// app.js
//
// El "pegamento" entre la interfaz (HTML) y la lógica (hive-api.js + raffle.js).
// Aquí NO hay cálculos importantes: solo leemos lo que el usuario escribe,
// llamamos a las funciones correctas, y mostramos el resultado en pantalla.
//
// También gestiona el idioma (inglés por defecto, con botón para cambiar a
// español): como buena parte del contenido de esta página se genera por
// JavaScript (resultados, mensajes de estado...) en vez de estar ya escrito
// en el HTML, guardamos los últimos datos calculados para poder "repintarlos"
// en el nuevo idioma sin tener que volver a pedirlos a Hive.

import { getContentReplies, getBlock, getDynamicGlobalProperties } from './hive-api.js';
import { computeRaffle } from './raffle.js';
import { t, getLang, setLang, applyStaticTranslations } from './i18n.js';

// Cuántos bloques nuevos añadir al sugerir un "bloque futuro" para el sorteo.
// Hive genera un bloque cada ~3 segundos, así que 1200 bloques ≈ 1 hora.
// Le da tiempo de sobra al organizador a publicar el anuncio antes de que
// el bloque objetivo exista.
const BLOQUES_DE_MARGEN = 1200;
const SEGUNDOS_POR_BLOQUE = 3;

// Estado que necesitamos recordar para poder redibujar la pantalla
// (por ejemplo, al cambiar de idioma) sin volver a llamar a la API de Hive.
let sorteoEnCurso = null; // { author, permlink, blockNum } del sorteo que se está configurando
let ultimoEstadoBloque = null; // último resultado de "¿ya se puede sortear?"
let ultimoResultado = { crear: null, verificar: null }; // últimos resultados calculados

// ---------- Idioma ----------

function cambiarIdioma() {
  const nuevoIdioma = getLang() === 'en' ? 'es' : 'en';
  setLang(nuevoIdioma);
  refrescarTodoElIdioma();
}

function actualizarBotonIdioma() {
  // Igual que en hive-scope: el botón muestra la bandera y el código del
  // idioma ACTUAL (no el idioma al que cambiarías al pulsarlo).
  document.getElementById('lang-flag').textContent = getLang() === 'es' ? '🇪🇸' : '🇬🇧';
  document.getElementById('lang-label').textContent = getLang().toUpperCase();
}

// Vuelve a pintar todo lo que hay en pantalla en el idioma actual: los
// textos estáticos (vía data-i18n) y también el contenido que generamos
// dinámicamente con JavaScript, usando los datos que tenemos guardados.
function refrescarTodoElIdioma() {
  applyStaticTranslations();
  actualizarBotonIdioma();

  if (sorteoEnCurso && !document.getElementById('config-resultado').classList.contains('hidden')) {
    actualizarTextoDeCompromiso();
  }
  pintarEstadoBloque();

  if (ultimoResultado.crear) pintarResultado('resultado-crear', ultimoResultado.crear);
  if (ultimoResultado.verificar) pintarResultado('resultado-verificar', ultimoResultado.verificar);
}

// ---------- Pestañas ----------

function setupTabs() {
  const botones = document.querySelectorAll('.tab-btn');
  botones.forEach((boton) => {
    boton.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));

      boton.classList.add('active');
      document.getElementById(`tab-${boton.dataset.tab}`).classList.add('active');
    });
  });
}

// ---------- Paso 1: Configurar sorteo ----------

async function handleConfigurar(evento) {
  evento.preventDefault();

  const author = document.getElementById('config-author').value.trim();
  const permlink = document.getElementById('config-permlink').value.trim();

  const boton = evento.target.querySelector('button');
  boton.disabled = true;
  boton.textContent = t('btnSuggestBlockLoading');

  try {
    const props = await getDynamicGlobalProperties();
    const blockNumSugerido = props.head_block_number + BLOQUES_DE_MARGEN;

    sorteoEnCurso = { author, permlink, blockNum: blockNumSugerido };

    document.getElementById('config-blocknum').value = blockNumSugerido;
    document.getElementById('config-resultado').classList.remove('hidden');

    actualizarTextoDeCompromiso();
    await actualizarEstadoBloque();
  } catch (err) {
    alert(t('errQueryFailed', { msg: err.message }));
  } finally {
    boton.disabled = false;
    boton.textContent = t('btnSuggestBlock');
  }
}

function actualizarTextoDeCompromiso() {
  const blockNum = document.getElementById('config-blocknum').value;
  const { author, permlink } = sorteoEnCurso;

  document.getElementById('config-texto').value = t('commitText', { author, permlink, blockNum });
}

async function actualizarEstadoBloque() {
  const blockNum = Number(document.getElementById('config-blocknum').value);
  sorteoEnCurso.blockNum = blockNum;

  try {
    const props = await getDynamicGlobalProperties();
    const bloquesRestantes = blockNum - props.last_irreversible_block_num;

    if (bloquesRestantes > 0) {
      const minutosAprox = Math.ceil((bloquesRestantes * SEGUNDOS_POR_BLOQUE) / 60);
      ultimoEstadoBloque = { tipo: 'esperando', bloquesRestantes, minutosAprox };
    } else {
      ultimoEstadoBloque = { tipo: 'listo' };
    }
  } catch (err) {
    ultimoEstadoBloque = { tipo: 'error', mensaje: err.message };
  }

  pintarEstadoBloque();
}

// Pinta ultimoEstadoBloque en pantalla, en el idioma actual.
function pintarEstadoBloque() {
  if (!ultimoEstadoBloque) return;

  const estadoEl = document.getElementById('config-estado');
  const botonSortear = document.getElementById('btn-sortear');

  if (ultimoEstadoBloque.tipo === 'esperando') {
    estadoEl.textContent = t('statusWaiting', {
      blocks: ultimoEstadoBloque.bloquesRestantes,
      minutes: ultimoEstadoBloque.minutosAprox,
    });
    botonSortear.disabled = true;
  } else if (ultimoEstadoBloque.tipo === 'listo') {
    estadoEl.textContent = t('statusReady');
    botonSortear.disabled = false;
  } else {
    estadoEl.textContent = t('statusError', { msg: ultimoEstadoBloque.mensaje });
  }
}

// ---------- Paso 2: Sortear ----------

async function handleSortear() {
  const boton = document.getElementById('btn-sortear');
  boton.disabled = true;
  boton.textContent = t('btnDrawLoading');

  try {
    const { author, permlink, blockNum } = sorteoEnCurso;
    const resultado = await ejecutarSorteo(author, permlink, blockNum);

    mostrarResultado('resultado-crear', { author, permlink, blockNum, ...resultado });
  } catch (err) {
    alert(t('errDrawFailed', { msg: err.message }));
  } finally {
    boton.disabled = false;
    boton.textContent = t('btnDraw');
  }
}

// ---------- Verificación ----------

async function handleVerificar(evento) {
  evento.preventDefault();

  const author = document.getElementById('verify-author').value.trim();
  const permlink = document.getElementById('verify-permlink').value.trim();
  const blockNum = Number(document.getElementById('verify-blocknum').value);
  const ganadorAnunciado = document.getElementById('verify-ganador-anunciado').value.trim();

  const boton = evento.target.querySelector('button');
  boton.disabled = true;
  boton.textContent = t('btnVerifyLoading');

  try {
    const resultado = await ejecutarSorteo(author, permlink, blockNum);

    mostrarResultado('resultado-verificar', {
      author,
      permlink,
      blockNum,
      ganadorAnunciado: ganadorAnunciado || null,
      ...resultado,
    });
  } catch (err) {
    alert(t('errVerifyFailed', { msg: err.message }));
  } finally {
    boton.disabled = false;
    boton.textContent = t('btnVerify');
  }
}

// Función compartida: obtiene los datos de Hive necesarios y calcula el sorteo.
// La usan TANTO "Sortear ahora" como "Verificar", para garantizar que ambos
// caminos hacen exactamente lo mismo.
async function ejecutarSorteo(author, permlink, blockNum) {
  const [replies, block] = await Promise.all([
    getContentReplies(author, permlink),
    getBlock(blockNum),
  ]);

  if (!block) {
    throw new Error(t('errBlockNotExist', { blockNum }));
  }

  return computeRaffle({ replies, block });
}

// ---------- Mostrar resultados ----------

// Guarda los datos del resultado (para poder repintarlo si cambia el idioma)
// y lo pinta en pantalla.
function mostrarResultado(elementId, datos) {
  if (elementId === 'resultado-crear') ultimoResultado.crear = datos;
  if (elementId === 'resultado-verificar') ultimoResultado.verificar = datos;

  pintarResultado(elementId, datos);
}

function pintarResultado(elementId, datos) {
  const { author, permlink, blockNum, blockId, participantes, ganador, ganadorAnunciado } = datos;

  const contenedor = document.getElementById(elementId);
  contenedor.classList.remove('hidden');

  let comparacionHtml = '';
  if (ganadorAnunciado) {
    const coincide = ganadorAnunciado === ganador;
    const clave = coincide ? 'resultMatch' : 'resultNoMatch';
    const clase = coincide ? 'ok' : 'error';
    comparacionHtml = `<p class="${clase}">${t(clave, { name: ganadorAnunciado })}</p>`;
  }

  contenedor.innerHTML = `
    <h3>${t('resultTitle')}</h3>
    <p><strong>${t('resultPost')}</strong> @${author}/${permlink}</p>
    <p><strong>${t('resultBlockUsed')}</strong> #${blockNum}</p>
    <p><strong>${t('resultBlockId')}</strong> <code>${blockId}</code></p>
    <p><strong>${t('resultParticipants', { count: participantes.length })}</strong></p>
    <details>
      <summary>${t('resultSeeList')}</summary>
      <ol>${participantes.map((p) => `<li>${p}</li>`).join('')}</ol>
    </details>
    <p class="ganador">${t('resultWinner')} <strong>@${ganador}</strong></p>
    ${comparacionHtml}
  `;
}

// ---------- Inicialización ----------

function init() {
  applyStaticTranslations();
  actualizarBotonIdioma();

  setupTabs();

  document.getElementById('lang-btn').addEventListener('click', cambiarIdioma);
  document.getElementById('form-configurar').addEventListener('submit', handleConfigurar);
  document.getElementById('config-blocknum').addEventListener('change', actualizarTextoDeCompromiso);
  document.getElementById('btn-actualizar-estado').addEventListener('click', actualizarEstadoBloque);
  document.getElementById('btn-sortear').addEventListener('click', handleSortear);
  document.getElementById('form-verificar').addEventListener('submit', handleVerificar);

  document.getElementById('btn-copiar-texto').addEventListener('click', () => {
    const textarea = document.getElementById('config-texto');
    textarea.select();
    navigator.clipboard.writeText(textarea.value);
  });
}

init();
