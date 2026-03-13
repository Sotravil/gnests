# Preset Schema

```json
{
  "id": "preset_xxx",
  "name": "welcome-basic",
  "label": "Welcome Basic",
  "description": "Optional description",
  "version": 1,
  "title": "Hello {{user}}",
  "body": "Tap to open {{route}}",
  "targetUrl": "{{route}}",
  "tag": "welcome",
  "icon": "",
  "badge": "",
  "image": "",
  "theme": {
    "color": "#111827",
    "accent": "#0ea5e9",
    "background": "#ffffff",
    "text": "#111827",
    "border": "#d6e1e6",
    "shadow": "md",
    "radius": 16
  },
  "domains": ["example.com"],
  "silent": false,
  "requireInteraction": false,
  "actions": [],
  "meta": {},
  "placeholders": {
    "user": { "default": "friend", "required": false },
    "route": { "default": "/", "required": true }
  },
  "embed": {
    "mount": "#gnests-slot",
    "mode": "notification",
    "inline": false,
    "autostart": true
  },
  "source": "local",
  "updatedAt": 0
}
```

## Placeholder Resolution Priority
1. Explicit vars command values
2. Draft `meta`
3. Placeholder defaults
4. System values (`date`, `time`, `clientId`, `platform`, `domain`)
5. Unresolved remains unresolved and is reported as warning/error depending on strict mode

## Origin Semantics
- `source: local` for localStorage presets
- `source: repo` for public catalog presets
- imported repo presets become local on save/import
