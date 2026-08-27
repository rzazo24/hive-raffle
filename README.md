# hive-raffle

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fhive-raffle.vercel.app%2F)
![Last Commit](https://img.shields.io/github/last-commit/rzazo24/hive-raffle)
![Issues](https://img.shields.io/github/issues/rzazo24/hive-raffle)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Hive](https://img.shields.io/badge/blockchain-Hive-red)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

Verifiable raffles using the Hive blockchain as a source of randomness.

🔗 Live: [hive-raffle.vercel.app](https://hive-raffle.vercel.app/)

Instead of relying on a `Math.random()` that nobody can check, this project
uses the `block_id` of a future Hive block as the seed: nobody can predict it
in advance, so nobody can manipulate the result — and anyone can recompute it
afterwards to confirm it's legitimate.

## How it works

1. **Participants**: the authors of the top-level comments on a Hive post
   (`author` + `permlink`) become the entrants.
2. **Seed**: a future Hive block number is committed to and announced
   publicly before that block exists.
3. **Winner**: once the block exists, SHA-256 is applied to its `block_id`,
   and the result (interpreted as a number) decides the winning index within
   the list of participants.
4. **Verification**: anyone can enter the same `author`, `permlink`, and
   block number in the "Verify raffle" tab and confirm they get the same
   winner.

## Local development

This project has no build step, but it uses ES modules
(`<script type="module">`), which **do not work by double-clicking
`index.html`**. Serve the directory with a local server, for example:

```bash
python -m http.server 8000
```

and open `http://localhost:8000`.

## Deployment

A fully static site, currently deployed on [Vercel](https://vercel.com)
(auto-deployed from the `main` branch), but it works just as well on GitHub
Pages, Netlify, or any static host — no extra configuration needed.

## Stack

- Vanilla HTML / CSS / JavaScript (no frameworks, no bundler).
- Hive's public RPC API (`https://api.hive.blog`, with a fallback node).
- The browser's native Web Crypto API for SHA-256.
