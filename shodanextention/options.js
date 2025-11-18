const B = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);

function $(id){ return document.getElementById(id); }

function feedback(msg){ const f = $('feedback'); f.textContent = msg; f.style.display = 'inline'; setTimeout(()=>{ f.style.display='none'; }, 2500); }

let currentKey = null;

function setBlurredState(blurred){
  const input = $('apiKey');
  const toggle = $('showToggle');
  if (blurred) {
    input.classList.add('blurred');
    toggle.textContent = 'Show';
  } else {
    input.classList.remove('blurred');
    toggle.textContent = 'Hide';
  }
}

function saveKey(){
  if (!B || !B.storage || !B.storage.local) { feedback('Storage unavailable'); return; }
  const input = $('apiKey');
  // always read the input value (visual blur does not change the input value)
  const key = input.value.trim();
  const color = $('colorPicker').value;
  B.storage.local.set({ shodan_api_key: key, shodan_color: color }, ()=>{ currentKey = key; setBlurredState(true); feedback('Saved'); });
}

function clearKey(){
  if (!B || !B.storage || !B.storage.local) { feedback('Storage unavailable'); return; }
  B.storage.local.remove(['shodan_api_key','shodan_color'], ()=>{ $('apiKey').value=''; $('colorPicker').value = '#0073bd'; currentKey = null; setBlurredState(false); feedback('Cleared'); });
}

function loadKey(){
  if (!B || !B.storage || !B.storage.local) return;
  B.storage.local.get(['shodan_api_key','shodan_color'], (items)=>{
    if (items && items.shodan_api_key) {
      currentKey = items.shodan_api_key;
      $('apiKey').value = currentKey;
      setBlurredState(true);
    }
    if (items && items.shodan_color) {
      $('colorPicker').value = items.shodan_color;
    }
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadKey();
  $('save').addEventListener('click', saveKey);
  $('clear').addEventListener('click', clearKey);
  $('showToggle').addEventListener('click', ()=>{
    const input = $('apiKey');
    if (input.classList.contains('blurred')) setBlurredState(false);
    else setBlurredState(true);
  });
});

// small CSS injection for blur class so we don't change external styles
const style = document.createElement('style');
style.textContent = '.blurred{filter:blur(6px);}';
document.head.appendChild(style);
