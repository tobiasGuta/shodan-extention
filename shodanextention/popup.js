// popup.js — resolves hostname, queries Shodan, displays results
const B = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);

function $(id){ return document.getElementById(id); }

function showStatus(msg){ const s = $('status'); s.style.display='block'; s.textContent = msg; }
function showError(msg){ $('status').style.display='none'; $('content').style.display='none'; const e=$('error'); e.style.display='block'; e.textContent=msg; }

function storageGet(key){
  return new Promise((resolve)=>{
    if (!B) return resolve(null);
    if (B.storage && B.storage.local && B.storage.local.get) {
      B.storage.local.get([key], (items)=>{
        resolve(items && items[key] ? items[key] : null);
      });
    } else resolve(null);
  });
}

function tabsQuery(query){
  return new Promise((resolve,reject)=>{
    if (!B || !B.tabs || !B.tabs.query) return reject(new Error('tabs API unavailable'));
    B.tabs.query(query, (tabs)=>{
      resolve(tabs);
    });
  });
}

async function resolveHostname(hostname){
  const url = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`;
  const r = await fetch(url, { cache:'no-store' });
  if (!r.ok) throw new Error(`DNS lookup failed (${r.status})`);
  const j = await r.json();
  const answers = j.Answer || j.Answers || j.answer;
  if (!answers || !Array.isArray(answers)) {
    if (j.Answer && j.Answer.data) return j.Answer.data;
    throw new Error('No A records found');
  }
  for (const a of answers){
    if (!a) continue;
    if ((a.type === 1 || a.type === 'A') && a.data) return a.data;
    if (a.data && /^\d+\.\d+\.\d+\.\d+$/.test(a.data)) return a.data;
  }
  throw new Error('No A records found');
}

async function queryShodan(ip, key){
  const url = `https://api.shodan.io/shodan/host/${encodeURIComponent(ip)}?key=${encodeURIComponent(key)}`;
  const r = await fetch(url, { cache:'no-store' });
  const text = await r.text();
  let j;
  try { j = JSON.parse(text); } catch(e){
    if (!r.ok) throw new Error(`Shodan error: ${r.status} ${text}`);
    throw e;
  }
  if (!r.ok) {
    const msg = j && (j.error || j.message) ? (j.error || j.message) : `Shodan error ${r.status}`;
    throw new Error(msg);
  }
  return j;
}

function render(data){
  $('error').style.display='none';
  $('content').style.display='block';
  $('ip').textContent = data.ip_str || data.ip || '';
  $('org').textContent = data.org || '-';
  $('ports').textContent = Array.isArray(data.ports) ? data.ports.join(', ') : (data.ports || '-');
  $('hostnames').textContent = Array.isArray(data.hostnames) ? data.hostnames.join(', ') : (data.hostnames || '-');
  $('tags').textContent = Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || '-');
  $('os').textContent = data.os || '-';
}

async function init(){
  try{
    showStatus('Reading API key...');
    const key = await storageGet('shodan_api_key');
    const color = await storageGet('shodan_color');
    if (color) {
      const h = document.querySelector('h1');
      if (h) h.style.color = color;
      const btn = document.getElementById('openOptions');
      if (btn) { btn.style.backgroundColor = color; btn.style.color = '#fff'; }
    }
    if (!key) { showError('No Shodan API key configured. Open Options.'); return; }

    showStatus('Getting active tab...');
    const tabs = await tabsQuery({ active:true, currentWindow:true });
    if (!tabs || !tabs[0] || !tabs[0].url) { showError('No active tab found'); return; }
    let hostname;
    try { hostname = (new URL(tabs[0].url)).hostname; } catch(e){ showError('Unable to parse tab URL'); return; }

    showStatus(`Resolving ${hostname}...`);
    let ip;
    try { ip = await resolveHostname(hostname); } catch(e){ showError(`DNS resolution failed: ${e.message}`); return; }

    showStatus(`Querying Shodan for ${ip}...`);
    let data;
    try { data = await queryShodan(ip, key); } catch(e){ showError(`Shodan error: ${e.message}`); return; }
    render(data);
  } catch(e){ showError(e.message || String(e)); }
}

document.addEventListener('DOMContentLoaded', ()=>{
  $('openOptions').addEventListener('click', ()=>{
    if (!B || !B.runtime) return;
    if (B.runtime.openOptionsPage) B.runtime.openOptionsPage();
    else B.runtime.sendMessage({ action: 'openOptions' });
  });
  init();
});
