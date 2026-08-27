// hive-api.js
//
// Aquí vive TODA la comunicación con la blockchain de Hive.
// Estas funciones solo piden datos a la API y los devuelven "en crudo" —
// no calculan nada ni deciden ganadores. Esa lógica está en raffle.js.
//
// ¿Qué es la API RPC de Hive? Es un servidor al que le mandamos peticiones
// HTTP con el formato JSON-RPC ("dame el bloque número X", "dame los
// comentarios de este post"...) y nos responde con datos en JSON.

// Lista de nodos públicos. Si el primero falla (caído, lento, con error),
// probamos el siguiente. Así la web es más fiable.
const NODES = ['https://api.hive.blog', 'https://anyx.io'];

// Función interna: hace una llamada JSON-RPC probando cada nodo de la lista
// hasta que uno responda correctamente.
async function rpcCall(method, params) {
  let lastError;

  for (const node of NODES) {
    try {
      const response = await fetch(node, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Error RPC desconocido');
      }

      return data.result;
    } catch (err) {
      lastError = err;
      console.warn(`[hive-api] Fallo en ${node} (${method}):`, err.message);
      // No relanzamos el error todavía: probamos el siguiente nodo.
    }
  }

  throw new Error(`No se pudo contactar con ningún nodo de Hive para "${method}": ${lastError?.message}`);
}

// Devuelve la lista de respuestas (comentarios de primer nivel) a un post.
// Cada respuesta incluye, entre otras cosas, el campo "author".
export async function getContentReplies(author, permlink) {
  return rpcCall('condenser_api.get_content_replies', [author, permlink]);
}

// Devuelve el bloque completo con ese número, incluyendo su "block_id"
// (el identificador único e inmutable de ese bloque).
export async function getBlock(blockNum) {
  return rpcCall('condenser_api.get_block', [blockNum]);
}

// Devuelve las propiedades globales de la blockchain en este momento:
// head_block_number (el bloque más reciente que existe) y
// last_irreversible_block_num (el último bloque que ya no puede cambiar,
// ni siquiera por una reorganización de la cadena).
export async function getDynamicGlobalProperties() {
  return rpcCall('condenser_api.get_dynamic_global_properties', []);
}
