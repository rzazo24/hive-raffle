// hive-api.js
//
// This is where ALL communication with the Hive blockchain lives.
// These functions only request data from the API and return it "as is" —
// they don't compute anything or decide winners. That logic lives in raffle.js.
//
// What is Hive's RPC API? It's a server we send HTTP requests to with the
// JSON-RPC format ("give me block number X", "give me this post's
// comments"...) and it replies with data in JSON.

// List of public nodes. If the first one fails (down, slow, error), we try
// the next one. This makes the site more reliable.
const NODES = ['https://api.hive.blog', 'https://anyx.io'];

// Internal helper: makes a JSON-RPC call, trying each node in the list
// until one responds successfully.
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
        throw new Error(data.error.message || 'Unknown RPC error');
      }

      return data.result;
    } catch (err) {
      lastError = err;
      console.warn(`[hive-api] Failed on ${node} (${method}):`, err.message);
      // We don't re-throw yet: we try the next node.
    }
  }

  throw new Error(`Could not reach any Hive node for "${method}": ${lastError?.message}`);
}

// Returns the list of replies (top-level comments) to a post.
// Each reply includes, among other things, the "author" field.
export async function getContentReplies(author, permlink) {
  return rpcCall('condenser_api.get_content_replies', [author, permlink]);
}

// Returns the full block with that number, including its "block_id"
// (the unique, immutable identifier for that block).
export async function getBlock(blockNum) {
  return rpcCall('condenser_api.get_block', [blockNum]);
}

// Returns the list of votes on a post, including who voted ("voter") and
// how strongly (a negative "percent" means a downvote).
export async function getActiveVotes(author, permlink) {
  return rpcCall('condenser_api.get_active_votes', [author, permlink]);
}

// Returns the blockchain's global properties right now:
// head_block_number (the most recent block that exists) and
// last_irreversible_block_num (the last block that can no longer change,
// not even through a chain reorganization).
export async function getDynamicGlobalProperties() {
  return rpcCall('condenser_api.get_dynamic_global_properties', []);
}
