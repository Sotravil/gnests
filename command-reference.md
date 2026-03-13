# GNESTS Command Reference

## Draft / Authoring
- `new` / `reset`
- `name "johnson"`
- `label "Johnson Welcome"`
- `title "hello"`
- `body "welcome {{user}}"`
- `tag demo`
- `open "/status"`
- `icon "..."`, `badge "..."`, `image "..."`
- `show`, `preview`, `render`

## Meta / Vars
- `meta user="johnson" campaign="launch"`
- `vars user="Kevin" route="/status"`

## Local Presets
- `save`
- `save as "johnson"`
- `presets`
- `load "johnson"`
- `clone "johnson" as "johnson-v2"`
- `rename "johnson" "johnson-v2"`
- `delete "johnson"`
- `recent`
- `last`

## Repo Presets
- `repo presets`
- `repo show "welcome-basic"`
- `import preset "welcome-basic"`
- `load repo "welcome-basic"`
- `use repo "welcome-basic"`

## Assets
- `assets`
- `asset show "logo-main"`
- `asset use icon "logo-main"`
- `asset use badge "badge-main"`
- `asset use image "hero-1"`
- `asset remove "logo-main"`
- `asset clear`

## Theme
- `color "#0ea5e9"`
- `accent "#22c55e"`
- `background "#0f172a"`
- `text "#ffffff"`
- `border "#1f2937"`
- `radius 16`
- `shadow "md"`
- `theme show`
- `theme reset`

## Domains
- `domain add "example.com"`
- `domain remove "www.example.com"`
- `domains`
- `domain clear`

## Embed / Export
- `export embed`
- `export html`
- `export js`
- `export json`
- `export package`
- `embed save`
- `embed save as "johnson-embed"`
- `embed list`
- `embed load "johnson-embed"`
- `embed delete "johnson-embed"`
- `embed regenerate "johnson-embed"`

## Notify / Schedule
- `send`
- `send "Hello"`
- `send "Hello" "World" tag=demo`
- `notify title="Hello" body="World" open=/status`
- `attempt p "hola"`
- `schedule "Reminder" "Open app" in=5m`

## System
- `diag`
- `perm`
- `sw`
- `mode professional`
- `help`
- `clear`
- `action notify.send {"title":"Hello","body":"World"}`
