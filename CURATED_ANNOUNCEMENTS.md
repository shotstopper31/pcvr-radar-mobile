# PCVR Radar — Curated community posts

The public PCVR Radar site does **not** connect to Discord automatically. Flat2VR Discord forum content can be added only through authorized means, with a direct source permalink and a verified original posting date. Never use a personal Discord user token or scrape private channels.

To feature a verified announcement, edit `site/data/announcements.json` in GitHub, adding an entry to `posts` in this form:

```json
{
  "version": 1,
  "posts": [
    {
      "title": "Verified game/mod announcement title",
      "mod_name": "Name of the VR conversion",
      "source": "Flat2VR Modding Discord (manually reviewed)",
      "url": "https://discord.com/channels/SERVER_ID/CHANNEL_ID/POST_ID",
      "published_at": "2026-11-20T14:00:00Z",
      "stage": "Early Release",
      "platforms": ["PCVR"],
      "steam_appid": null
    }
  ]
}
```

This is only a **schema example**, not a claim that the example post exists. Use a permalink you can open and a verified UTC timestamp from the real announcement. Valid `stage` values are `WIP`, `Early Release`, `Mod released`, and `Announcement`. Do not substitute today's date for the actual original posting date. The app displays community posts only within its selected 2/7/15/30-day range. Posts dated in the future are hidden. If no posts are submitted, the Community posts tab explains that Discord is not connected.

For automatic Discord forum ingestion later, request authorization from the Flat2VR server administrators and use an approved Discord bot or public feed, with appropriate channel permissions. Do not put any bot token in public JavaScript or the repo.
