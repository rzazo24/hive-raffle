// raffle.js
//
// Lógica "pura" del sorteo: estas funciones NO hacen peticiones de red,
// solo transforman los datos que les pasamos. Al ser puras (mismos datos
// de entrada -> siempre el mismo resultado), son la parte más fácil de
// confiar y de verificar de todo el proyecto.
//
// Esta es la razón por la que el modo "crear sorteo" y el modo "verificar"
// SIEMPRE dan el mismo resultado: ambos llaman exactamente a esta misma
// función, computeRaffle().

// De la lista de respuestas de Hive, extrae los autores únicos (participantes).
// Si alguien comenta varias veces, solo cuenta una vez.
export function extractParticipants(replies) {
  const autores = replies.map((reply) => reply.author);
  const unicos = [...new Set(autores)];
  // Orden alfabético: así el orden de la lista es siempre el mismo,
  // sin depender del orden en que la API haya devuelto los comentarios.
  return unicos.sort();
}

// Calcula el hash SHA-256 de un texto usando la Web Crypto API del navegador.
// Un hash es una "huella digital": el mismo texto siempre da el mismo hash,
// pero es imposible predecir el hash sin calcularlo, y un cambio mínimo en
// el texto de entrada da un hash completamente distinto.
export async function sha256Hex(texto) {
  const bytesDeEntrada = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytesDeEntrada);
  const hashBytes = Array.from(new Uint8Array(hashBuffer));
  return hashBytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// A partir del block_id (nuestra "semilla" aleatoria verificable) y el
// número de participantes, calcula de forma determinista qué índice gana.
export async function pickWinnerIndex(blockId, totalParticipantes) {
  if (totalParticipantes <= 0) {
    // Este archivo es lógica pura y no depende del sistema de idiomas (i18n.js),
    // así que este mensaje interno se deja en inglés como idioma por defecto.
    throw new Error('No participants to draw from.');
  }

  const hashHex = await sha256Hex(blockId);

  // Un hash SHA-256 es un número enorme (256 bits), demasiado grande para
  // el tipo "number" normal de JavaScript. Por eso usamos BigInt, que puede
  // representar enteros de cualquier tamaño.
  const hashComoNumeroGrande = BigInt('0x' + hashHex);

  // El resto de la división (%) por el número de participantes nos da
  // un índice válido dentro de la lista, repartido de forma uniforme.
  const indice = hashComoNumeroGrande % BigInt(totalParticipantes);

  return Number(indice);
}

// Función principal del sorteo. Recibe los datos ya obtenidos de Hive
// (replies y block) y devuelve el resultado completo.
export async function computeRaffle({ replies, block }) {
  const participantes = extractParticipants(replies);
  const blockId = block.block_id;
  const indiceGanador = await pickWinnerIndex(blockId, participantes.length);
  const ganador = participantes[indiceGanador];

  return {
    participantes,
    blockId,
    indiceGanador,
    ganador,
  };
}
