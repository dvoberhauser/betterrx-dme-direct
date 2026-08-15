# BetterRX + DME+ — DME Direct

DME Direct is a mobile-first, provider-led prototype for ordering, tracking, recovering, and reporting on durable medical equipment. It preserves a deliberately simple interface and persistent left-side action rail while demonstrating complete provider and scoped vendor workflows.

## Start the prototype

You can open `index.html` directly in a modern browser. For local development in Kiro:

```text
npm run dev
```

Then open `http://localhost:4173`.

No build step, database, API keys, or external services are required. Demo state is synthetic and stored in the browser only. Use **Reset demo** in the profile menu to restore the seeded state.

## Validate before committing

```text
npm run validate
```

The validation checks JavaScript syntax, referenced files, expected role/workflow markers, and the synthetic-data safety notice.

## Included

- Complete static application source: `index.html`, `styles.css`, and `app.js`
- Current validation notes
- Founder-facing business case and methodology document in `docs/`
- Kiro steering files in `.kiro/steering/`
- Development handoff and recommended architecture path in `KIRO_HANDOFF.md`

## Demo roles

- Admission Nurse
- Charge Nurse
- Director of Nursing
- Executive
- Scoped vendor preview and vendor-network enrollment

## Important prototype boundary

This package is a front-end demonstration. It does not contain production authentication, PHI, a database, EHR integration, vendor APIs, payment processing, or production-grade audit storage. All patients, orders, pricing, vendor performance, revenue, contribution margin, and service-failure figures are synthetic.
