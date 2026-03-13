# GNESTS (Guided Notification Execution and Sync Toolkit)

GNESTS is a static-first notification orchestration lab that combines guided UI workflows, diagnostics, queue processing, and a professional command surface.

Repository:
- https://github.com/Sotravil/gnests
- https://github.com/Sotravil/gnests/tree/main

Current release:
- Version: `0.8.0`
- Launch date: `2026-03-12`
- Source of truth: `version.json` in the GitHub repository

## Project Categories

1. PWA runtime
2. Service worker notifications
3. Queue orchestration
4. Remote/linking workflows
5. Diagnostics and recovery
6. Professional console and command execution
7. Embed export and integration

## What This Project Does

1. Runs browser notification experiments in static hosting.
2. Schedules and queues notifications with local-first persistence.
3. Supports optional GitHub-backed queue sync for team workflows.
4. Provides diagnostics with explicit fix guidance.
5. Enables command-based operation through the professional console.

## Key Files

- `index.html`: main UI, runtime state manager, version checks, changelog route.
- `sw.js`: worker lifecycle, click/close telemetry relay, push placeholder.
- `queue.json`: queue source used for static pull workflows.
- `version.json`: release metadata consumed by version-check runtime.
- `CHANGELOG.md`: release history and categorized changes.
- `manifest.json`: PWA identity and install metadata.

## Versioning Policy

This project uses semantic versioning (`MAJOR.MINOR.PATCH`).

1. `PATCH`: bug fixes and non-breaking maintenance.
2. `MINOR`: backward-compatible features and UX/runtime expansions.
3. `MAJOR`: breaking behavior, schema, or API changes.

Release metadata is published in `version.json` and mirrored in `CHANGELOG.md`.

## Changelog Workflow

For every release:

1. Bump app version in `index.html` (`APP_VERSION`).
2. Update `version.json`:
   - `version`
   - `releaseDate`
   - `highlights`
   - `categories`
   - `changelogUrl`
3. Add release entry in `CHANGELOG.md`.
4. Commit and push to GitHub.

At runtime, the app fetches GitHub-hosted `version.json` (with local fallback) and compares remote vs local version.

## Auto Update Notification Behavior

When a newer version exists:

1. A clickable in-app update notification appears with version and launch date.
2. If browser notifications are granted, a system notification is also shown.
3. Clicking the update notification routes to the changelog section in `index.html` using `?changelog=1`.

## Operating Modes

1. Easy: guided block workflow.
2. Medium: balanced default operations.
3. Hard: diagnostics-heavy visibility.
4. Professional: compact command-driven workflow.

## Hosting and Deployment

1. Deploy with HTTPS (GitHub Pages supported).
2. Keep service worker registration same-origin (`./sw.js`).
3. Ensure `version.json`, `CHANGELOG.md`, and assets are published.
4. Validate:
   - notification permission
   - service worker registration
   - latest version check from GitHub raw source

## Quick Start

1. Open the app and complete onboarding.
2. Grant notification permission.
3. Register service worker.
4. Send test notification or schedule/queue one.
5. Open diagnostics if anything fails.
6. Use professional console for advanced scripted operations.
