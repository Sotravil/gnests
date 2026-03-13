# Embed Schema

## Embed Config Shape

```json
{
  "id": "embed_xxx",
  "name": "johnson-embed",
  "presetRef": "johnson",
  "source": "local",
  "runtime": {
    "scriptSrc": "https://cdn.jsdelivr.net/gh/Sotravil/gnests@main/dist/gnests-embed.js",
    "mount": "#gnests-slot",
    "mode": "notification",
    "autostart": true
  },
  "payload": {
    "title": "hello",
    "body": "welcome {{user}}",
    "targetUrl": "/status",
    "icon": "",
    "badge": "",
    "image": "",
    "tag": "welcome"
  },
  "theme": {
    "color": "#111827",
    "accent": "#0ea5e9",
    "background": "#ffffff",
    "text": "#111827"
  },
  "domains": ["example.com"],
  "meta": {},
  "exportedAt": 0
}
```

## Export Formats
- HTML snippet
- JS init snippet
- JSON config
- package payload (`embed-config.json`, `embed-init.js`, `embed-snippet.html`)

## Runtime Behavior
- Runtime script reads `window.GNESTS_EMBEDS`
- For each config:
  - checks domain allowlist (best-effort)
  - no-ops if host not allowed
  - mounts lightweight card in configured selector

## Security Note
Domain allowlist in static runtime is advisory only, not secure enforcement.
