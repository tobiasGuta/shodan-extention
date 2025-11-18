# Shodan Site Info (browser extension)

Simple Firefox/Chrome extension (Manifest V3) that shows Shodan information for the current tab's hostname.

How it works
- Stores Shodan API key in `storage.local` via the Options page.
- Resolves hostname via Google DNS-over-HTTPS (`https://dns.google/resolve`).
- Queries Shodan host API and displays IP, organization, open ports, hostnames, tags, and OS.

Files
- `manifest.json` extension manifest
- `popup.html`, `popup.js` popup UI & logic
- `options.html`, `options.js` API key management
- `background.js` service worker (basic handlers)

Load in Firefox (temporary)
1. Open `about:debugging#/runtime/this-firefox`.
2. Click "Load Temporary Add-on" and choose `manifest.json` inside this folder.
3. Open Options from the extension entry to set your Shodan API key.


Notes
- Do NOT hardcode your API key. Save it via Options.
- If you see CORS or network errors, open Browser Console to inspect requests.
