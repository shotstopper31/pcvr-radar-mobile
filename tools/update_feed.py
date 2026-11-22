#!/usr/bin/env python3
"""Regenerate public PCVR catalog, news and optional CAD price cache for GitHub Pages.

No personal Steam library or API credentials are written into public data files.
IsThereAnyDeal's API key must be supplied as the ITAD_API_KEY environment secret.
"""
from __future__ import annotations

import json
import html
import os
import re
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'site'/'data'/'feed.json'
sys.path.insert(0,str(Path(__file__).resolve().parent))
from catalog import FEATURED, SOURCE_URL, parse_index, make_uid
from metadata import enrich_game, news_category

NEWS_SOURCES=[('UploadVR','https://www.uploadvr.com/rss/'),('Road to VR','https://www.roadtovr.com/feed/')]


def request(url: str, *, data=None, headers=None, timeout=20):
    h={'User-Agent':'PCVRRadarMobile/0.8 (+https://github.com/jrejaud/awesome-flat2vr)',
       'Accept':'application/json, application/xml, text/xml, text/plain, */*'}
    if headers:h.update(headers)
    if data is not None:
        h['Content-Type']='application/json'
        data=json.dumps(data).encode('utf-8')
    with urlopen(Request(url, data=data, headers=h),timeout=timeout) as r:
        return r.read()


def catalog():
    results=parse_index(request(SOURCE_URL).decode('utf8'))
    if len(results)<25:raise ValueError('Flat2VR index returned fewer than 25 PCVR records')
    unique={}
    for g in results:
        d=enrich_game(g)
        d['id']=make_uid(d['title'],d['mod_url'])
        d.pop('better_options',None)
        unique[(g['title'].lower(),g['mod_url'].lower())]=d
    # Curated mods can be absent from the community index; keep them visible.
    for g in FEATURED:
        key=(g['title'].lower(),g['mod_url'].lower())
        if key not in unique:
            d=enrich_game(dict(g));d['id']=make_uid(d['title'],d['mod_url']);d['release_url']=g['mod_url'];d['source']='Featured';d['released_at']=None;d['release_tag']=None;d['release_event']=None;d['date_evidence']=None;d['first_release_at']=None;d.pop('better_options',None)
            unique[key]=d
        elif g.get('description') and not unique[key].get('description'):
            unique[key]['description']=g['description']
    return sorted(unique.values(),key=lambda x:((x.get('released_at')or''),x['title']),reverse=True)


def strip_tags(text):
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]*>',' ',text or ''))).strip()


def headlines():
    items={}
    for name,url in NEWS_SOURCES:
        try:
            root=ET.fromstring(request(url,timeout=18))
            entries=root.findall('./channel/item')
            atom=False
            if not entries:
                atom=True;entries=root.findall('{http://www.w3.org/2005/Atom}entry')
            for item in entries[:60]:
                def val(tag):
                    el=item.find(('{http://www.w3.org/2005/Atom}' if atom else '')+tag)
                    return (el.text or '') if el is not None else ''
                title=strip_tags(val('title'))
                summary=strip_tags(val('summary') if atom else val('description'))[:350]
                category=news_category(title,summary)
                if not category:continue
                if atom:
                    ln=item.find('{http://www.w3.org/2005/Atom}link')
                    link=ln.get('href','') if ln is not None else val('link')
                else:link=val('link')
                if not re.match(r'^https://[\w.-]+',link):continue
                stamp=val('updated') if atom else val('pubDate')
                try:
                    published=(datetime.fromisoformat(stamp.replace('Z','+00:00')) if atom else parsedate_to_datetime(stamp)).astimezone(timezone.utc).isoformat()
                except (ValueError,TypeError):published=None
                items[link]={'source':name,'title':title[:300],'url':link,'summary':summary,'category':category,'published':published,'first_seen':datetime.now(timezone.utc).isoformat()}
        except (URLError,ET.ParseError,TimeoutError) as err:
            print(f'Warning: news source {name} failed: {err}', file=sys.stderr)
    return sorted(items.values(),key=lambda x:x['published'] or x['first_seen'],reverse=True)[:100]


def itad_prices(games):
    """Optional server-side-only price cache: up to 30 distinct Steam games per run."""
    secret=os.environ.get('ITAD_API_KEY','').strip()
    if not secret:return {}
    headers={'ITAD-API-Key':secret,'Accept':'application/json'}
    featured_ids=[g['steam_appid'] for g in FEATURED if isinstance(g.get('steam_appid'),int)]
    appids=list(dict.fromkeys(featured_ids+[g['steam_appid'] for g in games if isinstance(g.get('steam_appid'),int)]))[:30]
    id_to_app={}
    for appid in appids:
        try:
            url='https://api.isthereanydeal.com/games/lookup/v1?'+urlencode({'appid':appid})
            value=json.loads(request(url,headers=headers,timeout=12))
            item=value.get('game') if value.get('found') else None
            if item and item.get('id'):id_to_app[item['id']]=appid
        except (URLError,ValueError,KeyError,TimeoutError) as err:
            print(f'Warning: ITAD lookup failed for {appid}: {err}', file=sys.stderr)
        time.sleep(.10)
    ids=list(id_to_app)
    if not ids:return {}
    try:
        r=json.loads(request('https://api.isthereanydeal.com/games/prices/v3?'+urlencode({'country':'CA','capacity':'0','vouchers':'false'}),data=ids,headers=headers,timeout=25))
        lows=json.loads(request('https://api.isthereanydeal.com/games/storelow/v2?country=CA',data=ids,headers=headers,timeout=25))
        if not isinstance(r,list) or not isinstance(lows,list):raise ValueError('Unexpected ITAD API response')
        steam_lows={}
        for entry in lows:
            for low in entry.get('lows',[]):
                if (low.get('shop') or {}).get('name','').lower()=='steam':
                    steam_lows[entry.get('id')]=low.get('price')
        result={}
        for item in r:
            appid=id_to_app.get(item.get('id'))
            if not appid:continue
            offers=[]
            for offer in item.get('deals',[]):
                amount=(offer.get('price') or {}).get('amount')
                if not isinstance(amount,(int,float)):continue
                offers.append({'amount':amount,'currency':(offer.get('price') or {}).get('currency','CAD'),'shop':(offer.get('shop') or {}).get('name','Store'),'cut':offer.get('cut',0),'url':offer.get('url')})
            offers.sort(key=lambda x:x['amount'])
            low=steam_lows.get(item.get('id')) or {}
            result[str(appid)]={'best':offers[0] if offers else None,'steam_historical_low':low.get('amount'),'currency':low.get('currency','CAD'),'url':offers[0]['url'] if offers else 'https://isthereanydeal.com/','checked_at':datetime.now(timezone.utc).isoformat()}
        return result
    except (URLError,ValueError,TypeError,TimeoutError) as err:
        print(f'Warning: ITAD prices failed: {err}',file=sys.stderr);return {}


def main():
    data={'updated_at':datetime.now(timezone.utc).isoformat(), 'source':'Flat2VR Index + RSS', 'games':[], 'news':[], 'prices':{}}
    try:data['games']=catalog()
    except Exception as err:
        print('Error loading mod index:',err,file=sys.stderr)
        seed=json.loads((ROOT/'site'/'data'/'seed.json').read_text('utf8'))
        data['games']=seed['games']
    data['news']=headlines()
    data['prices']=itad_prices(data['games'])
    OUT.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')
    print(f"Published {len(data['games'])} mods, {len(data['news'])} headlines, {len(data['prices'])} games with price checks; no credentials in output")

if __name__=='__main__':main()
