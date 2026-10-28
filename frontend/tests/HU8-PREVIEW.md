# HU8 parcial: listado de seis a ocho vacantes para revisión

Entrega para Mateo y QA. **HU8 pendiente de validación completa.** El alcance de
esta revisión es el listado que comienza con seis vacantes y muestra ocho al
actualizar, con los mismos componentes, filtros y estilos. La marca visible es
«Datos simulados · Demostración». No se usa localStorage como fuente de datos.

Los botones «Ver oferta» conservan `hu8Demo=listado` y abren el detalle ilustrativo
del mismo ID. Volver conserva el conjunto actualizado, filtros, orden y etiquetas
de la sesión. Los detalles de las dos incorporaciones admiten también enlaces
directos y recargas sin depender del historial. Una recarga completa reinicia la
sesión en memoria; no se persiste en localStorage. Postulación, guardado y perfil
de empresa siguen deshabilitados. Los demás escenarios no se presentan como
terminados ni como aprobados por QA.

## Flujo «Listado actualizado»

1. Abrir `/vacantes?hu8Demo=listado`: se muestran las seis ofertas originales.
2. Pulsar el icono «Actualizar listado»: aparece el mismo skeleton y se bloquean
   nuevos clics mientras termina la lectura simulada (aproximadamente 250 ms).
3. Sin cambiar de URL, aparecen ocho ofertas. Con el orden predeterminado «más
   recientes», las dos primeras tienen la etiqueta «Nueva»:
   - Diseñador de Experiencia de Usuario — Digital Solutions.
   - Analista de Soporte Técnico — Andes Tecnología.
4. Las seis ofertas originales conservan todos sus campos, contenido y requisitos.
   Cada incorporación tiene su propio ID de empresa, detalle y requisitos. Los
   títulos y empresas corresponden a lo solicitado; los demás campos son
   ilustrativos, no una transcripción verificada de Figma.
5. Abrir cualquiera de las dos ofertas y volver conserva las ocho y las etiquetas.
   Actualizar otra vez mantiene ocho, sin duplicarlas; como ya se conocían sus IDs,
   dejan de marcarse como nuevas en esa consulta, según la lógica previa de sesión.

Los filtros y el selector de orden mantienen su comportamiento: pueden reducir
los resultados o cambiar el orden visible. Cancelar una actualización antes de
completarse no consume la transición. No se necesita una segunda página ni un
selector visible. La fuente real y los escenarios locales de vacío/error siguen
separados de esta demostración.

## Configuración de Vercel Preview (sin desplegar todavía)

- Proyecto Next.js con Root Directory `frontend`, build `npm run build`.
- Usar las dependencias y `package-lock.json` existentes, con instalación
  `npm ci` explícita para evitar ambigüedad con los lockfiles de pnpm. No se han
  actualizado dependencias ni verificado una instalación limpia en esta tarea.
- Configurar `HU8_PREVIEW_DEMO=true` **solo para Preview**, preferiblemente limitado
  a la rama `feature/hu8-requisitos-tecnicos`.
- Vercel suministra `VERCEL=1` y `VERCEL_ENV=preview`. No sobrescribirlos.
- No configurar `NEXT_PUBLIC_HU8_PREVIEW_DEMO_ENABLED`: `next.config.ts` deriva ese
  valor al compilar, exigiendo las tres condiciones anteriores. Sin ellas vale
  `false`, también en Production aunque por error se configure el opt-in.
- No configurar `NODE_ENV=development` en Vercel.
- No se necesitan URL de API, credenciales de Supabase ni Elasticsearch para
  esta demo. La configuración existente de API se mantiene para las rutas reales.
- Abrir `https://<dominio-del-preview>/vacantes?hu8Demo=listado`.

El modo Preview admite únicamente `listado`. Los demás modos locales no se
habilitan en Preview. Sin parámetro o con uno no permitido, `/vacantes` sigue
consultando `GET /vacantes/buscar?q=`. Un error de la API nunca activa fixtures.
La demo es una separación de fuentes, no un mecanismo de autenticación: configurar
la protección de acceso del Preview si se necesita revisión privada.

La bandera queda incorporada al build. **No promover a Production un artefacto
compilado con la demo habilitada.** Production debe obtener un build nuevo en su
propio entorno; cambiar una variable después del build no altera el bundle.

## Verificación reproducible

Desde `frontend`, sin servicios externos:

```powershell
node --test --experimental-transform-types lib/vacancies/preview-demo.spec.mjs lib/vacancies/consultation.spec.mts lib/vacancies/consultation-session.spec.mts lib/vacancies/request-timeout.spec.mts
npm test
npm run build
```

La suite Preview comprueba la configuración de build, bloqueo en Production,
opt-in ausente o inválido, transición seis a ocho en desarrollo y Preview,
conservación de originales, etiquetas, filtros, cancelación, navegación, detalles
por ID y separación de API. Incluye respuestas vacías y errores reales simulados
mediante `fetch` de prueba. No consulta ni modifica servicios reales.

Para una comprobación de navegador del build Preview, usar un puerto libre y
compilar localmente con las tres variables de Vercel anteriores, dentro de un
proceso temporal. Esto reproduce la configuración de Preview y no es un deploy.

La API real y su integración siguen pendientes. No se deben usar sus resultados
como evidencia de aceptación de HU8. Su búsqueda puede crear un índice de
Elasticsearch ausente; esta tarea no necesita ejecutar esa consulta real.

## Verificación del flujo seis a ocho (27 de octubre de 2026)

- Pasaron 32 pruebas HU8: 10 de la suite Preview/actualización, 3 de sesión, 14 de
  consultas y 5 de timeout. Se ejecutaron directamente con Node para no necesitar
  subprocesos del test runner en el sandbox de Windows.
- TypeScript (`tsc --noEmit --incremental false`) y ESLint de los dos módulos de
  datos y del test modificado pasaron. No se modificaron componentes ni CSS.
- La comprobación visual nueva quedó pendiente: el servidor de desarrollo arrancó
  y luego se detuvo por el aviso de seguridad de Next.js ya documentado abajo.
  No se repitió ese intento ni el build de Production, ni se actualizaron
  dependencias o se desactivaron protecciones.
- La comprobación anterior en Chrome cubría seis ofertas; no se debe presentar
  como una comprobación visual del nuevo flujo de ocho.

## Resultados anteriores a la ampliación

- 28 pruebas de HU8 y 8 pruebas existentes de HU1/HU2 pasaron. La suite nueva de
  Preview (6 de esas 28) se repitió correctamente después del ajuste de su formato
  a JavaScript, compatible con los tipos de Node ya instalados.
- El build configurado como Preview finalizó con código 0. TypeScript y la
  generación de las 33 páginas terminaron correctamente.
- Chrome headless verificó las seis filas, los seis destinos «Ver oferta», el
  regreso al listado, la actualización y la marca visible. No hubo solicitudes
  externas, uso de localStorage ni excepciones JavaScript durante la demo.
- En el mismo navegador, `/vacantes` sin parámetro intentó consultar la API.
  La petición se interceptó localmente con un 503: se mostró el error y ningún
  fixture. No se hizo esa consulta al backend real.
- La matriz de pruebas bloquea Production incluso con el opt-in activado. El
  artefacto local generado con `VERCEL_ENV=production` también contiene la bandera
  pública derivada en `false`.
- El comando de build Production terminó con código 1 por `SecurityFatalError`
  de la versión instalada de Next.js, después de compilar y generar las páginas.
  Su reintento no fue autorizado y no se ejecutó. El build Preview había emitido
  el mismo aviso antes de completarse en un reintento. **Este aviso puede bloquear
  el build de Vercel**; debe revisarse antes de desplegar. No se actualizaron
  dependencias ni se desactivó la comprobación de seguridad.
- ESLint detecta cinco errores previos `react-hooks/immutability` en
  `app/vacantes/page.tsx`, en el manejo de sesión. Se comprobó en memoria que están
  presentes también sin los cambios de esta tarea. Se conservaron para no
  refactorizar el listado ni sus filtros dentro de esta entrega.
- `git diff --check` pasó. Los temporales de navegador se crearon fuera del
  repositorio; no se añadieron secretos, archivos de build ni dependencias.

## Selección de la entrega

Incluir el listado y sus dependencias de encabezado, estilos, sesión, fuente,
fixtures y tipos; la configuración de build, `.env.example`, esta guía y la suite
Preview. Incluir el detalle existente y sus recursos locales únicamente para
mantener operativos los seis enlaces. Mantener la licencia junto a la fuente.

Lista propuesta de cambios para el commit, con rutas relativas a `frontend/`
(no se ha añadido ningún archivo al índice):

```text
.env.example
next.config.ts
app/components/PortalHeader.tsx
app/vacantes/page.tsx
app/vacantes/layout.tsx
app/vacantes/components/JobsBoard.css
app/vacantes/components/JobsPortalHeader.css
app/vacantes/components/JobsPortalHeader.tsx
app/vacantes/components/VacancyConsultationProvider.tsx
app/vacantes/components/jobs-styles.ts
app/vacantes/[id]/page.tsx
app/vacantes/[id]/DetalleVacanteCliente.tsx
app/vacantes/[id]/VacancyDetail.css
lib/api/vacantes.ts
lib/vacancies/listing.ts
lib/vacancies/consultation-session.ts
lib/vacancies/consultation-source.ts
lib/vacancies/demo-mode.ts
lib/vacancies/detail-content.ts
lib/vacancies/requirements.ts
lib/vacancies/request-timeout.ts
lib/vacancies/development/demo-source.ts
lib/vacancies/development/fixtures.ts
lib/vacancies/preview-demo.spec.mjs
lib/vacancies/consultation.spec.mts
lib/vacancies/consultation-session.spec.mts
lib/vacancies/request-timeout.spec.mts
tests/fixtures/hu8.ts
tests/HU8-PREVIEW.md
public/hu8/InterVariable.woff2
public/hu8/Inter-LICENSE.txt
public/hu8/buildings-panorama.jpg
```

Los archivos y recursos del detalle mantienen la navegación, no amplían los
criterios de aceptación de esta entrega. Las pruebas anteriores se conservan
como regresión técnica; su inclusión no equivale a aprobación de QA.

No incluir `backend/package-lock.json`: es un cambio previo de resolución de
dependencias del backend, ajeno a esta entrega. Tampoco se necesita el ajuste
previo de `frontend/pnpm-workspace.yaml` para instalar con npm. Ambos cambios se
conservan en el árbol de trabajo; no se han descartado.

`tests/HU8.md` describe trabajo anterior más amplio, no aceptación de esta entrega.
`tests/hu8-mock-api.mts` no es necesario para esta demo. No incluir `.next`, perfiles
de navegador, capturas temporales, `.env.local`, credenciales o configuraciones de
Vercel generadas localmente. No se ha ejecutado git add, commit, push ni deploy.
