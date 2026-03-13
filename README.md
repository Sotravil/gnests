# GNESTS (Guided Notification Execution and Sync Toolkit)

GNESTS is a static-first notification orchestration project built for both beginners and advanced operators.

It combines:
- PWA + service worker notification runtime
- Local scheduling and queue processing
- Device-link and remote routing helpers
- Diagnostics with fix hints
- Multi-level UX modes (`easy`, `medium`, `hard`, `professional`)
- Professional command console with a lightweight notification DSL

GitHub repository:
- https://github.com/Sotravil/gnests
- https://github.com/Sotravil/gnests/tree/main

## Purpose

GNESTS is designed to let you:
- test notification workflows quickly
- model queue/scheduled delivery behavior
- debug why tasks were delayed or failed
- link devices for remote routing experiments
- evolve from static testing into real relay-backed push architecture

It is intentionally practical for demos, QA, and architecture validation before full backend rollout.

## Who It Is For

- Easy mode users: want large, guided controls and minimal setup complexity
- Medium mode users: want balanced UI and regular operations
- Hard mode users: want diagnostics-heavy operational control
- Professional users: want compact manual UI plus scriptable command execution

## Current Capabilities

### Works now in static hosting
- Notification permission flow
- Service worker registration and lifecycle
- Local notification sends (`send now` and scheduled timers)
- Queue ingestion from `queue.json`
- In-page queue processing and status updates
- Notification click/close telemetry relayed from service worker
- Device-link request/approve presence signaling (local + sync-assisted flow)
- QR route generation for linking
- Diagnostics scans with explicit fixes
- Professional console command language execution

### Requires backend/relay for full remote reliability
- True closed-browser remote push delivery
- Durable subscription persistence across devices
- Server-side push sender using VAPID

If you need guaranteed cross-device push while target apps are closed, add a backend sender adapter.

## Architecture Overview

### Frontend controller
File: `index.html`

Responsibilities:
- renders full UX (all modes + sections)
- maintains app state (`settings`, `draft`, `queue`, `scheduled`, `logs`, `linking`)
- handles permissions, service worker registration, and queue operations
- performs diagnostics and displays remediation guidance
- runs professional command console and language engine bridge

### Runtime worker
File: `sw.js`

Responsibilities:
- service worker install/activate/fetch caching
- safe notification display (`SHOW_NOTIFICATION`)
- `push` event placeholder for backend-enabled delivery
- click/close event capture and client message relay
- response-routing metadata propagation for notification actions

### Command language engine
File: `console-language.js`

Responsibilities:
- parses simple semicolon-separated DSL commands
- executes notification/system operations via app API bridge
- provides command help dictionary
- supports shortcuts such as `attempt p "hola"`

### Queue schema snapshot
File: `queue.json`

Responsibilities:
- sample/public import source
- demonstration schema for queued notifications
- optional sync artifact for pull-based workflows

### PWA manifest
File: `manifest.json`

Responsibilities:
- install metadata and identity
- app colors and icon references
- standalone display behavior

## UX Modes and Behavior

### Easy
- block-style workbench
- large buttons and high readability
- hides most advanced operational surfaces
- best for first-time operators

### Medium
- balanced default view
- main workflow sections visible
- good for regular day-to-day testing

### Hard
- stronger diagnostics emphasis
- operational surfaces are prominent
- suited to troubleshooting and reliability analysis

### Professional
- reduced help noise
- compact controls
- manual console and command-oriented flow
- optimized for power users

## First-Run Onboarding and Consent

On first load, a consent modal is shown.

Consent options:
1. Fingerprint/identity consent
2. Notification + service worker permission flow consent

Notes:
- fingerprint here refers to local project identity tracking context (`client id + platform`) for routing and linkage behavior
- on mobile (iOS/Android), background behavior is still browser and OS policy dependent

## Professional Command Language (DSL)

Supported examples:
- `help`
- `attempt p "hola"`
- `attempt p -t "hola" -b "body" -u "/status" -s y -ri n`
- `p "quick title"`
- `s y`
- `schema n`
- `perm`
- `sw`
- `diag`
- `link announce`
- `link request client-123 "Teammate Phone"`
- `mode professional`
- `clear`

Command chaining:
- separate commands with `;`
- example: `attempt p -t "hola"; s y; diag;`

## Notification Data Model (Practical)

Common payload fields used across UI/queue/worker:
- `id`
- `title`
- `body`
- `targetUrl`
- `icon`
- `badge`
- `image`
- `tag`
- `actions[]`
- `clientTarget`
- `silent`
- `requireInteraction`

Extended remote/response metadata:
- `responseTargetClientId`
- `responseToNotificationId`

## Diagnostics and Failure Analysis

The diagnostics section scans for issues such as:
- permission not granted
- service worker not registered
- offline network state
- overdue scheduled tasks (possible background throttling)
- incomplete relay config
- stale link requests
- no linked devices available

Each finding includes:
- severity
- signal category
- impact
- explicit fix recommendation

## Sync and Data Strategy

Primary runtime storage:
- `localStorage`

Optional pull source:
- `queue.json`

Optional remote sync:
- GitHub Content API (configured in settings)

Strategy:
- local-first
- sync after local success
- retain local state on remote sync failure

## Remote and Device Linking Flow

1. Generate or share link routes in Remote section.
2. Use QR route to open peer device with linking context.
3. Send link request.
4. Peer approves incoming request.
5. Linked device appears in target selectors.
6. Use relay-backed sending for true remote delivery when backend is configured.

## Deployment Guide

1. Host with HTTPS (GitHub Pages is valid).
2. Keep service worker registration same-origin (`./sw.js`).
3. Ensure all referenced static files are reachable from deployed base path.
4. Validate in browser devtools:
   - Application > Service Workers
   - Application > Manifest
   - Notifications permission state

## Security and Operational Notes

- Do not expose high-privilege GitHub tokens in production clients.
- Treat in-browser GitHub sync as controlled/dev usage unless hardened.
- Professional console executes user-provided commands; use trusted operators only.
- For production push, move credentialed operations to backend services.

## Roadmap Suggestions

- move storage from `localStorage` to IndexedDB for larger workloads
- implement signed relay endpoints and robust auth
- add delivery receipts and per-task retry policy
- add multi-tenant namespace separation for larger teams

## Quick Start

1. Open app and complete onboarding consent.
2. Choose mode (`easy`, `medium`, `hard`, `professional`).
3. Grant notification permission.
4. Register service worker.
5. Send quick notification or create scheduled/queue item.
6. Run diagnostics if anything fails.
7. Configure relay + VAPID if testing real remote push path.
