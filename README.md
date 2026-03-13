# GNESTS — Guided Notification Execution and Sync Toolkit

GNESTS is a static-first, browser-native notification orchestration toolkit for web developers. It provides a complete environment for composing, scheduling, queuing, previewing, and dispatching Web Notifications — all from a single HTML file backed by a service worker, with no server required. It includes a professional command console, a preset and template system with placeholder resolution, embeddable notification widgets, built-in diagnostics, and optional GitHub-backed version and queue synchronization.

---

## Table of Contents

- [What GNESTS Is](#what-gnests-is)
- [Why It Exists](#why-it-exists)
- [Who This Is For](#who-this-is-for)
- [When Not to Use GNESTS](#when-not-to-use-gnests)
- [Core Capabilities](#core-capabilities)
- [How GNESTS Works](#how-gnests-works)
- [Architecture Overview](#architecture-overview)
- [Main Workflows](#main-workflows)
- [Operating Modes](#operating-modes)
- [Key Files and Module Map](#key-files-and-module-map)
- [Data and Configuration Artifacts](#data-and-configuration-artifacts)
- [Professional Console and Command Reference](#professional-console-and-command-reference)
- [Presets](#presets)
- [Embeds and Export](#embeds-and-export)
- [Schemas and Contracts](#schemas-and-contracts)
- [Installation and Local Usage](#installation-and-local-usage)
- [Configuration](#configuration)
- [Hosting and Deployment](#hosting-and-deployment)
- [Quick Start](#quick-start)
- [Versioning and Update Flow](#versioning-and-update-flow)
- [Limitations and Known Caveats](#limitations-and-known-caveats)
- [Security and Privacy Notes](#security-and-privacy-notes)
- [Roadmap](#roadmap)
- [Author](#author)
- [License](#license)

---

## What GNESTS Is

GNESTS is a self-contained notification lab that runs entirely as a static website. It combines:

- A **notification composer** with title, body, icon, badge, image, tag, and action support.
- A **scheduling and queue engine** that persists to `localStorage` and can optionally pull from a static `queue.json` file.
- A **service worker runtime** that handles notification display, click routing, dismiss telemetry, and offline caching.
- A **professional command console** with a DSL parser, action normalizer, and structured response pipeline.
- A **preset and template system** with `{{placeholder}}` resolution, local CRUD, and a public repository catalog.
- An **embed export system** that generates HTML/JS/JSON snippets for embedding notification widgets into external sites.
- A **diagnostics engine** that inspects permission state, service worker health, capability detection, and storage integrity.
- A **device linking and discovery system** using `BroadcastChannel` and `localStorage` heartbeats.
- A **cross-platform PWA** that adapts to desktop, tablet, and mobile form factors with dark mode support.

Everything persists locally. There is no backend, no database, and no authentication layer. The only network calls are optional fetches to GitHub-hosted `version.json` and `queue.json` for update checks and queue sync.

---

## Why It Exists

Browser notifications are straightforward in concept but surprisingly complex to work with correctly. Permission flows vary across browsers and operating systems. Service worker lifecycles are opaque. Notification payloads have inconsistent support for icons, badges, images, actions, and interaction flags. Scheduling and queuing require custom infrastructure. Testing notification behavior across devices requires repetitive manual work.

GNESTS exists to give developers a single, deployable environment where they can:

1. Experiment with the full Web Notification API surface without writing boilerplate.
2. Build and test notification payloads with live previews and placeholder-driven templates.
3. Schedule and queue notifications with local-first persistence.
4. Diagnose permission, service worker, and capability issues with guided fixes.
5. Export notification configurations as embeddable widgets for other projects.
6. Operate entirely from static hosting — no server, no build step, no dependencies.

---

## Who This Is For

- **Web developers** testing notification behavior across browsers and devices.
- **Frontend teams** prototyping notification UX before building backend push infrastructure.
- **Technical educators** demonstrating service worker and notification concepts.
- **Solo developers** who need a lightweight notification toolkit without a push service.

---

## When Not to Use GNESTS

- **You need server-initiated push notifications.** GNESTS is static-first. The service worker includes a `push` event handler for future backend integration, but no push sender exists today.
- **You need authentication or access control.** There is no user identity system. Anyone with access to the hosted URL has full access.
- **You need production-grade delivery guarantees.** Notifications are dispatched locally via the browser's Notification API. There is no delivery tracking, retry infrastructure, or cross-device sync.
- **You need secure domain enforcement for embeds.** The embed domain allowlist is a best-effort client-side check. It is not a security boundary.

---

## Core Capabilities

| Capability | Description |
|---|---|
| **Compose** | Build notification payloads with title, body, icon, badge, image, tag, actions, and interaction flags. |
| **Send** | Dispatch notifications immediately via `ServiceWorkerRegistration.showNotification()` with `new Notification()` fallback. |
| **Schedule** | Set delay-based notifications that fire after a specified duration. |
| **Queue** | Manage a persistent notification queue with status tracking, repeat rules, and client targeting. |
| **Presets** | Save, load, clone, rename, and delete reusable notification templates with placeholder support. |
| **Repo Catalog** | Browse and import presets from a public JSON catalog hosted alongside the app. |
| **Placeholders** | Use `{{variable}}` syntax in any payload field; resolved from vars, meta, preset defaults, and system values. |
| **Embeds** | Export notification configurations as embeddable HTML, JS, or JSON snippets for external sites. |
| **Assets** | Manage a local library of icon, badge, and image assets (stored as data URLs). |
| **Themes** | Configure color, accent, background, text, border, radius, and shadow for embed output. |
| **Domains** | Define an allowlist of domains where exported embeds should render. |
| **Diagnostics** | Inspect environment, permissions, service worker state, storage health, and capability detection. |
| **Device Linking** | Link browser tabs and devices via QR codes and `BroadcastChannel` heartbeats. |
| **Console** | Operate the full toolkit through a DSL-driven command console with structured responses. |
| **Versioning** | Auto-check for updates against GitHub-hosted `version.json` with in-app and system notification alerts. |
| **PWA** | Installable as a Progressive Web App with offline caching and standalone display. |

---

## How GNESTS Works

### Notification Flow

1. The user composes a notification payload (via UI form or console command).
2. Placeholder values are resolved through the placeholder engine.
3. The payload is passed to `notifyNow()`, which requests notification permission if not already granted.
4. The primary dispatch path sends the payload to the registered service worker via `postMessage`, which calls `self.registration.showNotification()`.
5. If no service worker is available, the fallback creates a `new Notification()` directly.
6. The service worker handles `notificationclick` (routing to a target URL) and `notificationclose` (dismiss telemetry relayed back to the page).

### Queue Flow

1. Queue items are stored in `localStorage` with status (`scheduled`, `draft`, `sent`, `failed`), timing (`sendAt`), repeat rules, and client targeting.
2. On boot and at polling intervals, `processQueueEligibility()` checks for items whose `sendAt` time has passed and dispatches them.
3. Optionally, the app can fetch `queue.json` from the hosting origin to import externally-defined queue items (useful for team workflows on GitHub Pages).

### Service Worker Lifecycle

1. On registration, the worker caches core static assets (`index.html`, `manifest.json`, `queue.json`).
2. Fetch events serve cached responses first, falling back to network with dynamic cache updates.
3. `message` events from the page trigger `showNotification()` with sanitized payloads.
4. `push` events (placeholder for future backend integration) also trigger `showNotification()`.
5. `notificationclick` events focus or open a window and navigate to the notification's target URL.
6. `notificationclose` events relay dismiss data back to open clients.

### Console Pipeline

1. **Parse**: Raw input is split on `;` into a command chain, then tokenized into command + args + key-value pairs.
2. **Normalize**: Each parsed command is mapped to a canonical action name (e.g., `title "hello"` → `draft.setTitle`) with structured arguments.
3. **Execute**: The action executor dispatches to the appropriate store module (draft, preset, embed, asset, repo, theme, domain, system, notify).
4. **Respond**: Every execution returns a structured response with `ok`, `status`, `action`, `requestId`, `traceId`, `message`, `data`, `warnings`, and `errors`.

### Version Check Flow

1. On boot, the app fetches `version.json` from the GitHub raw content URL.
2. It compares the remote version against the local `APP_VERSION` constant.
3. If an update is available, an in-app badge is shown and (if permissions allow) a system notification is dispatched with a click route to `?changelog=1`.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       index.html                            │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Composer  │  │  Queue   │  │Diagnostics│  │  Device   │  │
│  │   UI      │  │  Engine  │  │  Scanner  │  │  Linking  │  │
│  └────┬─────┘  └────┬─────┘  └───────────┘  └───────────┘  │
│       │              │                                       │
│  ┌────▼──────────────▼─────────────────────────────────┐    │
│  │              State Manager (localStorage)            │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│  ┌────────────────────▼────────────────────────────────┐    │
│  │           Professional Console Pipeline              │    │
│  │  parser → normalizer → executor → response           │    │
│  │       ▼          ▼          ▼                        │    │
│  │  command-    action-    action-    response-          │    │
│  │  parser.js  normalizer executor   schema.js          │    │
│  │              .js        .js                          │    │
│  └──────┬──────────┬──────────┬────────────────────────┘    │
│         │          │          │                              │
│  ┌──────▼──┐ ┌─────▼───┐ ┌───▼──────┐ ┌────────────────┐  │
│  │ draft-  │ │ preset- │ │ embed-   │ │ placeholder-   │  │
│  │ store   │ │ store   │ │ store    │ │ engine.js      │  │
│  └─────────┘ └─────────┘ └─────────┘ └────────────────┘  │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────┐   │
│  │ asset-   │ │ repo-preset- │ │ embed-exporter.js    │   │
│  │ store.js │ │ adapter.js   │ │ + dist/gnests-embed  │   │
│  └──────────┘ └──────────────┘ └──────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ postMessage
               ┌───────▼────────┐
               │     sw.js      │
               │  - caching     │
               │  - showNotif   │
               │  - click/close │
               │  - push (stub) │
               └────────────────┘
```

All state lives in `localStorage`. The service worker communicates with the page via `postMessage`. The console pipeline is modular: each `.js` file is an IIFE that attaches to `window.*` and is consumed by `console-language.js`, which is the bridge between the UI and the execution engine.

---

## Main Workflows

### Compose and Send

Open the composer, fill in notification fields, and click **Send instantly**. The app requests permission if needed, registers the service worker if not yet active, and dispatches the notification.

### Schedule

Set a delay (e.g., `5m`, `1h`) and the notification fires after the duration elapses. Scheduled items persist across page reloads.

### Queue Processing

Add items to the queue with a future `sendAt` timestamp. The queue engine checks eligibility on boot and at configurable polling intervals. Items can target all clients or a specific `clientId`.

### Preset Authoring

Use the console or UI to build a notification draft, assign placeholder variables, and save it as a named preset. Presets can be loaded, cloned, renamed, and deleted. The placeholder engine resolves `{{var}}` tokens at render time.

### Repo Catalog

The app ships with a `presets/` directory containing a JSON catalog (`index.json`) and individual preset files. The console command `repo presets` lists available entries; `import preset "name"` copies one into local storage.

### Embed Export

After composing or loading a preset, export it as an embeddable snippet. The exporter generates HTML, JS, JSON, or a full package (three files). The embed runtime script (`dist/gnests-embed.js`) reads `window.GNESTS_EMBEDS` and mounts notification cards into a target DOM element with optional domain allowlisting.

### Diagnostics

The diagnostics scanner inspects: environment (HTTPS, localhost), notification permission, service worker registration, API capability, storage read/write health, and connected devices. Each diagnostic includes a human-readable status and fix guidance.

### Device Linking

Devices on the same origin can discover each other via `localStorage` heartbeats and `BroadcastChannel`. A QR code is generated for linking. Connected devices appear in a discovery grid with online/offline pulse indicators.

---

## Operating Modes

GNESTS adapts its UI complexity through four modes:

| Mode | Purpose | UI Behavior |
|---|---|---|
| **Easy** | Guided, block-style actions for beginners | Large touch targets, simplified forms, guided blocks, explanatory text visible |
| **Medium** | Balanced default for general use | Standard layout with all core sections |
| **Hard** | Diagnostics-heavy visibility for debugging | Compact UI with full diagnostic access |
| **Professional** | Command-driven workflow for power users | Console-first, multi-panel workspace, help text hidden |

Modes are toggled from the header toolbar and persisted in `localStorage`. Each mode applies a CSS body class (`mode-easy`, `mode-medium`, etc.) that controls visibility and layout.

---

## Key Files and Module Map

### File Tree

```
gnests/
├── index.html                 # Main app: UI, state, runtime, all workflows
├── sw.js                      # Service worker: cache, notifications, click/close
├── manifest.json              # PWA manifest
├── version.json               # Release metadata for update checks
├── queue.json                 # Static queue source for sync/import
├── CHANGELOG.md               # Release history
├── README.md                  # This file
│
├── console-language.js        # Console bridge: parse → normalize → execute → respond
├── command-parser.js          # Tokenizer and chain parser for DSL input
├── command-registry.js        # Canonical command list and help text
├── action-normalizer.js       # Maps parsed commands to canonical action objects
├── action-executor.js         # Dispatches actions to store modules, returns responses
├── response-schema.js         # Structured response factory (success/warning/error)
│
├── draft-store.js             # Active draft + vars state (localStorage)
├── preset-store.js            # Local preset CRUD with recent/last tracking
├── repo-preset-adapter.js     # Fetches preset catalog from presets/ directory
├── asset-store.js             # Local asset library (data URL storage)
├── embed-store.js             # Local embed config CRUD
├── embed-exporter.js          # Generates HTML/JS/JSON/package from embed config
├── placeholder-engine.js      # Resolves {{var}} placeholders in notification fields
│
├── presets/
│   ├── index.json             # Catalog of available repo presets
│   ├── welcome-basic.json     # Welcome notification template
│   └── daily-digest.json      # Digest notification template
│
├── dist/
│   └── gnests-embed.js        # Embed runtime: mounts notification cards on external sites
│
├── examples/
│   ├── embed-basic.html       # Basic embed integration example
│   └── embed-inline-config.html  # Inline config embed example
│
├── assets/
│   └── icons/
│       ├── icon-192.svg       # PWA icon (192×192)
│       └── icon-512.svg       # PWA icon (512×512)
│
├── api-contract.md            # API modes, request/response shapes, error codes
├── command-reference.md       # Full DSL command listing
├── embed-schema.md            # Embed config shape and export formats
├── preset-schema.md           # Preset JSON schema and placeholder resolution
└── migration-notes.md         # Console architecture migration context
```

### Module Responsibilities

| Module | Role |
|---|---|
| `index.html` | Monolithic app shell: UI rendering, state management, notification dispatch, queue processing, scheduling, diagnostics, device linking, version checking, onboarding, and all event wiring. |
| `sw.js` | Service worker: static asset caching, `showNotification()` via message events, click routing with URL navigation, close telemetry relay, and a stub push handler. |
| `console-language.js` | Orchestrator for the professional console. Chains parser → normalizer → executor and collects results. |
| `command-parser.js` | Splits DSL input on `;`, tokenizes each segment, extracts positional args and key-value pairs, and parses duration literals. |
| `command-registry.js` | Declares the canonical list of supported commands and generates help output. |
| `action-normalizer.js` | Translates parsed command objects into normalized action objects with canonical action names (e.g., `draft.setTitle`, `preset.saveLocal`, `notify.send`). |
| `action-executor.js` | Routes normalized actions to the appropriate store module, executes the operation, and returns a structured response. |
| `response-schema.js` | Factory for structured API responses with `ok`, `status`, `requestId`, `traceId`, `message`, `data`, `warnings`, and `errors`. |
| `draft-store.js` | Manages the active notification draft and runtime variables in `localStorage`. Provides create, read, update, reset, and history tracking. |
| `preset-store.js` | CRUD for named notification presets in `localStorage`, plus recent-use tracking and last-saved pointers. |
| `repo-preset-adapter.js` | Fetches the preset catalog (`presets/index.json`) and individual preset JSON files from the hosting origin. |
| `embed-store.js` | CRUD for saved embed configurations in `localStorage`. |
| `embed-exporter.js` | Generates embed output in four formats: JSON config, JS init snippet, HTML snippet, and a package bundle containing all three. |
| `asset-store.js` | Local asset library: stores icons, badges, and images as data URLs in `localStorage`. |
| `placeholder-engine.js` | Resolves `{{var}}` placeholders in notification fields using a priority chain: explicit vars → draft meta → preset defaults → system values. |
| `dist/gnests-embed.js` | Lightweight runtime for external sites. Reads `window.GNESTS_EMBEDS`, checks domain allowlist, and mounts styled notification cards. |

---

## Data and Configuration Artifacts

### `version.json`

Published to the repository root. The app fetches this from GitHub raw content to check for updates.

```json
{
  "project": "GNESTS Notification Suite",
  "version": "0.8.0",
  "releaseDate": "2026-03-12",
  "changelogUrl": "https://github.com/Sotravil/gnests/blob/main/CHANGELOG.md",
  "categories": ["PWA Runtime", "Service Worker Notifications", ...],
  "highlights": ["..."],
  "repository": { "owner": "Sotravil", "repo": "gnests", "branch": "main" }
}
```

### `queue.json`

A static queue snapshot that the app can fetch and merge into local queue state. Useful for distributing notifications to users via GitHub Pages without a backend.

```json
{
  "version": "1.0",
  "items": [
    {
      "id": "public-001",
      "status": "scheduled",
      "title": "Queue demo: all clients",
      "body": "This came from queue.json and targets all clients.",
      "clientTarget": "all",
      "tag": "public-demo",
      "actions": [{ "action": "open", "title": "Open App" }]
    }
  ]
}
```

### `manifest.json`

Standard PWA manifest enabling installation and standalone display mode.

### `localStorage` Keys

| Key | Content |
|---|---|
| `gnests.presets.local` | Map of saved presets |
| `gnests.presets.lastSaved` | Name of last saved preset |
| `gnests.presets.recent` | Ordered list of recently used preset names |
| `gnests.console.activeDraft` | Current working draft |
| `gnests.console.activeVars` | Current runtime placeholder variables |
| `gnests.console.history` | Console command history |
| `gnests.embeds.local` | Map of saved embed configurations |
| `gnests.assets.local` | Map of stored assets (data URLs) |
| `notificationLabState` | Core app state (settings, queue, schedule, client identity, notification history) |

---

## Professional Console and Command Reference

The professional console accepts a semicolon-delimited DSL. Commands can be chained:

```
new; name "welcome"; title "Hello {{user}}"; body "Tap to continue"; tag welcome; save;
```

### Command Categories

**Draft Authoring**: `new`, `reset`, `name`, `label`, `title`, `body`, `tag`, `open`, `icon`, `badge`, `image`, `silent`, `sticky`, `show`, `preview`, `render`

**Variables**: `meta key="value"`, `vars user="Kevin" route="/home"`

**Local Presets**: `save`, `save as "name"`, `presets`, `load "name"`, `clone "name" as "new-name"`, `rename "old" "new"`, `delete "name"`, `recent`, `last`

**Repo Presets**: `repo presets`, `repo show "name"`, `import preset "name"`, `load repo "name"`, `use repo "name"`

**Assets**: `assets`, `asset show "id"`, `asset use icon "id"`, `asset use badge "id"`, `asset use image "id"`, `asset remove "id"`, `asset clear`

**Theme**: `color "#hex"`, `accent "#hex"`, `background "#hex"`, `text "#hex"`, `border "#hex"`, `radius 16`, `shadow "md"`, `theme show`, `theme reset`

**Domains**: `domain add "example.com"`, `domain remove "example.com"`, `domains`, `domain clear`

**Embed / Export**: `export embed`, `export html`, `export js`, `export json`, `export package`, `embed save`, `embed save as "name"`, `embed list`, `embed load "name"`, `embed delete "name"`

**Notify**: `send`, `send "Hello"`, `send "Hello" "World" tag=demo`, `notify title="Hello" body="World"`, `schedule "Title" "Body" in=5m`

**System**: `diag`, `perm`, `sw`, `mode professional`, `help`, `clear`

**Direct Action**: `action notify.send {"title":"Hello","body":"World"}`

Every command returns a structured response. See [api-contract.md](api-contract.md) for full request/response shapes and error codes.

---

## Presets

Presets are reusable notification templates stored as JSON. They support:

- All notification payload fields (title, body, icon, badge, image, tag, actions)
- Placeholder declarations with defaults and required flags
- Theme configuration for embed output
- Domain allowlisting
- Embed mount settings

### Placeholder Resolution Priority

1. Explicit `vars` command values
2. Draft `meta` values
3. Placeholder defaults defined in the preset
4. System values (`date`, `time`, `clientId`, `platform`, `domain`)
5. Unresolved placeholders remain as `{{var}}` and generate warnings (or errors in strict mode)

### Repo Catalog

The `presets/` directory contains an `index.json` listing available presets and individual `.json` files for each. The `repo-preset-adapter.js` module fetches these at runtime. Imported repo presets become local presets on save.

See [preset-schema.md](preset-schema.md) for the full preset JSON shape.

---

## Embeds and Export

GNESTS can export notification configurations as embeddable widgets for external websites.

### Export Formats

| Format | Output |
|---|---|
| **JSON** | Raw embed configuration object |
| **JS** | `window.GNESTS_EMBEDS.push(config)` init snippet |
| **HTML** | Mount div + script tag + JS init |
| **Package** | All three files: `embed-config.json`, `embed-init.js`, `embed-snippet.html` |

### Embed Runtime

The `dist/gnests-embed.js` script is the client-side runtime for external sites. It:

1. Reads `window.GNESTS_EMBEDS` on load.
2. For each config, checks the domain allowlist against the current hostname.
3. Mounts a styled notification card into the configured CSS selector.
4. Clicking the card navigates to the notification's target URL.

See [embed-schema.md](embed-schema.md) for the config shape and the `examples/` directory for integration examples.

---

## Schemas and Contracts

| Document | Content |
|---|---|
| [api-contract.md](api-contract.md) | Operating modes, DSL request shape, normalized action shape, response schema (success/warning/error), and error/warning code reference. |
| [command-reference.md](command-reference.md) | Full listing of supported DSL commands grouped by category. |
| [preset-schema.md](preset-schema.md) | Preset JSON structure, placeholder resolution priority, and origin semantics. |
| [embed-schema.md](embed-schema.md) | Embed config shape, export formats, runtime behavior, and security notes. |
| [migration-notes.md](migration-notes.md) | Context on the migration from the earlier helper-style console to the current parse → normalize → execute pipeline. |

---

## Installation and Local Usage

GNESTS is a static site. There is no build step and no package manager dependency.

### Option 1: Clone and Serve

```bash
git clone https://github.com/Sotravil/gnests.git
cd gnests
```

Serve with any static file server:

```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .

# PHP
php -S localhost:8000
```

Open `http://localhost:8000` in a browser.

### Option 2: Open Directly

For basic testing, open `index.html` directly in a browser. Service worker registration requires a server (localhost or HTTPS), so direct file access will disable SW-dependent features.

> **Note**: Notification permission and service worker APIs require a secure context (HTTPS or localhost).

---

## Configuration

GNESTS has no external configuration file. All settings are managed through the in-app settings panel and persisted in `localStorage`. Configurable options include:

- **Auto-register service worker** on boot
- **Polling enabled** and polling interval for queue processing
- **Sync mode** (local-only or GitHub-backed queue fetch)
- **Complexity mode** (easy / medium / hard / professional)
- **Onboarding** acceptance state

To reset all configuration and state, clear `localStorage` for the app's origin.

---

## Hosting and Deployment

### Requirements

1. **HTTPS** — Required for service worker registration and notification permissions. GitHub Pages, Netlify, Vercel, and Cloudflare Pages all provide this automatically.
2. **Same-origin service worker** — `sw.js` must be served from the same origin and scope as `index.html`.
3. **Static file access** — `version.json`, `queue.json`, `presets/*.json`, and `manifest.json` must be accessible at their relative paths.

### GitHub Pages

1. Push the repository to GitHub.
2. Enable GitHub Pages from **Settings → Pages** (source: main branch, root directory).
3. The app is live at `https://<username>.github.io/gnests/`.

### Other Static Hosts

Upload the repository contents to the web root. No build step is required. Ensure the server serves `.json` files with `application/json` content type and `.js` files with `application/javascript`.

---

## Quick Start

1. **Open the app** — Navigate to the hosted URL or serve locally.
2. **Complete onboarding** — Accept the initial consent prompt.
3. **Grant notification permission** — Click the permission button or run `perm` in the console.
4. **Register the service worker** — Click the SW button or run `sw` in the console.
5. **Send a test notification** — Fill in a title and body, then click **Send instantly**. Or in the console:
   ```
   send "Hello" "This is a test notification"
   ```
6. **Try a preset** — In professional mode:
   ```
   repo presets; import preset "welcome-basic"; load "welcome-basic"; vars user="Dev"; render; send;
   ```
7. **Run diagnostics** — Click the diagnostics button or run `diag` in the console.
8. **Export an embed** — After composing a notification:
   ```
   domain add "example.com"; export html;
   ```

---

## Versioning and Update Flow

GNESTS uses semantic versioning (`MAJOR.MINOR.PATCH`).

- **PATCH**: Bug fixes and non-breaking maintenance.
- **MINOR**: Backward-compatible features and runtime additions.
- **MAJOR**: Breaking changes to behavior, schemas, or data contracts.

### Release Workflow

1. Bump `APP_VERSION` in `index.html`.
2. Update `version.json` with new version, release date, highlights, and categories.
3. Add an entry in `CHANGELOG.md`.
4. Commit and push to GitHub.

### Runtime Update Check

On boot, the app fetches `version.json` from the GitHub raw content URL:

```
https://raw.githubusercontent.com/Sotravil/gnests/main/version.json
```

If the remote version is newer than the local `APP_VERSION`:

1. A header badge displays the latest version and release date.
2. An in-app toast notification appears.
3. If notification permission is granted, a system notification is also dispatched.
4. Clicking the update notification navigates to `?changelog=1`, which opens the in-app changelog section.

---

## Limitations and Known Caveats

- **No backend push.** The `push` event handler in `sw.js` is a placeholder. True push notifications require a push service and backend sender, which GNESTS does not provide.
- **localStorage limits.** All state (presets, embeds, assets, queue, drafts) is stored in `localStorage`, which is typically limited to 5–10 MB per origin. Large asset libraries (stored as data URLs) can exhaust this.
- **No cross-device sync.** Device linking via `BroadcastChannel` and `localStorage` only works across tabs on the same browser. There is no real network-based device sync.
- **Queue.json is pull-only.** The static queue file must be manually updated and pushed to the repository. There is no real-time queue injection.
- **Notification support varies.** Action buttons, badges, images, `requireInteraction`, and `silent` flags have inconsistent support across browsers and operating systems.
- **Single-file app.** The core UI lives in one large `index.html` file. This is intentional for static-first deployment simplicity but can make contributions harder to navigate.
- **No test suite.** There are currently no automated tests.

---

## Security and Privacy Notes

- **No data leaves the browser** unless the user explicitly triggers a fetch to GitHub for version checks or queue sync. All notification data, presets, embeds, and assets are stored locally.
- **Embed domain allowlists are advisory.** The `domains` field in embed configs is checked client-side by `gnests-embed.js`. This is a convenience check, not a security enforcement. Any site can load the embed runtime and ignore the allowlist.
- **Service worker scope.** The service worker is registered at `./` scope, meaning it intercepts all fetches within its origin path. Be aware of this if co-hosting other applications at the same origin.
- **No input sanitization for push payloads.** The `sw.js` `sanitizePayload()` function coerces fields to strings and limits actions to two entries, but does not perform HTML sanitization. Notification content is rendered by the browser's native notification UI, which does not execute HTML.
- **No authentication.** There is no login, session, or access control mechanism. The app is open to anyone who can reach the URL.

---

## Roadmap

The following are inferred directions based on existing code structure and stubs. They are not confirmed commitments.

- **Backend push integration** — The `push` event handler in `sw.js` is ready to receive payloads from a push service.
- **Relay mode** — The API contract references a "future relay mode" for optional backend-mediated notification delivery.
- **Repo preset publishing** — The adapter currently reads from a static catalog. Write/publish support is mentioned in the API contract as a potential trusted-operator feature.
- **Enhanced embed runtime** — The current embed runtime mounts a simple styled card. Richer widget types (toast, banner, modal) could expand this.

---

## Author

**Sotravil** — [github.com/Sotravil](https://github.com/Sotravil)

---

## License

No license file is currently included in the repository. If you intend to use, distribute, or contribute to GNESTS, contact the author for licensing terms.
