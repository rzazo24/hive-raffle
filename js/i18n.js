// i18n.js
//
// Sistema de traducción muy simple, sin librerías externas: un diccionario
// de textos por idioma, y unas pocas funciones para leerlo, guardarlo y
// aplicarlo al HTML.
//
// Cómo funciona en el HTML: cualquier elemento con el atributo
// data-i18n="miClave" mostrará translations[idioma].miClave como su texto.
// Para placeholders de inputs se usa data-i18n-placeholder en su lugar.

export const translations = {
  en: {
    appSubtitle: 'Verifiable raffles using the Hive blockchain as a source of randomness.',

    tabCreate: 'Create raffle',
    tabVerify: 'Verify raffle',

    step1Title: 'Step 1 — Configure the raffle',
    step1Help:
      'Enter the post whose comments will be the participants. This tool will suggest a ' +
      'future Hive block as the raffle\'s seed: since nobody can predict the contents of a ' +
      'block that doesn\'t exist yet, nobody can manipulate the result — not even you.',
    labelAuthor: 'Post author',
    labelPermlink: 'Post permlink',
    placeholderAuthor: 'e.g. hiveio',
    placeholderPermlink: 'e.g. my-raffle-post',
    btnSuggestBlock: 'Suggest future block',
    btnSuggestBlockLoading: 'Querying Hive...',
    labelBlockNum: 'Target block (you can edit it, but it must be in the future)',
    commitHelp:
      'Publish this text publicly (for example as a comment on your own post) ' +
      'before that block arrives, so everyone knows in advance which block will decide the raffle:',
    btnCopyText: '📋 Copy text',
    btnCheckStatus: '🔄 Check if the raffle can run yet',

    step2Title: 'Step 2 — Draw',
    step2Help: 'Available as soon as the target block exists and is irreversible.',
    btnDraw: '🎉 Draw now',
    btnDrawLoading: 'Drawing...',

    verifyTitle: 'Verify a past raffle',
    verifyHelp:
      'Enter the same data the organizer used (author, permlink and block number) and this ' +
      'tool will recompute the result from scratch. If it matches the announced winner, the raffle was legitimate.',
    labelBlockNumSeed: 'Block number used as the seed',
    labelAnnouncedWinner: 'Announced winner (optional, for automatic comparison)',
    placeholderAnnouncedWinner: 'e.g. some-user',
    btnVerify: '🔍 Verify',
    btnVerifyLoading: 'Verifying...',

    statusWaiting: '⏳ Still {blocks} blocks left (~{minutes} min) until the raffle can run.',
    statusReady: '✅ The target block already exists and is irreversible. You can draw now!',
    statusError: 'Could not check status: {msg}',

    commitText:
      'Raffle for @{author}/{permlink}\n' +
      'Will be resolved using Hive block #{blockNum}.\n' +
      'Verify it yourself at: hive-raffle ("Verify raffle" tab)',

    resultTitle: 'Result',
    resultPost: 'Post:',
    resultBlockUsed: 'Block used as seed:',
    resultBlockId: 'block_id:',
    resultParticipants: 'Participants ({count}):',
    resultSeeList: 'See full list',
    resultWinner: '🏆 Winner:',
    resultMatch: '✅ Matches the announced winner ("{name}").',
    resultNoMatch: '❌ Does NOT match the announced winner ("{name}"). Something is off.',

    errQueryFailed: 'Could not query Hive: {msg}',
    errDrawFailed: 'Could not complete the raffle: {msg}',
    errVerifyFailed: 'Could not verify: {msg}',
    errBlockNotExist: "Block #{blockNum} doesn't exist yet.",

    footerText:
      'Open source · No backend · Data is read directly from the public Hive API (api.hive.blog).',
    footerMadeBy:
      'Made with <span class="heart">❤️</span> by <a href="https://peakd.com/@rzazo24" target="_blank" rel="noopener">@rzazo24</a>',
  },

  es: {
    appSubtitle: 'Sorteos verificables usando la blockchain de Hive como fuente de aleatoriedad.',

    tabCreate: 'Crear sorteo',
    tabVerify: 'Verificar sorteo',

    step1Title: 'Paso 1 — Configurar el sorteo',
    step1Help:
      'Indica el post cuyos comentarios serán los participantes. La web te sugerirá un ' +
      'bloque futuro de Hive como semilla del sorteo: como nadie puede predecir el contenido ' +
      'de un bloque que aún no existe, nadie puede manipular el resultado — ni siquiera tú.',
    labelAuthor: 'Autor del post',
    labelPermlink: 'Permlink del post',
    placeholderAuthor: 'p. ej. hiveio',
    placeholderPermlink: 'p. ej. mi-post-de-sorteo',
    btnSuggestBlock: 'Sugerir bloque futuro',
    btnSuggestBlockLoading: 'Consultando Hive...',
    labelBlockNum: 'Bloque objetivo (puedes editarlo, pero debe ser futuro)',
    commitHelp:
      'Publica este texto públicamente (por ejemplo, como comentario en tu propio post) ' +
      'antes de que llegue ese bloque, para que todo el mundo sepa de antemano qué bloque decidirá el sorteo:',
    btnCopyText: '📋 Copiar texto',
    btnCheckStatus: '🔄 Comprobar si ya se puede sortear',

    step2Title: 'Paso 2 — Sortear',
    step2Help: 'Disponible en cuanto el bloque objetivo ya exista y sea irreversible.',
    btnDraw: '🎉 Sortear ahora',
    btnDrawLoading: 'Sorteando...',

    verifyTitle: 'Verificar un sorteo ya realizado',
    verifyHelp:
      'Introduce los mismos datos que usó el organizador (autor, permlink y número de bloque) ' +
      'y la web recalculará el resultado desde cero. Si coincide con el ganador anunciado, el sorteo era legítimo.',
    labelBlockNumSeed: 'Número de bloque usado como semilla',
    labelAnnouncedWinner: 'Ganador anunciado (opcional, para comparar automáticamente)',
    placeholderAnnouncedWinner: 'p. ej. algun-usuario',
    btnVerify: '🔍 Verificar',
    btnVerifyLoading: 'Verificando...',

    statusWaiting: '⏳ Aún faltan {blocks} bloques (~{minutes} min) para poder sortear.',
    statusReady: '✅ El bloque objetivo ya existe y es irreversible. ¡Ya puedes sortear!',
    statusError: 'No se pudo comprobar el estado: {msg}',

    commitText:
      'Sorteo de @{author}/{permlink}\n' +
      'Se resolverá usando el bloque de Hive #{blockNum}.\n' +
      'Verifícalo tú mismo en: hive-raffle (pestaña "Verificar sorteo")',

    resultTitle: 'Resultado',
    resultPost: 'Post:',
    resultBlockUsed: 'Bloque usado como semilla:',
    resultBlockId: 'block_id:',
    resultParticipants: 'Participantes ({count}):',
    resultSeeList: 'Ver lista completa',
    resultWinner: '🏆 Ganador:',
    resultMatch: '✅ Coincide con el ganador anunciado ("{name}").',
    resultNoMatch: '❌ NO coincide con el ganador anunciado ("{name}"). Algo no cuadra.',

    errQueryFailed: 'No se pudo consultar Hive: {msg}',
    errDrawFailed: 'No se pudo completar el sorteo: {msg}',
    errVerifyFailed: 'No se pudo verificar: {msg}',
    errBlockNotExist: 'El bloque #{blockNum} todavía no existe.',

    footerText:
      'Código abierto · Sin backend · Los datos se leen directamente de la API pública de Hive (api.hive.blog).',
    footerMadeBy:
      'Hecho con <span class="heart">❤️</span> por <a href="https://peakd.com/@rzazo24" target="_blank" rel="noopener">@rzazo24</a>',
  },
};

const STORAGE_KEY = 'hive-raffle-lang';
const IDIOMA_POR_DEFECTO = 'en';

// Lee el idioma guardado en este navegador, o 'en' si es la primera visita.
export function getLang() {
  return localStorage.getItem(STORAGE_KEY) || IDIOMA_POR_DEFECTO;
}

// Guarda el idioma elegido para que se recuerde en la próxima visita.
export function setLang(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
}

// Traduce una clave al idioma actual, sustituyendo variables tipo {nombre}
// si se pasan. Ejemplo: t('resultParticipants', { count: 5 })
export function t(key, vars = {}) {
  const idioma = getLang();
  let texto = translations[idioma][key] ?? translations[IDIOMA_POR_DEFECTO][key] ?? key;

  for (const [nombreVariable, valor] of Object.entries(vars)) {
    texto = texto.replaceAll(`{${nombreVariable}}`, valor);
  }

  return texto;
}

// Recorre todo el HTML y traduce los elementos marcados con data-i18n
// (texto) y data-i18n-placeholder (placeholders de inputs).
export function applyStaticTranslations() {
  document.documentElement.lang = getLang();

  // Usamos innerHTML (no textContent) porque algunas traducciones incluyen
  // HTML sencillo, como el enlace del pie de página. Todas las traducciones
  // están escritas a mano en este mismo archivo (no vienen de fuera), así
  // que no hay riesgo de inyectar contenido de un tercero.
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}
