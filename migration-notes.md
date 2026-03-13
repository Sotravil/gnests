# Migration Notes

## Previous Professional Console
- Helper-style direct execution
- Limited command handling
- No full preset CRUD lifecycle
- No normalized action bus
- No dedicated embed config lifecycle

## New Professional Console
- Parse -> normalize -> validate -> execute -> respond pipeline
- Stateful active draft + vars
- Local preset CRUD with recent/last pointers
- Repo preset catalog read/import flow
- Asset library support
- Theme + domain controls
- Embed export lab with local embed config store
- Structured success/warning/error responses

## Compatibility Notes
- Existing quick notification flows remain available in non-professional sections.
- Professional mode adds richer operations without requiring backend.
- Static-first behavior is preserved.
