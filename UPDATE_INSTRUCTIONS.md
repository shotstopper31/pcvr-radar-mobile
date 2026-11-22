# PCVR Radar v0.8 — GitHub Pages update

Repository: `shotstopper31/pcvr-radar-mobile`.

## Recommended upload using GitHub website

1. Make a backup of your repository if desired. **Do not upload personal Steam API keys, the desktop database, or private settings.**
2. Download `PCVR_Radar_v080_Update.zip` and extract it on Windows.
3. Open your GitHub repository. Choose **Add file → Upload files**, and drag the extracted `site/` and `tools/` folders onto the upload page, preserving their directory paths. Existing paths should be replaced. If GitHub's browser uploader does not replace existing files, use GitHub Desktop or your local Git clone to commit the changes instead.
4. Commit to `main`.
5. Verify **Actions → Publish independent PCVR Radar mobile app** shows a green check, or manually run it from the Actions tab.
6. Visit `https://shotstopper31.github.io/pcvr-radar-mobile/` on your Galaxy S24+; reload or close/reopen the installed PWA. Service worker cache name changed to `v08` so the new app shell can replace v0.7.1.

## What's changed

- Source-linked **initial vs. later releases**; do not use refresh timestamps as release dates.
- Browser-local **first-discovered tracking**: first successful v0.8 refresh creates a baseline, future unseen mods are marked new *for that browser only*. Not a global discovery date.
- A separate, **provisional Radar Readiness A–D score** for only three sourced developer projects (Titanfall 2, NomaiVR/Outer Wilds and SubmersedVR/Subnautica); others say Not assessed. Not a copy of UnflatVR grades and not a hands-on review.
- **Game Hubs** comparison toggle in Discover Mods, preserving artwork and individual mod cards.
- **Latest linked release activity** list, expressly not a popularity score. Improved detail modal with evidence links, grade breakdown, and platform/runtime descriptions.
- Same mobile compact theme, Firestorm colours, local owned-game/watchlist storage (all existing `radar7-*` browser keys), news and pricing integration.

## Limitations

- UnflatVR's dataset/grades are NOT scraped or reused. Official developer sources underpin the documented sample ratings.
- Steam library is personal browser-local in this public standalone version; no Steam API key or automatic library sync.
- PCVR Central quality labels are independent of the new Radar Readiness score; where quality is unavailable, show Unrated.
- First release is unknown unless the index explicitly identifies a dated initial release.
- The hosted updater runs while GitHub Actions deploys. A failed external source leaves existing site data or a bundled starter rather than inventing entries.
- Additional authored mod pages or reviews require per-title verification.
