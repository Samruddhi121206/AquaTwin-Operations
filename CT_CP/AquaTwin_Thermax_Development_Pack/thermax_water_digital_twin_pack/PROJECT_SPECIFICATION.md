# Product Specification & Implementation Plan

## 1. Product vision

Build an industrial operations ERP and digital-twin platform for a water-treatment facility. The first process scope is:

1. Raw-water source and storage tank.
2. Raw-water transfer pump and discharge header.
3. RO feed and pre-treatment section.
4. RO high-pressure pump and membrane train.
5. Permeate and reject streams.
6. Treated-water storage interface.

The platform should be usable by plant operators, shift supervisors, maintenance engineers, process engineers and administrators. It should combine a familiar ERP navigation model with an operator-focused HMI.

### Product name (working)
**AquaTwin Operations** — Water Treatment Plant Operations & Digital Twin Platform.

The name is provisional and must not imply Thermax endorsement or ownership.

### Product promise
“One place to see the plant, understand its condition, operate authorised workflows, investigate alarms, maintain equipment and improve water/energy performance.”

## 2. Evidence, assumptions and design status

### Publicly supported facts
- Thermax's E Series RO page describes a compact modular RO plant and lists feed pump, self-cleaning filter, cartridge filters, high-pressure pump, RO membranes and dosing system. It publishes capacity options and optional remote monitoring. See `https://www.thermaxglobal.com/industrial-products/water-and-waste-solutions/water-treatment-solutions/e-series-ro`.
- Thermax's containerised plant page describes plug-and-play integration with level-control systems and a PLC-mounted panel for automatic operation. See `https://www.thermaxglobal.com/industrial-products/water-and-waste-solutions/water-treatment-solutions/containerised-plants`.
- MongoDB documents a Next.js integration and recommends keeping the connection string server-side. MongoDB time-series collections are intended for time-stamped measurements with metadata.

### Not yet confirmed for a specific Thermax installation
- Raw-water tank count, dimensions, capacity and material.
- Source, inlet/outlet piping, pump count and duty/standby arrangement.
- Pump curves, motor ratings, valve types and line sizes.
- Actual instrument tags, ranges, accuracy and alarm limits.
- RO model, membrane staging, exact pretreatment order, dosing points, CIP arrangement and reject handling.
- PLC make/model, I/O list, HMI/SCADA architecture, network segmentation and protocols.
- Operating sequence, trip setpoints, permissives and plant-specific safety requirements.

### Model status labels
Every design element in the software must be marked as one of:
- **Verified** — supported by an approved plant document or written engineering confirmation.
- **Configured** — entered by an authorised engineer and approved for a plant.
- **Assumed/demo** — illustrative only; never used to command real equipment.
- **Unavailable** — not provided by the data source.

The sample configuration in this pack is a demonstration only.

## 3. Product users and permissions

| Role | Main tasks | Permissions |
|---|---|---|
| Platform administrator | Create organisation, users, tenants, global settings | Platform-level administration |
| Plant administrator | Configure a plant, assets, tags, shifts and access | Plant configuration; no bypass of safety interlocks |
| Shift supervisor | Monitor plant, review alarms, assign work | Supervisory actions and reports |
| Operator | Monitor HMI, request permitted start/stop, acknowledge alarms | Limited operational controls |
| Process engineer | Configure model parameters, review trends, tune simulation | Engineering configuration; approval workflow |
| Maintenance technician | View equipment, receive work orders, record maintenance | Maintenance workflow |
| Viewer/auditor | Read dashboards and reports | Read-only |
| Integrator | Manage gateway connectivity and tag mapping | Connectivity configuration; no implicit process-control permission |

**RBAC rule:** Permissions are checked server-side for every API request. Hiding a button in the UI is not authorisation.

## 4. ERP information architecture

Primary navigation should be stable and understandable:

1. **Home / Overview**
2. **Plants**
3. **Live Operations**
4. **Digital Twin**
5. **Equipment**
6. **Alarms & Events**
7. **Maintenance**
8. **Water Quality**
9. **Energy & Performance**
10. **Reports**
11. **Users & Roles**
12. **Configuration**
13. **Audit Log**

The application should remember the user's last selected plant, but show a clear plant selector at all times.

### Main dashboard layout
- Header: organisation, plant selector, mode badge (SIMULATION / READ-ONLY / SUPERVISORY), connection state, notifications, user profile.
- Left navigation: compact labels and icons.
- Main content: KPI cards, process status, alarms requiring attention, trend preview and shift summary.
- Right-side quick panel: active alarms and pending approvals.
- Avoid dense engineering jargon on the landing page. Detailed engineering values belong in the process and equipment screens.

### Operator language
Prefer:
- “Tank level” instead of “LT-101 PV” as the main label.
- “Transfer pump” with tag P-101 shown as secondary metadata.
- “Feed pressure” with instrument tag beneath it.
- “Acknowledge alarm” rather than “clear fault” unless the fault has actually cleared.
- “Command pending” / “Command accepted” / “Command rejected” with clear reason.

## 5. Core screens and acceptance criteria

### 5.1 Login and plant selection
- Secure login; session timeout; password reset or enterprise identity provider.
- User sees only assigned organisation/plant.
- Plant selector shows plant name, location, operational status and current mode.
- Acceptance: a user cannot access another tenant's plant by changing an ID in the URL.

### 5.2 Operations overview
Show:
- Tank level (%, m³ and trend).
- Inlet and transfer flow (m³/h).
- Pump running/fault state.
- RO feed, permeate and reject flow.
- RO feed and concentrate pressure where available.
- Permeate conductivity/TDS if instrumented.
- Active alarms, communication quality and last update time.
- Current simulation/physical mode.

Acceptance:
- Each live value shows unit, timestamp and quality.
- Stale, bad-quality or disconnected values are visibly different from valid readings.
- Dashboard never silently displays stale values as current.

### 5.3 Digital process screen
- Interactive process diagram with tank, pumps, valves, filters, RO skid, permeate tank and reject line.
- Equipment status and instrument values appear beside the symbol.
- Selecting an asset opens its detail drawer: description, tag, status, readings, alarms, maintenance history and datasheet.
- Flow paths visually distinguish normal flow, stopped flow and unknown state.
- 2D process diagram is the first release. 3D is optional and must not delay core functionality.

Acceptance:
- Diagram is generated from plant configuration, not hard-coded to one assumed plant.
- Every symbol maps to an asset/tag ID.
- Unknown telemetry is not drawn as normal operation.

### 5.4 HMI control panel
- Display mode, permissives, interlocks and equipment readiness.
- Operator requests Start/Stop only where enabled by approved control philosophy.
- Require confirmation for consequential commands.
- Show command lifecycle: requested → validated → queued → acknowledged/rejected → completed/failed.
- Record user, time, plant, asset, old/new state, reason and source.
- No “force output”, safety bypass or unrestricted manual override in the initial product.

Acceptance:
- Commands are disabled in demo configuration unless explicitly enabled.
- In virtual mode, commands act only on the virtual PLC.
- In physical read-only mode, no command endpoint can write to the PLC.
- Physical command support is a separately approved later phase.

### 5.5 Tank and transfer equipment
Tank details:
- Level, volume, capacity, low/low-low/high/high-high states.
- Inlet/outlet flow, estimated residence time (if inputs support it).
- Level trend, alarms and operating events.

Pump details:
- Run/stop/trip state.
- Start count, run hours, flow, discharge pressure, motor current/power if instrumented.
- Duty/standby role if confirmed.
- Maintenance due state and recent events.

### 5.6 RO operations
Display:
- Feed flow, permeate flow, reject/concentrate flow.
- Feed pressure, interstage pressure and concentrate pressure where instrumented.
- Permeate conductivity/TDS.
- Recovery, rejection estimate and specific energy if power data exists.
- Filter differential pressure and CIP history if sensors/data exist.

Do not infer membrane health from a single reading. Use trends, feed-water conditions and vendor-defined normalisation rules.

### 5.7 Alarm and event management
- Alarm list with severity, status, first occurrence, last occurrence, asset, tag and description.
- Filters: active/acknowledged/cleared, severity, asset, time range.
- Acknowledge requires logged-in authorised user.
- Acknowledgement does not clear the underlying condition.
- Event history is immutable; corrections are appended as new audit events.

### 5.8 Maintenance
- Asset register.
- Preventive maintenance schedules.
- Work orders: open, assigned, in progress, waiting parts, completed, verified.
- Checklists and maintenance notes.
- Attachments: manuals, inspection reports, photos and approved datasheets.
- Maintenance actions must not automatically override PLC control logic.

### 5.9 Reports
- Shift report.
- Daily water balance.
- Pump run-hour and energy report.
- RO performance report.
- Alarm summary.
- Maintenance history.
- Export CSV/PDF.
- Report must disclose missing data and sample/estimated values.

## 6. Process scope and reference sequence

### 6.1 Raw-water section (reference model)
Raw water source → inlet isolation/control element → raw-water storage tank → suction strainer (if installed) → transfer pump → discharge header → RO feed/pre-treatment interface.

The exact location of the feed pump and transfer pump must be determined from the selected plant's approved P&ID. They may be distinct equipment or one pump may serve a different duty.

### 6.2 RO section (reference model)
Raw-water/feed tank → feed pump → self-cleaning filter → cartridge filter → chemical dosing (exact point to be confirmed) → high-pressure pump → RO membrane train → permeate and reject streams → permeate storage / reject handling.

This is a simplified product-level sequence based on publicly listed E Series RO components, not a construction drawing. Confirm exact order and all ancillary equipment from the specific model's P&ID.

## 7. Methodology

### Phase 0 — Discovery and engineering evidence
Deliverables:
- Approved P&IDs and process flow diagram.
- Equipment datasheets.
- Instrument index and I/O list.
- Control philosophy / cause-and-effect matrix.
- Alarm and trip schedule.
- PLC/network details.
- Plant operating data with permission and anonymisation as needed.
- Document register with revision and approval state.

Exit gate: process engineer signs off the reference model boundary and all parameters required for simulation.

### Phase 1 — Product UX and ERP foundation
- Define user roles and permission matrix.
- Create design system and responsive navigation.
- Implement authentication, organisation/plant hierarchy and audit log.
- Add asset register, tag dictionary and document register.
- Create seeded demo tenant/plant.

Exit gate: user can log in, select plant, see role-appropriate navigation and manage assets.

### Phase 2 — Virtual raw-water process
- Implement tank level/volume model.
- Implement inlet and outlet flow model.
- Implement pump state machine and fault simulation.
- Implement alarm rules.
- Build 2D process diagram and live dashboard.
- Add configurable setpoints, with demo/verified status labels.

Exit gate: simulation is repeatable, mathematically consistent and all displayed values trace to model variables.

### Phase 3 — Virtual PLC and control theory
- Implement PLC scan-cycle abstraction.
- Implement permissive/interlock evaluation from approved logic.
- Implement PID controller for a defined control objective.
- Implement manual/auto mode in simulation only.
- Add trend, step response and disturbance tests.
- Add controller tuning and parameter versioning.

Exit gate: stable simulation and documented test results. Do not claim physical safety validation.

### Phase 4 — RO process model
- Add feed, permeate and reject mass balance.
- Add recovery and salt rejection metrics.
- Add pressure/flow/quality indicators.
- Add configurable membrane-stage representation.
- Add alarm rules only after model and vendor limits are approved.

Exit gate: mass balance closes within defined numerical tolerance; all assumptions are documented.

### Phase 5 — ERP workflows and analytics
- Alarm acknowledgement and escalation.
- Maintenance work orders.
- Shift handover.
- Reports and export.
- Audit history and configuration approvals.

Exit gate: end-to-end operator workflow works with test users and role restrictions.

### Phase 6 — Validation and industrial-readiness review
- Compare simulated responses with hand calculations and approved plant data.
- Test sensor faults, communication loss, pump trips and stale data.
- Conduct cybersecurity review and role/tenant isolation tests.
- Obtain engineering approval for each plant configuration.
- Keep real PLC mode read-only until separate controls/safety approval.

Exit gate: signed validation report, deployment runbook and explicit list of limitations.

### Phase 7 — Gateway and PLC integration (later)
- Build a separate edge gateway service on the plant network.
- Map PLC tags to canonical tag IDs.
- Start with read-only telemetry.
- Add heartbeat, buffering, time synchronisation and quality flags.
- Introduce command support only through a documented change-control and safety review.

## 8. Suggested delivery schedule

This is an estimate for a small capable team; actual duration depends on team size and access to plant documents.

| Sprint | Focus | Deliverable |
|---|---|---|
| 0 | Process discovery | Approved model inputs / assumptions register |
| 1 | UX and ERP shell | Login, navigation, plant context, role model |
| 2 | MongoDB and asset model | Plants, assets, tags, users, audit |
| 3 | Tank simulation | Level, flow, tank diagram and trends |
| 4 | Virtual PLC/HMI | Pump state, modes, permissives, alarms |
| 5 | Control theory | PID, response plots, disturbance tests |
| 6 | RO model | Flow balance, recovery, quality metrics |
| 7 | Maintenance and reports | Work orders, shift report, exports |
| 8 | Validation and hardening | Test evidence, security review, release candidate |

## 9. Product acceptance criteria

The MVP is complete when:
- A user can sign in and access only assigned plants.
- A plant can be configured without changing source code.
- Every asset and sensor has a stable tag/asset identity.
- Tank level follows the conservation-of-volume model.
- Pump and valve state changes are deterministic and audited.
- The HMI distinguishes command request, acknowledgement and process feedback.
- Alarm acknowledgement is separate from alarm clearing.
- RO feed/permeate/reject mass balance is visible.
- Historical trends and reports work.
- Demo assumptions are clearly labelled.
- No browser code can directly connect to MongoDB or a PLC.
- Virtual and physical modes cannot conflict.
- Physical outputs remain disabled until approved integration and safety gates are complete.

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| No site-specific P&ID | Keep reference model configurable; do not claim exact replication |
| Incorrect assumed parameters | Store source, revision, approver and status for every parameter |
| Misleading simulated data | Persistent SIMULATION badge and watermark |
| Unsafe remote commands | Read-only first; PLC retains safety logic; gateway isolation |
| Poor network connectivity | Edge buffering, stale-data flags, reconnect strategy |
| Sensor failure | Quality flags, range checks, bad/stale state |
| Model mismatch | Calibrate with approved data and document error |
| Scope expansion | Keep 2D process and core workflows ahead of 3D/predictive AI |
| MongoDB telemetry growth | Time-series collection, retention policy, indexes and archival plan |

## 11. Business value measurement

Do not promise savings without a measured baseline. Capture before/after KPIs:
- kWh per m³ pumped and per m³ permeate.
- Pump run hours, starts and trips.
- Tank overflow/low-level events.
- RO recovery = permeate flow / feed flow.
- RO specific energy = electrical energy / permeate volume.
- Cleaning frequency and CIP duration.
- Alarm detection and acknowledgement time.
- Operator time spent on routine reporting.
- Unplanned downtime hours.
- Work-order completion and repeat-failure rate.

A pilot evaluation should use a defined baseline period, agreed operating conditions, a measurement window, and an engineering-approved comparison method. Any improvement target is a hypothesis until measured.

## 12. Immediate next actions

1. Send the technical document request to the relevant Thermax engineering contact.
2. Ask for the specific E Series RO model or site-specific RO configuration.
3. Request raw-water and RO P&IDs under appropriate confidentiality terms.
4. Create a document register and parameter approval workflow.
5. Start UI development using a demo plant configuration, clearly marked illustrative.
6. Do not enable real PLC writes during the initial software build.
