# Kiro development handoff

## Product intent

DME Direct gives post-acute providers a simple control surface for DME ordering and fulfillment visibility. The interface should remain operationally calm: progressive disclosure, plain language, persistent navigation, and visible exceptions without dashboard clutter.

## Current implementation

The prototype is a dependency-free single-page application. `app.js` contains seeded data, role permissions, workflow rules, rendering, and browser-local persistence. `styles.css` contains the responsive design system. `index.html` is the entry point.

Implemented behavior includes:

- Role-specific provider experience for Admission Nurse, Charge Nurse, Director of Nursing, and Executive
- Provider navigation for Home, New Order, Existing Orders, Past Orders, Vendor Management, Reports, and Messages
- EHR pull simulation, standing-order verification, configurable preauthorization, cost controls, approval/override routing, and CMS benchmarks
- Deterministic vendor ranking with visible fulfillment risk and operating-hours inputs
- Severe-weather/disaster confirmation for every under-eight-hour order regardless of risk score
- Managed duplicate dispositions, notes, escalation, replacement/exchange, and clinical-necessity paths
- Search/filter, high-risk highlighting, dispatch and pickup ETA, proof of delivery, condition attestation, acknowledgement, and Executive-only archive
- Vendor contacts, editable catalog items, quality events, approval inbox, modification/cancellation, pickup management, notifications, and global search
- Scoped vendor sign-in and tokenized vendor enrollment
- DON/Executive PSF recovery, vendor benchmark, revenue, DME cost, and contribution-margin dashboards

## Recommended production architecture

Preserve the current prototype as an executable product specification while migrating in bounded slices:

1. Introduce a component-based front end with typed domain models and route-level role guards.
2. Move seeded records and workflow transitions behind a versioned API.
3. Add organization-scoped authentication, least-privilege authorization, immutable audit events, and encrypted storage.
4. Implement EHR/FHIR, vendor, messaging, notification, weather-event, and benchmark adapters behind explicit interfaces.
5. Add server-side policy evaluation for duplicates, preauthorization, cost thresholds, severe-weather confirmation, ranking, and archive eligibility.
6. Add automated unit, contract, accessibility, security, and end-to-end tests before any live-data pilot.

## Suggested domain boundaries

- Identity and organization access
- Patient/order intake
- Policy and approval orchestration
- Vendor network and catalog
- Ranking and fulfillment risk
- Delivery, pickup, proof, and acknowledgement
- Messaging and notifications
- Quality events and PSF recovery
- Financial and contribution-margin reporting
- Audit, retention, and export

## Non-negotiable rules to preserve

- Any active severe-weather or disaster event requires vendor confirmation for delivery windows under eight hours, for every risk score.
- A duplicate flag blocks submission until a disposition and required notes are recorded.
- Admission Nurse exceptions route to Charge Nurse approval.
- High-risk vendor verification requires explicit Yes/No responses and a comment for every condition.
- Dispatched delivery items and scheduled pickups must display an ETA.
- Archive access is Executive-only.
- Vendor ranking is deterministic and explainable to authorized provider users, while hidden quality-rule effects remain protected from vendors.
- Contribution Margin equals recognized revenue minus direct DME cost; prototype figures must remain labeled illustrative until connected to governed source data.

## First Kiro task

Create characterization tests around the existing pure workflow rules before reorganizing `app.js`. This prevents a framework migration from changing business behavior silently.
