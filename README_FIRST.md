# PCVR Radar v0.7.1 — Standalone mobile edition (Galaxy S24+)

This is a NEW, independent, installable **progressive web app (PWA)**. It does not require a gaming PC, local Python server, pairing code, port 8765, or your desktop PCVR Radar app after you publish it to an HTTPS URL.

## Upgrade from the live v0.7 GitHub Pages site

1. Download and extract this v0.7.1 package on your Windows PC.
2. Upload the updated `site/` files and `README_FIRST.md` to the `main` branch of `shotstopper31/pcvr-radar-mobile`. Preserve the directory structure and allow overwriting existing filenames. Do not put the ZIP itself in GitHub.
3. The existing `.github/workflows/publish.yml` is unchanged. Commit the files; the existing GitHub Actions workflow should publish the latest version.
4. Verify your deployment run is green, then open `https://shotstopper31.github.io/pcvr-radar-mobile/` and refresh the installed PWA. If cached, close/reopen once or use the web browser's reload.
5. No Steam, ITAD or personal data files are included. Your device watchlist remains in browser storage (same URL and browser) and is not reset by this update.

**Important:** The Fresh Mod Announcements section does not scrape or automatically monitor Discord. Index release cards require a real release date/version in the Flat2VR Index. Curated community post cards appear only after verified links are added to `site/data/announcements.json`; see `CURATED_ANNOUNCEMENTS.md`.

## Best deployment: GitHub Pages (free public shareable URL + automatic news updates)

1. Create a NEW public GitHub repository, for example `pcvr-radar-mobile`. Do not reuse a repository containing your personal PCVR Radar database.
2. Upload **all files and folders in this package**, including `.github/workflows/publish.yml`, `site/`, and `tools/`. GitHub's web upload may hide dot-prefixed folders on some systems; verify the `.github/workflows/publish.yml` file appears in the repository.
3. In the repository, go to **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Actions → Publish independent PCVR Radar mobile app → Run workflow** (or push a commit). The workflow fetches the public Flat2VR Index plus UploadVR/Road to VR headlines and deploys the independent website. It is scheduled twice daily, though GitHub Actions schedules are not guaranteed to run at exact times.
5. Go back to **Settings → Pages** and use the displayed `https://<username>.github.io/<repository>/` URL.
6. On your Galaxy S24+, open the HTTPS URL using Chrome or Samsung Internet. Use the browser menu and select **Install app** / **Add to Home screen**. You can launch the icon from your home screen even when your gaming PC is turned off. Share the same website link with friends or colleagues.

You may optionally enable up-to-date Canadian prices from IsThereAnyDeal by setting the repository secret **ITAD_API_KEY** under Settings → Secrets and variables → Actions. NEVER commit your key to the repository or paste it into the mobile app. The updater will check a limited selection of Steam games and cache price data on the hosted site. IsThereAnyDeal API usage and rate limits apply. Without this secret, the site links to ITAD for live pricing and clearly labels unavailable historical lows.

## Alternative: Cloudflare Pages direct upload

1. Go to https://dash.cloudflare.com/ → Workers & Pages → Create → Drag and drop.
2. Upload the **`site/` directory contents** or the included `PCVR_Radar_Mobile_Site_Only.zip` (if provided separately) and deploy.
3. Open the generated HTTPS `pages.dev` URL on your phone and install the PWA.

This second approach is the quickest to get a public link. It will still attempt to refresh the Flat2VR mod catalog directly when the page opens, but **news/headline aggregation and cached prices only refresh automatically with the included GitHub Actions workflow**. Cloudflare direct upload does not run the Python updater.

## What works now

- Compact phone home layout with a settings toggle; original desktop layout and game art are preserved.
- Fresh mod announcements: dated Flat2VR Index releases plus optional manually verified community posts, with source/category filters and source links.


- Mobile-first responsive layout with real Steam header artwork when available; desktop browser compatible.
- Original Ocean blue/green and Firestorm orange/red themes, saved per-device.
- Browse the Flat2VR public mod index over HTTPS and keep an offline cached copy.
- Filter/sort by game name, release date, original platform (including Nintendo consoles when metadata is known), and PCVR Central quality snapshot (unrated where not matched).
- Select 30/15/7/2-day update windows.
- Personal watchlist, owned markers, manual game import, and portable export/import — stored ONLY on the browser/device.
- Separate mod/software, headset/hardware, and industry headline categories when the hosted feed exists.
- Click through to official mod GitHub pages, Steam stores, and IsThereAnyDeal.
- Works as an installable PWA over HTTPS, with offline access to previously loaded UI/catalog (external links and artwork still need internet).

## What is intentionally different from the private PC build

- No Steam login/API key or automatic Steam library sync in the public app. Never publish the `data/settings.json`, `tracker.sqlite3` or exported Steam library from your PC.
- No PC-installed game scanning or direct connection to `127.0.0.1` or `10.0.0.100`.
- No personal GitHub/Steam/ITAD API key in JavaScript. ITAD data is optional and fetched server-side by the GitHub Actions workflow via a GitHub secret.
- Personal library and watchlist **do not sync automatically** between PC and phone (or different phones).
- It is not an Android APK or a Play Store app.

## Updating and troubleshooting

- If the mod index is unreachable from the phone (e.g. network restrictions), the PWA continues showing its cached catalog or starter mods.
- A browser installation must come from a secure HTTPS URL, not `file://` and not the old computer's `http://10.0.0.100:8765` address.
- If the hosted site initially shows only 8 starter mods, run the GitHub Pages workflow or use Refresh to retrieve the full community index.
- For security, the public website has no admin server or sensitive API credentials.
- A 404 from a 3rd-party Steam artwork URL will display the game title as fallback.

## Project lineage and credits

Based on PCVR Radar v0.6.1 UI/content conventions. Mod catalog: Flat2VR Index (CC0 as described in its project); mod quality references: PCVR Central (linked snapshots bundled from the previous build); PCVR headlines: UploadVR and Road to VR RSS; external artwork: original game publisher/Steam CDN. Pricing is attributed and linked to IsThereAnyDeal. **Do not present this app as affiliated with these services.**
