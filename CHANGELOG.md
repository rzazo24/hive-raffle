# Changelog

All notable changes to this project are documented in this file.

## [0.5.1] - 2026-10-05

### Changed
- CLAUDE.md is now tracked in the repo (removed it and the now-empty `.gitignore` from the ignore setup).

### Docs
- Updated the repository notes in CLAUDE.md (repo is private).

## [0.5.0] - 2026-09-29

### Changed
- Scrollbars restyled to match the site design (thin, red-to-cyan gradient thumb, same as hive-scope).

## [0.4.0] - 2026-09-02

### Added
- Vercel Analytics script (same as hive-scope).
- Favicon reusing the logo mark (diamond + cyan die).

## [0.3.0] - 2026-08-28

### Added
- Optional entry deadline filter: comments posted after a chosen UTC cutoff don't count as participants.
- Optional require-voter filter: participants must have upvoted the post (downvotes excluded).

### Docs
- Added a homepage screenshot to the README.

## [0.2.0] - 2026-08-28

### Added
- MIT license.

### Changed
- Removed CLAUDE.md from the repo; kept it local only as Claude Code context.

### Docs
- Rewrote the README in English and translated all code comments to English.
- Added badges and the live Vercel URL to the README.

## [0.1.0] - 2026-08-28

### Added
- Initial release: verifiable Hive raffles using a future block's `block_id` as the random seed (commit-reveal scheme), with a "Verify raffle" mode to independently recompute and confirm any announced winner.
