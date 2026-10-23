/* Doña Cecilia — el Google Sheet "MANADA DC II" se actualiza solo desde la app.
   Va pegado en el Sheet: Extensiones → Apps Script (ver sheet/LEEME.md).
   - Trae los datos directo de la base de la app (solo lectura, con la misma clave que el calendario).
   - Reescribe CABALLOS, PREÑECES, SANIDAD, EVENTOS y BAJAS. En las CAMADAS solo actualiza lo que
     cambió y agrega los que nacen (las camadas tienen notas a mano que no están en la app).
   - Nunca toca las fórmulas: las vuelve a poner en cada fila. Las columnas que la app no tiene
     (por ejemplo "FPP (PLANILLA VIEJA)") se conservan para cada caballo.
   - La app manda: lo que se escriba a mano en las columnas que vienen de la app se pisa.
   La clave NO va acá: se guarda con el menú Doña Cecilia → Configurar clave. */

const SB_URL = 'https://rqmibapllqfvxgsawyox.supabase.co';
// Clave pública de la app (la misma de app/config.js): sola no alcanza para leer nada, hace falta la clave del calendario.
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbWliYXBsbHFmdnhnc2F3eW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MTc2NTMsImV4cCI6MjEwNjI5MzY1M30.QH3vsZUmp2MXFq-2rPLgDmvoTGsRz4NojyGeGxvSRH0';
const ZONA = 'America/Argentina/Buenos_Aires';

/* ===================== Armado de las filas (sin tocar el Sheet) ===================== */
const ORDEN_CAT = ['Potrillos', 'Doma', 'Descanso', 'Hechura', 'Jugadores', 'Madres', 'Receptoras'];
const GRUPO_EV = { 'Parición': 'Reproducción', 'Revisión': 'Reproducción', 'Tacto / Eco': 'Preñez', 'Aborto': 'Preñez', 'Servicio': 'Servicio', 'Inseminación': 'Servicio',
  'Desparasitación': 'Sanidad', 'Vacuna': 'Sanidad', 'Anemia': 'Sanidad', 'Veterinario': 'Sanidad', 'Influenza': 'Sanidad', 'Encéfalo': 'Sanidad', 'Adenitis': 'Sanidad', 'Tétano': 'Sanidad',
  'Rinoneumonitis': 'Sanidad', 'Salmonela': 'Sanidad', 'Desvasada': 'Trabajos', 'Herrada': 'Trabajos', 'Desherrada': 'Trabajos', 'Muelas': 'Trabajos', 'Castración': 'Trabajos',
  'Movimiento': 'Movimiento', 'Práctica': 'Polo', 'Torneo': 'Polo' };
const SIN_EVENTOS = ['Práctica', 'Torneo']; // en el Sheet no van uno por uno

const norm = v => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
const fecha = s => { if (!s) return ''; const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : s; };
const o = v => (v === undefined || v === null || v === '') ? '—' : v;
const ddmm = s => s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '';
const precio = v => v === undefined || v === null || v === '' ? '—' : (typeof v === 'number' ? v : String(v));

function separar(filas) {
  const D = { caballos: [], eventos: [], servicios: [], config: {} };
  for (const r of filas) {
    if (r.coleccion === 'config') { if (r.id === 'app') D.config = r.data || {}; }
    else if (D[r.coleccion]) D[r.coleccion].push(Object.assign({ id: r.id }, r.data));
  }
  return D;
}
const porCategoria = (a, b) => (ORDEN_CAT.indexOf(a.categoria) + 99 * (ORDEN_CAT.indexOf(a.categoria) < 0)) - (ORDEN_CAT.indexOf(b.categoria) + 99 * (ORDEN_CAT.indexOf(b.categoria) < 0)) || a.nombre.localeCompare(b.nombre);

function filasCaballos(D) {
  return D.caballos.filter(c => c.estado === 'Activo').sort(porCategoria).map(c => ({
    'NOMBRE': c.nombre, 'RP': o(c.rp), 'N° CHIP': o(c.chip), 'CATEGORÍA': c.categoria, 'SEXO': o(c.sexo), 'PELAJE': o(c.pelaje),
    'FECHA NAC.': c.nac ? fecha(c.nac) : '—', 'CAMADA': c.camada || '—', 'PADRE': o(c.padre), 'MADRE': o(c.madre),
    'OBSERVACIÓN': [c.obs, c.categoria === 'Descanso' && c.descansoDesde ? 'En descanso desde ' + ddmm(c.descansoDesde) + (c.descansoHasta ? ', volver a agarrar ' + ddmm(c.descansoHasta) : '') : ''].filter(Boolean).join(' · '),
    'EMBOCADURA': c.embocadura || '', 'APODO / OTRO NOMBRE': c.apodo || '' }));
}

function filasBajas(D) {
  return D.caballos.filter(c => c.estado !== 'Activo').sort((a, b) => (b.bajaFecha || '').localeCompare(a.bajaFecha || '') || a.nombre.localeCompare(b.nombre)).map(c => ({
    'NOMBRE': c.nombre, 'MOTIVO': c.estado, 'FECHA': c.bajaFecha ? fecha(c.bajaFecha) : '—', 'PRECIO': precio(c.bajaPrecio),
    'COMPRADOR / QUIÉN VENDIÓ': o(c.bajaComprador), 'DETALLE': c.bajaObs || c.obs || '' }));
}

function filasEventos(D) {
  return D.eventos.filter(e => e.fecha && SIN_EVENTOS.indexOf(e.tipo) < 0)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || (a.caballo || '').localeCompare(b.caballo || ''))
    .map(e => ({ 'FECHA': fecha(e.fecha), 'CABALLO': e.caballo || '', 'EVENTO': e.detalle || e.tipo, 'TIPO': GRUPO_EV[e.tipo] || 'Otro',
      'OBSERVACIÓN': e.obs || '', 'PRECIO': e.precio ? +e.precio || e.precio : '' }));
}

/* Una fila por madre: su servicio más nuevo. Las que murieron este año siguen apareciendo (historia de la temporada). */
function filasPreneces(D) {
  const t = +D.config.temporada || new Date().getFullYear();
  const madres = new Set(D.caballos.filter(c => ['Madres', 'Receptoras'].indexOf(c.categoria) >= 0).map(c => norm(c.nombre)));
  const ult = {};
  for (const s of D.servicios) {
    const k = norm(s.madre); if (!madres.has(k) || (+s.temporada || 0) < t) continue;
    const a = ult[k]; if (!a || (+s.temporada || 0) > (+a.temporada || 0) || ((+s.temporada || 0) === (+a.temporada || 0) && (s.fecha || '') > (a.fecha || ''))) ult[k] = s;
  }
  const orden = { 'Parida': 0, 'Preñada': 1, 'Servida (sin tacto)': 2, 'Abortó': 3, 'Vacía': 4 };
  return Object.values(ult).sort((a, b) => (orden[a.estado] ?? 9) - (orden[b.estado] ?? 9) || (a.fpp || '9').localeCompare(b.fpp || '9') || a.madre.localeCompare(b.madre))
    .map(s => ({ 'MADRE': s.madre, 'SERVICIO / TACTO': s.fecha ? fecha(s.fecha) : '—', 'PADRILLO': o(s.padrillo), 'ESTADO': s.estado || '—',
      'FPP (APP)': s.fpp && s.estado !== 'Vacía' ? fecha(s.fpp) : '—', 'OBSERVACIÓN': s.obs || '' }));
}

/* Último registro de cada cosa por caballo (la herrada también cuenta como desvase, igual que en la app) */
function ultimos(D) {
  const u = {};
  for (const e of D.eventos) for (const t of e.tipo === 'Herrada' ? ['Herrada', 'Desvasada'] : [e.tipo]) {
    const k = e.caballoId + '|' + t; if (e.fecha && (!u[k] || e.fecha > u[k])) u[k] = e.fecha;
  }
  return u;
}
function filasSanidad(D) {
  const u = ultimos(D);
  return D.caballos.filter(c => c.estado === 'Activo' && c.categoria !== 'Doma').sort(porCategoria).map(c => {
    const her = u[c.id + '|Herrada'] || '', desh = u[c.id + '|Desherrada'] || '';
    return { 'CABALLO': c.nombre, 'CATEGORÍA': c.categoria, 'ÚLT. DESPARASIT.': fecha(u[c.id + '|Desparasitación']),
      'ÚLT. DESVASE O HERRADA': fecha(u[c.id + '|Desvasada']), 'ÚLT. HERRADA': fecha(her), 'ÚLT. MUELAS': fecha(u[c.id + '|Muelas']),
      _desherrado: !!(her && desh >= her) };
  });
}

/* Camadas: por año, los caballos de esa camada y las madres preñadas de la temporada ("Por nacer") */
function datosCamadas(D) {
  const t = +D.config.temporada || new Date().getFullYear(), out = {};
  for (const c of D.caballos) if (c.camada) (out[c.camada] = out[c.camada] || { caballos: [], porNacer: [] }).caballos.push(c);
  const prenadas = D.servicios.filter(s => +s.temporada === t && s.estado === 'Preñada');
  (out[t] = out[t] || { caballos: [], porNacer: [] }).porNacer = prenadas;
  return out;
}
const normK = v => norm(v).replace(/[^A-Z0-9]/g, ''); // para comparar nombres escritos distinto (con o sin paréntesis)
// "Concepción" y "CONCEPCIÓN (POTRANCA PISTONE)" son la misma madre
const mismaMadre = (a, b) => { a = normK(a); b = normK(b); return !!a && !!b && (a === b || (Math.min(a.length, b.length) >= 4 && (a.startsWith(b) || b.startsWith(a)))); };
const hoyEsta = c => c.estado === 'Activo' ? c.categoria : (c.estado || 'Baja');


/* Mezcla los datos de la app en las filas de una camada (sin tocar el Sheet). Devuelve cuántas filas cambiaron. */
function mezclarFilasCamada(enc, ultimaCol, filas, formulas, datos) {
  const col = h => enc.indexOf(h), cN = col('NOMBRE EN APP'), cM = col('MADRE'), cH = col('HOY ESTÁ EN');
  const poner = (f, h, v) => { const j = col(h); if (j >= 0 && !formulas[j] && v !== undefined && v !== null && v !== '') f[j] = v; };
  const sinNombre = x => cN < 0 || !String(x[cN]).trim() || String(x[cN]).trim() === '—';
  const usadas = new Set();
  let cambios = 0;
  for (const c of datos.caballos) {
    let f = cN >= 0 ? filas.find(x => !usadas.has(x) && normK(x[cN]) === normK(c.nombre)) : null;
    let nombrar = false;
    if (!f && cH >= 0 && cM >= 0) { f = filas.find(x => !usadas.has(x) && norm(x[cH]) === 'POR NACER' && normK(x[cM]) === normK(c.madre)); nombrar = !!f; } // la madre parió
    if (!f && cM >= 0) f = filas.find(x => !usadas.has(x) && sinNombre(x) && mismaMadre(x[cM], c.madre)); // cría anotada sin nombre
    if (!f) { f = enc.slice(0, ultimaCol).map(() => ''); poner(f, 'MADRE', c.madre); poner(f, 'PADRILLO', c.padre); poner(f, 'OBSERVACIÓN', c.obs); filas.push(f); nombrar = true; }
    usadas.add(f);
    const antes = f.join('|');
    // Las camadas tienen datos cargados a mano (a veces más precisos): solo se completa lo vacío.
    // Lo único que siempre se actualiza es dónde está hoy.
    const vacio = h => { const j = col(h); return j >= 0 && (!String(f[j]).trim() || String(f[j]).trim() === '—'); };
    const completar = (h, v) => { if (nombrar || vacio(h)) poner(f, h, v); };
    if (nombrar) poner(f, 'NOMBRE EN APP', c.nombre);
    completar('N° / RP', c.rp); completar('N° CHIP', c.chip); completar('SEXO', c.sexo); completar('PELAJE', c.pelaje);
    completar('FECHA NAC.', c.nac ? fecha(c.nac) : ''); poner(f, 'HOY ESTÁ EN', hoyEsta(c));
    if (f.join('|') !== antes) cambios++;
  }
  for (const s of datos.porNacer) {
    if (cM < 0 || cH < 0) break;
    if (datos.caballos.some(c => mismaMadre(c.madre, s.madre)) || filas.some(x => mismaMadre(x[cM], s.madre))) continue;
    const f = enc.slice(0, ultimaCol).map(() => ''); poner(f, 'MADRE', s.madre); poner(f, 'PADRILLO', s.padrillo); poner(f, 'HOY ESTÁ EN', 'Por nacer');
    poner(f, 'OBSERVACIÓN', s.fpp ? 'FPP ' + ddmm(s.fpp) : ''); filas.push(f); cambios++;
  }
  return cambios;
}

if (typeof module !== 'undefined') module.exports = { mismaMadre, normK, mezclarFilasCamada, separar, filasCaballos, filasBajas, filasEventos, filasPreneces, filasSanidad, datosCamadas, hoyEsta, norm };

/* ===================== Escritura en el Sheet ===================== */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Doña Cecilia')
    .addItem('Actualizar ahora', 'actualizarAhora')
    .addSeparator()
    .addItem('Configurar clave', 'configurarClave')
    .addItem('Actualizar solo todos los días a las 7', 'activarDiario')
    .addItem('Dejar de actualizar solo', 'desactivarDiario')
    .addToUi();
}

function configurarClave() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Clave de Doña Cecilia', 'Pegá la clave del calendario (la que está en el link del calendario, después de k=).', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK || !r.getResponseText().trim()) return;
  PropertiesService.getScriptProperties().setProperty('DC_CLAVE', r.getResponseText().trim());
  ui.alert('Listo. Ahora tocá Doña Cecilia → Actualizar ahora.');
}

function activarDiario() {
  desactivarDiario();
  ScriptApp.newTrigger('actualizarTodo').timeBased().atHour(7).everyDays(1).inTimezone(ZONA).create();
  SpreadsheetApp.getUi().alert('Listo: el Sheet se va a actualizar solo todos los días a las 7.');
}
function desactivarDiario() {
  for (const tr of ScriptApp.getProjectTriggers()) if (tr.getHandlerFunction() === 'actualizarTodo') ScriptApp.deleteTrigger(tr);
}

function actualizarAhora() {
  const r = actualizarTodo();
  SpreadsheetApp.getUi().alert('Sheet actualizado con la app.\n\n' + r.join('\n'));
}

function leerApp() {
  const clave = PropertiesService.getScriptProperties().getProperty('DC_CLAVE');
  if (!clave) throw new Error('Falta la clave: Doña Cecilia → Configurar clave.');
  const res = UrlFetchApp.fetch(SB_URL + '/rest/v1/rpc/datos_calendario', { method: 'post', contentType: 'application/json',
    headers: { apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON }, payload: JSON.stringify({ p_clave: clave }), muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('La app no respondió (' + res.getResponseCode() + '). Revisá la clave.');
  const filas = JSON.parse(res.getContentText());
  if (!Array.isArray(filas) || !filas.length) throw new Error('La app no devolvió datos. Revisá la clave.');
  return separar(filas);
}

function actualizarTodo() {
  const lock = LockService.getDocumentLock(); lock.waitLock(30000);
  try {
    const D = leerApp(), ss = SpreadsheetApp.getActiveSpreadsheet(), r = [];
    if (D.caballos.filter(c => c.estado === 'Activo').length < 10) throw new Error('La app devolvió muy pocos caballos; no se tocó nada.');
    const cab = filasCaballos(D), baj = filasBajas(D), ev = filasEventos(D), pr = filasPreneces(D), san = filasSanidad(D);
    r.push('CABALLOS: ' + escribirTabla(ss, 'CABALLOS', 4, 'NOMBRE', cab) + ' caballos');
    r.push('BAJAS: ' + escribirTabla(ss, 'BAJAS', 4, 'NOMBRE', baj));
    r.push('EVENTOS: ' + escribirTabla(ss, 'EVENTOS', 4, null, ev));
    r.push('PREÑECES: ' + escribirTabla(ss, 'PREÑECES', 5, 'MADRE', pr) + ' madres');
    r.push('SANIDAD: ' + escribirTabla(ss, 'SANIDAD', 4, 'CABALLO', san, (sh, fila0, enc, filas) => {
      const k = enc.indexOf('ESTADO', enc.indexOf('ÚLT. HERRADA')) + 1; // el estado de la herrada
      filas.forEach((f, i) => { if (f._desherrado && k > 0) sh.getRange(fila0 + i, k).setValue('DESHERRADA'); });
    }));
    const cams = datosCamadas(D);
    for (const anio of Object.keys(cams)) { const n = mezclarCamada(ss, anio, cams[anio], D); if (n) r.push('CAMADA ' + anio + ': ' + n); }
    const cuando = Utilities.formatDate(new Date(), ZONA, 'dd/MM/yyyy HH:mm');
    for (const h of ['CABALLOS', 'BAJAS', 'EVENTOS']) {
      const c = ss.getSheetByName(h) && ss.getSheetByName(h).getRange('A2');
      if (c) c.setValue(String(c.getValue()).replace(/actualizad[oa][^·]*?(\d{2}\/\d{2}\/\d{4})( \d{2}:\d{2})?/i, m => m.replace(/\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2})?/, cuando)));
    }
    r.push('Última actualización: ' + cuando);
    return r;
  } finally { lock.releaseLock(); }
}

/* Reescribe una tabla: encabezados en la fila filaEnc y los datos abajo, hasta la primera fila vacía.
   - Columnas con fórmula: se vuelven a poner en todas las filas.
   - Columnas que la app no trae: se conserva lo que había para ese mismo caballo (clave).
   - Si hay más o menos filas que antes, se agregan o sacan filas dentro de la tabla, así lo de abajo
     (resúmenes) se corre solo y las fórmulas que cuentan la tabla siguen abarcándola. */
function escribirTabla(ss, nombre, filaEnc, clave, filas, despues) {
  const sh = ss.getSheetByName(nombre); if (!sh) return 'no está la pestaña';
  const nc = sh.getLastColumn(), enc = sh.getRange(filaEnc, 1, 1, nc).getValues()[0].map(v => String(v).trim().toUpperCase());
  let ultimaCol = enc.length; while (ultimaCol > 0 && !enc[ultimaCol - 1]) ultimaCol--;
  const fila0 = filaEnc + 1;
  const colA = sh.getRange(fila0, 1, Math.max(sh.getLastRow() - filaEnc, 1), 1).getValues();
  let n0 = 0; while (n0 < colA.length && colA[n0][0] !== '') n0++;
  const viejo = n0 ? sh.getRange(fila0, 1, n0, ultimaCol).getValues() : [];
  const formulas = n0 ? sh.getRange(fila0, 1, 1, ultimaCol).getFormulasR1C1()[0] : [];
  const kc = clave ? enc.indexOf(clave) : -1, porClave = {};
  if (kc >= 0) viejo.forEach(f => { porClave[norm(f[kc])] = f; });
  const nuevas = filas.map(f => {
    const ant = kc >= 0 ? porClave[norm(f[clave])] : null;
    return enc.slice(0, ultimaCol).map((h, j) => formulas[j] ? '' : (h in f ? f[h] : (ant ? ant[j] : '')));
  });
  const n1 = nuevas.length;
  if (n1 > n0) { if (n0) sh.insertRowsAfter(fila0, n1 - n0); else sh.insertRowsBefore(fila0, n1); }
  if (n1 < n0) { if (n1) sh.deleteRows(fila0 + 1, n0 - n1); else { sh.deleteRows(fila0 + 1, n0 - 1); sh.getRange(fila0, 1, 1, ultimaCol).clearContent(); } }
  if (n1) {
    sh.getRange(fila0, 1, n1, ultimaCol).setValues(nuevas);
    formulas.forEach((fx, j) => { if (fx) sh.getRange(fila0, j + 1, n1, 1).setFormulaR1C1(fx); });
    if (despues) despues(sh, fila0, enc, filas);
  }
  return n1;
}

/* Camadas: no se reescriben (tienen notas a mano). Se actualizan los datos que vienen de la app,
   se reemplaza "Por nacer" cuando la madre pare y se agregan los que faltan. */
function mezclarCamada(ss, anio, datos, D) {
  const sh = ss.getSheetByName('CAMADA ' + anio); if (!sh) return '';
  const filaEnc = 4, fila0 = 5, nc = sh.getLastColumn();
  const enc = sh.getRange(filaEnc, 1, 1, nc).getValues()[0].map(v => String(v).trim().toUpperCase());
  let ultimaCol = enc.length; while (ultimaCol > 0 && !enc[ultimaCol - 1]) ultimaCol--;
  const colA = sh.getRange(fila0, 1, Math.max(sh.getLastRow() - filaEnc, 1), 1).getValues();
  let n0 = 0; while (n0 < colA.length && colA[n0][0] !== '') n0++;
  const filas = n0 ? sh.getRange(fila0, 1, n0, ultimaCol).getValues() : [];
  const formulas = n0 ? sh.getRange(fila0, 1, 1, ultimaCol).getFormulasR1C1()[0] : [];
  const cambios = mezclarFilasCamada(enc, ultimaCol, filas, formulas, datos);
  if (!cambios) return '';
  const n1 = filas.length;
  if (n1 > n0) { if (n0) sh.insertRowsAfter(fila0, n1 - n0); else sh.insertRowsBefore(fila0, n1); }
  sh.getRange(fila0, 1, n1, ultimaCol).setValues(filas.map(f => f.map((v, j) => formulas[j] ? '' : v)));
  formulas.forEach((fx, j) => { if (fx) sh.getRange(fila0, j + 1, n1, 1).setFormulaR1C1(fx); });
  return cambios + ' cambios';
}
