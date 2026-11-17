# AquaTwin Operations

## Complete Product Vision, Requirements, Architecture and End-to-End Workflow

**Document type:** Consolidated product and implementation
specification\
**Initial scope:** Raw-water storage and transfer, with provision for
RO-process integration\
**Frontend baseline:** React, TypeScript, Vite and Tailwind CSS\
**Status:** Product specification. Site-specific engineering facts must
be verified before real deployment.

------------------------------------------------------------------------

# 1. Product Overview

AquaTwin Operations is an industrial plant operations platform combining
process visualization, PLC configuration and monitoring,
electrical-panel visualization, and operational analysis.

The application has exactly **four primary modules**:

1.  **Plant** --- the main operational workspace: process mimic, tank
    simulation/live values, equipment states, alarms and operating
    information.
2.  **Input / Output** --- the PLC engineering workspace: PLC selection,
    hardware/rack configuration, I/O mapping, ladder-logic visibility
    where supported, live monitoring, terminal and diagnostics.
3.  **Control Panel** --- electrical cabinet, physical components,
    terminal blocks and wiring/signal-path visualization.
4.  **Analysis** --- historical trends, water-quality history, energy,
    equipment performance, alarms/events history and reports.

Settings, user access and audit functions may exist as supporting
application facilities, but must not become a fifth main module.

## 1.1 Goals

-   Provide one coherent view of plant operations.
-   Build a useful Virtual PLC before connecting physical hardware.
-   Prepare a path to connect a real Mitsubishi PLC after its exact
    model and communication capabilities are confirmed.
-   Display PLC values in a live engineering-style monitor and terminal.
-   Make the relationship between sensors, PLC channels, tags and the
    Plant mimic visible.
-   Keep simulated and real data clearly distinguished.
-   Store historical process and event data.
-   Preserve industrial safety and site operating procedures.

## 1.2 Non-negotiable principles

-   Exactly four primary modules: Plant, Input / Output, Control Panel
    and Analysis.
-   All modules use one shared tag/runtime data model.
-   Virtual PLC and Real PLC adapters use the same tag contract.
-   Never show a real PLC as connected without a verified communication
    session.
-   Initial real PLC integration is read-only.
-   Do not invent site P&ID details, tank dimensions, I/O addresses,
    setpoints, wiring or PLC specifications.
-   PLC safety logic and hardwired protection remain authoritative.
-   The UI should be professional, operator-friendly and desktop-first.

------------------------------------------------------------------------

# 2. Application Navigation and Shared Header

## 2.1 Landing page

Show four prominent cards:

  -----------------------------------------------------------------------
  Module                  Purpose                 Main content
  ----------------------- ----------------------- -----------------------
  Plant                   Observe and operate the Process mimic, tank,
                          process                 pumps, valves, live
                                                  values, alarms

  Input / Output          Configure and monitor   PLC overview, hardware,
                          the PLC                 I/O mapping, ladder
                                                  view, terminal,
                                                  diagnostics

  Control Panel           Understand electrical   Cabinet layout,
                          hardware                PLC/power/relay
                                                  components, terminal
                                                  wiring, signal tracing

  Analysis                Understand performance  Trends, water quality,
                          over time               energy, runtime, alarm
                                                  history and reports
  -----------------------------------------------------------------------

The landing page may also show plant state, PLC mode, data freshness and
active alarm count. These summaries do not create extra modules.

## 2.2 Shared header

-   AquaTwin logo/name.
-   Selected plant/site.
-   Breadcrumb.
-   Current mode: Virtual PLC or Real PLC.
-   Plant/data connection status.
-   User and role.
-   Notifications/active alarm indicator.
-   Time/shift information where configured.

Use configurable demo values until actual deployment details are
supplied.

------------------------------------------------------------------------

# 3. Module 1 --- Plant

The Plant module is the main operational area. It should make the
process easy to understand and show how equipment and measurements
change.

## 3.1 Overview layout

-   **Top:** plant state, operating mode, PLC/data connection, active
    alarms.
-   **Centre:** large process mimic/digital-twin view.
-   **Right:** live measurements and equipment states.
-   **Bottom:** active alarms, recent events and operating messages.

The process mimic should be the visual focus, not a collection of
unrelated KPI cards.

## 3.2 Initial process scope

The first implementation focuses on raw-water storage and transfer. A
**generic conceptual process** is:

**Raw-water source → inlet/isolation or control valve → raw-water tank
TK-101 → transfer pump P-101 → downstream/RO feed header.**

Future RO integration may include, subject to approved site drawings:

**RO feed pump → self-cleaning filter → cartridge filter → chemical
dosing (site-specific location) → high-pressure pump → RO membrane
system → permeate tank and reject handling.**

This is not a verified site P&ID. The exact sequence, equipment tags,
bypasses, drains, valves, dosing points and interlocks must come from
approved plant drawings and the control narrative.

## 3.3 Process mimic

Show relevant equipment using clear industrial symbols and labels:

-   Raw-water source/inlet.
-   Tank with animated liquid level.
-   Inlet and outlet pipes.
-   Isolation/control valves.
-   Transfer pump(s).
-   Flow and pressure measurement points.
-   Level measurement points.
-   Downstream process connection.
-   Equipment states and alarm indicators.

Every displayed object must map to a real or simulated equipment/tag
record. Clicking an object opens its details.

### Tank simulation and live values

Show: - Current level (%). - Level in engineering units if
geometry/calibration is known. - Capacity only if verified. - Configured
low/normal/high bands. - High-high/low-low alarms only when approved
thresholds exist. - Inlet/outlet flow if available. - Source: Virtual
PLC or Real PLC. - Last update and data quality.

In Virtual PLC mode, level should change from simulated inflow/outflow
and a process model, not random animation.

Simplified balance:

`Change in stored volume = inlet flow − outlet flow`

If tank geometry is known, calculate level from volume. Otherwise use a
clearly labelled simplified percentage model.

### Pumps

For each pump show: - Equipment tag/name. - Command state, if
available. - Run feedback. - Trip/fault feedback. - Auto/Manual mode
only if supplied by PLC. - Runtime, if available. - Associated alarms. -
Data source and timestamp.

A run command is not proof that the motor is running. Display command
and feedback separately.

### Valves

Show: - Open/close command, if available. - Open limit feedback. -
Closed limit feedback. - Fault/unknown state. - Position percentage only
if a position transmitter exists.

### Sensors

Candidate categories: - Tank level. - Flow. - Pressure. - Water quality
such as pH, conductivity and turbidity, where instruments exist.

These are candidate tags, not confirmation that the site has these
instruments. Configure each tag from the actual instrument and I/O list.

## 3.4 Plant interactions

-   Click tank to open details and trends.
-   Click pump to open equipment details.
-   Click valve to see command and feedback.
-   Click sensor to see value, units, quality, timestamp and tag
    mapping.
-   Highlight the process line when equipment is selected.
-   Show related active alarms.
-   Support Virtual PLC scenarios: nominal operation, tank filling, tank
    draining, pump stopped and sensor fault.
-   Scenario controls must be disabled or clearly separated in Real PLC
    mode.

## 3.5 Modes

-   **Virtual PLC / Simulation:** simulated process and tag values.
-   **Real PLC / Monitoring:** values from a physical PLC through a
    backend gateway.
-   **Real PLC / Write-enabled:** later capability only, requiring
    explicit authorisation, safety review and command permissions.

------------------------------------------------------------------------

# 4. Module 2 --- Input / Output (PLC Engineering Workspace)

This is a dedicated PLC workspace inspired by industrial engineering
tools. It should not look like a generic dashboard.

## 4.1 Internal tabs

These are tabs inside Input / Output, not new primary modules:

1.  PLC Overview
2.  Hardware Configuration
3.  Ladder Logic View
4.  I/O Monitoring
5.  PLC Terminal
6.  Connection & Diagnostics

## 4.2 PLC Overview

Show: - Manufacturer and PLC family. - Exact CPU model. -
Firmware/version when verified. - Communication protocol/driver. -
Endpoint/IP/port when configured. - CPU state when supported. - Scan
time when available. - Last successful communication. - Data freshness
and quality. - Virtual/Real mode. - Read-only/write-enabled status.

**Known target:** Mitsubishi Electric. The exact PLC model/CPU is not
confirmed. Keep family and model configurable. Do not assume a specific
MELSEC family, CPU, rack or IP address.

## 4.3 Hardware Configuration

### Intended layout

Follow the supplied reference images: - Traditional industrial
engineering-software appearance. - Light grey/blue frame. - Compact
toolbar and tabs. - Module catalogue on the left. - Large realistic
horizontal PLC rack in the centre. - Selected module properties on the
right. - Lower module details panel. - Configuration messages and status
bar at the bottom.

The rack must be the visual centre.

### Features

-   Select manufacturer and PLC family.
-   Select compatible base/rack.
-   Select CPU.
-   Add power supply and supported I/O/communication modules.
-   Show empty expansion slots.
-   Assign modules to valid slots.
-   Select modules to inspect properties.
-   Remove/replace modules only where rack rules allow.
-   Search/filter catalogue.
-   Save/load rack configuration.
-   Validate compatibility, slot capacity and power budget where data
    exists.

### Catalogue categories

-   Power Supply
-   CPU
-   Digital Input
-   Digital Output
-   Analog Input
-   Analog Output
-   Temperature/Special Function
-   Communication/Network
-   Base Units/Expansion

Each catalogue record should contain manufacturer, model, category,
description, channels, signal range, compatibility, power requirements,
image, datasheet reference and verification status.

Only populate specifications from official manuals/catalogues or
verified engineering documents. Mark unknown values "Not verified."

### Physical appearance

Use genuine product photographs or manufacturer-approved images where
possible. A rack illustration may show slot layout but must not be
represented as an actual product photograph.

Show realistic module proportions, casing, terminal blocks, labels,
status LEDs, base unit, mounting rail and slot numbers. Avoid cartoon
modules, emoji, flat rectangles and decorative futuristic effects.

### Module properties

When a module is selected, show: - Product/model. - Module type. -
Slot. - Channel count. - Signal type. - Input/output range. -
Resolution. - Addressing rules. - Power requirement. - Compatibility. -
Datasheet/manual. - Verification status.

Properties must come from the selected catalogue record.

### Validation

Where supported by verified catalogue data, validate: - Base/rack
compatibility. - CPU compatibility. - Slot assignment and duplicate
use. - Module count/capacity. - Power budget. - Required power supply. -
Supported module placement. - I/O address conflicts.

Show actual errors and warnings. Do not always show "Configuration OK."

## 4.4 I/O Mapping

Map field devices to PLC channels and AquaTwin tags.

Support: - Digital Inputs (DI). - Digital Outputs (DO). - Analog Inputs
(AI). - Analog Outputs (AO).

Each mapping should include: - PLC module, rack and slot. - Channel
number. - PLC device address. - AquaTwin tag. - Field device/equipment
tag. - Signal type. - Engineering units. - Raw and scaled value. -
Range/scaling parameters. - Normal/fail state where defined. - Alarm
limits where approved. - Read/write permission. - Verification status.

Illustrative tag names only:

  Tag             Type   Example meaning
  --------------- ------ ----------------------
  TK101_LEVEL     AI     Raw-water tank level
  FLOW101         AI     Flow measurement
  P101_RUN_FB     DI     Pump run feedback
  P101_TRIP       DI     Pump trip feedback
  P101_RUN_CMD    DO     Pump run command
  XV101_OPEN_FB   DI     Valve open feedback

These are not confirmed site addresses or actual I/O.

### DI

Show channel/address, tag, field device, ON/OFF value, timestamp,
quality and simulation/real source.

### DO

Show output channel, tag, command state, separate feedback if present,
permission/interlock status and write-enabled state. Never imply a
command operated equipment without feedback.

### AI

Show raw count/value, scaled value, unit, configured range, supported
signal type, quality and timestamp. Use verified scaling parameters.

### AO

Show raw output, scaled setpoint, unit, range, assigned device and
permission/interlock status. Real output writes remain disabled until
approved.

## 4.5 Ladder Logic View

For Virtual PLC: - Show power rails, contacts, coils, timers, counters
and basic logic blocks. - Simulate supported logic against virtual
tags. - Clearly label this as AquaTwin virtual logic.

For Real PLC: - Display/upload/parse actual program only if the selected
CPU, software/export format, protocol and permissions support it. - Do
not claim to edit or download Mitsubishi programs unless genuinely
implemented. - Never represent generic sample logic as the actual plant
program.

## 4.6 I/O Monitoring

Provide a live table/grid containing: - Tag and description. - I/O
type. - Rack/slot/channel. - PLC address. - Current value and unit. -
Quality and timestamp. - Read/write permission.

Features: search/filter, group by DI/DO/AI/AO, pin tags, show changed
values, pause/resume display refresh, CSV export and source indicators.

## 4.7 PLC Terminal

Provide a serial-monitor-style diagnostic terminal: - Timestamped
incoming messages. - Connection events. - Scan/communication status. -
Read requests and responses. - Tag read results. - Driver
errors/timeouts. - Warnings.

Controls: clear, pause/resume, search, INFO/WARN/ERROR/TX/RX filters,
export and permitted diagnostic/read commands.

Do not expose an unrestricted raw socket terminal to the browser.
Backend must validate and authorise every request. Initial Real PLC
terminal is read-only.

## 4.8 Connection & Diagnostics

Show selected driver, endpoint, connection state, last successful read,
latency, timeout/error counts, scan/refresh rate, data quality,
diagnostic log and read-only/write-enabled state.

A successful TCP connection alone does not prove valid PLC data is being
read. Show protocol/session health and valid tag reads separately.

------------------------------------------------------------------------

# 5. Module 3 --- Control Panel

This module represents the physical electrical cabinet and wiring. It is
separate from PLC software configuration.

## 5.1 Cabinet overview

Show configurable components where present: - Incoming power and
isolator. - Fuses/MCBs/protection. - 24 V DC supply. - PLC base/rack and
CPU. - DI/DO/AI/AO modules. - Interposing relays. - Contactors/motor
starters/VFD interfaces. - Terminal blocks. - Ethernet/network switch. -
Cable ducts and grounding.

Exact cabinet arrangement must come from approved drawings and site
inspection. Until then label it **Conceptual / Not an approved wiring
drawing**.

## 5.2 Wiring and signal tracing

Illustrative input path:

**Level transmitter → field cable → terminal block → PLC analog input
channel → PLC tag TK101_LEVEL → AquaTwin Plant tank display.**

Illustrative output path:

**AquaTwin authorised command → backend permission check → PLC output
tag → output module → relay/contactor interface → equipment**, with
feedback returned separately.

Actual wiring must be verified from drawings and inspection.

When a component is selected, show its tag, manufacturer/model if
verified, function, terminal references, connected components, PLC
rack/slot/channel, linked AquaTwin tags, status and source drawing.

Input / Output explains PLC hardware, channels, tags and communication.
Control Panel explains cabinet hardware, terminals and physical wiring.
Do not duplicate the whole PLC workspace here.

------------------------------------------------------------------------

# 6. Module 4 --- Analysis

Analysis is for history, trends and reporting, not equipment control.

## 6.1 Process trends

Trend configured tags such as tank level, flow, pressure, pump
state/runtime and other verified measurements.

Features: - Time-range selection. - Live/historical view. - Multiple-tag
comparison. - Zoom/pan. - Min/max/average. - Visible data gaps and
bad-quality periods. - Export.

## 6.2 Water quality

Include only installed or manually recorded parameters, such as pH,
conductivity and turbidity. Show current value, history, units, sample
time, source and approved operating/reference limits. Do not invent
statutory or process limits.

## 6.3 Energy and equipment performance

Where data exists, show: - Pump operating hours. - Starts/stops. -
Runtime by day/week/month. - Energy from an actual meter or approved
calculation. - Specific energy metrics only when required flow and
energy data exists. - Availability and trip frequency.

Do not fabricate kWh. Label estimated values as estimated.

## 6.4 Alarm and event history

Store: - Alarm/event ID. - Timestamp. - Equipment/tag. -
Severity/message. - Value at occurrence. - Acknowledgement user/time. -
Return-to-normal/clear time. - Duration. - Source: Virtual or Real.

Application alarm acknowledgement is not the same as resetting a
physical PLC trip or safety circuit.

## 6.5 Reports

Support shift, daily, weekly, monthly, alarm/event, equipment runtime,
process trend and water-quality reports.

Include plant, time range, generated time, source/mode, missing-data
indicators, charts and tables. Export PDF/CSV where required.

------------------------------------------------------------------------

# 7. Mitsubishi PLC Integration Strategy

## 7.1 Known information

-   Target manufacturer: Mitsubishi Electric.
-   Exact PLC family/CPU: not confirmed.
-   User can inspect the PLC and obtain details.
-   Driver and protocol must be selected after the model, firmware,
    ports and enabled communication functions are known.

## 7.2 Hardware discovery checklist

Collect: 1. Exact PLC family. 2. Exact CPU model/part number. 3.
Firmware version. 4. Base/rack model. 5. Installed I/O and communication
modules. 6. Ethernet/serial port and module details. 7. Configured
IP/subnet/port or serial settings. 8. Enabled protocol and PLC
communication settings. 9. Programming/engineering software and project
version. 10. Read-only permission. 11. Approved tag/device/address list.
12. OT network topology and cybersecurity requirements.

Photograph CPU and module labels, rack and ports. Do not share
credentials/passwords.

## 7.3 Candidate communication methods

Choose only after checking the exact CPU/module manuals: - Mitsubishi MC
Protocol / SLMP (supported frame and configuration). - OPC UA, if PLC or
approved gateway supports it. - Modbus TCP, if configured and
supported. - Serial communication, if supported and approved.

Do not choose a protocol only because a library supports it. Verify the
actual device supports the required operation.

## 7.4 Driver selection

Evaluate a maintained Mitsubishi MC Protocol/SLMP client, OPC UA client,
Modbus TCP client or vendor-supported gateway as appropriate.

Verify: - CPU/family support. - Protocol/frame support. -
Device/register types. - Read/write capabilities. - Timeout/reconnect
behaviour. - Package maintenance/licence. - Runtime compatibility. -
Security implications.

Do not put PLC credentials or direct PLC access in browser code.

## 7.5 Connection architecture

**PLC → isolated OT network → approved industrial gateway/backend
service → AquaTwin API/realtime service → React frontend.**

The browser must never connect directly to the PLC.

The gateway should: - Establish PLC session. - Read allowlisted tags. -
Validate addresses and data types. - Scale analog values. - Attach
timestamp and quality. - Publish updates. - Log failures. - Enforce
permissions and command allowlists. - Rate-limit requests. - Reconnect
safely.

Use approved network boundaries, firewall rules, VLANs and remote-access
policies. Never expose the PLC directly to the public internet.

## 7.6 First real integration milestone

Read-only: - Read selected tags. - Display real values. - Show timestamp
and quality. - Compare against existing HMI/engineering software. - Log
errors and connection state.

Do not enable remote writes in the first live milestone.

## 7.7 Later write capability

Only after written approval, controls-engineer review, approved control
narrative, command allowlist, role permissions, PLC-side permissives,
feedback, timeout/cancellation, audit logging and commissioning tests.

Emergency stops, motor protection and process safety interlocks must
remain in PLC/hardwired systems.

------------------------------------------------------------------------

# 8. Virtual PLC and Digital Twin

## 8.1 Purpose

Build and test before the actual PLC model and site access are
finalised. Virtual PLC must use the same tag contract and data structure
as the future Real PLC adapter. It is not a replacement for Mitsubishi
hardware or its engineering software.

## 8.2 Virtual PLC functions

-   Configurable sample PLC profile and rack.
-   Digital input toggles.
-   Analog input sliders/numeric sources.
-   Digital/analog output simulation.
-   Virtual scan cycle.
-   Basic supported logic execution.
-   Tank/pump/valve process simulation.
-   Fault injection: sensor disconnected, out-of-range, communication
    loss, pump trip.
-   Timestamped terminal log.
-   Alarm generation.
-   Scenario selection/reset.

All simulated values must be labelled SIMULATED.

## 8.3 Shared tag contract

Each tag should include fields equivalent to: - `tagId` - `name` -
`description` - `ioType` (DI, DO, AI, AO or internal) - `dataType` -
`address` - `rack`, `slot`, `channel` - `rawValue` - `value` - `unit` -
`quality` (good, uncertain, bad, disconnected) - `source` (virtual or
real) - `timestamp` - `readWrite` - `engineeringRange` - `scaling` -
`alarmConfiguration`

Define the TypeScript interface once and reuse it in all modules.

## 8.4 Source switching

Virtual and Real adapters implement the same interface. Plant components
should not need rewriting when source changes. Never mix real and
simulated values silently.

------------------------------------------------------------------------

# 9. End-to-End Workflows

## 9.1 Virtual mode

1.  User opens AquaTwin.
2.  Opens Input / Output.
3.  Selects a sample Mitsubishi profile marked unverified.
4.  Configures virtual rack and modules.
5.  Maps virtual DI/DO/AI/AO channels to tags.
6.  Virtual PLC updates values using selected scenario and logic.
7.  Shared runtime service publishes updates.
8.  Plant displays tank, pump, valve and sensor states.
9.  Control Panel highlights conceptual signal paths.
10. Analysis stores simulated history, clearly labelled.
11. PLC Terminal displays timestamped simulation/diagnostic events.

## 9.2 Real read-only mode

1.  Engineer confirms exact CPU, firmware, modules and protocol.
2.  Controls/OT team approves access/network method.
3.  Engineer configures the backend gateway.
4.  Gateway establishes protocol session.
5.  Gateway reads an allowlisted set of tags.
6.  Backend validates address, type, scaling, timestamp and quality.
7.  Backend publishes values to shared runtime.
8.  Input / Output displays live values and diagnostics.
9.  Plant displays the same values on the process mimic.
10. Control Panel shows mapped hardware/wiring.
11. Analysis stores real telemetry with source metadata.
12. Terminal records read/communication events.

## 9.3 Later authorised command

1.  Authorised user selects permitted command.
2.  UI displays target and requested value.
3.  Backend checks role, permission, mode, allowlist and limits.
4.  Backend checks configured permissives.
5.  Backend sends command through approved driver.
6.  PLC executes its own logic/interlocks.
7.  Gateway reads independent feedback.
8.  AquaTwin shows command result and feedback separately.
9.  Audit log records user, timestamp, request, response and result.

Backend acceptance does not prove physical operation.

------------------------------------------------------------------------

# 10. Technical Architecture

Keep the architecture simple and maintainable. Avoid unnecessary
microservices in the first release.

## 10.1 High-level architecture

**React frontend** - Four modules. - Shared application state. - Process
mimic and charts. - PLC engineering workspace. - Role-aware controls.

**Backend API and realtime service** - Authentication/authorisation. -
Plant and tag configuration. - Telemetry ingestion. - Alarm/event
handling. - Reports. - WebSocket or equivalent realtime updates.

**PLC gateway/adapters** - Virtual PLC adapter. - Real Mitsubishi
adapter after verification. - Protocol-specific reads. - Later safe
command service.

**Database** - Plant configuration. - PLC hardware profiles and rack
configurations. - Module catalogue references. - I/O mappings and
tags. - Telemetry history. - Alarms/events. - Wiring/components. - Audit
logs and report metadata.

## 10.2 Frontend structure (adapt to existing repository)

``` text
src/
  types/
    plant.ts
    plc.ts
    io.ts
    alarms.ts
    analysis.ts
  context/
    PlantContext.tsx
  services/
    api.ts
    telemetry.ts
    plcService.ts
  components/
    layout/
    shared/
  modules/
    Plant/
    InputOutput/
      PLCOverview/
      HardwareConfiguration/
      LadderLogic/
      IOMonitoring/
      PLCTerminal/
      Diagnostics/
    ControlPanel/
    Analysis/
```

Do not create duplicate state, duplicate timers or parallel tag
definitions.

## 10.3 Backend logical areas

Possible API areas: - `/api/plant` - `/api/plc` - `/api/hardware` -
`/api/io` - `/api/tags` - `/api/telemetry` - `/api/alarms` -
`/api/events` - `/api/analysis` - `/api/reports` - `/api/commands`
(disabled until approved)

Validate all inputs server-side.

## 10.4 Realtime and database

Use WebSocket or equivalent for tag changes, plant state, alarms,
connection status and diagnostics. Poll/scan from the backend gateway,
not from independent component timers.

Suggested entities: - `plants` - `plantEquipment` - `plcDevices` -
`hardwareCatalog` - `rackConfigurations` - `ioModules` - `ioChannels` -
`tags` - `telemetry` - `alarms` - `events` - `panelComponents` -
`wiringConnections` - `users` - `roles` - `auditLogs` - `reports`

Plan telemetry indexes and retention according to sample rate and
operational needs.

------------------------------------------------------------------------

# 11. Roles and Permissions

  -----------------------------------------------------------------------
  Role                                Typical access
  ----------------------------------- -----------------------------------
  Viewer                              View Plant, I/O, Control Panel and
                                      Analysis

  Operator                            View operations and acknowledge
                                      application alarms

  Engineer                            Configure hardware profiles, tags,
                                      mappings and diagnostics

  Administrator                       Manage users, roles and site
                                      configuration
  -----------------------------------------------------------------------

Real PLC writes require separate explicit permission and remain disabled
until site controls/safety review is complete. Audit configuration
changes and commands.

------------------------------------------------------------------------

# 12. Data Quality and Alarm Rules

Recommended quality states: - **Good:** valid recent value. -
**Uncertain:** value exists but has warning/stale condition. - **Bad:**
invalid, failed or unavailable. - **Disconnected:** no active source.

Rules: - Never silently display an old value as live. - Mark stale data
and show last update. - Preserve raw and scaled values where
applicable. - Store source and quality with historical samples. -
Configure alarm thresholds from approved documents. - Distinguish
acknowledgement from clearing and equipment trip reset. - Separate
simulation alarms from real plant alarms.

------------------------------------------------------------------------

# 13. Visual Design Requirements

## 13.1 Overall style

Professional industrial SCADA and PLC engineering software: - Clear
industrial hierarchy. - Compact, readable technical typography. -
Consistent spacing/alignment. - Light neutral workspace with restrained
blue accents. - Consistent status colours. - Fine borders and subtle
shadows. - Dense but readable information.

Avoid excessive rounded SaaS cards, cartoon hardware, decorative
gradients/glows, fake 3D, emoji hardware and placeholder charts
presented as real data.

## 13.2 Hardware configuration screen

Follow the user's reference: - Top application bar. - PLC tabs and
engineering toolbar. - Hardware identification strip. - Left module
catalogue with product thumbnails. - Large central horizontal PLC rack
with slot numbers and realistic modules. - Right module properties. -
Bottom tabs: Module Properties, Terminal Wiring, Address Assignment,
Diagnostics. - Configuration messages. - Bottom connection/status bar.

Use genuine product images where possible and mark sample/unverified
configurations.

## 13.3 Desktop targets

Primary: 1440 × 900.\
Minimum target: 1280 × 800.

At smaller widths, panels may collapse or become drawers. Do not shrink
the rack until labels become unreadable.

------------------------------------------------------------------------

# 14. Testing and Acceptance Criteria

## Plant

-   Tank value changes correctly in Virtual PLC mode.
-   Pump command and run feedback are separate.
-   Valve command and feedback are separate.
-   Equipment selection opens correct details.
-   Alarms map to correct tag/equipment.
-   Real/Virtual source is visible.
-   Stale/disconnected values are clearly marked.

## Input / Output

-   Catalogue search works.
-   Rack slots can be configured.
-   Incompatible modules are rejected.
-   Selected module updates properties.
-   I/O mappings save and restore.
-   DI/DO/AI/AO values display correctly.
-   Analog scaling is tested against known values.
-   Terminal logs are timestamped.
-   Real connection is never fabricated.
-   Browser does not connect directly to PLC.

## Control Panel

-   Components are selectable.
-   Signal paths highlight correctly.
-   Wiring relationships match configured mappings.
-   Conceptual/unverified drawings are labelled.
-   Component detail shows source/reference.

## Analysis

-   Historical values store source and quality.
-   Time-range filtering works.
-   Data gaps are visible.
-   Reports use correct time ranges.
-   Simulated and real history are distinguishable.
-   Energy is measured or labelled estimated.

## Safety/security

-   Real PLC read-only is default.
-   Write controls disabled unless authorised.
-   Server validates every command.
-   PLC safety logic remains independent.
-   No PLC credentials in frontend code.
-   OT access is restricted and approved.
-   Audit logs record changes and commands.

------------------------------------------------------------------------

# 15. Implementation Roadmap

## Phase 0 --- Site discovery

Inspect PLC labels, CPU, firmware, modules, ports, protocol; obtain
approved P&ID, electrical drawings, I/O list, instrument datasheets and
OT permissions.

**Deliverable:** verified site/hardware information pack.

## Phase 1 --- Application foundation

Freeze four-module navigation; define shared tag types/runtime;
establish Virtual/Real source indicators, timestamps and data quality.

**Deliverable:** stable data foundation.

## Phase 2 --- Plant

Build process mimic, tank simulation, pump/valve/sensor details, alarms
and shared-tag integration.

**Deliverable:** working virtual plant operations screen.

## Phase 3 --- Input / Output

Build PLC overview, hardware catalogue/rack, I/O mapping, Virtual PLC,
monitoring, terminal and diagnostics.

**Deliverable:** usable PLC engineering workspace.

## Phase 4 --- Control Panel

Build cabinet layout, component details, terminal/wiring views and
signal tracing.

**Deliverable:** interactive cabinet visualization.

## Phase 5 --- Analysis

Store telemetry; build trends, water-quality history, runtime/energy,
alarm history and reports.

**Deliverable:** history and reporting.

## Phase 6 --- Real Mitsubishi read-only

Select driver after CPU confirmation; build backend gateway; read
approved tags; validate values against existing HMI/engineering
software; test reconnect, timeout and stale-data handling.

**Deliverable:** verified live telemetry.

## Phase 7 --- Controlled writes (optional later)

Complete approvals, allowlist, permissions, interlock/permissive review,
feedback, audit and commissioning.

**Deliverable:** restricted command capability only if approved.

------------------------------------------------------------------------

# 16. Information Still Required

## PLC

-   Exact Mitsubishi family and CPU.
-   Firmware.
-   Communication port/module.
-   Protocol and configuration.
-   IP/port or serial settings.
-   PLC device/address map.
-   Installed module part numbers.

## Process

-   Approved P&ID and process flow.
-   Tank dimensions/capacity and level calibration.
-   Pump/valve tags.
-   Instrument list and datasheets.
-   Control narrative and modes.
-   Approved alarm setpoints.

## Electrical

-   Panel layout drawing.
-   Wiring schematics.
-   Terminal plan.
-   Rack/slot layout.
-   I/O list.
-   Relay/contactor/VFD interface.

## IT/OT and operations

-   Network topology.
-   Firewall/VLAN requirements.
-   Approved gateway location.
-   User/role policy.
-   Remote-access rules.
-   Read/write permissions.
-   Data retention/reporting requirements.

------------------------------------------------------------------------

# 17. Non-Negotiable Development Rules

1.  Keep exactly four primary modules.
2.  Plant is the main process operations area.
3.  Input / Output is PLC engineering and monitoring.
4.  Control Panel is electrical hardware and wiring.
5.  Analysis is history and performance reporting.
6.  All modules use the same tag/runtime data model.
7.  Virtual and Real PLC use the same tag contract.
8.  Real values come through a verified backend gateway.
9.  Never fabricate connections, hardware specifications, addresses or
    process values.
10. Mark sample configurations and simulated values clearly.
11. Real PLC integration is read-only initially.
12. Do not put safety logic in the web application.
13. Do not present conceptual drawings as approved site drawings.
14. Avoid unnecessary microservices and extra top-level modules.
15. Prioritise working, testable functionality over decorative mockups.

------------------------------------------------------------------------

# 18. Definition of a Successful MVP

The first meaningful AquaTwin MVP is complete when:

-   Landing page contains the four agreed modules.
-   Plant displays a coherent tank and transfer-process simulation.
-   Input / Output configures a sample Virtual PLC rack and maps
    DI/DO/AI/AO tags.
-   I/O Monitoring displays live simulated values.
-   PLC Terminal displays timestamped logs.
-   Control Panel displays a conceptual cabinet and traces a
    sensor-to-PLC-to-Plant path.
-   Analysis stores and displays simulated trends, alarms and reports.
-   Every simulated value is clearly labelled.
-   A verified Mitsubishi read-only gateway can later be added without
    rewriting the four modules.

The next step after this MVP is to verify the actual Mitsubishi PLC
hardware and implement a controlled read-only connection.

**End of specification.**
