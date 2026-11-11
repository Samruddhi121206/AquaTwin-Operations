# Thermax-Aligned Water Treatment Digital Twin — Development Pack

**Version:** 1.0  
**Prepared:** 11 November 2026  
**Project status:** Development specification / reference architecture  
**Primary scope:** Raw Water Storage & Transfer, with an integrated RO treatment module  
**Database:** MongoDB

> **Engineering-status disclaimer:** This pack defines a software product and an engineering reference model. It is not an approved Thermax design, site-specific P&ID, control narrative, or safety instrumented system. Thermax public material confirms its E Series RO product components and containerised plant automation features, but does not establish the exact raw-water tank/pump arrangement for a particular customer site. Replace all illustrative values and sequences with approved plant documents before claiming an authenticated plant digital twin or connecting to physical equipment.

## Pack contents

| File | Purpose |
|---|---|
| `PROJECT_SPECIFICATION.md` | Main product, scope, user journeys, implementation plan, methodology, acceptance criteria |
| `SYSTEM_ARCHITECTURE.md` | ERP-style architecture, deployment, data flow, security and PLC integration boundary |
| `MATHEMATICAL_MODEL.md` | Tank, pump, PID and RO equations; assumptions and calibration |
| `MONGODB_DESIGN.md` | MongoDB collections, indexes, sample documents, retention and tenancy |
| `API_CONTRACT.md` | REST/WebSocket API contracts and command lifecycle |
| `TEST_AND_VALIDATION.md` | Test strategy, model validation, industrial acceptance checklist |
| `prompts/LOVABLE_BASE_PROMPT.md` | Copy-ready Lovable prompt for the initial UI/base design |
| `schemas/openapi.yaml` | Starter OpenAPI 3.1 API specification |
| `schemas/sample-plant-config.json` | Clearly illustrative sample plant configuration |
| `diagrams/*.mmd` | Editable Mermaid architecture/process/user-flow diagrams |

## Recommended build order

1. Approve product scope and worker roles.
2. Obtain the selected plant's approved P&IDs, datasheets, instrument list, control narrative and operating limits.
3. Freeze the engineering tag dictionary and units.
4. Build ERP shell, authentication, tenant/plant structure and audit trail.
5. Build virtual tank and transfer process model.
6. Add virtual PLC state machine, alarms and HMI controls.
7. Add RO process model and performance metrics.
8. Add trends, reports, maintenance and role-based workflows.
9. Validate simulation against engineering calculations and authorised operating data.
10. Develop a separate, secured industrial gateway for read-only PLC monitoring first; add approved commands only after formal safety and cybersecurity review.

## Technology decision

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui.
- Visual process: React Flow for P&ID-like interactive 2D process; optional Three.js/React Three Fiber for a later 3D view.
- Backend: Next.js server routes for ERP/business CRUD; Python FastAPI service for numerical simulation and control calculations.
- Database: MongoDB Atlas or managed MongoDB; Mongoose or official Node.js driver.
- Live updates: WebSocket or Server-Sent Events from backend/gateway.
- Charts: Recharts or ECharts.
- Deployment: Docker; separate web, simulation and gateway services.
- Future industrial protocols: OPC UA / Modbus TCP adapters selected to match the actual PLC and approved network design.

## Important design decisions

- MongoDB stores users, plants, assets, configuration, alarms, work orders, audit events and time-series measurements.
- Use a MongoDB **time-series collection** for high-frequency sensor telemetry where supported; keep transactional records in ordinary collections.
- The browser never connects directly to MongoDB or directly to a PLC.
- A user command is a request, not a direct write to an output. It passes authentication, authorisation, validation, interlock checks, command acknowledgement and audit logging.
- In physical mode, the PLC retains control of safety-critical interlocks and final equipment actuation. The web platform is supervisory; it must not replace hardwired emergency stops or certified protection.
- Virtual mode and physical mode are mutually exclusive for a given plant control context.
- Every numeric value must carry a unit, timestamp, source, quality/status and configuration version.
