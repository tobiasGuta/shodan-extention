// background.js — MV3 service worker (lightweight)
const B = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);

if (B && B.runtime && B.runtime.onInstalled) {
  B.runtime.onInstalled.addListener((details)=>{
    console.log('Shodan Site Info installed', details);
  });
}

// Handle openOptions message from popup fallback
if (B && B.runtime && B.runtime.onMessage) {
  B.runtime.onMessage.addListener((msg, sender, sendResponse)=>{
    if (msg && msg.action === 'openOptions') {
      if (B.runtime.openOptionsPage) B.runtime.openOptionsPage();
      else {
        // fallback: try to open options page as a tab
        if (B.tabs && B.tabs.create) B.tabs.create({ url: 'options.html' });
      }
    }
  });
}
