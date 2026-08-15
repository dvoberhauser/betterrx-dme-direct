# Prototype validation

- HTML entry point contains the application mount, stylesheet, JavaScript bundle, viewport settings, and live status region.
- JavaScript passes the Node.js syntax checker.
- Required provider-role and workflow markers are present.
- Recommendation-to-workflow markers are present for saved bundles, handoffs, notification preferences, cost-policy configuration, modification, cancellation, pickup, and scoped override decisions.
- Duplicate flags block progression until an audited disposition is recorded; exception and replacement paths feed approval and return coordination respectively.
- High-risk vendor selection automatically opens the contact card; four confirmations and verification notes are required before the order can advance.
- The pending duplicate disposition and notes persist through form re-renders, preventing the selector-reset loop.
- Vendor verification displays phone, email, ordered items, and rental length; all four conditions require Yes/No plus mandatory comments, and any No blocks advancement.
- Severe-weather or disaster events deterministically require vendor confirmation for delivery windows under eight hours, independent of the historical risk score.
- Existing and past order cards retain the compact layout; Search, Vendor, Ordered by, and Delivery status filter controls have persistent visible labels across desktop and mobile layouts.
- The prototype has no external runtime dependencies and can run directly from `index.html`.
- All data is synthetic and any changed demo state is stored only in browser-local storage.

Validated: August 15, 2026
