"""Flat2VR Index ingestion. Data is CC0 per https://github.com/jrejaud/awesome-flat2vr."""
from __future__ import annotations

import hashlib
import html
import re
from urllib.parse import urlparse

SOURCE_URL = "https://raw.githubusercontent.com/jrejaud/awesome-flat2vr/main/README.md"
SOURCE_HOME = "https://github.com/jrejaud/awesome-flat2vr"

# Steam IDs are intentionally only populated when confidently identified.
STEAM_IDS = {
    "doom (2016)": 379720,
    "doom eternal": 782330,
    "titanfall 2": 1237970,
    "f.e.a.r.": 21090,
    "f.e.a.r. 2: project origin": 16450,
    "max payne": 12140,
    "max payne 2": 12150,
    "alien: isolation": 214490,
    "subnautica": 264710,
    "outer wilds": 753640,
    "firewatch": 383870,
    "left 4 dead 2": 550,
    "half-life 2": 220,
    "the witcher 3: wild hunt": 292030,
    "cyberpunk 2077": 1091500,
    "bioshock infinite": 8870,
    "bioshock 2 remastered": 409720,
    "bioshock remastered": 409710,
    "watch dogs": 243470,
    "devil may cry 5": 601150,
    "the stanley parable: ultra deluxe": 1703340,
    "kingdom come: deliverance": 379430,
    "payday 2": 218620,
    "ultrakill": 1229490,
    "no man's sky": 275850,
    "grand theft auto iv": 12110,
    "soma": 282140,
    "gloomhaven (digital)": 780290,
    "big walk": None,  # Placeholder deliberately not looked up by title if ambiguous
}

# Explicitly tracked projects; the Flat2VR Index may also list other mods for the same games.
FEATURED = [
    {"title": "DOOM (2016)", "mod_name": "KHARVOX", "mod_url": "https://github.com/CactusVRStudios/KHARVOX", "github_repo": "CactusVRStudios/KHARVOX", "steam_appid": 379720, "quality": "beta", "kind": "Dedicated", "linux_status": "Windows mod; Proton unverified", "description": "Room-scale 6DOF, tracked motion controllers and stereoscopic VR. Quest 3 via Virtual Desktop supported."},
    {"title": "DOOM Eternal", "mod_name": "EternalVR", "mod_url": "https://github.com/ArcadaLabs-Jason/EternalVR", "github_repo": "ArcadaLabs-Jason/EternalVR", "steam_appid": 782330, "quality": "alpha", "kind": "Dedicated", "linux_status": "Windows mod; Proton unverified", "description": "OpenXR full stereo, motion controls and room-scale conversion; experimental release."},
    {"title": "Titanfall 2", "mod_name": "CircuitLord's Titanfall 2 VR", "mod_url": "https://github.com/CircuitLord/CircuitLordVRModInstaller", "github_repo": "CircuitLord/CircuitLordVRModInstaller", "steam_appid": 1237970, "quality": "beta", "kind": "Dedicated", "linux_status": "Windows mod; Proton unverified", "description": "Full campaign conversion: stereoscopy, motion controls and manual reloads."},
    {"title": "F.E.A.R.", "mod_name": "F.E.A.R. VR by DR-89", "mod_url": "https://github.com/DR-89/fear-vr", "github_repo": "DR-89/fear-vr", "steam_appid": 21090, "quality": "beta", "kind": "Dedicated", "linux_status": "Windows-only stated by author", "description": "OpenXR hand controls and stereoscopy for the original F.E.A.R. campaign."},
    {"title": "Max Payne 2", "mod_name": "Max Payne 2 VR by evilSheep", "mod_url": "https://github.com/evilSheep/max-payne-2-vr", "github_repo": "evilSheep/max-payne-2-vr", "steam_appid": 12150, "quality": "beta", "kind": "Dedicated", "linux_status": "Windows-only stated by author", "description": "Dual wielding, physical holsters, tracked hands and bullet time. Tested on Quest 3."},
    {"title": "Alien: Isolation", "mod_name": "MotherVR", "mod_url": "https://github.com/Nibre/MotherVR", "github_repo": "Nibre/MotherVR", "steam_appid": 214490, "quality": "beta", "kind": "Dedicated", "description": "Classic immersive first-person VR conversion."},
    {"title": "Outer Wilds", "mod_name": "NomaiVR", "mod_url": "https://github.com/Raicuparta/nomai-vr", "github_repo": "Raicuparta/nomai-vr", "steam_appid": 753640, "quality": "stable", "kind": "Dedicated", "description": "Full VR exploration mod for Outer Wilds."},
    {"title": "Subnautica", "mod_name": "SubmersedVR", "mod_url": "https://github.com/Okabintaro/SubmersedVR", "github_repo": "Okabintaro/SubmersedVR", "steam_appid": 264710, "quality": "beta", "kind": "Dedicated", "description": "Motion-control oriented conversion for underwater exploration."},
]


def clean(value: str) -> str:
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\*\*", "", value)
    value = html.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def repo_from_url(url: str) -> str | None:
    p = urlparse(url)
    if p.scheme != "https" or p.hostname not in ("github.com", "www.github.com"):
        return None
    parts = [s for s in p.path.strip("/").split("/") if s]
    if len(parts) < 2:
        return None
    if not all(re.fullmatch(r"[A-Za-z0-9_.-]{1,100}", p) for p in parts[:2]):
        return None
    return f"{parts[0]}/{parts[1].removesuffix('.git')}"


def make_uid(title: str, mod_url: str) -> str:
    return hashlib.sha256((title.lower().strip() + "::" + mod_url.rstrip("/").lower()).encode()).hexdigest()[:22]


def classify(mod_name: str, url: str) -> str:
    text = (mod_name + " " + url).lower()
    if "uevr" in text:
        return "UEVR"
    if "reframework" in text:
        return "Framework"
    if "r.e.a.l." in text or "luke ross" in text:
        return "R.E.A.L."
    return "Dedicated"


def parse_index(markdown: str) -> list[dict]:
    """Parse the README's generated table, including games with multiple listed ports."""
    results = []
    for line in markdown.splitlines():
        if not line.startswith("| ") or line.startswith(("| Game", "|---")):
            continue
        cols = line.strip().strip("|").split(" | ")
        if len(cols) < 4:
            continue
        title_match = re.search(r"\*\*(.*?)\*\*", cols[0]);
        if not title_match:
            continue
        title = clean(title_match.group(1))
        image_match = re.search(r'<img\s+src="(images/[a-zA-Z0-9_./-]+)"', cols[0])
        image_url = "https://raw.githubusercontent.com/jrejaud/awesome-flat2vr/main/" + image_match.group(1) if image_match and ".." not in image_match.group(1) else None
        platform = cols[2]
        if "PCVR" not in platform.upper():
            continue  # No Quest-native-only ports in this PCVR tracker.
        # Individual ports in same cell are separated by a double HTML break.
        segments = re.split(r"<br>\s*<br>", cols[1])
        for segment in segments:
            match = re.search(r"\[([^\]]+)\]\((https?://[^\s)]+)\)", segment)
            if not match:
                continue
            mod_name, mod_url = clean(match.group(1)), match.group(2)
            version_match = re.search(r"Latest:\s*\[([^\]]+)\]\((https?://[^\s)]+)\)\s*\((\d{4}-\d{2}-\d{2})\)", segment)
            creator_match = re.search(r"\bby\s+(.+?)(?:<br>|$)", segment)
            quality = "unknown"
            state_text = (cols[2] + " " + segment).lower()
            for state in ("abandoned", "stable", "beta", "alpha"):
                if state in state_text:
                    quality = state
                    break
            release_tag = clean(version_match.group(1)) if version_match else None
            date = version_match.group(3) if version_match else None
            creator = clean(creator_match.group(1)) if creator_match else None
            results.append({
                "uid": make_uid(title, mod_url), "title": title, "mod_name": mod_name,
                "mod_url": mod_url, "release_url": version_match.group(2) if version_match else mod_url,
                "release_tag": release_tag, "released_at": date, "date_evidence": "index-linked-release" if date and version_match else None, "release_event": ("Initial release" if release_tag and "initial" in release_tag.lower() else ("Dated release (version unspecified)" if "unversioned" in release_tag.lower() else "Latest versioned release")) if date and release_tag else None, "first_release_at": date if release_tag and "initial" in release_tag.lower() else None, "quality": quality,
                "kind": classify(mod_name, mod_url), "github_repo": repo_from_url(mod_url),
                "steam_appid": STEAM_IDS.get(title.lower()), "creator": creator,
                "source": "Flat2VR Index", "linux_status": "Not verified",
                "description": None, "source_image": image_url,
            })
    return results
