# PCVR Radar v0.8 — Smarter mod intelligence

**Build date:** November 21, 2026  
**Based on:** Public standalone v0.7.1 site, retaining local `radar7-*` settings and watchlist keys.

## Included

- Source-linked release event types. **Initial release** is shown only if the Flat2VR source explicitly tags it; later dates are the **latest linked release** and are not presented as initial or discovery dates.
- Browser-local discovery history, initialized with a baseline to avoid marking the entire legacy catalog as newly discovered. Future new entries are marked new on that device only.
- Release-activity panel ordered by dated source releases; not represented as views, downloads or popularity.
- Game Hubs in Discover Mods, with comparisons across alternate mod options for the same game. Game title artwork is unchanged.
- Provisional PCVR Radar readiness scores A–D for three developer-documented projects, with transparent point breakdowns and official citations. No inferred grade when evidence is missing. These are NOT UnflatVR's proprietary scores or PCVR Central's qualitative assessments.
- Expanded mod details: release-event labels, documented controls, source-guided installation and unchanged Windows/Linux status when unverified.
- Source suggestion link for broader catalog submissions; no scraping of Discord, UnflatVR, or other protected catalogs.
- Existing Firestorm theme, phone compact view, mobile navigation, Steam/ITAD links, personal owned-game markers and watchlist preserved.

## Deployment

Extract `PCVR_Radar_v080_Update.zip` and upload its `site/` and `tools/` paths into the **root** of `shotstopper31/pcvr-radar-mobile`, then commit to `main`. The existing `.github/workflows/publish.yml` runs automatically on a push; check the Actions tab for a green check. The build is **not** deployed by this ZIP on its own.

## Validation

- 33 headless Chromium browser checks using offline fixtures, at Galaxy S24+ (412×915) and desktop (1440×900) viewports.
- 7 Python ingestion/unit checks, with versioned/initial/unversioned and missing release-date cases.
- JavaScript syntax and Python syntax verified.
- Source evidence reviewed for official three developer projects: `CircuitLord/CircuitLordVRModInstaller`, `Raicuparta/nomai-vr`, `Okabintaro/SubmersedVR`.
- Offline QA mocks do **not** verify the deployed live external feeds, GitHub Pages workflow, Samsung hardware/browser runtime, or user Steam library.

## Known limitations

- Expanded catalog ingestion beyond the Flat2VR Index remains a reviewed suggestion path. No automatic third-party scrape or Discord bot is configured.
- Radar Readiness is not a hands-on quality review; only the three curated projects can receive grades in this release.
- The optional IsThereAnyDeal hosted API cache still requires a GitHub Actions secret and remains limited to selected Steam games.
- Titles with a shared name but missing Steam ID are grouped by normalized title; check their individual mods to avoid ambiguous editions.
