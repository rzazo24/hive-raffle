// raffle.js
//
// "Pure" raffle logic: these functions do NOT make network requests, they
// only transform the data we pass them. Being pure (same input data ->
// always the same result) makes this the easiest part of the whole
// project to trust and to verify.
//
// This is why the "create raffle" mode and the "verify" mode ALWAYS give
// the same result: both call this exact same function, computeRaffle().

// From the list of Hive replies, extracts the unique authors (participants).
// If someone comments more than once, they only count once.
export function extractParticipants(replies) {
  const authors = replies.map((reply) => reply.author);
  const unique = [...new Set(authors)];
  // Alphabetical order: this way the list order is always the same,
  // regardless of the order the API returned the comments in.
  return unique.sort();
}

// Computes the SHA-256 hash of a text using the browser's Web Crypto API.
// A hash is a "digital fingerprint": the same text always produces the same
// hash, but it's impossible to predict the hash without computing it, and a
// tiny change in the input text gives a completely different hash.
export async function sha256Hex(text) {
  const inputBytes = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', inputBytes);
  const hashBytes = Array.from(new Uint8Array(hashBuffer));
  return hashBytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// From the block_id (our verifiable random "seed") and the number of
// participants, deterministically computes which index wins.
export async function pickWinnerIndex(blockId, totalParticipants) {
  if (totalParticipants <= 0) {
    // This file is pure logic and doesn't depend on the i18n system
    // (i18n.js), so this internal message is left in English as the
    // default language.
    throw new Error('No participants to draw from.');
  }

  const hashHex = await sha256Hex(blockId);

  // A SHA-256 hash is a huge number (256 bits), too big for JavaScript's
  // regular "number" type. That's why we use BigInt, which can represent
  // integers of any size.
  const hashAsBigNumber = BigInt('0x' + hashHex);

  // The remainder of the division (%) by the number of participants gives
  // us a valid index into the list, distributed uniformly.
  const index = hashAsBigNumber % BigInt(totalParticipants);

  return Number(index);
}

// Main raffle function. Receives data already fetched from Hive (replies
// and block) and returns the full result.
export async function computeRaffle({ replies, block }) {
  const participants = extractParticipants(replies);
  const blockId = block.block_id;
  const winnerIndex = await pickWinnerIndex(blockId, participants.length);
  const winner = participants[winnerIndex];

  return {
    participantes: participants,
    blockId,
    indiceGanador: winnerIndex,
    ganador: winner,
  };
}
