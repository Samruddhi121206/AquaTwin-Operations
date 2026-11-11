# Lovable Prompt — AquaTwin Operations ERP + Digital Twin

Copy the prompt below into Lovable to generate the first UI/base application. Use a clean, light industrial SaaS design. Prioritise a functional ERP shell and operator usability, not a flashy marketing website.

---

Build a responsive enterprise web application named **AquaTwin Operations**. It is an industrial water-treatment plant operations ERP and digital-twin dashboard for plant operators, shift supervisors, process engineers, maintenance technicians and administrators.

## Product context

The first demo plant has two process areas:
1. Raw Water Storage & Transfer.
2. Reverse Osmosis (RO) treatment.

Important: this is a configurable reference/demo plant, not an authenticated replica of a specific Thermax installation. Show a persistent `SIMULATION` label throughout the application. Use illustrative demo values only and label them as simulated. Do not claim that any data or design is approved by Thermax.

## Design direction

- Light theme, white and very light grey surfaces.
- Professional industrial SaaS design; calm, high-contrast, clean and practical.
- Use navy/slate text, restrained blue primary actions, green for healthy, amber for warning, red for critical, grey for unknown/offline.
- Use clear typography, consistent spacing, compact data cards and readable tables.
- Avoid gradients, glassmorphism, oversized hero sections and excessive rounded cards.
- Desktop-first but responsive for tablets.
- Sidebar navigation with icons and labels; collapsible.
- Top bar with organisation, plant selector, mode badge, connection status, notifications and user menu.
- Use realistic charts and process symbols; no decorative factory stock imagery.
- Accessibility: keyboard navigation, visible focus, colour plus text/icon status, adequate contrast.

## Main application shell

Create these routes/pages:
- `/login`
- `/dashboard`
- `/operations`
- `/digital-twin`
- `/equipment`
- `/alarms`
- `/maintenance`
- `/water-quality`
- `/performance`
- `/reports`
- `/settings/users`
- `/settings/plant`
- `/audit-log`

Sidebar:
- Overview
- Live Operations
- Digital Twin
- Equipment
- Alarms & Events
- Maintenance
- Water Quality
- Energy & Performance
- Reports
- Administration

## Dashboard / Overview

Header:
- Page title `Plant Overview`
- Plant selector `Demo Water Treatment Plant`
- Badge `SIMULATION`
- Connection indicator `Simulation service connected`
- Current shift and user profile.

KPI cards:
- Raw Water Tank Level: 62.4%
- Tank Volume: 39.2 m³ (illustrative)
- Transfer Pump P-101: Running
- Transfer Flow: 6.0 m³/h
- RO Feed Flow: 5.0 m³/h
- RO Permeate Flow: 3.5 m³/h
- RO Recovery: 70%
- Permeate Conductivity: 85 µS/cm (simulated)

Below cards:
- Large tank level trend chart (last 60 minutes).
- Process health panel showing Raw Water, Transfer, RO Feed, RO Membrane, Permeate.
- Active alarms list with severity, time, asset and acknowledge action.
- Recent events timeline.
- Shift summary with operating hours and water processed.

Every value must show unit, timestamp and `SIMULATED` quality in the demo.

## Live Operations page

Create a process-focused layout:
- Left: interactive process diagram.
- Right: selected equipment details and readings.
- Bottom: live trend charts.

Process diagram sequence:
Raw Water Source → Inlet Valve XV-101 → Raw Water Tank TK-101 → Suction Strainer STR-101 → Transfer Pump P-101 → RO Feed Header → Feed Pump P-201 → Self-Cleaning Filter F-201 → Cartridge Filter F-202 → Chemical Dosing CD-201 → High Pressure Pump P-202 → RO Membrane RO-201 → Permeate Tank TK-201.
Show reject/concentrate branch from RO-201 to Reject Outlet.

Use simple P&ID-inspired symbols and labelled pipes. Make the diagram horizontally scrollable or fit-to-screen. Clicking an asset opens a detail drawer. Highlight flow direction. Distinguish running, stopped, alarm and unknown states.

## Digital Twin page

Show:
- Process diagram with asset states.
- Simulation controls: Start, Pause, Reset, Speed (0.5x, 1x, 2x).
- Simulation mode badge.
- Model configuration panel with tank area, tank capacity, inlet flow, outlet flow and pump flow. Values are demo parameters.
- Step disturbance controls for inlet flow and outlet demand.
- Tank level response chart.
- Controller panel with setpoint, PV, error, output, P/I/D terms and Auto/Manual selector.
- A clear warning: `Simulation controls affect only the virtual model. They do not control physical plant equipment.`

## Equipment page

Table columns:
- Tag
- Equipment
- Type
- Area
- State
- Criticality
- Last maintenance
- Actions

Seed equipment:
- TK-101 Raw Water Storage Tank
- LIT-101 Tank Level Transmitter
- P-101 Transfer Pump
- FIT-101 Transfer Flow Transmitter
- P-201 RO Feed Pump
- F-201 Self-Cleaning Filter
- F-202 Cartridge Filter
- P-202 RO High-Pressure Pump
- RO-201 RO Membrane Train
- FIT-202 Permeate Flow Transmitter
- AIT-201 Permeate Conductivity Analyser
- TK-201 Permeate Tank

These are illustrative tag names for the demo, not actual Thermax tags.

## Alarms & Events page

Create severity filters Critical, High, Medium, Low and state filters Active, Acknowledged, Cleared.
Seed alarms:
- `TK-101 High Level` — High — Active
- `P-101 Pump Trip` — Critical — Acknowledged
- `RO-201 Low Permeate Flow` — Medium — Active
- `AIT-201 Conductivity High` — High — Cleared

Alarm detail must show first occurrence, last occurrence, tag, current value, threshold, source and acknowledgement history. Acknowledge does not clear an alarm. Include a confirmation modal and user/reason field.

## Maintenance page

Show:
- Work-order KPI cards: Open, In Progress, Overdue, Completed this month.
- Work-order table with number, asset, task, priority, assignee, due date and status.
- Create work order modal.
- Work order detail with checklist, notes, activity history and attachments.
- Preventive maintenance calendar/list.

## Water Quality page

Cards and charts for:
- Feed TDS / conductivity.
- Permeate TDS / conductivity.
- Salt rejection estimate.
- RO recovery.
- Feed and permeate flow.
- Sample table with timestamp, parameter, value, unit, source and quality.

Show clear empty states when a value is not instrumented. Do not invent live values outside the explicitly seeded demo.

## Energy & Performance page

Show:
- Water produced.
- RO recovery trend.
- Pump run hours.
- Specific energy consumption (only when energy meter and volume data exist).
- Water balance.
- Performance comparisons by shift/day.
- Mark all demo values simulated.

## Reports page

Report cards:
- Shift Operations Report
- Daily Water Balance
- RO Performance Report
- Pump Runtime Report
- Alarm Summary
- Maintenance Report

Allow date range selection, plant selection, preview and export controls. UI can use mock export behaviour until backend is connected.

## Administration

Plant settings:
- Plant profile.
- Process areas.
- Asset/tag register.
- Engineering parameter register with source, revision and status (`Verified`, `Configured`, `Assumed/Demo`, `Unavailable`).
- Alarm rules and setpoints.
- Simulation settings.
- User and role management.

Audit log:
- Timestamp, user, action, entity, plant, result and details.
- Read-only table.

## Interaction requirements

- Navigation must work.
- Plant selector must change selected plant context.
- Filters and search must work on tables.
- Tabs, drawers, modals and forms must work.
- Charts should use seeded demo data and clear labels.
- Simulation controls should update local demo state only.
- Do not create fake physical PLC connectivity.
- Do not show a successful equipment command unless the simulated state machine confirms it.
- Use reusable components and typed data models.
- Provide loading, empty, error and stale-data states.
- Include toast feedback for UI actions.
- Do not expose database credentials in client code.

## Technical expectations

Generate a clean React/TypeScript frontend with reusable components and a clear separation between mock data and future API services. Use shadcn/ui-style components, Tailwind CSS, lucide icons and Recharts. Keep data types ready for a Next.js App Router + MongoDB backend. Do not hard-code the whole process diagram into a single image; use interactive components so asset states can later be driven by telemetry.

The first result should be a polished, navigable UI prototype with all routes, realistic demo data, and a consistent industrial ERP experience.
