import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { afterEach, describe, it, mock } from 'node:test';
import { hu8Href, HU8_DEMO_SCENARIOS, resolveHu8DemoScenario } from './demo-mode.ts';

// The application uses Next's extensionless TS resolution. Match it only in this test process.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) &&
          error.code === 'ERR_MODULE_NOT_FOUND') {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});

const { loadHu8Vacancies, loadHu8Vacancy } = await import('./consultation-source.ts');
const { listDemoVacancies, getDemoVacancy } = await import('./development/demo-source.ts');
const { getHu8DevelopmentFixtures } = await import('./development/fixtures.ts');
const { createVacancyConsultationSession, observeVacancyRead } = await import('./consultation-session.ts');
const { filterVacancies, sortVacancies } = await import('./listing.ts');
const envKeys = ['NODE_ENV', 'VERCEL', 'VERCEL_ENV', 'HU8_PREVIEW_DEMO', 'NEXT_PUBLIC_HU8_PREVIEW_DEMO_ENABLED'];
const originalEnv = new Map(envKeys.map((key) => [key, process.env[key]]));
let buildSequence = 0;

afterEach(() => {
  for (const [key, value] of originalEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  mock.restoreAll();
});

async function configureBuild(vercelEnvironment, optIn, platform = '1') {
  for (const key of envKeys) delete process.env[key];
  Object.assign(process.env, { NODE_ENV: 'production', VERCEL: platform });
  if (vercelEnvironment !== undefined) process.env.VERCEL_ENV = vercelEnvironment;
  if (optIn !== undefined) process.env.HU8_PREVIEW_DEMO = optIn;
  // Even an accidentally supplied public flag must be overridden by next.config.ts.
  process.env.NEXT_PUBLIC_HU8_PREVIEW_DEMO_ENABLED = 'true';
  const { default: config } = await import(new URL(`../../next.config.ts?build=${buildSequence++}`, import.meta.url).href);
  process.env.NEXT_PUBLIC_HU8_PREVIEW_DEMO_ENABLED = config.env.NEXT_PUBLIC_HU8_PREVIEW_DEMO_ENABLED;
}

describe('Entrega parcial HU8: aislamiento de la demostración Preview', () => {
  it('solo habilita un build Vercel Preview con opt-in explícito', async () => {
    for (const [environment, optIn, platform] of [
      ['production', 'true', '1'], ['development', 'true', '1'],
      ['preview', undefined, '1'], ['preview', 'false', '1'],
      ['preview', 'TRUE', '1'], ['preview', 'true', '0'],
      [undefined, 'true', '1'],
    ]) {
      await configureBuild(environment, optIn, platform);
      assert.equal(resolveHu8DemoScenario('listado'), null);
      assert.throws(() => getHu8DevelopmentFixtures(), /no están habilitados/);
      await assert.rejects(listDemoVacancies('listado'), /no está habilitada/);
    }
    await configureBuild('preview', 'true');
    assert.equal(resolveHu8DemoScenario('listado'), 'listado');
  });

  it('Preview permite exclusivamente listado, sin activar los demás escenarios', async () => {
    await configureBuild('preview', 'true');
    assert.equal(resolveHu8DemoScenario(null), null);
    assert.equal(resolveHu8DemoScenario('desconocido'), null);
    for (const { value } of HU8_DEMO_SCENARIOS) {
      if (value === 'listado') continue;
      assert.equal(resolveHu8DemoScenario(value), null);
      await assert.rejects(listDemoVacancies(value), /no está habilitada/);
    }
    // The allowed listado now owns its six-to-eight refresh without enabling a second mode.
    assert.equal(getHu8DevelopmentFixtures(true).length, 8);
  });

  it('carga las seis vacantes y los seis destinos Ver oferta sin llamar a la API', async () => {
    await configureBuild('preview', 'true');
    const fetchMock = mock.method(globalThis, 'fetch', async () => {
      throw new Error('La demo nunca debe consultar el backend');
    });
    const vacancies = await loadHu8Vacancies('listado');
    assert.equal(vacancies.length, 6);
    assert.equal(new Set(vacancies.map((vacancy) => vacancy.id)).size, 6);
    for (const vacancy of vacancies) {
      const href = hu8Href(`/vacantes/${vacancy.id}`, 'listado');
      const url = new URL(href, 'https://hu8-preview.example');
      assert.equal(url.searchParams.get('hu8Demo'), 'listado');
      const detail = await loadHu8Vacancy(url.pathname.split('/').at(-1), 'listado');
      assert.equal(detail.id, vacancy.id);
      assert.equal(detail.titulo, vacancy.titulo);
    }
    assert.equal(hu8Href('/vacantes', 'listado'), '/vacantes?hu8Demo=listado');
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it('actualiza de seis a ocho, conserva originales y sesión y abre los dos detalles propios', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => {
      throw new Error('La demo nunca debe consultar el backend');
    });
    for (const environment of ['development', 'preview']) {
      if (environment === 'preview') await configureBuild('preview', 'true');
      else Object.assign(process.env, { NODE_ENV: 'development', NEXT_PUBLIC_HU8_PREVIEW_DEMO_ENABLED: 'false' });
      const session = createVacancyConsultationSession();
      const read = (action, sequence) => ({ action, sequence, journey: session.journey });
      const original = await loadHu8Vacancies('listado', undefined, read('initial', 0));
      assert.equal(original.length, 6);
      assert.deepEqual(observeVacancyRead(session, original, 'initial'), []);

      const pending = loadHu8Vacancies('listado', undefined, read('refresh', 1));
      assert.equal(session.journey.phase, 'listado', 'La fase no cambia antes de terminar la carga');
      const updated = await pending;
      assert.equal(updated.length, 8);
      assert.deepEqual(updated.filter(vacancy => original.some(item => item.id === vacancy.id)), original);
      const ordered = sortVacancies(updated, 'recent');
      const additions = ordered.slice(0, 2);
      assert.deepEqual(additions.map(({ titulo, empresa }) => [titulo, empresa]), [
        ['Diseñador de Experiencia de Usuario', 'Digital Solutions'],
        ['Analista de Soporte Técnico', 'Andes Tecnología'],
      ]);
      assert.deepEqual(observeVacancyRead(session, updated, 'refresh'), additions.map(vacancy => vacancy.id));
      assert.equal(new Set(updated.map(vacancy => vacancy.id)).size, 8);
      assert.equal(new Set(additions.map(vacancy => vacancy.idEmpresa)).size, 2);
      assert.ok(additions.every(vacancy => !original.some(item => item.idEmpresa === vacancy.idEmpresa)));

      const details = await Promise.all(additions.map(vacancy => {
        const url = new URL(hu8Href(`/vacantes/${vacancy.id}`, 'listado'), 'https://hu8-preview.example');
        assert.equal(url.searchParams.get('hu8Demo'), 'listado');
        return loadHu8Vacancy(url.pathname.split('/').at(-1), 'listado', undefined, session.journey);
      }));
      for (let index = 0; index < additions.length; index++) assert.deepEqual(details[index], additions[index]);
      assert.deepEqual(details[0].requisitos.map(item => item.nombre), ['Figma', 'Prototipado', 'Investigación de usuarios', 'Accesibilidad']);
      assert.deepEqual(details[1].requisitos.map(item => item.nombre), ['Diagnóstico de hardware y software', 'Windows y Linux', 'Redes TCP/IP', 'Gestión de incidencias']);
      assert.ok(details[0].requisitos.every(item => !details[1].requisitos.some(other => other.id === item.id)));

      session.filters.query = 'Diseñador';
      const returned = await loadHu8Vacancies('listado', undefined, read('initial', 1));
      assert.deepEqual(returned, updated);
      assert.deepEqual(observeVacancyRead(session, returned, 'initial'), additions.map(vacancy => vacancy.id));
      assert.equal(session.filters.query, 'Diseñador');
      assert.deepEqual(filterVacancies(returned, session.filters).map(vacancy => vacancy.id), [additions[0].id]);
      const refreshedAgain = await loadHu8Vacancies('listado', undefined, read('refresh', 2));
      assert.deepEqual(refreshedAgain, updated);
      assert.deepEqual(observeVacancyRead(session, refreshedAgain, 'refresh'), []);
      const freshSession = createVacancyConsultationSession();
      assert.equal((await loadHu8Vacancies('listado', undefined, { action: 'initial', sequence: 0, journey: freshSession.journey })).length, 6);
    }
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it('cancelar la carga no avanza el listado y el siguiente intento puede completarlo', async () => {
    await configureBuild('preview', 'true');
    const session = createVacancyConsultationSession();
    const read = { action: 'refresh', sequence: 1, journey: session.journey };
    const controller = new AbortController();
    const pending = loadHu8Vacancies('listado', controller.signal, read);
    controller.abort();
    await assert.rejects(pending, error => error.name === 'AbortError');
    assert.equal(session.journey.phase, 'listado');
    assert.equal(session.journey.appliedRead, 0);
    assert.equal((await loadHu8Vacancies('listado', undefined, read)).length, 8);
  });

  it('los detalles nuevos admiten enlaces directos y recargas sin historial del listado', async () => {
    await configureBuild('preview', 'true');
    const additions = getHu8DevelopmentFixtures(true).slice(6);
    for (const vacancy of additions) assert.deepEqual(await loadHu8Vacancy(vacancy.id, 'listado'), vacancy);
    await assert.rejects(loadHu8Vacancy('80000000-0000-4000-8000-000000000099', 'listado'), error => error.status === 404);
  });

  it('conserva los estados de vacío, error y recuperación del recorrido local', async () => {
    Object.assign(process.env, { NODE_ENV: 'development', NEXT_PUBLIC_HU8_PREVIEW_DEMO_ENABLED: 'false' });
    const session = createVacancyConsultationSession();
    const read = (action, sequence) => ({ action, sequence, journey: session.journey });
    const original = await loadHu8Vacancies('recorrido', undefined, read('initial', 0));
    assert.equal(original.length, 6);
    assert.deepEqual(await loadHu8Vacancies('recorrido', undefined, read('refresh', 1)), []);
    await assert.rejects(loadHu8Vacancies('recorrido', undefined, read('refresh', 2)), error => error.status === 503);
    const recovered = await loadHu8Vacancies('recorrido', undefined, read('retry', 3));
    assert.equal(recovered.length, 8);
    assert.deepEqual(recovered.slice(0, 6), original);
  });

  it('la ruta normal consulta la API incluso con la demo habilitada y nunca encubre errores', async () => {
    await configureBuild('preview', 'true');
    const fetchMock = mock.method(globalThis, 'fetch', async (input) => {
      const url = new URL(String(input));
      assert.equal(url.pathname, '/vacantes/buscar');
      assert.equal(url.searchParams.get('q'), '');
      return Response.json([]);
    });
    assert.deepEqual(await loadHu8Vacancies(null), []);
    assert.equal(fetchMock.mock.callCount(), 1);
    fetchMock.mock.mockImplementation(async () => Response.json({ message: 'API no disponible' }, { status: 503 }));
    await assert.rejects(loadHu8Vacancies(null), /API no disponible/);
    assert.equal(fetchMock.mock.callCount(), 2);
  });

  it('Production ignora la URL demo y bloquea también el acceso directo a los fixtures', async () => {
    await configureBuild('production', 'true');
    const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json([]));
    assert.deepEqual(await loadHu8Vacancies('listado'), []);
    assert.equal(fetchMock.mock.callCount(), 1);
    assert.equal(hu8Href('/vacantes', 'listado'), '/vacantes');
    assert.throws(() => getHu8DevelopmentFixtures(), /no están habilitados/);
    assert.throws(() => getHu8DevelopmentFixtures(true), /no están habilitados/);
    await assert.rejects(getDemoVacancy('80000000-0000-4000-8000-000000000001', 'listado'), /no está habilitada/);
  });

  it('conserva los escenarios locales sin requerir configuración de Vercel', () => {
    Object.assign(process.env, { NODE_ENV: 'development', NEXT_PUBLIC_HU8_PREVIEW_DEMO_ENABLED: 'false' });
    for (const { value } of HU8_DEMO_SCENARIOS) assert.equal(resolveHu8DemoScenario(value), value);
    assert.equal(getHu8DevelopmentFixtures().length, 6);
    assert.equal(getHu8DevelopmentFixtures(true).length, 8);
  });
});
