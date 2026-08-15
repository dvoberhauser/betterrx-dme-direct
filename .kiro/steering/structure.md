# Structure steering

- `index.html`: application shell and asset references
- `styles.css`: visual system, responsive behavior, and component presentation
- `app.js`: current seeded data, state, rules, rendering, and event handling
- `scripts/validate.mjs`: dependency-free pre-commit checks
- `docs/`: founder-facing business and methodology material
- `.kiro/steering/`: product, technical, and repository guidance for Kiro

When modularizing, create domain-oriented folders rather than generic `utils` collections. Keep tests adjacent to the rules they characterize. Preserve a simple static demo entry point until the replacement application reaches feature parity.
