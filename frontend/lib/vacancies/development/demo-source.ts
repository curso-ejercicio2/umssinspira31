import { VacancyApiError } from '../../api/vacantes';
import type { Hu8ConsultationRead, Hu8DemoJourney, Hu8DemoScenario } from '../demo-mode';
import { resolveHu8DemoScenario } from '../demo-mode';
import { getHu8DevelopmentFixtures } from './fixtures';

function assertDemoAllowed(scenario: Hu8DemoScenario) {
  if (resolveHu8DemoScenario(scenario) !== scenario) {
    throw new Error('La demostración de HU8 no está habilitada para este entorno y escenario.');
  }
}

/** A stable loading view remains pending until navigation cancels it. */
function demoDelay(scenario: Hu8DemoScenario, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Consulta cancelada', 'AbortError')); return; }
    const timer = scenario === 'carga' ? undefined : setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, scenario === 'recorrido' ? 1200 : 250);
    function abort() {
      if (timer !== undefined) clearTimeout(timer);
      reject(new DOMException('Consulta cancelada', 'AbortError'));
    }
    signal?.addEventListener('abort', abort, { once: true });
  });
}

function scenarioVacancies(scenario: Hu8DemoScenario, includeNewVacancies = scenario === 'actualizado') {
  const vacancies = getHu8DevelopmentFixtures(includeNewVacancies);
  if (scenario === 'sin-vacantes') return [];
  if (scenario === 'sin-requisitos') return vacancies.map((vacancy) => ({ ...vacancy, requisitos: [] }));
  return vacancies;
}

export async function listDemoVacancies(scenario: Hu8DemoScenario, signal?: AbortSignal, read?: Hu8ConsultationRead) {
  assertDemoAllowed(scenario);
  await demoDelay(scenario, signal);
  signal?.throwIfAborted();
  if (scenario === 'listado') {
    // Commit the transition only after a completed explicit refresh. Replayed
    // effects and returning from a detail reuse the session without advancing it.
    if (read && read.action !== 'initial' && read.sequence > read.journey.appliedRead) {
      read.journey.phase = 'actualizado';
      read.journey.appliedRead = read.sequence;
    }
    return scenarioVacancies(scenario, read?.journey.phase === 'actualizado');
  }
  if (scenario === 'recorrido') {
    if (!read) throw new Error('El recorrido necesita una sesión de consulta.');
    // Only completed user actions advance the story. Replayed effects, route
    // navigation and Strict Mode must not consume another demonstration step.
    const journey = read.journey;
    if (read.action !== 'initial' && read.sequence > journey.appliedRead) {
      if (journey.phase === 'listado') journey.phase = 'sin-vacantes';
      else if (journey.phase === 'sin-vacantes') journey.phase = 'error';
      else if (journey.phase === 'error') journey.phase = 'actualizado';
      journey.appliedRead = read.sequence;
    }
    if (journey.phase === 'error') throw new VacancyApiError('Error simulado de consulta de HU8.', 503);
    return scenarioVacancies(journey.phase);
  }
  if (scenario === 'error') throw new VacancyApiError('Error simulado de consulta de HU8.', 503);
  return scenarioVacancies(scenario);
}

export async function getDemoVacancy(id: string, scenario: Hu8DemoScenario, signal?: AbortSignal, journey?: Hu8DemoJourney) {
  assertDemoAllowed(scenario);
  await demoDelay(scenario, signal);
  signal?.throwIfAborted();
  if (scenario === 'error') throw new VacancyApiError('Error simulado de consulta de HU8.', 503);
  const effectiveScenario = scenario === 'recorrido' ? journey?.phase === 'actualizado' ? 'actualizado' : 'listado' : scenario;
  // Both added offers remain addressable by ID, including a direct link or a
  // detail reload, without changing the listing's phase or using browser storage.
  const includeNewVacancies = scenario === 'listado' || effectiveScenario === 'actualizado';
  const vacancy = scenario === 'inexistente' ? undefined : scenarioVacancies(effectiveScenario, includeNewVacancies).find((item) => item.id === id);
  if (!vacancy) throw new VacancyApiError('La vacante no existe.', 404);
  return vacancy;
}
