# GNESTS API Contract

## Modes
- Local-only mode: full draft/preset/embed operations in browser localStorage.
- Repo-catalog mode: reads preset catalog from public static `presets/*.json`.
- Embed-export mode: generates snippets/config JSON for external projects.
- Future relay mode: optional backend adapter for true remote push.

## DSL Command Request Shape

Example human DSL:
```txt
load "johnson"; domain add "example.com"; export html;
```

Equivalent conceptual JSON request:
```json
{
  "cmd": "load \"johnson\"; domain add \"example.com\"; export html;",
  "context": {
    "clientId": "client-123",
    "sourceProject": "gnests-ui",
    "mode": "professional"
  },
  "options": {
    "dryRun": false,
    "strict": false
  }
}
```

## Normalized Action Request Shape

```json
{
  "action": "embed.export",
  "args": {
    "format": "html"
  },
  "context": {
    "clientId": "client-123",
    "sourceProject": "gnests-ui"
  },
  "options": {
    "dryRun": false,
    "strict": true
  }
}
```

## Response Schema

Success:
```json
{
  "ok": true,
  "status": "success",
  "action": "preset.listLocal",
  "requestId": "req_xxx",
  "traceId": "trace_xxx",
  "message": "Local presets loaded successfully.",
  "data": {
    "count": 2,
    "items": []
  },
  "warnings": [],
  "errors": []
}
```

Warning:
```json
{
  "ok": true,
  "status": "warning",
  "action": "embed.export",
  "requestId": "req_xxx",
  "traceId": "trace_xxx",
  "message": "Embed generated, but domain allowlist is empty.",
  "data": {"format": "html"},
  "warnings": [
    {
      "code": "EMPTY_DOMAIN_ALLOWLIST",
      "field": "domains",
      "detail": "The embed will run on any domain because no allowlist entries were configured."
    }
  ],
  "errors": []
}
```

Error:
```json
{
  "ok": false,
  "status": "error",
  "action": "preset.deleteLocal",
  "requestId": "req_xxx",
  "traceId": "trace_xxx",
  "message": "Preset not found.",
  "data": null,
  "warnings": [],
  "errors": [
    {
      "code": "PRESET_NOT_FOUND",
      "field": "name",
      "detail": "No local preset named 'johnson' exists."
    }
  ]
}
```

## Error / Warning Codes
- UNKNOWN_COMMAND
- PARSE_ERROR
- INVALID_ARGUMENT
- MISSING_ARGUMENT
- INVALID_BOOLEAN
- INVALID_DURATION
- INVALID_JSON_PAYLOAD
- PRESET_NOT_FOUND
- PRESET_NAME_REQUIRED
- PRESET_ALREADY_EXISTS
- EMBED_NOT_FOUND
- EMBED_NAME_REQUIRED
- LOCAL_STORAGE_WRITE_FAILED
- LOCAL_STORAGE_READ_FAILED
- REPO_PRESET_NOT_FOUND
- REPO_CATALOG_LOAD_FAILED
- ASSET_NOT_FOUND
- DOMAIN_INVALID
- EMPTY_DOMAIN_ALLOWLIST
- UNRESOLVED_PLACEHOLDER
- PERMISSION_DENIED
- SERVICE_WORKER_MISSING
- SYNC_FAILED
- UNKNOWN_ACTION

## Static Limitations
- Domain checks in exported embed are best-effort client checks only.
- No secure enforcement without backend verification.
- Repo writes/publish are not default and should stay trusted-operator only.
