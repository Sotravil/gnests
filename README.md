# GNESTS (Static Notification Orchestration Suite)

GNESTS is a modular static notification suite for web developers, combining a control UI, service worker runtime, local scheduling, queue processing, and optional GitHub-backed sync.

## Project reality

### What works locally with static hosting
- Service worker registration and lifecycle.
- Notification permission flow and capability checks.
- Local queue and local scheduled notifications.
- In-app send-now and timed execution while context stays active.
- Notification click and close event routing/telemetry.
- Optional queue polling from `queue.json`.

### What needs more than static hosting
- True remote push to fully closed browsers/devices.
- Subscription persistence and secure push-sender flow.

For guaranteed remote push, add a sender adapter (serverless/backend) with VAPID keys and subscription storage.

## File responsibilities
- `index.html`
	- Developer-facing controller UI.
	- State + queue logic + scheduling + logs.
	- Service worker registration + permission checks.
	- Local-first persistence + optional GitHub sync adapter hooks.
- `sw.js`
	- Notification runtime brain.
	- Install/activate, optional static caching, click/close events.
	- Receives page messages and shows notifications.
	- Future `push` event support for real sender backend.
- `queue.json`
	- Schema-like snapshot and import/export example.
	- Not the only live runtime database.
- `manifest.json`
	- PWA metadata: app identity, install behavior, icons, colors.

## Runtime store model
- Live runtime edits: localStorage now, IndexedDB recommended for larger queues.
- `queue.json`: defaults, import/export, developer sample, optional sync artifact.
- GitHub API sync: optional, explicitly enabled flow.

## GNESTS phase workflow

### Phase 1: boot handshake
1. Load UI.
2. Register service worker.
3. Read permission and capability state.
4. Load local queue/state first.
5. Optionally load `queue.json`.
6. Optionally run GitHub sync.
7. Render badges and logs.

### Phase 2: capability checks
- Notification API support.
- Permission status.
- Service worker support/ready state.
- Installed vs browser-tab mode.
- Optional GitHub sync mode.

### Phase 3: queue creation
- Validate schema.
- Save local-first.
- Mark statuses and schedule timers.
- Optionally sync snapshot to GitHub.

### Phase 4: execution modes
- Mode A: in-app notifications (most reliable static mode).
- Mode B: local scheduled notifications (device/browser dependent).
- Mode C: true remote push (requires separate sender adapter layer).

### Phase 5: click routing
- Focus existing client if possible.
- Navigate or open route/URL.
- Relay click/close metadata back to page logs.

### Phase 6: sync strategy
Local-first, then sync. If sync fails, keep local state and retry later.

## Deployment notes
1. Deploy over HTTPS (GitHub Pages works well).
2. Keep service worker registration same-origin (`./sw.js`).
3. If using GitHub sync in-browser, use least-privileged token scope and treat it as development-only risk.
4. Validate service worker + notifications in browser devtools Application panel.

## Phase 2 upgrade path for real push
1. Collect subscriptions from the client app.
2. Store subscriptions + client targeting metadata server-side.
3. Add sender endpoint (Cloudflare Worker/serverless/backend).
4. Use VAPID keys for encrypted push delivery.
5. Keep `sw.js` as runtime display/click handler.
