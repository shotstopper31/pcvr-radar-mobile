# PCVR Radar v0.8 — Standalone PCVR mod intelligence (mobile + desktop)

A responsive installable progressive web app, independent of your home PC, hosted on GitHub Pages. Open the public site on your Galaxy S24+, Windows Edge, or CachyOS Firefox. Maintains the original game artwork, Ocean/Firestorm theme, compact mobile design and locally saved watchlist/ownership.

## v0.8 additions

- Game Hubs: group alternate VR mods for one game, with links to official sources and a comparison modal.
- Evidence-based Radar Readiness grades A–D for **selected documented mods**, distinct from PCVR Central's quality assessments. Unknown mods say Not assessed, rather than a guessed grade.
- Accurate dating: latest linked Flat2VR release, initial releases when explicitly tagged, and browser-local first discoveries (separate from mod release dates).
- Release activity ranked by verified source dates; **not** a popularity score, player count or engagement estimate.
- First-pass expanded source references and installation guides for selected mods, without bulk copying the UnflatVR catalog.

## Deployment

See `UPDATE_INSTRUCTIONS.md` for replacing v0.7.1. Complete bundle contains `.github/workflows/publish.yml`, `site/` and `tools/`; upload it into the root of your existing repository.

The workflow runs `tools/update_feed.py` for the Flat2VR public index, UploadVR and Road to VR RSS, and optional server-side ITAD checks if `ITAD_API_KEY` is configured in GitHub Actions secrets. The deployed site is static and public. Never put an API key in JavaScript, a repository file, or a screenshot.

## Radar Readiness rubric

This independently designed preparatory score is not imported from UnflatVR and is not a review of gameplay quality. With sufficient source evidence, it scores: supported controller mode 35; installation mechanism 25; author installation documentation 20; source-linked release within 365 days 15; documented runtime requirements 5. A ≥85, B ≥70, C ≥50, D <50. With fewer than three documented facts, do not assign a grade. A link to the developer documentation and a point breakdown appears in Details.

The initial curated assessments cover CircuitLord's Titanfall 2 VR, Raicuparta's NomaiVR for Outer Wilds, and Okabintaro's SubmersedVR. Only the appropriate game is matched to a multi-game installer. Review sources periodically; cached metadata may grow stale. A score is provisional and does not establish Quest 3 or Proton compatibility, performance, comfort or overall fun.

## Date integrity

The Flat2VR Index records a `Latest:` link, tag and date for some mods. v0.8 labels those as a linked release. The string `initial` in the release tag allows an initial-release label; otherwise the date is not the game's first-ever release date. Mod discoveries are recorded locally only after v0.8 is first loaded, with a baseline to avoid calling preexisting entries new. The GitHub Actions publish time is the **feed refresh date**, not a mod release or mod discovery.

## License, sourcing and privacy

Only ingest publicly available Flat2VR Index information and direct public news RSS. Do not scrape or copy UnflatVR's protected directory, grades, or reviews; direct users to official developers and editorial sources. Original game artwork is loaded through Steam assets or the Flat2VR project's linked art. Neither the GitHub repository nor the app includes personal Steam credentials or desktop database. Stored watchlist and owned markers remain on each browser/device only.
