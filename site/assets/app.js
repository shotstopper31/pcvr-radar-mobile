'use strict';
/* PCVR Radar v0.7 Mobile Standalone. No account keys, credentials or local server. */
const INDEX_URL='https://raw.githubusercontent.com/jrejaud/awesome-flat2vr/main/README.md';
const INDEX_IMAGE='https://raw.githubusercontent.com/jrejaud/awesome-flat2vr/main/';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=x=>/^https:\/\/[A-Za-z0-9.-]+(?:[/?#:]|$)/.test(String(x||''))?esc(x):'#';
const money=(x,cur='CAD')=>x==null?'—':new Intl.NumberFormat('en-CA',{style:'currency',currency:cur}).format(x);
const dateDisplay=x=>{if(!x)return 'Date not verified';let d=new Date(x.length===10?x+'T12:00:00Z':x);return Number.isNaN(d.getTime())?'Date not verified':d.toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'})};
const read=(k,def)=>{try{let s=localStorage.getItem(k);return s===null?def:JSON.parse(s)}catch{return def}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const state={page:'home',games:[],news:[],feedPrices:{},meta:{},seed:[],remote:false,feedUpdated:null,watch:read('radar7-watch',{}),owned:read('radar7-owned',{}),targets:read('radar7-targets',{}),custom:read('radar7-custom',[]),theme:read('radar7-theme','ocean'),days:read('radar7-days',30),newsCategory:'all',sort:'date',query:'',quality:'all',platform:'all',recent:false,source:'Loading starter catalog'};
if(![2,7,15,30].includes(state.days))state.days=30;
const titleKey=s=>String(s||'').trim().toLowerCase();
const gameKey=(title,url)=>titleKey(title)+'::'+titleKey(url).replace(/\/$/,'');
const uid=(title,url)=>gameKey(title,url); // Stable across catalog refreshes, not numeric row IDs.
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\*\*/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
function imgUrl(g){if(g.steam_appid)return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/'+Number(g.steam_appid)+'/header.jpg';return /^https:\/\/raw\.githubusercontent\.com\/jrejaud\/awesome-flat2vr\/main\/images\//.test(g.source_image||'')?g.source_image:''}
function mergeGames(games){
 let result=new Map();
 for(const g of [...state.seed,...games,...state.custom]){const key=uid(g.title,g.mod_url);const old=result.get(key);result.set(key,{...old,...g,id:key,description:g.description||old?.description||'',steam_appid:g.steam_appid||old?.steam_appid||null,quality:g.quality&&g.quality!=='Unrated'?g.quality:old?.quality||'Unrated',source_image:g.source_image||old?.source_image||null,quality_source:g.quality_source||old?.quality_source||null,quality_origin:g.quality_origin||old?.quality_origin||null,original_platform:g.original_platform==='Unverified'&&old?.original_platform?old.original_platform:g.original_platform||old?.original_platform||'Unverified'});}
 state.games=[...result.values()].map(g=>({...g,watched:!!state.watch[g.id],owned:!!state.owned[g.id]||!!state.owned['id:'+g.steam_appid]||!!state.owned['title:'+titleKey(g.title)],target_price:state.targets[g.id]??null}));
}
function applyMeta(g){
 const title=titleKey(g.title),m=state.meta||{},ids=m.steam_ids||{},plats=m.original_platforms||{};
 g.steam_appid=g.steam_appid||ids[title]||null;
 g.original_platform=g.original_platform||plats[title]||'Unverified';
 g.quality=g.quality||'Unrated';
 if(!g.github_repo){const matched=/^https:\/\/github\.com\/([a-z0-9_.-]+\/[a-z0-9_.-]+)/i.exec(g.mod_url||'');g.github_repo=matched?matched[1]:null}
 const rating=(m.ratings||{})[titleKey(g.github_repo)];
 const label=rating?.label;
 const qualityMap={'native-like':'Native-like','excellent':'Excellent','playable':'Playable','experimental':'Experimental','broken':'Broken'};
 if(label&&qualityMap[label]&&rating.url){g.quality=qualityMap[label];g.quality_source=rating.url;g.quality_origin=rating.quality_origin;g.quality_checked=rating.checked;g.six_dof_aim=rating.six_dof_aim===true}
 return g;
}
function parseIndex(text){const items=[];
 for(const line of text.split(/\r?\n/)){
  if(!line.startsWith('| ')||line.startsWith('| Game'))continue;
  const parts=line.slice(2).replace(/\|\s*$/,'').split(' | ');
  if(parts.length<3||!parts[2].toUpperCase().includes('PCVR'))continue;
  const name=parts[0].match(/\*\*([^*]+)\*\*/);if(!name)continue;
  const title=clean(name[1]);const pic=(parts[0].match(/<img\s+src="(images\/[A-Za-z0-9_./-]+)"/)||[])[1];
  const source_image=pic&&!pic.includes('..')?INDEX_IMAGE+pic:null;
  for(const segment of parts[1].split(/<br>\s*<br>/i)){
   const mod=segment.match(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/);if(!mod)continue;
   const rel=segment.match(/Latest:\s*\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\s*\((\d{4}-\d{2}-\d{2})\)/i);
   const modName=clean(mod[1]),modURL=mod[2];
   const kind=/uevr/i.test(modName+' '+modURL)?'UEVR':/r\.e\.a\.l\.|luke ross/i.test(modName+' '+modURL)?'R.E.A.L.':/reframework/i.test(modName)?'Framework':'Dedicated';
   let g={title,mod_name:modName,mod_url:modURL,release_url:rel?.[2]||modURL,release_tag:rel?.[1]||null,released_at:rel?.[3]||null,source_image,kind,creator:null,source:'Flat2VR Index',linux_status:'Not verified',quality:'Unrated',original_platform:null};
   items.push(applyMeta(g));
  }
 }
 return items;
}
function toast(s){const e=$('toast');e.textContent=s;e.classList.add('visible');clearTimeout(window._radarToast);window._radarToast=setTimeout(()=>e.classList.remove('visible'),3200)}
function notice(t,warn=false){const n=$('notice');n.textContent=t;n.classList.toggle('warn',warn)}
async function fetchJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return r.json()}
async function refresh(silent=false){
 if(!silent)notice('Refreshing public sources…');let successes=0;const problems=[];
 try{
  const data=await fetchJSON('./data/feed.json?cache='+Date.now());
  if(data?.games?.length){state.remote=true;mergeGames(data.games.map(applyMeta));successes++}
  if(Array.isArray(data.news)){state.news=data.news.filter(n=>/^https:\/\//.test(n.url||'')).slice(0,100);if(state.news.length)successes++}
  if(data.prices&&typeof data.prices==='object')state.feedPrices=data.prices;
  state.feedUpdated=data.updated_at||null;
 }catch(err){problems.push('Hosted feed unavailable')}
 try{
  const r=await fetch(INDEX_URL+'?t='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw Error('HTTP '+r.status);
  const parsed=parseIndex(await r.text());
  if(parsed.length<25)throw Error('Index returned too few recognized entries');
  state.remote=true;mergeGames(parsed);save('radar7-catalog',parsed);state.source='Live Flat2VR Index';successes++;
 }catch(e){problems.push('Live Flat2VR index unavailable');const cached=read('radar7-catalog',[]);if(cached.length>=25){mergeGames(cached);state.source='Saved Flat2VR index'} }
 if(!state.games.length)mergeGames([]);
 if(successes){notice(`Independent mobile dashboard · ${state.games.length} VR conversions · ${state.news.length} headlines${state.feedUpdated?' · News feed '+dateDisplay(state.feedUpdated):''}`);if(!silent)toast('Sources refreshed')}
 else{notice(`Offline or source unavailable — showing ${state.games.length} cached / featured mods. ${problems.join('; ')}`,true);if(!silent)toast('Using saved catalog')}
 render();
}
const isRecent=d=>{const time=Date.parse(d||'');return Number.isFinite(time)&&time<=Date.now()&&time>=Date.now()-state.days*86400000};
function shown(){const q=titleKey(state.query);let games=state.games.filter(g=>{
 if(q&&!titleKey(g.title+' '+g.mod_name+' '+(g.creator||'')).includes(q))return false;
 if(state.recent&&!isRecent(g.released_at))return false;
 if(state.quality!=='all'&&g.quality!==state.quality)return false;
 if(state.platform!=='all'&&!titleKey(g.original_platform).includes(titleKey(state.platform)))return false;
 if(state.page==='library'&&!g.owned)return false;
 if(state.page==='deals'&&!g.steam_appid)return false;
 if(state.page==='watchlist'&&!g.watched)return false;
 return true;
 });
 const abc=(a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'});
 games.sort(state.sort==='name'?abc:state.sort==='platform'?(a,b)=>a.original_platform.localeCompare(b.original_platform)||abc(a,b):(a,b)=>(b.released_at||'').localeCompare(a.released_at||'')||abc(a,b));return games;
}
function priceFor(g){return state.feedPrices[String(g.steam_appid)]||null}
function priceHtml(g){const p=priceFor(g);if(!p){return `<div class="price-label">CAD pricing <strong>Check live offers</strong><div class="low">Steam – All time low: unavailable</div></div><a class="deal-link" target="_blank" rel="noopener" href="https://isthereanydeal.com/">ITAD ↗</a>`}
 const best=p.best;return `<div class="price-label">${best?`<strong>${esc(money(best.amount,best.currency||'CAD'))}</strong> · ${esc(best.shop||'Retailer')}`:'Offers unavailable'}<div class="low">Steam – All time low: ${p.steam_historical_low==null?'unavailable':esc(money(p.steam_historical_low,p.currency||'CAD'))}${p.checked_at?' · checked '+dateDisplay(p.checked_at):''}</div></div><a class="deal-link" target="_blank" rel="noopener" href="${safeUrl(p.url||'https://isthereanydeal.com/')}">Deals ↗</a>`}
function gameCard(g){const photo=imgUrl(g);return `<article class="game-card"><div class="game-art"><div class="game-fallback">${esc(g.title)}</div>${photo?`<img loading="lazy" src="${esc(photo)}" alt="${esc(g.title)} cover artwork" onerror="this.remove()" />`:''}<div class="card-badges-overlay"><a class="quality-badge ${esc(titleKey(g.quality))}" ${g.quality_source?`href="${safeUrl(g.quality_source)}" target="_blank" rel="noopener"`:''} title="PCVR Central rating snapshot">${esc(g.quality||'Unrated')}</a><button class="star ${g.watched?'selected':''}" data-action="watch" data-id="${esc(g.id)}" aria-label="${g.watched?'Remove from':'Add to'} watchlist">${g.watched?'★':'☆'}</button></div></div><div class="game-body"><h3 class="game-title">${esc(g.title)}</h3><div class="mod-name">${esc(g.mod_name)}</div><div class="badges"><span class="badge">${esc(g.kind||'Dedicated')}</span><span class="badge">${esc(g.original_platform||'Unverified')}</span>${g.owned?'<span class="badge owned">✓ Owned</span>':''}</div><div class="date-line">${g.released_at?'Updated '+dateDisplay(g.released_at):'Release date not checked'}</div><div class="game-footer">${priceHtml(g)}</div><div class="game-actions"><button data-action="detail" data-id="${esc(g.id)}">Details</button><a href="${safeUrl(g.mod_url)}" target="_blank" rel="noopener">VR mod ↗</a></div></div></article>`}
const TITLES={home:['RADAR OVERVIEW','Latest from the modding scene','New VR conversions, mod updates and headset news.'],mods:['DISCOVER PCVR','Every world has a doorway','Find flatscreen games you can experience in VR.'],deals:['STEAM & DEALS','Games worth picking up','Canadian pricing where a safe, hosted source is available; otherwise open ITAD.'],library:['MY GAME LIBRARY','Your games, now on the radar','Mark games you own; only saved on this device.'],news:['VR HEADLINES','Software, hardware and VR industry','Latest coverage from the independent public news feed.'],settings:['PREFERENCES','Your independent PCVR Radar','Personalize the mobile dashboard without connecting to a PC.'],watchlist:['WATCHLIST','Following the modding scene','Mods saved to your mobile watchlist.']};
function renderStats(){const recent=state.games.filter(g=>isRecent(g.released_at)).length,watched=state.games.filter(g=>g.watched).length,owned=state.games.filter(g=>g.owned).length;const values=[['TRACKED MODS',state.games.length,'Catalog conversions'],[`UPDATED IN ${state.days} DAYS`,recent,'Dated releases'],['OWNED GAMES',owned,'Marked on this device'],['WATCHLIST',watched,'Mods you follow']];$('stats').innerHTML=values.map(([k,v,n],i)=>`<div class="stat${i===3?' tappable':''}" ${i===3?'data-page="watchlist"':''} ${i===3?'role="button" tabindex="0" aria-label="Open watchlist"':''}><div class="stat-label">${k}</div><div class="stat-value">${v}</div><div class="stat-note">${n}</div></div>`).join('')}
function collections(){const games=shown();let actual=state.page==='home'?games.slice(0,8):games;if(state.page==='deals')actual=actual.filter(x=>x.steam_appid);return `<div class="result-meta">${state.page==='home'?'Showing latest '+actual.length+' · ':''}${games.length} matching VR conversions · ${esc(state.source)}</div>${actual.length?`<div class="card-grid">${actual.map(gameCard).join('')}</div>`:`<div class="empty"><h3>No matches on the radar yet</h3><p>Try another filter, refresh sources or mark a game as owned.</p><button class="primary" data-page="mods">Browse mods</button></div>`}${state.page==='home'?`<p style="text-align:right;margin:15px 0"><button class="ghost" data-page="mods">Browse the full catalog →</button></p>`:''}`}
function libraryView(){return `<div class="library-banner"><div class="eyebrow">PRIVATE ON-DEVICE COLLECTION</div><h3>Your personal game list</h3><p>This standalone edition does not connect to Steam or expose your library to visitors. Mark titles as owned individually or import a list of game names / Steam App IDs. Your selections stay in this browser.</p><div class="library-actions"><button id="open-import">+ Import games</button><button data-page="mods">Browse conversions</button><button data-page="watchlist">My watchlist</button></div></div>${collections()}`}
function newsView(){const tabs=['all','VR mods & software','Headsets & hardware','Industry'];let news=state.news.filter(n=>state.newsCategory==='all'||n.category===state.newsCategory);return `<div class="category-tabs">${tabs.map(t=>`<button data-category="${esc(t)}" class="${state.newsCategory===t?'active':''}">${t==='all'?'All headlines':esc(t)}</button>`).join('')}</div><div class="news-sources"><a href="https://www.uploadvr.com/" target="_blank" rel="noopener">UploadVR ↗</a><a href="https://www.roadtovr.com/" target="_blank" rel="noopener">Road to VR ↗</a><a href="https://pcvrcentral.com/" target="_blank" rel="noopener">PCVR Central ↗</a></div>${news.length?`<div class="news-list">${news.map(n=>`<article class="news-item"><div class="news-meta"><span class="news-cat">${esc(n.category)}</span>${esc(n.source)} · ${dateDisplay(n.published||n.first_seen)}</div><h3><a href="${safeUrl(n.url)}" target="_blank" rel="noopener">${esc(n.title)} ↗</a></h3><p>${esc((n.summary||'').slice(0,260))}</p></article>`).join('')}</div>`:`<div class="empty"><h3>No hosted headlines loaded yet</h3><p>The mod catalog can update directly from Flat2VR. Headlines will populate after publishing with the included GitHub Pages automated updater. Meanwhile, the trusted publication links above are available.</p></div>`}`}
function settingsView(){return `<div class="settings-grid"><section class="settings-card"><div class="settings-row"><div><h3>Firestorm Orange / Red</h3><p>Switch from the original ocean blue / green theme.</p></div><button class="switch" data-action="theme" role="switch" aria-checked="${state.theme==='firestorm'}" aria-label="Firestorm theme"><i></i></button></div></section><section class="settings-card"><h3>Refresh public sources</h3><p>Fetch the current community mod index. News updates require the included hosted updater.</p><div class="settings-actions"><button id="settings-refresh">↻ Refresh now</button></div><div class="source-status">Active catalog: <strong>${esc(state.source)}</strong>${state.feedUpdated?'<br/>Hosted news refreshed: '+dateDisplay(state.feedUpdated):''}</div></section><section class="settings-card"><h3>Your portable watchlist</h3><p>Export or import your watchlist and owned-game selections. No Steam account credentials are needed.</p><div class="settings-actions"><button id="export-data">↓ Export data</button><label>↑ Import data<input id="import-file" type="file" accept="application/json,.json"></label><button id="reset-data">Clear preferences</button></div></section><section class="settings-card"><h3>Install PCVR Radar</h3><p>Once deployed over HTTPS, open this page in Chrome or Samsung Internet, open the browser menu and select <strong>Add to Home screen</strong> or <strong>Install app</strong>. The app will then have its own icon and launch full-screen.</p><p>The offline cache keeps the interface and last loaded catalog available after installation. Live updates and external artwork require internet access.</p></section><section class="settings-card"><h3>Privacy &amp; pricing</h3><p>This public-ready build deliberately contains no Steam API key, personal Steam game list, or IsThereAnyDeal credentials. Current prices and historical lows require a trusted server-side integration; this edition links to official store and deal pages.</p></section><section class="settings-card"><h3>About</h3><p>PCVR Radar v0.7 · Mobile Standalone PWA · Based on v0.6.1 project design and mod metadata. Source data and PCVR Central quality snapshots may change. Always check official mod pages before installing.</p><button class="ghost" data-page="home">Return to dashboard</button></section></div>`}
function render(){document.documentElement.dataset.theme=state.theme;
 const [label,title,desc]=TITLES[state.page]||TITLES.home;$('page-breadcrumb').textContent=title;$('section-label').textContent=label;$('section-title').textContent=title;$('section-description').textContent=desc;
 document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===state.page));
 $('filter-panel').hidden=['news','settings'].includes(state.page);
 renderStats();
 $('page-content').innerHTML=state.page==='news'?newsView():state.page==='settings'?settingsView():state.page==='library'?libraryView():collections();
 $('days').value=String(state.days);$('sort').value=state.sort;$('quality').value=state.quality;$('platform').value=state.platform;$('recent-only').checked=state.recent;
}
function showDetails(key){const g=state.games.find(x=>x.id===key);if(!g)return;const photo=imgUrl(g);$('detail-heading').textContent=g.title;const fields=[['VR mod',g.mod_name],['Original platform',g.original_platform||'Not verified'],['Quality',g.quality||'Unrated'],['Mod type',g.kind||'Dedicated'],['Last release',dateDisplay(g.released_at)],['6DOF aiming',g.six_dof_aim?'Listed':'Not verified'],['Steam App ID',g.steam_appid||'Not matched'],['Proton / Linux',g.linux_status||'Not verified']];$('detail-content').innerHTML=`<div class="dialog-body">${photo?`<img class="detail-banner" src="${esc(photo)}" alt="${esc(g.title)} artwork" onerror="this.remove()">`:''}<p>${esc(g.description||'See the official project for installation details, current status, controls and compatibility.')}</p><div class="detail-meta">${fields.map(([a,b])=>`<div class="detail-field"><small>${esc(a)}</small><strong>${esc(b)}</strong></div>`).join('')}</div><div class="detail-links"><a href="${safeUrl(g.mod_url)}" target="_blank" rel="noopener">Official VR mod ↗</a>${g.quality_source?`<a href="${safeUrl(g.quality_source)}" target="_blank" rel="noopener">PCVR Central ↗</a>`:''}${g.steam_appid?`<a href="https://store.steampowered.com/app/${Number(g.steam_appid)}/" target="_blank" rel="noopener">Steam ↗</a>`:''}<a href="https://isthereanydeal.com/" target="_blank" rel="noopener">ITAD ↗</a><button data-action="owned" data-id="${esc(g.id)}">${g.owned?'✓ Owned · Unmark':'Mark owned'}</button><button data-action="watch" data-id="${esc(g.id)}">${g.watched?'★ Unwatch':'☆ Watch'}</button></div><p>Prices and ratings may be outdated. Data on this phone is not synced to the Windows/Linux app.</p></div>`;if(!$('details').open)$('details').showModal()}
function exportData(){const data={format:'pcvr-radar-mobile-v1',created_at:new Date().toISOString(),watch:state.watch,owned:state.owned,targets:state.targets,custom:state.custom};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='PCVR-Radar-Mobile-data.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);toast('Watchlist exported')}
async function importData(file){if(!file)return;try{if(file.size>2e6)throw Error('File exceeds 2MB');const d=JSON.parse(await file.text());if(d.format!=='pcvr-radar-mobile-v1')throw Error('Wrong export format');for(const k of ['watch','owned','targets']){if(d[k]&&typeof d[k]==='object'&&!Array.isArray(d[k])){state[k]=d[k];save('radar7-'+k,d[k])}}if(Array.isArray(d.custom)){state.custom=d.custom.slice(0,100).filter(g=>g&&g.title&&/^https:\/\//.test(g.mod_url));save('radar7-custom',state.custom)}mergeGames(read('radar7-catalog',[]));render();toast('Personal data imported')}catch(e){toast('Import failed: '+e.message)}}
function setPage(p){if(!(p in TITLES))return;state.page=p;history.replaceState(null,'','#'+p);render();window.scrollTo({top:0,behavior:'smooth'})}
function updateFlag(id,key){state[key][id]=!state[key][id];save('radar7-'+key,state[key]);mergeGames(read('radar7-catalog',[]));render();const dialog=$('details');if(dialog.open)showDetails(id)}
document.addEventListener('click',async e=>{
 const c=e.target.closest('[data-close]');if(c){$(c.dataset.close).close();return}
 const nav=e.target.closest('[data-page]');if(nav){e.preventDefault();setPage(nav.dataset.page);return}
 const category=e.target.closest('[data-category]');if(category){state.newsCategory=category.dataset.category;render();return}
 const a=e.target.closest('[data-action]');if(a){const k=a.dataset.id;if(a.dataset.action==='detail')showDetails(k);if(a.dataset.action==='watch')updateFlag(k,'watch');if(a.dataset.action==='owned')updateFlag(k,'owned');if(a.dataset.action==='theme'){state.theme=state.theme==='firestorm'?'ocean':'firestorm';save('radar7-theme',state.theme);render()}return}
 if(e.target.closest('#open-import')){$('import-dialog').showModal();return}
 if(e.target.closest('#import-save')){const names=$('owned-input').value.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean);let matched=0;for(const item of names){const byApp=/^\d+$/.test(item);for(const g of state.games){if((byApp&&String(g.steam_appid)===item)||(!byApp&&titleKey(g.title)===titleKey(item))){state.owned[g.id]=true;matched++}}if(byApp)state.owned['id:'+item]=true;else state.owned['title:'+titleKey(item)]=true}save('radar7-owned',state.owned);mergeGames(read('radar7-catalog',[]));$('import-dialog').close();$('owned-input').value='';render();toast(`${matched} matching VR conversions marked owned`);return}
 if(e.target.closest('#export-data')){exportData();return}
 if(e.target.closest('#reset-data')){if(confirm('Clear this phone\'s watchlist and owned markers?')){state.watch={};state.owned={};state.targets={};for(const k of ['watch','owned','targets'])save('radar7-'+k,state[k]);mergeGames(read('radar7-catalog',[]));render();toast('Personal selections cleared')}return}
 if(e.target.closest('#settings-refresh')||e.target.closest('#refresh-button')){refresh(false);return}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.stat.tappable')){e.preventDefault();setPage('watchlist')}});
$('search').addEventListener('input',e=>{state.query=e.target.value;render()});
$('sort').addEventListener('change',e=>{state.sort=e.target.value;render()});
$('quality').addEventListener('change',e=>{state.quality=e.target.value;render()});
$('platform').addEventListener('change',e=>{state.platform=e.target.value;render()});
$('days').addEventListener('change',e=>{state.days=Number(e.target.value);save('radar7-days',state.days);render()});
$('recent-only').addEventListener('change',e=>{state.recent=e.target.checked;render()});
document.addEventListener('change',e=>{if(e.target.id==='import-file')importData(e.target.files?.[0])});
async function init(){try{state.meta=await fetchJSON('./data/metadata.json');let seed=await fetchJSON('./data/seed.json');state.seed=seed.games.map(applyMeta);const cached=read('radar7-catalog',[]);mergeGames(cached);state.source=cached.length?'Cached Flat2VR Index':'Bundled featured mods'}catch(e){notice('Unable to load starter catalog: '+e.message,true);return}const hash=location.hash.slice(1);if(hash in TITLES)state.page=hash;render();refresh(true)}
if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
init();
