"""Presentation metadata: never overwrites the v0.2 database or user edits."""
import json
import re
from pathlib import Path

RATINGS = json.loads(Path(__file__).with_name('quality_ratings.json').read_text('utf-8'))
OPTIONS = json.loads(Path(__file__).with_name('game_options.json').read_text('utf-8'))
QUALITY_ORDER = {'broken':0, 'experimental':1, 'playable':2, 'excellent':3, 'native-like':4}
LABELS = {'native-like':'Native-like','excellent':'Excellent','playable':'Playable',
          'experimental':'Experimental','broken':'Broken'}
# These are the platform(s) of the game targeted by the conversion, not VR runtimes.
# Unknown titles remain unverified rather than inferring PC from a Steam match.
PLATFORMS = {
 'doom (2016)':'PC / PlayStation 4 / Xbox One',
 'doom eternal':'PC / PlayStation 4 / Xbox One / Stadia',
 'titanfall 2':'PC / PlayStation 4 / Xbox One',
 'f.e.a.r.':'PC', 'max payne 2':'PC',
 'alien: isolation':'PC / PlayStation 3 / PlayStation 4 / Xbox 360 / Xbox One',
 'outer wilds':'PC / Xbox One', 'subnautica':'PC',
 "the legend of zelda: majora's mask":'Nintendo 64',
 'the legend of zelda: ocarina of time':'Nintendo 64',
 'super mario 64':'Nintendo 64',
 'super mario sunshine':'GameCube',
 'super mario galaxy':'Wii',
 'super mario galaxy 2':'Wii',
 'super mario 3d world':'Wii U',
}

GAME_SLUGS = {'alien: isolation':'alien-isolation','doom eternal':'doom-eternal',
 'max payne 2':'max-payne-2','outer wilds':'outer-wilds','subnautica':'subnautica',
 'titanfall 2':'titanfall-2'}

def enrich_game(game):
    rating=RATINGS.get((game.get('github_repo') or '').lower(),{})
    slug=GAME_SLUGS.get(game['title'].lower())
    if not slug or not rating.get('url','').split('/mods/')[-1].startswith(slug+'-'):
        rating={}
    game['quality']=LABELS.get(rating.get('label'),'Unrated')
    game['quality_source']=rating.get('url')
    game['quality_checked']=rating.get('checked')
    game['six_dof_aim']=rating.get('six_dof_aim') is True
    game['quality_origin']=rating.get('quality_origin')
    # Compare only the same game's options. Unknown is not a poor rating.
    current_rank=QUALITY_ORDER.get(rating.get('label'))
    alternatives=[r for r in OPTIONS.get(slug,[]) if current_rank is not None
                  and QUALITY_ORDER.get(r.get('label'),-1)>current_rank
                  and r.get('url')!=rating.get('url')]
    alternatives.sort(key=lambda r:(-QUALITY_ORDER[r['label']], not r.get('six_dof_aim',False)))
    game['better_options']=[dict(r,quality=LABELS[r['label']]) for r in alternatives]

    game['original_platform']=PLATFORMS.get(game['title'].lower(),'Unverified')
    return game

def news_category(text, summary=''):
    if re.search(r'\b(?:grand[- ]?)?mothervr\b',text,re.I):
        return 'VR mods & software'
    # Classify the subject of the headline; headset mentions in a game's
    # compatibility paragraph should not turn software news into hardware news.
    if re.search(r'\b(games?|mods?|uevr|playtest|dlc|adventure|synth riders|hand tracking support)\b',text,re.I) and not re.search(r'\b(treadmills?|bundled|hardware|firmware|oled|regulatory|storage products)\b',text,re.I):
        return 'VR mods & software'
    if re.search(r'\b(headsets?|pimax|bigscreen beyond|valve index|steam frame|micro.?oled|lenses|haptics|controllers?|tracking hardware)\b',text,re.I) or (re.search(r'\b(quest [234s]+|vive)\b',text,re.I) and re.search(r'\b(firmware|specs|hardware|refresh rate|resolution|battery|passthrough|price cut)\b',text,re.I)):
        return 'Headsets & hardware'
    if re.search(r'\b(uevr|pcvr|vr mods?|vr conversion|flat2vr|flatscreen|modding|modded|vr injector|motion control|steamvr|openxr|virtual desktop)\b',text,re.I):
        return 'VR mods & software'
    if re.search(r'\b(acquisition|acquires|layoffs|funding|revenue|market|industry|regulation|antitrust)\b',text,re.I) and re.search(r'\b(vr|virtual reality|xr)\b',text+' '+summary,re.I):
        return 'Industry'
    if re.search(r'\b(vr|virtual reality|xr)\b',text,re.I):
        return 'VR mods & software'
    if summary and re.search(r'\b(vr|virtual reality|pcvr|headset)\b',summary,re.I):
        return 'VR mods & software'
    return None
