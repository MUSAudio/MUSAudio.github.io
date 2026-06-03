
const labelMap = {
  gt:'Ground Truth FOA', gt_w:'Ground Truth W (Mono)', ours:'MUSAudio (ours)', stable:'Stable Audio Open', dacvae:'DACVAE (Mono)', flow2gan:'Flow2GAN', omni:'OmniAudio',
  input:'Input / reference mixture', ours_agent:'MUSAudio', separation_pyroom:'SAMPyroom', direct_spatialize:'MUSAudio (GT)'
};
function fmt(v){ return v === null || v === undefined ? '—' : v; }
function metricTable(metrics, keys){
  const rows = keys.map(k=>`<tr><td>${labelMap[k]||k}</td><td>${fmt(metrics[k]?.mrstft)}</td><td>${fmt(metrics[k]?.lsd)}</td></tr>`).join('');
  return `<table class="metrics"><thead><tr><th>Method</th><th>MRSTFT ↓</th><th>LSD ↓</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function tracksHtml(tracks){
  return `<div class="tracks">${tracks.map(t=>`<div class="track"><strong>${t.label}</strong><small>${t.channels||'?'} ch · ${t.sr||'?'} Hz · ${t.duration||'?'} s${t.format ? ' · '+t.format : ''}</small><audio controls preload="none" src="${t.src}"></audio></div>`).join('')}</div>`;
}
function renderAudioVAE(items){
  const el=document.getElementById('audiovae-demos');
  el.innerHTML=items.map((d,i)=>`<article class="demo"><h3>Example ${i+1}</h3>${tracksHtml(d.tracks)}</article>`).join('');
}

function sceneInfo(d){
  const labels=(d.labels||[]).map(x=>`<span class="pill">${x}</span>`).join('');
  const pos=(d.positions||[]).map((p,i)=>`<li>${(d.labels||[])[i]||('source '+(i+1))}: azimuth ${Math.round(p.azimuth)}°, elevation ${Math.round(p.elevation)}°</li>`).join('');
  return `<div class="scene-info"><strong>Spatial layout</strong><div>${labels}</div><ul>${pos}</ul></div>`;
}
function avVideoGrid(d, view='front'){
  const videos=((d.viewVideos||{})[view]||[]);
  return `<div class="av-grid">${videos.map(v=>`<div class="av-card"><strong>${v.label}</strong><video controls preload="metadata" src="${v.src}"></video></div>`).join('')}</div>`;
}
function renderGeneration(items){
  const el=document.getElementById('generation-demos');
  const viewNames={front:'Front',right:'Right',back:'Back',left:'Left'};
  el.innerHTML=items.map((d,i)=>{
    const viewTabs=Object.keys(viewNames).map(v=>`<button class="view-tab ${v==='front'?'active':''}" data-view="${v}">${viewNames[v]}</button>`).join('');
    return `<article class="demo generation-demo" data-demo-id="${d.id}"><h3>Example ${i+1}</h3>${sceneInfo(d)}<div class="view-row">${viewTabs}</div><div class="av-panel">${avVideoGrid(d,'front')}</div><details><summary>Normalized FOA browser previews</summary>${tracksHtml(d.tracks)}</details></article>`;
  }).join('');
  document.querySelectorAll('.view-tab').forEach(btn=>btn.addEventListener('click',()=>{
    const article=btn.closest('.generation-demo');
    article.querySelectorAll('.view-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const demo=items.find(x=>x.id===article.dataset.demoId);
    article.querySelector('.av-panel').innerHTML=avVideoGrid(demo, btn.dataset.view);
  }));
}
const start = data => { renderAudioVAE(data.audiovae); renderGeneration(data.generation); };
if (window.MUSAUDIO_DEMOS) {
  start(window.MUSAUDIO_DEMOS);
} else {
  fetch('assets/data/demos.json').then(r=>r.json()).then(start);
}
