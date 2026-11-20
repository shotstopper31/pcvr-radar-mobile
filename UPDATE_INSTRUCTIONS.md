# Upgrade PCVR Radar Mobile from v0.7 to v0.7.1

Your existing public site: https://shotstopper31.github.io/pcvr-radar-mobile/

1. Extract **PCVR_Radar_v071_Update.zip** on your Windows PC.
2. Open https://github.com/shotstopper31/pcvr-radar-mobile and select **Code → Add file → Upload files**. Upload the extracted `site` folder contents while retaining the `site/` folder path, plus the two Markdown guides. Choose the option to replace/overwrite files already in the repository and commit to `main`. Upload the individual extracted files and folders, **not the ZIP file**.
3. The GitHub Actions workflow (`.github/workflows/publish.yml`) is **unchanged**; you do not need to recreate it.
4. Check https://github.com/shotstopper31/pcvr-radar-mobile/actions for a successful new run. If an artifact lookup fails temporarily, start a fresh **Run workflow** rather than rerunning only the failed deployment step.
5. Open your website on your S24+, close/reopen the installed PWA, and refresh. The service worker cache version was changed so v0.7.1 can replace the previous app shell. A second reload can be needed for an already-open PWA.

**New in v0.7.1**
- Compact home layout enabled by default on smartphones, with Settings toggle.
- New Fresh Mod Announcements section: dated Flat2VR Index release records, separately from manually curated community posts.
- Release-status and original platform badges, dated source links, and category filter.
- Better bottom navigation icons. Desktop layout, Steam game art, personal watchlist, Firestorm theme, and all older sections remain.

**Important:** No automated Discord `#new-vr-mods` connection is included. The curator guide `CURATED_ANNOUNCEMENTS.md` explains the approved/manual process. No personal Steam data or API credentials are included.
