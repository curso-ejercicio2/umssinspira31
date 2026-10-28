import type { Vacancy } from '../../api/vacantes';
import type { Hu8VacancyDetail, VacancyDetailContent } from '../detail-content';
import { resolveHu8DemoScenario } from '../demo-mode';

/**
 * SIMULATED DATA for local development or the explicitly enabled Preview listing.
 * Names/companies follow the supplied HU8 mockup list.
 * Other fields are illustrative fixtures, not records from Supabase/Elasticsearch.
 */
export function getHu8DevelopmentFixtures(includeNewVacancies = false): Hu8VacancyDetail[] {
  if (resolveHu8DemoScenario('listado') === null) {
    throw new Error('Los fixtures de HU8 no están habilitados para este entorno y escenario.');
  }

  const techSolutions = '80000000-0000-4000-8000-000000000101';
  const jalasoft = '80000000-0000-4000-8000-000000000102';
  const companyIds: Record<string, string> = {
    'TechSolutions S.A.': techSolutions,
    Jalasoft: jalasoft,
    'Digital Solutions': '80000000-0000-4000-8000-000000000103',
    'Andes Tecnología': '80000000-0000-4000-8000-000000000104',
  };
  const fixture = (index: number, fields: Pick<Vacancy, 'titulo' | 'empresa' | 'area' | 'modalidad' | 'descripcion' | 'ubicacion'>, requirements: string[], detailContent: VacancyDetailContent): Hu8VacancyDetail => ({
    id: `80000000-0000-4000-8000-00000000000${index}`,
    idEmpresa: companyIds[fields.empresa],
    ...fields,
    estado: 'Disponible',
    fechaCreacion: `2026-10-${17 - index}T12:00:00.000Z`,
    condiciones: 'Condiciones ilustrativas para la demostración local de HU8.',
    requisitos: requirements.map((nombre, requirement) => ({ id: `hu8-demo-${index}-${requirement + 1}`, nombre })),
    detailContent,
  });

  const vacancies = [
    fixture(1, {
      titulo: 'Desarrollador Frontend Junior', empresa: 'TechSolutions S.A.',
      area: 'Desarrollo de software', modalidad: 'Remoto', ubicacion: 'Cochabamba',
      descripcion: 'Crea interfaces web claras y accesibles con React y TypeScript junto a nuestro equipo de producto.',
    }, [
      'React y TypeScript para el desarrollo de interfaces.',
      'Tailwind CSS y diseño web adaptable para la presentación visual.',
      'Git para el control de versiones.',
      'Consumo de API REST para integrar servicios.',
    ], {
      locationDetail: 'Cochabamba, Bolivia', experience: 'Junior', schedule: 'Tiempo completo', closingDate: '2026-10-30T12:00:00.000Z',
      about: ['En TechSolutions S.A. buscamos un egresado o titulado de Ingeniería de Sistemas, Informática o carreras afines. Trabajarás con nuestro equipo de producto desde Cochabamba, creando componentes web e integrando servicios para clientes locales.'],
      experienceNote: 'Nivel Junior · Se valoran proyectos académicos o personales. No se requiere experiencia laboral previa.',
      responsibilities: [
        'Desarrollar componentes e interfaces web con React y TypeScript.',
        'Implementar diseños adaptables a dispositivos móviles con Tailwind CSS.',
        'Integrar API REST y colaborar en revisiones de código con Git.',
        'Participar en pruebas y mejoras de accesibilidad junto al equipo.',
      ],
      desirable: 'Pruebas unitarias con Jest. Puedes postular aunque aún estés desarrollando esta habilidad.',
      benefits: [
        'Trabajo remoto desde Bolivia y jornada de tiempo completo.',
        'Acompañamiento técnico y espacios de aprendizaje.',
        'Participación en proyectos de software para clientes locales.',
      ],
      companyDescription: 'Somos una empresa de tecnología enfocada en desarrollar soluciones de software.',
      companyFacts: '50–200 empleados · Av. San Martín y Costanera, piso 12, Cochabamba.',
    }),
    fixture(2, {
      titulo: 'Desarrollador Backend', empresa: 'TechSolutions S.A.',
      area: 'Desarrollo de software', modalidad: 'Remoto', ubicacion: 'Cochabamba',
      descripcion: 'Desarrolla servicios y API REST con Python, e integra soluciones para aplicaciones empresariales.',
    }, ['Python', 'python', 'pythón', 'API REST', ' API   REST ', 'SQL', 'Git'], {
      locationDetail: 'Cochabamba, Bolivia', experience: 'Intermedio', schedule: 'Tiempo completo', closingDate: '2026-10-31T12:00:00.000Z',
      about: ['Te integrarás al equipo de servicios para desarrollar aplicaciones empresariales, modelar datos y mantener integraciones seguras.'],
      responsibilities: ['Desarrollar servicios con Python y API REST.', 'Diseñar consultas y mantener bases de datos SQL.', 'Revisar código y documentar las integraciones del equipo.', 'Participar en pruebas y mantenimiento de los servicios.'],
      desirable: 'Conocimientos de contenedores y pruebas automatizadas de servicios.',
      benefits: ['Trabajo remoto desde Bolivia.', 'Colaboración con el equipo de desarrollo y espacios de aprendizaje.', 'Participación en proyectos de integración de servicios.'],
      companyDescription: 'Somos una empresa de tecnología enfocada en desarrollar soluciones de software.',
      companyFacts: '50–200 empleados · Cochabamba, Bolivia.',
    }),
    fixture(3, {
      titulo: 'Analista de Datos Junior', empresa: 'Jalasoft',
      area: 'Análisis de datos', modalidad: 'Híbrido', ubicacion: 'Cochabamba',
      descripcion: 'Analiza información y prepara reportes para apoyar las decisiones del equipo.',
    }, ['SQL', 'Python', 'Power BI', 'Excel'], {
      locationDetail: 'Cochabamba, Bolivia', experience: 'Junior', schedule: 'Tiempo completo', closingDate: '2026-10-29T12:00:00.000Z',
      about: ['Colaborarás en la preparación de datos y la construcción de reportes para los equipos de negocio.'],
      responsibilities: ['Preparar y validar conjuntos de datos.', 'Construir consultas SQL y reportes con Power BI.', 'Documentar hallazgos y compartir resultados con el equipo.'],
      desirable: 'Conocimientos de visualización y estadística descriptiva.',
      benefits: ['Modalidad híbrida en Cochabamba.', 'Acompañamiento del equipo de análisis de datos.'],
      companyDescription: 'Empresa de tecnología y desarrollo de software. Información ilustrativa para esta demostración.',
    }),
    fixture(4, {
      titulo: 'Analista de Calidad de Software', empresa: 'TechSolutions S.A.',
      area: 'Calidad de software', modalidad: 'Híbrido', ubicacion: 'Santa Cruz',
      descripcion: 'Diseña casos de prueba y verifica la calidad de aplicaciones y servicios web.',
    }, ['Pruebas de software', 'Selenium', 'Postman', 'SQL'], {
      locationDetail: 'Santa Cruz, Bolivia', experience: 'Intermedio', schedule: 'Tiempo completo', closingDate: '2026-10-28T12:00:00.000Z',
      about: ['Acompañarás al equipo de desarrollo en la verificación de entregas y la detección de problemas de calidad.'],
      responsibilities: ['Diseñar y ejecutar casos de prueba.', 'Verificar servicios con Postman y consultas SQL.', 'Automatizar pruebas con Selenium y documentar incidencias.'],
      desirable: 'Experiencia en pruebas de accesibilidad.',
      benefits: ['Modalidad híbrida en Santa Cruz.', 'Participación en procesos de mejora de calidad.'],
      companyDescription: 'Somos una empresa de tecnología enfocada en desarrollar soluciones de software.',
    }),
    fixture(5, {
      titulo: 'Ingeniero de Infraestructura TI', empresa: 'Jalasoft',
      area: 'Infraestructura TI', modalidad: 'Presencial', ubicacion: 'Cochabamba',
      descripcion: 'Administra infraestructura y redes para mantener la disponibilidad de los servicios.',
    }, ['Linux', 'Redes', 'Docker', 'Administración de servidores'], {
      locationDetail: 'Cochabamba, Bolivia', experience: 'Intermedio', schedule: 'Tiempo completo', closingDate: '2026-10-27T12:00:00.000Z',
      about: ['Apoyarás la operación de servidores y redes, con atención a la continuidad de los servicios del equipo.'],
      responsibilities: ['Administrar servidores Linux y contenedores Docker.', 'Monitorear la disponibilidad de redes y servicios.', 'Documentar procedimientos de operación y recuperación.'],
      benefits: ['Trabajo presencial en Cochabamba.', 'Colaboración con el equipo de infraestructura.'],
      companyDescription: 'Empresa de tecnología y desarrollo de software. Información ilustrativa para esta demostración.',
    }),
    fixture(6, {
      titulo: 'Especialista en Ciberseguridad', empresa: 'TechSolutions S.A.',
      area: 'Ciberseguridad', modalidad: 'Remoto', ubicacion: 'La Paz',
      descripcion: 'Identifica vulnerabilidades y participa en la protección de sistemas y redes.',
    }, ['Seguridad de redes', 'Análisis de vulnerabilidades', 'SIEM', 'Respuesta a incidentes'], {
      locationDetail: 'La Paz, Bolivia', experience: 'Intermedio', schedule: 'Tiempo completo', closingDate: '2026-10-26T12:00:00.000Z',
      about: ['Colaborarás en la detección de riesgos y la respuesta a incidentes de seguridad de los sistemas.'],
      responsibilities: ['Analizar vulnerabilidades en sistemas y redes.', 'Monitorear eventos de seguridad con herramientas SIEM.', 'Documentar incidentes y proponer medidas de protección.'],
      desirable: 'Conocimientos de automatización de tareas de seguridad.',
      benefits: ['Trabajo remoto desde Bolivia.', 'Participación en iniciativas de seguridad del equipo.'],
      companyDescription: 'Somos una empresa de tecnología enfocada en desarrollar soluciones de software.',
    }),
  ];

  if (includeNewVacancies) {
    // Titles and companies match the requested updated list. The remaining
    // fields and technical requirements are illustrative, isolated demo data.
    vacancies.push({
      ...fixture(7, {
        titulo: 'Diseñador de Experiencia de Usuario', empresa: 'Digital Solutions',
        area: 'Diseño de producto', modalidad: 'Remoto', ubicacion: 'La Paz',
        descripcion: 'Investiga necesidades de usuarios y diseña experiencias accesibles para productos digitales.',
      }, ['Figma', 'Prototipado', 'Investigación de usuarios', 'Accesibilidad'], {
        locationDetail: 'La Paz, Bolivia', experience: 'Junior', schedule: 'Tiempo completo', closingDate: '2026-11-02T12:00:00.000Z',
        about: ['En Digital Solutions participarás en la investigación y el diseño de experiencias de uso para aplicaciones web.'],
        responsibilities: ['Investigar necesidades de usuarios y documentar hallazgos.', 'Crear flujos de navegación y prototipos en Figma.', 'Evaluar accesibilidad y realizar pruebas de usabilidad.'],
        desirable: 'Conocimientos de sistemas de diseño y pruebas de usabilidad.',
        benefits: ['Trabajo remoto desde Bolivia.', 'Colaboración con el equipo de diseño de Digital Solutions.'],
        companyDescription: 'Digital Solutions desarrolla productos digitales centrados en sus usuarios. Información ilustrativa para esta demostración.',
      }),
      fechaCreacion: '2026-10-19T14:00:00.000Z',
    }, {
      ...fixture(8, {
        titulo: 'Analista de Soporte Técnico', empresa: 'Andes Tecnología',
        area: 'Soporte técnico', modalidad: 'Presencial', ubicacion: 'Cochabamba',
        descripcion: 'Resuelve incidencias de equipos, sistemas operativos y conectividad para apoyar a los usuarios.',
      }, ['Diagnóstico de hardware y software', 'Windows y Linux', 'Redes TCP/IP', 'Gestión de incidencias'], {
        locationDetail: 'Cochabamba, Bolivia', experience: 'Junior', schedule: 'Tiempo completo', closingDate: '2026-11-03T12:00:00.000Z',
        about: ['En Andes Tecnología brindarás asistencia técnica a usuarios y darás seguimiento a incidentes de equipos y redes.'],
        responsibilities: ['Diagnosticar problemas de hardware y software.', 'Configurar sistemas operativos y verificar conectividad TCP/IP.', 'Registrar incidentes y documentar su resolución.'],
        desirable: 'Conocimientos de herramientas de asistencia remota y mesas de ayuda.',
        benefits: ['Trabajo presencial en Cochabamba.', 'Acompañamiento del equipo de soporte de Andes Tecnología.'],
        companyDescription: 'Andes Tecnología brinda servicios de soporte y mantenimiento informático. Información ilustrativa para esta demostración.',
      }),
      fechaCreacion: '2026-10-19T13:00:00.000Z',
    });
  }

  return vacancies;
}
