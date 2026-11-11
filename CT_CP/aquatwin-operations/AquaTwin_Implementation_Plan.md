# AquaTwin Operations: Implementation Plan

**Version:** 1.0 (draft)
**Scope:** Live Operations, Virtual PLC, Real PLC gateway, Control Panel module, command workflow
**Inputs used:** Architecture recommendation document, Siemens reference cabinet image (front and internal view with 25 numbered callouts), real S7-based control panel photo

---

## 1. Goals and Non-Goals

### Goals
1. Make **Live Operations** the landing page: an operator understands the process at a glance.
2. Build a **Virtual PLC** with a real I/O model (sensor → analog input → PLC logic → output → equipment → feedback), not random numbers.
3. Define **one PLC/I/O interface** that both Virtual PLC and Real PLC implement, so connecting hardware is an adapter task, not a UI redesign.
4. Add an engineering-grade **Control Panel** module (Cabinet Overview, Wiring Diagram, I/O Monitoring) with signal-path tracing.
5. Move simulation and connectivity out of the frontend into a **backend + PLC gateway**.
6. Implement a **safe command lifecycle** (request → validate → PLC ack → equipment feedback → audit).

### Non-Goals (for now)
- Remote commands to a real PLC (read-only first, enabled only after controls-engineer sign-off).
- Replacing hardwired safety. E-stops, interlocks and motor protection stay independent of the web app.
- Browser-to-PLC direct connections (never).

---

## 2. Assumptions and Items to Verify

| # | Item | Status |
|---|------|--------|
| A1 | The reference panels are Siemens-based (SIMATIC S7-1500 / S7-1200, SITOP PSU, SIRIUS motor protectors and contactors, Pilz safety relays). Actual project PLC is **unconfirmed**. | Verify |
| A2 | Preferred protocol is OPC UA; Modbus TCP is the fallback. S7-1500 supports OPC UA server (licence/firmware dependent). | Verify |
| A3 | All sample tags, addresses, terminals and wire numbers are **SIMULATED** until real drawings are supplied. | Must label in UI |
| A4 | Backend: Python FastAPI + MongoDB (as per recommendation). | Confirm |
| A5 | Existing frontend: React + TypeScript, state in `PlantContext.tsx` (per `ARCHITECTURE.md`). | Confirm |

**Rule:** anything not backed by a real drawing, tag list or datasheet carries a visible `SIMULATED / UNVERIFIED` badge.

---

## 3. Target Architecture

```
Field devices (level / flow / pressure sensors, pumps, valves, relays)
        │
PLC / I/O hardware (CPU, AI, DI, AO, DO)
        │
 ┌──────┴──────────┐
 │ REAL PLC        │   VIRTUAL PLC (software I/O + logic)
 └──────┬──────────┘
        │   (same adapter interface)
PLC GATEWAY / I/O SERVICE
   OPC UA · Modbus TCP · tag mapping · validation · connection monitor · command handler
        │
AQUATWIN BACKEND (auth · runtime state · telemetry · alarms · commands · audit)
        │  REST + WebSocket
AQUATWIN OPERATIONS UI (React)
```

### Responsibility split

| Component | Responsibility |
|-----------|----------------|
| React frontend | Visualisation, operator interaction only |
| `PlantContext` | Current UI runtime state (fed by telemetry, no simulation inside) |
| `RuntimeModeContext` | Real / Virtual mode, connection state, read-only flag |
| WebSocket service | Receives live telemetry, alarms, command status |
| Virtual PLC | Simulates process physics, I/O and PLC logic |
| PLC Gateway | Talks to physical PLC, tag mapping, quality, timestamps |
| Backend API | Auth, RBAC, command validation, alarms, audit |
| MongoDB | Config, tags, events, telemetry history, audit |

---

## 4. Core Data Model (build first, everything depends on it)

Create in `src/types/` (frontend) and mirror as Pydantic models in the backend.

### 4.1 Tag
```ts
type DataQuality = 'GOOD' | 'UNCERTAIN' | 'BAD' | 'STALE' | 'SIMULATED';

interface Tag {
  id: string;               // "TK101.LEVEL"
  description: string;
  dataType: 'BOOL' | 'INT' | 'REAL';
  engUnit?: string;         // "m", "m3/h", "bar"
  rawRange?: [number, number];   // e.g. 4-20 mA -> 0-27648 counts
  engRange?: [number, number];
  ioChannelId?: string;     // link to physical channel
  writable: boolean;        // command allowlist flag
  source: 'VIRTUAL' | 'REAL';
  verified: boolean;        // false until matched to real drawings
}

interface TagValue {
  tagId: string;
  value: number | boolean;
  quality: DataQuality;
  sourceTimestamp: string;  // sensor/PLC time
  serverTimestamp: string;  // gateway receive time
}
```

### 4.2 I/O channel and signal path
```ts
interface IOChannel {
  id: string;               // "A2.AI0"
  moduleId: string;         // "A2"
  type: 'AI' | 'DI' | 'AO' | 'DO';
  channel: number;
  signal: '4-20mA' | '0-10V' | '24VDC' | 'RELAY';
  terminalId?: string;      // "X1:14"
  tagId?: string;
  state?: boolean | number;
  fault?: 'WIRE_BREAK' | 'SHORT' | 'OVERRANGE' | 'UNDERRANGE' | null;
}

interface SignalPath {
  id: string;
  equipmentId: string;      // "LT-101"
  nodes: Array<{
    kind: 'FIELD_DEVICE' | 'FIELD_CABLE' | 'TERMINAL' | 'IO_CHANNEL'
        | 'PLC_TAG' | 'GATEWAY' | 'UI_OBJECT' | 'RELAY' | 'CONTACTOR' | 'ACTUATOR';
    refId: string;
    label: string;
  }>;
}
```

### 4.3 Panel component (for Control Panel)
```ts
interface PanelComponent {
  id: string;               // "K9", "F1", "A2", "PSU1"
  kind: 'ISOLATOR' | 'MCB' | 'MOTOR_PROTECTOR' | 'PSU_24V' | 'PLC_CPU'
      | 'AI_MODULE' | 'DI_MODULE' | 'AO_MODULE' | 'DO_MODULE'
      | 'RELAY' | 'CONTACTOR' | 'SAFETY_RELAY' | 'TERMINAL_BLOCK'
      | 'ETHERNET_SWITCH' | 'EARTH_BAR' | 'DRIVE' | 'HMI' | 'ESTOP';
  zone: string;             // see section 9.2
  position: { x: number; y: number; w: number; h: number };
  linkedChannels: string[];
  linkedEquipment: string[];
  verified: boolean;
}
```

### 4.4 Command
```ts
type CommandState =
  | 'REQUESTED' | 'REJECTED_VALIDATION' | 'SENT_TO_PLC'
  | 'PLC_ACCEPTED' | 'PLC_REJECTED' | 'FEEDBACK_CONFIRMED'
  | 'FEEDBACK_TIMEOUT' | 'FAILED';

interface Command {
  id: string;
  tagId: string;
  requestedValue: number | boolean;
  user: string;
  role: string;
  state: CommandState;
  timestamps: Partial<Record<CommandState, string>>;
  reason?: string;
}
```

**Deliverable:** `types/plant.ts, plc.ts, io.ts, commands.ts` + JSON seed for a sample plant (1 tank, 2 pumps, 2 valves, 1 level transmitter, 1 flow meter, 1 pressure transmitter).

---

## 5. Phased Roadmap

| Phase | Name | Priority | Est. effort |
|-------|------|----------|-------------|
| 0 | Discovery and repo preparation | Critical | 2–3 days |
| 1 | Data model + Live Operations rebuild | Critical | 1.5–2 weeks |
| 2 | Virtual PLC (in backend) | Critical | 2 weeks |
| 3 | Real-time telemetry + backend core | High | 1.5 weeks |
| 4 | Control Panel module | High | 2–3 weeks |
| 5 | PLC Gateway + OPC UA / Modbus adapters | High | 2 weeks |
| 6 | Real PLC read-only integration | High | 1–2 weeks (hardware dependent) |
| 7 | Command workflow + commissioning | Later | 2 weeks + site tests |

Estimates assume one full-stack developer; phases 4 and 5 can run in parallel with two.

---

### Phase 0: Discovery and Preparation

**Tasks**
- [ ] Audit current repo against `ARCHITECTURE.md`; list everything inside `PlantContext.tsx` that is simulation vs. state.
- [ ] Create target folder structure (section 12) with empty modules.
- [ ] Add `RuntimeModeContext` skeleton (`VIRTUAL` default, `REAL` disabled).
- [ ] Add global `SIMULATED` badge component.
- [ ] Start the hardware information checklist (section 14) and send it to the controls engineer.

**Exit criteria:** app still builds and runs unchanged; folder structure merged.

---

### Phase 1: Live Operations Rebuild

**Tasks**
- [ ] Make `/` route → Live Operations. Rename Dashboard to **Plant Summary** (reachable from plant selector / secondary nav).
- [ ] Update sidebar to the new navigation (section 11).
- [ ] Build layout with four regions (section 8).
- [ ] Build process-mimic components in `components/process/`: `Tank`, `Pump`, `Valve`, `Pipe`, `FlowArrow`, `SensorTag`.
- [ ] Drive all components from `TagValue` objects (initially mocked from a local fixture).
- [ ] Click handlers: tank, pump, valve open a detail drawer (runtime, feedback, tags, alarms).
- [ ] Bottom tab panel: Trends, Equipment, Sensor Diagnostics, Alarm History, Command History.

**Exit criteria**
- Operator can see mode, connection, level (m and %), flows, pump/valve state, alarms in one screen without scrolling at 1080p.
- No chart-heavy dashboard on the landing page.
- Every displayed value shows quality + timestamp on hover.

---

### Phase 2: Virtual PLC

**Principle:** the Virtual PLC runs a **scan cycle** and exposes the same interface as a real PLC. UI never reads process variables directly, only tags.

**Scan cycle (e.g. 100–250 ms)**
```
1. Read inputs       → process model produces raw sensor signals
2. Scale/validate    → raw counts → engineering units, set quality
3. Execute logic     → permissives, interlocks, auto/manual, alarms
4. Write outputs     → run requests, valve open/close demands
5. Actuator model    → pump/valve respond with delay (start time, travel time)
6. Feedback          → run feedback, limit switches, overload
7. Publish tags      → to gateway interface
```

**Process model (physics)**
- Tank volume: `dV/dt = Q_in − Q_out`; level = V / area.
- Pump flow as function of running state and (optionally) a simple pump curve; flow drops to 0 on trip.
- Valve position with travel time (OPEN → TRAVELLING → CLOSED); flow only when open feedback true.
- Pressure derived from level and flow (simple head + friction approximation).
- Sensor model: noise, optional drift, fault injection.

**Virtual I/O mapping (sample)**

| Virtual I/O | Behaviour |
|-------------|-----------|
| AI: Tank level transmitter | 4–20 mA equivalent, scaled to level |
| AI: Flow transmitter | Flow from pump/valve state |
| AI: Pressure transmitter | Pressure model |
| DI: Pump run feedback | True after start delay when run request is on |
| DI: Pump overload / trip | Fault injection or condition-based |
| DI: Valve open / closed feedback | Follows valve travel model |
| DI: High-level switch | Trips at configured threshold |
| DO: Pump run request | Result of PLC logic |
| DO: Valve open/close | Result of PLC logic |
| DO: Relay output | Changes relay state |

**Sample logic**
- Auto fill: start inlet pump when level < LOW_START, stop at HIGH_STOP.
- High-high level: inhibit inlet pump (permissive).
- Dry-run protection: inhibit outlet pump below LOW-LOW.
- Pump trip latches until reset.
- Feedback mismatch alarm: run request ON but no feedback after N seconds.

**Fault injection API (for demos and testing):** sensor wire break, stuck valve, pump trip, comms loss, noisy signal.

**Exit criteria**
- Raising inlet flow raises level → logic reacts → pump/valve changes → feedback updates → Live Operations updates, all through tags.
- Injected faults produce correct alarms and quality flags.
- Unit tests for scan cycle, scaling, interlocks (section 13).

---

### Phase 3: Telemetry and Backend Core

**Tasks**
- [ ] FastAPI project: `auth`, `telemetry`, `commands`, `alarms`, `audit`, `api`.
- [ ] WebSocket `/ws/telemetry`: tag value stream (delta updates), connection state, alarm events, command status.
- [ ] REST: tag config, I/O config, panel layout, history queries, command submission.
- [ ] MongoDB collections: `tags`, `io_channels`, `panel_components`, `signal_paths`, `telemetry`, `alarms`, `events`, `commands`, `audit`, `users`.
- [ ] Frontend `telemetrySocket.ts` with reconnect/backoff and stale-data detection.
- [ ] Remove simulation from `PlantContext`; it only holds data received from the socket.
- [ ] Authentication (JWT) and roles: `viewer`, `operator`, `engineer`, `admin`.

**Exit criteria:** UI runs entirely from backend telemetry; killing the backend shows a clear **COMMS LOST** state and values go `STALE`.

---

### Phase 4: Control Panel Module

See section 9 for detailed design. Delivery order:

1. **I/O Monitoring** (fastest, immediately useful, reads `IOChannel` + `TagValue`).
2. **Cabinet Overview** (zoned physical layout, clickable components).
3. **Wiring Diagram** with signal-path tracing.

**Exit criteria**
- Select `LT-101` → complete path highlighted: transmitter → field cable → terminal → AI channel → `TK101.LEVEL` → gateway → Live Operations tank.
- Click any panel component → shows tag, state, linked channels, verified/unverified badge.

---

### Phase 5: PLC Gateway

**Adapter interface (all adapters implement it)**
```python
class PlcAdapter(Protocol):
    async def connect(self) -> None: ...
    async def disconnect(self) -> None: ...
    async def read_tags(self, tag_ids: list[str]) -> list[TagValue]: ...
    async def subscribe(self, tag_ids: list[str], callback) -> None: ...
    async def write_tag(self, tag_id: str, value) -> WriteResult: ...  # disabled in read-only mode
    def health(self) -> ConnectionHealth: ...
```

**Adapters**
- `virtual-plc` (Phase 2 output, wrapped).
- `opc-ua` (e.g. `asyncua`): subscriptions, node-id mapping, security policy.
- `modbus-tcp` (e.g. `pymodbus`): register map, polling groups, byte/word order config.

**Gateway services**
- **Tag manager:** tag ↔ node/register/address mapping, loaded from config.
- **I/O manager:** channel states, scaling, range checks.
- **Connection monitor:** heartbeat, latency, last-good timestamp, auto-reconnect.
- **Validation:** reject out-of-range, flag stale/bad quality, never silently substitute values.
- **Read-only switch:** global config flag enforced in the gateway (not only the UI).

**Exit criteria:** switching `RuntimeMode` between VIRTUAL and REAL changes only the adapter; UI code is identical. A Modbus/OPC UA simulator (e.g. open-source test server) is used to prove the adapters before real hardware.

---

### Phase 6: Real PLC Read-Only Integration

**Prerequisites:** PLC make/model/firmware, tag list, network access, approved by controls engineer.

**Tasks**
- [ ] Confirm protocol and enable it on PLC (OPC UA server / Modbus TCP block).
- [ ] Build real tag map; mark entries `verified: true` only after cross-check with drawings.
- [ ] Parallel run: compare AquaTwin values vs. PLC HMI/TIA/engineering view for every tag.
- [ ] Verify timestamps, units, scaling and quality handling.
- [ ] Verify behaviour on cable pull / PLC stop / network loss.
- [ ] Use a dedicated read-only PLC account / firewall rules (inbound deny to PLC from anything except gateway).

**Exit criteria:** signed tag-by-tag verification sheet; UI clearly shows `REAL PLC · READ-ONLY`.

---

### Phase 7: Command Workflow and Commissioning

**State machine**
```
REQUESTED
  → validate (auth, role, tag allowlist, operating conditions, interlocks)
      ├─ fail → REJECTED_VALIDATION → audit
      └─ pass → SENT_TO_PLC
            ├─ PLC rejects → PLC_REJECTED → audit
            └─ PLC accepts → PLC_ACCEPTED
                  ├─ feedback within timeout → FEEDBACK_CONFIRMED → audit
                  └─ no feedback → FEEDBACK_TIMEOUT (alarm) → audit
```

**Rules**
- A button click never changes the UI equipment state. Only **feedback tags** do.
- Only allowlisted tags are writable; each has role requirement, valid range, and operating-condition check.
- Confirmation dialog for critical commands; optional two-step for high-risk ones.
- Every command logs: user, time, requested value, tag, result, final feedback.
- Enable first in Virtual mode; real-mode commands need written approval and a commissioning test plan (FAT/SAT).

**Exit criteria:** full command lifecycle visible in Command History tab; negative tests (wrong role, bad range, interlock active, PLC offline) all rejected correctly.

---

## 6. API and WebSocket Contract (initial)

| Endpoint | Purpose |
|----------|---------|
| `POST /auth/login` | JWT login |
| `GET /plants/{id}/config` | Plant, equipment, tags |
| `GET /io/channels` | I/O channel definitions + state |
| `GET /panel/components` | Control Panel layout |
| `GET /panel/signal-paths/{equipmentId}` | Signal path for tracing |
| `GET /telemetry/history?tag=&from=&to=` | Trend data |
| `GET /alarms?state=active` | Alarms |
| `POST /commands` | Submit command |
| `GET /commands/{id}` | Command status |
| `GET /audit` | Audit log (engineer/admin) |
| `WS /ws/telemetry` | Live tag deltas, alarms, command updates, connection health |

WebSocket message envelope:
```json
{ "type": "tag_update", "ts": "...", "data": [{ "tagId": "TK101.LEVEL", "value": 3.42, "quality": "GOOD", "sourceTimestamp": "..." }] }
```

---

## 7. Alarm Design

- Alarm states: `ACTIVE_UNACK`, `ACTIVE_ACK`, `RTN_UNACK` (returned to normal), `CLEARED`.
- Priorities: Critical / High / Medium / Low.
- Alarm sources: process limits (L, LL, H, HH), equipment (trip, feedback mismatch), instrument (bad quality, wire break, out of range), system (PLC comms lost, stale data).
- Deadband and on-delay to avoid chattering.
- Top status bar shows **critical active alarm count**.
- All alarm transitions are logged as events.

---

## 8. Live Operations Screen Specification

| Region | Content |
|--------|---------|
| **A. Top status bar** | Plant + process, mode (REAL / VIRTUAL), PLC connection, last sensor update, critical alarm count, operator |
| **B. Process mimic (largest)** | Animated tank, level (m and %), inlet/outlet flow, pump state (running / stopped / tripped), valve state, flow direction, pressure, sensor status |
| **C. Right panel** | Active alarms, pump/valve status, PLC health, key sensor values, recent events |
| **D. Bottom tabs** | Trends · Equipment details · Sensor diagnostics · Alarm history · Command history |

**Visual standards**
- Consistent state colours: running, stopped, tripped/fault, open, closed, stale/bad data. Colour is never the only indicator (add icon/text).
- Alarm colours reserved for alarms only.
- Stale or bad-quality values are greyed with a quality icon.
- Mode banner is always visible: `VIRTUAL PLC · SIMULATION` or `REAL PLC · READ-ONLY`.

---

## 9. Control Panel Module Specification

### 9.1 Design reference
Use the two supplied images as **layout and styling references**, not as final content:

- **Image 1 (Siemens reference cabinet):** front door view (pilot lights, HMI, E-stop, selector switches) plus internal view with numbered component callouts. Use this as the model for the **callout-style Cabinet Overview** (numbered markers linking to a legend).
- **Image 2 (real S7 panel):** shows the realistic zoning that the Cabinet Overview should mimic.

### 9.2 Zones suggested by the real panel photo (Image 2)

| Zone | Contents seen |
|------|---------------|
| Z1 Top row: protection | Row of MCBs (F1–F8) and motor protection breakers |
| Z2 Second row: switching/safety | Contactors (K9–K16) and safety relays (yellow) |
| Z3 Controller row | Modular PLC CPU with I/O modules (A1–A7), compact PLC, 24 V PSU, interface relays, small breakers, drive |
| Z4 Bottom: field wiring | Terminal block rows (field cable landing) |
| Z5 Side duct | Interface relays, wire duct |
| Z6 Door (front, Image 1) | Pilot lights, HMI, E-stop, selector switches |

Final zone content must follow the **real project drawing**, not these photos.

### 9.3 Three views

**View 1: Cabinet Overview**
- SVG/Canvas layout with DIN-rail rows, to scale relative to each other.
- Components rendered with recognisable shapes and **live LED state** (RUN, ERR, channel LEDs driven by I/O state).
- Click component → side drawer: ID, type, tag(s), channels, current state, verified badge.
- Toggle: *Door closed (front)* / *Door open (internal)*, following Image 1.
- Numbered callout mode with legend.

**View 2: Wiring Diagram**
- Schematic layout: field device → cable → terminal → I/O channel → PLC tag → (relay → contactor → actuator for outputs).
- Wire numbers, terminal IDs, signal type (4–20 mA, 24 VDC), cable ID.
- Click any node → highlight entire path, dim everything else, show tag and live value.
- Unverified wiring displays `SIMULATED` watermark.

**View 3: I/O Monitoring**
- Table + module grid: every AI/DI/AO/DO channel with raw value, engineering value, state, quality, forced/fault flags, linked tag, terminal.
- Filters: module, type, faulted only, unverified only.
- Live updates from telemetry socket.

### 9.4 Signal-path tracing (reference example)

```
Level transmitter LT-101
  → Field cable
  → Terminal block X1:xx
  → PLC AI channel (module Ax, ch n)
  → Tag TK101.LEVEL
  → PLC Gateway
  → Live Operations tank
```
Implemented from `SignalPath` records; the same records feed the highlight logic in both the wiring view and the Live Operations detail drawer (click tank → "View signal path").

### 9.5 Component library (`components/control-panel/`)
`Isolator, Mcb, MotorProtector, Psu24V, PlcCpu, IoModule, RelayBank, Contactor, SafetyRelay, TerminalStrip, EthernetSwitch, EarthBar, Drive, HmiPanel, EstopButton, PilotLight, WireLine, CabinetCanvas`

---

## 10. Security and Safety

- Browser connects only to AquaTwin backend; never to the PLC.
- HTTPS/WSS everywhere; JWT with short expiry; RBAC on every endpoint.
- Gateway is the only host allowed to reach the PLC network (firewall rule).
- PLC network segmented from IT; no inbound internet path.
- OPC UA: use signed/encrypted security policy and certificates where supported; avoid anonymous access.
- Secrets in environment/secret store, not in repo.
- Immutable audit log (append-only collection) for logins, config changes, commands.
- Hardwired safety (E-stop, safety relays, motor protection) remains independent and is **displayed, never controlled** by AquaTwin.
- Read-only enforcement in gateway config, not only in UI.

---

## 11. Navigation Structure

```
AQUATWIN OPERATIONS
 ├─ Live Operations   (landing page)
 ├─ Control Panel
 ├─ Digital Twin
 ├─ Equipment Management
 ├─ Alarms & Events
 ├─ Water Quality
 ├─ Maintenance
 ├─ Energy Performance
 ├─ Reports & Analytics
 └─ Settings & Audit
```
Plant Summary (ex-Dashboard) is reached from the plant selector or secondary navigation.

---

## 12. Target Repository Structure

```
src/
├── types/            plant.ts  plc.ts  io.ts  commands.ts
├── context/          PlantContext.tsx  RuntimeModeContext.tsx
├── services/         apiClient.ts  telemetrySocket.ts  plcConnectionService.ts  commandService.ts
├── components/
│   ├── layout/
│   ├── process/          Tank, Pump, Valve, Pipe, FlowArrow
│   ├── control-panel/    (see 9.5)
│   └── shared/           StatusBadge, QualityIcon, ModeBanner, SimulatedBadge
└── modules/
    ├── LiveOperations/  ControlPanel/  DigitalTwin/  Dashboard/(Plant Summary)
    ├── EquipmentManagement/  AlarmsEvents/  Maintenance/  WaterQuality/
    └── EnergyPerformance/  ReportsAnalytics/  SettingsAudit/

backend/
├── auth/
├── plc-gateway/
│   ├── adapters/ virtual-plc/ opc-ua/ modbus-tcp/
│   ├── tag-manager/  io-manager/  connection-monitor/
├── telemetry/  commands/  alarms/  audit/  api/
└── tests/
```

---

## 13. Testing Strategy

| Level | What |
|-------|------|
| Unit | Scaling (4–20 mA → engineering), interlock logic, alarm deadband, command state machine |
| Simulation | Scripted scenarios: fill/drain cycle, pump trip, sensor wire break, comms loss |
| Contract | Every adapter passes the same `PlcAdapter` test suite |
| Integration | Backend ↔ gateway ↔ virtual PLC ↔ WebSocket ↔ UI |
| UI | Component tests for process mimic states; Playwright e2e for Live Operations and signal-path tracing |
| Protocol | OPC UA / Modbus test server before real hardware |
| Site | Tag-by-tag verification, comms-failure tests, read-only enforcement test |
| Command | Positive and negative tests per writable tag (Phase 7) |

---

## 14. Information Needed from the Controls Engineer

1. PLC manufacturer, model, firmware version.
2. CPU and communication module (OPC UA / Modbus capability and licences).
3. I/O module types and channel counts.
4. Approved tag list with addresses / node IDs / data types.
5. Electrical panel wiring diagrams (including terminal numbers, cable and wire IDs).
6. P&ID and process flow diagram.
7. Sensor and actuator datasheets (ranges, signal types).
8. Relay, contactor and motor-starter arrangement.
9. Network topology and allowed protocols/IPs.
10. Control logic, permissives, interlocks and alarm setpoints.
11. Legend for the numbered callouts in the reference cabinet image (if that cabinet is the intended model).

Until received, all wiring/addresses stay marked **SIMULATED / UNVERIFIED**.

---

## 15. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Real PLC differs from assumed (e.g. no OPC UA) | Adapter interface; Modbus fallback; confirm early (Phase 0) |
| Fake-looking panel content mistaken for real | Mandatory `SIMULATED` badges and verified flag |
| Scope creep across 10 modules | Milestone 1 limited to Live Operations, Virtual PLC, Control Panel |
| UI/state coupling remains in `PlantContext` | Remove simulation in Phase 3; code review checklist |
| Unsafe remote control | Read-only default, gateway-enforced, Phase 7 gated by sign-off |
| Telemetry volume | Delta updates, throttled UI render, downsampled history |
| Time-sync / timestamp issues | Store both source and server timestamps; NTP on gateway |

---

## 16. Milestones and Definition of Done

### Milestone 1: Convincing software-based industrial system (Phases 0–4)
- [ ] Live Operations landing page with working tank simulation.
- [ ] Virtual PLC with I/O model, pump/valve logic and feedback.
- [ ] Alarms and fault injection working.
- [ ] Backend telemetry over WebSocket; frontend has no simulation code.
- [ ] Control Panel: Cabinet Overview, Wiring Diagram, I/O Monitoring, signal-path tracing.
- [ ] Visible REAL / VIRTUAL mode distinction and `SIMULATED` badges.

### Milestone 2: Hardware-ready (Phase 5)
- [ ] OPC UA and/or Modbus adapter verified against protocol simulator.
- [ ] Mode switch changes adapter only; UI unchanged.

### Milestone 3: Real PLC, read-only (Phase 6)
- [ ] Verified tag map signed off; parallel-run comparison passed.

### Milestone 4: Controlled commands (Phase 7)
- [ ] Command lifecycle, audit trail and negative tests passed; written approval obtained.

---

## 17. First Sprint Backlog (suggested, 2 weeks)

1. Create folder structure and `types/*` with sample plant JSON.
2. Add `RuntimeModeContext`, `ModeBanner`, `SimulatedBadge`.
3. Implement new sidebar and route Live Operations as landing page.
4. Build `Tank`, `Pump`, `Valve`, `Pipe`, `FlowArrow` driven by `TagValue` fixtures.
5. Build Live Operations layout (regions A–D) with right panel and bottom tabs (placeholders OK).
6. Spin up FastAPI skeleton with `/ws/telemetry` emitting fixture data.
7. Implement first Virtual PLC scan cycle: one tank, one inlet pump, one outlet valve, level transmitter.
8. Wire `telemetrySocket.ts` → `PlantContext` → Live Operations.
9. Write unit tests for scaling and the fill/stop logic.
10. Send the hardware checklist (section 14) to the controls engineer.

**Sprint demo:** tank fills and drains automatically through Virtual PLC logic; the operator sees pump/valve feedback and a high-level alarm, all via the same tag interface a real PLC will use.
