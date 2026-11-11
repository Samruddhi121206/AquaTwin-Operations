# AquaTwin Input/Output Module: Detailed Implementation Plan

**Target:** a PLC engineering and monitoring workspace inside the single *Input/Output* section
**Target PLC (current evidence):** Mitsubishi (exact CPU **not yet identified**)
**Date of library research:** 12 Nov 2026 (versions and status below were checked then; re-check at install)

---

## 0. Executive Summary

### What we are building
One Input/Output module with five working areas: **PLC Setup, Hardware & I/O, Live Monitor, PLC Terminal, Connection & Diagnostics.** The I/O configuration is saved as the plant's real tag configuration, and the Plant module reads the same tags whether the source is a Virtual PLC or a physical PLC.

### Decisions

| Decision | Choice | Reason (short) |
|----------|--------|----------------|
| Backend language | **Python 3.12 + FastAPI** (single backend and PLC gateway) | The best-maintained Mitsubishi SLMP libraries are Python; Node options are immature (see §2). Also matches the earlier AquaTwin architecture and your simulation work. |
| Mitsubishi driver (primary) | **`slmp-connect-python`** (SLMP binary 3E/4E) | Per-family profiles (iQ-F, iQ-R, iQ-L, Q, L); iQ-F/iQ-R documented as live-validated; typed read/write and polling helpers; MIT licence. |
| Mitsubishi driver (cross-check) | **`pymcprotocol`** (MIT) | Older, widely used MC protocol 3E client; used to independently verify readings during commissioning. |
| OPC UA | **`asyncua`** (opcua-asyncio) | Async client/server, subscriptions, certificates, same Python process; also gives us a simulator server. |
| Modbus TCP | **`pymodbus`** | Most-used Python Modbus stack, actively released. |
| Software PLC / simulator | **Built-in Virtual PLC driver** (own code) + **OpenPLC Runtime** (optional) + **`slmp` conformance simulator** (for SLMP tests) | Three levels of testing before touching hardware. |
| Live updates | **WebSocket** (FastAPI native) | Telemetry, terminal, status, command results. |
| Database | **MongoDB** (time-series collection for telemetry) | As already planned. |
| Frontend | **React + TypeScript** (existing) | Add a virtualised log view for the terminal and a lightweight chart library. |
| Engineering config | **GX Works3 / GX Works2** (Mitsubishi) | AquaTwin does **not** replace PLC engineering software. |

### Hard gate before writing the real driver
**Identify the exact PLC CPU, communication module, firmware and enabled protocols (Section 14).** Library choice, frame type, address notation and OPC UA availability all depend on it. Everything before that gate is built against the Virtual PLC and simulators.

---

## 1. Scope and Distinctions

| Capability | In scope? | Notes |
|-----------|-----------|-------|
| PLC **simulator** (software behaviour) | Yes | Virtual PLC driver, OpenPLC, protocol simulators |
| PLC **runtime connection** (read/monitor, later controlled writes) | Yes | SLMP / OPC UA / Modbus TCP drivers |
| PLC **engineering configuration** (CPU parameters, modules, program) | **No** (not universal) | Done in GX Works3/2. AquaTwin can *import/enter* the resulting I/O map. |
| Universal auto-configuration of any PLC | **No** | No such API exists; do not promise it |

**Tag states** (carried through UI and DB):
- `CONFIGURED`: user entered a tag and address.
- `VERIFIED`: a real read (or approved write) succeeded and was cross-checked.
- `UNAVAILABLE`: CPU/module/protocol does not support it.
- `DISABLED`: kept in config but not polled.

Never invent hardware addresses. Anything not matched to drawings or a successful read stays `CONFIGURED` and shows a badge.

---

## 2. Library Evaluation (the "best fit" analysis)

### 2.1 Mitsubishi SLMP / MC protocol

| Library | Language | Evidence found | Verdict |
|---------|----------|----------------|---------|
| **slmp-connect-python** | Python 3.10+, async | Binary **3E and 4E**; `plc_family` selects frame type and address rules; iQ-F (3E), iQ-R (4E), iQ-L (4E, validated on L16HCPU) listed as live-validated; Q/L/QnU retained profiles; MX-F/MX-R pending validation; typed helpers (`read_typed`, `read_named`, `poll`, chunked word reads); MIT | **Primary choice** |
| **aslmp** | Python 3.11+, async | Apache-2.0; profiles for iQ-F, iQ-R, Q, L; its author states the evidence base is one **FX5U-32MT/DS, firmware 1.065**, binary 3E and 4E over TCP/UDP; ships a conformance simulator | **Strong second option / test aid.** Very honest about coverage; evaluate its simulator |
| **pymcprotocol** | Python | Type 3E (tested on Q series), 4E implemented but untested, series: Q, L, QnA, iQ-L, iQ-R; MIT; a MicroPython fork reports testing 3E on FX5U | **Cross-check tool**; no explicit iQ-F profile |
| **plcpeople/mcprotocol** | Node.js | Documented tested hardware limited mainly to FX3U with A-compatible 1E frames; repo warns wrong addresses can write to wrong locations | Reference only |
| **raydotac/mcprotocol** | Node.js / TS | Claims iQ-R, Q, iQ-L, L, QnA with 3E/4E; repo shows only 3 commits and no releases | **Not recommended** for a production plant |
| **MX Component** | Windows COM library (Mitsubishi) | Manufacturer-supported; needs Windows and a bridge service | Fallback only if SLMP drivers fail on the real CPU |

**Why this drives the backend decision:** the Mitsubishi driver is the highest-risk component. The only libraries with explicit per-family profiles and documented live validation on iQ-F/iQ-R are Python. Choosing Node would mean either an unproven Node driver or a Python sidecar anyway. A single Python backend is simpler.

> Caveat: "live-validated" is the library authors' own claim. We still verify against our PLC (Section 12).

### 2.2 OPC UA

| Library | Evidence | Verdict |
|---------|----------|---------|
| **asyncua** (Python) | Version 2.1.0 on PyPI; async client + server; subscriptions, certificates, encryption, user/password; reported tested against Kepware, Beckhoff, WinCC, B&R and others | **Chosen** (same process as backend) |
| **node-opcua** (Node) | Very active: frequent releases through mid-2026 (2.175.x), healthy maintenance. One published 2026 advisory: socket leak during automatic reconnection when server/client clock skew exists (seen in 2.169.0) | Good library; only choose if you standardise on Node. **If used, pin versions and test reconnection under clock skew.** |

OPC UA on Mitsubishi requires an OPC UA server module or gateway (e.g. RD81OPC96 for iQ-R, FX5-OPC for certain iQ-F CPUs). It is not available on every PLC. Do not buy hardware until the CPU is identified.

### 2.3 Modbus TCP
**`pymodbus`** (BSD-3). Latest seen: 3.13.x/3.14 line, about 1.7 million downloads in 30 days. Use only if Modbus TCP is enabled on the Mitsubishi PLC.

### 2.4 Other vendors (Phase 5, verify before committing)
| Vendor | Candidate | Status |
|--------|-----------|--------|
| Siemens S7 | `python-snap7` | Not verified in this research; check CPU access settings |
| Rockwell | `pycomm3` | Not verified in this research |
| Schneider / WAGO | `pymodbus` / `asyncua` | Per exact model |

### 2.5 Frontend support libraries
| Need | Choice | Note |
|------|--------|------|
| Terminal log list | Custom component + virtualisation (e.g. `react-virtuoso`) | Needs filter, pause, export; an `xterm.js` emulator is not required because this is not a shell |
| Live trends | `uPlot` (fast) or `recharts` (already in many React apps) | uPlot for high-frequency, recharts for simplicity |
| State/cache | `zustand` + WebSocket store | Small, no boilerplate |
| Forms/validation | `react-hook-form` + `zod` | Schema shared with API contract |

*Versions: pin at install after checking release dates; avoid releases younger than about 2 weeks.*

---

## 3. Architecture

```
React frontend (Input/Output workspace + Plant module)
        │  REST (config) + WebSocket (telemetry / terminal / status)
FastAPI backend
 ├─ auth, RBAC, audit
 ├─ config services (catalogue, devices, modules, channels, tags)
 ├─ PLC manager  ── polls/subscribes, quality, timestamps, reconnect
 ├─ terminal service (ring buffer + broadcast)
 ├─ telemetry service (history writer)
 └─ command service (disabled until Phase 4)
        │  common PlcDriver interface
 ┌───────────────┬──────────────────┬──────────────────┬────────────┐
 │ VirtualPlc    │ MitsubishiSlmp   │ OpcUa (asyncua)  │ ModbusTcp  │
 └───────────────┴──────────────────┴──────────────────┴────────────┘
        │
 MongoDB            PLC hardware / field devices
```

**Rules**
- The browser never talks to the PLC.
- Plant module consumes **tags only**; it does not know the driver.
- Read-only is enforced in the driver layer and the command service, not only in the UI.
- Safety interlocks, E-stops and motor protection remain in the PLC or hardwired circuits.

### Repository layout
```
backend/
├── app/
│   ├── main.py
│   ├── core/            config.py  security.py  logging.py  secrets.py
│   ├── models/          (Pydantic) catalogue.py device.py module.py channel.py tag.py telemetry.py event.py command.py
│   ├── plc/
│   │   ├── base.py                  # PlcDriver protocol
│   │   ├── manager.py               # lifecycle, polling groups, reconnect
│   │   ├── quality.py               # GOOD/BAD/UNCERTAIN/STALE rules
│   │   ├── scaling.py               # raw -> engineering conversion
│   │   ├── drivers/
│   │   │   ├── virtual/             # virtual_plc.py  process_model.py  logic.py
│   │   │   ├── mitsubishi/          # slmp_driver.py  address_mapper.py  device_ranges.py  diagnostics.py
│   │   │   ├── opcua/               # opcua_driver.py
│   │   │   └── modbus/              # modbus_driver.py
│   │   └── catalogue/               # seed JSON per family (verified-from-manual fields only)
│   ├── services/        telemetry_service.py  terminal_service.py  command_service.py  audit_service.py
│   ├── api/             plc_routes.py  io_routes.py  terminal_routes.py  auth_routes.py
│   └── ws/              gateway.py
├── tests/               unit/  contract/  integration/  hardware/
└── pyproject.toml

frontend/src/modules/InputOutput/
├── index.tsx
├── tabs/  PlcSetup/  HardwareIO/  LiveMonitor/  PlcTerminal/  Diagnostics/
├── components/  ModulePicker  ChannelTable  TagEditor  ScalingEditor  QualityBadge  ConnectionBadge  TerminalLine
├── store/       ioStore.ts  terminalStore.ts  connectionStore.ts
└── api/         ioApi.ts  plcApi.ts  socket.ts
```

---

## 4. Data Model (MongoDB collections)

### 4.1 `plc_models` (catalogue, seeded from manuals only)
```json
{
  "_id": "mitsubishi.iq-f.fx5u-32mt-ds",
  "manufacturer": "Mitsubishi Electric",
  "family": "iQ-F",
  "cpu": "FX5U-32MT/DS",
  "protocols": [
    { "type": "SLMP", "frame": ["3E"], "libraryProfile": "iq-f", "notes": "Binary; port set in GX Works3" },
    { "type": "MODBUS_TCP", "enabledByDefault": false },
    { "type": "OPC_UA", "requires": "FX5-OPC module (CPU/firmware dependent)" }
  ],
  "builtInIo": { "DI": 16, "DO": 16 },
  "supportedModules": ["FX5-8AD", "..."],
  "sourceDocs": ["<manual title / rev / page>"],
  "verified": false
}
```
*Example only. Real values come from Mitsubishi manuals; `sourceDocs` is mandatory for every catalogue entry.*

### 4.2 `plc_devices`
```json
{
  "_id": "PLC-01", "plantId": "...", "modelId": "...",
  "protocol": "SLMP", "host": "192.168.x.x", "port": 0,
  "frame": "3E", "profile": "iq-f", "firmware": "",
  "mode": "READ_ONLY",
  "pollIntervalMs": 500, "timeoutMs": 2000,
  "secretRef": "vault://plc-01"
}
```
Credentials/certificates: only a `secretRef` is stored.

### 4.3 `io_modules`
`{ _id, deviceId, slot, type: "CPU|DI|DO|AI|AO|COMM", model, channelCount, signalTypes[], ranges[], addressBase }`

### 4.4 `io_channels`
`{ _id, moduleId, index, type: "DI|DO|AI|AO", signal: "24VDC|4-20mA|0-10V|RELAY", physicalLabel, terminal, enabled }`
Unique index on `(moduleId, index)` to prevent two signals on one channel.

### 4.5 `plc_tags`
```json
{
  "_id": "TK101_LEVEL", "name": "TK101_LEVEL", "description": "Tank 1 level",
  "deviceId": "PLC-01", "channelId": "AI0-module2-ch0",
  "type": "AI", "dataType": "float",
  "address": { "area": "D", "number": 100, "encoding": "word|dword|float32", "raw": "D100:F" },
  "signal": "4-20mA",
  "scaling": { "mode": "LINEAR", "rawMin": 0, "rawMax": 0, "engMin": 0, "engMax": 0, "unit": "%" },
  "limits": { "LL": null, "L": null, "H": null, "HH": null, "deadband": 0 },
  "status": "CONFIGURED",
  "access": "READ_ONLY",
  "lastVerified": null
}
```
(Scaling raw min/max come from the actual module/engineering configuration, not guesses.)

### 4.6 Other collections
| Collection | Content |
|-----------|---------|
| `telemetry` | MongoDB **time-series** collection: `{ts, tagId, value, raw, quality}` with retention/downsampling policy |
| `plc_events` | Connection events, diagnostics, tag-config changes |
| `plc_audit_logs` | Append-only user actions |
| `commands` | Phase 4 command lifecycle records |

---

## 5. Driver Layer

### 5.1 Common interface
```python
class PlcDriver(Protocol):
    async def connect(self) -> None: ...
    async def disconnect(self) -> None: ...
    async def status(self) -> PlcStatus: ...                 # RUN/STOP/ERROR where readable
    async def read(self, tags: list[Tag]) -> list[TagValue]: ...
    async def subscribe(self, tags, callback) -> Subscription: ...  # native or polling
    async def diagnostics(self) -> list[Diagnostic]: ...
    # Writes are NOT on the public interface. They exist only behind CommandService (Phase 4).
```

### 5.2 Mitsubishi SLMP driver (`slmp-connect-python`)

**Responsibilities**
1. Build `SlmpConnectionOptions(host, port, plc_family=…)` from the device record.
2. **Address mapper:** convert stored tag address to library address.
   - On **iQ-F/FX5** the `X`/`Y` device numbers are **octal** (e.g. `X100` = 0x40). On iQ-R and most other families they are **hexadecimal**. The mapper must follow the selected profile and have unit tests for both.
   - Support device areas actually needed: `X, Y, M, D, W, R, ZR…` as allowed by the CPU's device ranges (store allowed ranges per model in `device_ranges.py`).
3. **Batch reads:** group tags by area and contiguous addresses; use chunked word reads; avoid one request per tag.
4. **Typed decoding:** `U` (unsigned 16), `S`, `L` (32-bit), `F` (float32) per tag; make word/dword order explicit in config.
5. **Status/diagnostics:** read CPU model/type and run state if supported; map to `PlcStatus`.
6. **Error mapping:** timeout, connection refused, end-code errors (device out of range, request not allowed) → `Diagnostic` with human text and terminal line.
7. **Read-only guard:** the driver object exposes no write method to the manager; a separate `SlmpWriter` is only created by `CommandService` when mode permits.

**Known configuration facts to design around**
- On iQ-F, the **Communication Data Code (Binary/ASCII)** is a port-wide Ethernet setting in GX Works3. Switching to ASCII breaks all binary connections on that CPU. We use **binary**.
- The SLMP **port number and allowed connections** are configured in GX Works3 *Module Parameter → Ethernet Port*; do not hard-code a default port. Treat any port number from blog posts as unverified.
- Frame type follows the family: library maps iQ-F → 3E, iQ-R/iQ-L → 4E. If the real PLC rejects it, record the finding and adjust the profile.

### 5.3 OPC UA driver (`asyncua`)
- Only enabled if the PLC/gateway has an OPC UA server.
- Map each tag to a **NodeId** (stored in `address.raw`).
- Use **monitored-item subscriptions**; fall back to polling if refused.
- Security: signed/encrypted policy plus certificate trust list; username/password via secret store; no anonymous access on plant networks.
- Reconnect with backoff; clock-skew test (see node-opcua advisory as a reminder that reconnect logic needs explicit tests whichever library is used).

### 5.4 Modbus TCP driver (`pymodbus`)
- Register map per tag (coil, discrete input, input register, holding register).
- Word/byte order configurable per tag; group contiguous reads; polling interval configurable.
- Only if Modbus TCP is enabled on the PLC.

### 5.5 Virtual PLC driver
- Implements the same `PlcDriver` interface and exposes the same tag names.
- Contains a scan-cycle engine (inputs → scaling → logic → outputs → actuator model → feedback), tank/pump/valve physics, fault injection (wire break, pump trip, stuck valve, comms loss, noise).
- Reads the **same `plc_tags` config**, so a user-defined tag works in Virtual mode with no code changes.
- Can optionally **serve** its tag values via an `asyncua` server and/or SLMP simulator so the real drivers can be exercised end to end.

---

## 6. Polling, Quality and Timestamps

| Concern | Design |
|---------|--------|
| Poll groups | Fast (250–500 ms) for process values, slow (2–5 s) for diagnostics; configurable per tag |
| Timestamps | `sourceTimestamp` (from PLC/OPC UA when available) and `serverTimestamp` (backend receive time). SLMP has no source time, so mark source = server time |
| Quality | `GOOD`, `UNCERTAIN` (out of range / under-range), `BAD` (read error, wire break), `STALE` (no update within 3× poll interval), `SIMULATED` |
| Reconnect | Exponential backoff (1 s → 30 s cap) with jitter; connection state machine `DISCONNECTED → CONNECTING → CONNECTED → DEGRADED → ERROR` |
| Backpressure | Publish **changes only** (deadband) to WebSocket; coalesce bursts to ≤ 4 Hz for UI |
| History | Write on change + periodic heartbeat sample; downsample after retention window |

### Scaling engine
Linear 4–20 mA:
```
PV = (I − 4) / (20 − 4) × (PVmax − PVmin) + PVmin
```
For module raw counts: `PV = (raw − rawMin) / (rawMax − rawMin) × (engMax − engMin) + engMin`, with `rawMin/rawMax` taken from the actual module's data sheet/engineering configuration (do not assume).
Fault detection: configurable under-range/over-range thresholds (e.g. current below ~3.6 mA flagged `BAD: wire break`; value to be confirmed against the transmitter/module specification).

---

## 7. PLC Terminal Design

### 7.1 Message types
`CONNECTION`, `VALUE`, `OUTPUT` (Phase 4), `DIAGNOSTIC`, `SYSTEM`; each has `ts, level (INFO/WARN/ERROR), source, tagId?, text, data{}`.

### 7.2 Behaviour
- Bottom dock, expandable to full screen.
- Controls: pause stream, auto-scroll, clear (view only), export (TXT/CSV/JSON), filter by type/tag/level, text search.
- Backend keeps a **ring buffer** (e.g. last 5,000 lines per device) and persists important events (`plc_events`).
- Throttle `VALUE` lines (only on change or every N seconds) to avoid flooding.
- Header shows device, protocol, connection state, mode (`READ ONLY` / `VIRTUAL`).

### 7.3 Command grammar (Phase 1–3: read-only)
```
help
status
list-tags [type]
read <TAG>
read-all
history <TAG> [minutes]
diagnostics
```
- Parser is a fixed grammar mapped to backend services. **No raw text goes to the PLC.**
- Phase 4 adds `request <TAG> <value>`: creates a `Command` and goes through the full command pipeline (§10).
- Every typed command is itself logged and audited.

---

## 8. API and WebSocket Contract

### REST
| Endpoint | Purpose |
|----------|---------|
| `GET /api/plc/models` | Catalogue |
| `POST /api/plc/devices` / `PUT /api/plc/devices/{id}` | Create/update device config |
| `POST /api/plc/devices/{id}/test` | Test connection (reports success/timeout/auth/unsupported) |
| `POST /api/plc/devices/{id}/connect` / `disconnect` | Lifecycle |
| `GET /api/plc/devices/{id}/status` | Status |
| `GET/POST /api/io/modules` | Hardware modules |
| `GET/POST /api/io/channels`, `PUT /api/io/channels/{id}` | Channels |
| `GET/POST /api/io/tags`, `PUT/DELETE /api/io/tags/{id}` | Tags |
| `POST /api/io/tags/{id}/verify` | One-shot verification read |
| `POST /api/io/tags/import` / `GET /api/io/tags/export` | CSV/JSON tag list |
| `GET /api/telemetry/history` | Trends |
| `GET /api/plc/terminal/history` | Terminal history |
| `POST /api/plc/terminal/command` | Terminal command (read-only grammar) |
| `GET /api/plc/diagnostics` | Diagnostics |

### WebSocket `/ws/plc`
Events: `plc:status`, `plc:telemetry`, `plc:diagnostic`, `plc:terminal`, `plc:command-result`.
```json
{ "type": "plc:telemetry", "deviceId": "PLC-01",
  "data": [{ "tagId": "TK101_LEVEL", "value": 65.2, "raw": 16384, "quality": "GOOD",
             "sourceTs": "…", "serverTs": "…" }] }
```

---

## 9. Frontend: Screens and Behaviour

### 9.1 PLC Setup
- Manufacturer → family → exact CPU (from catalogue), firmware, protocol, IP, port, frame/profile, rack/slot where needed, security.
- Warnings when the selected protocol is not listed as supported for the CPU (`UNAVAILABLE`).
- **Test Communication** button with a clear result panel.

### 9.2 Hardware & I/O
- Module rack view: add CPU/DI/DO/AI/AO/COMM modules from supported list.
- Channel table (Channel · Tag · Type · Signal · Device · Address · Status · Live value).
- Tag editor drawer: scaling, units, limits, normal state, alarm meaning, device assignment.
- Validation: one tag per channel; type/signal compatibility (e.g. no analog tag on a DI channel); address in allowed device range; duplicate tag names blocked.
- Import/export tag list (CSV/JSON).

### 9.3 Live Monitor
- Separate DI/DO and AI/AO tables with value, raw, quality icon, last update age.
- Outputs show **command vs feedback** columns (feedback only if mapped).
- Mini-trend per analog tag; filters (faulted, stale, unverified).

### 9.4 PLC Terminal
As §7.

### 9.5 Connection & Diagnostics
- State machine view, latency, last good read, error counters, PLC run state, module health where readable, driver/library versions, "export diagnostic bundle".

### 9.6 Persistent banner
`VIRTUAL PLC · SIMULATION` or `REAL PLC · READ-ONLY`; unverified tags carry a `CONFIGURED` badge.

---

## 10. Output / Command Pipeline (Phase 4 only)

```
Operator request
  → authentication + role check
  → tag allow-list + value range check
  → operating-mode check (not READ_ONLY, not simulation-only)
  → interlock / permissive check (backend mirror of PLC logic)
  → send via dedicated writer
  → PLC acknowledgement (end code OK / rejected)
  → read back output + equipment feedback within timeout
  → terminal line + audit record (user, time, tag, value, result, feedback)
```
Rules:
- Default `access: READ_ONLY` for all tags; `WRITE_ALLOWED` is set per tag by an engineer.
- No generic write endpoint. No direct terminal write.
- Command ≠ proof of action: UI state changes only on **feedback** tags.
- Enable for a real PLC only after controls-engineer written approval and an approved commissioning test.
- Safety interlocks remain in PLC/hardwired logic.

---

## 11. Plant Module Integration
1. Plant objects (tank, pump, valve, sensors) store **tag IDs**, not values.
2. A binding table maps each plant object property to a tag: `Tank1.level → TK101_LEVEL`, `Pump1.runFeedback → P101_RUN_FB`.
3. Plant module subscribes to the same `/ws/plc` stream; quality `BAD/STALE` greys the object.
4. Switching Virtual → Real changes only the active driver for the device. Bindings remain.
5. Unbound tags show as warnings in the I/O Diagnostics tab.

---

## 12. Testing and Verification Strategy

| Level | Tooling | What is proven |
|-------|---------|----------------|
| Unit | pytest | Address mapper (octal X/Y vs hex), scaling, quality rules, grammar parser, validation |
| Contract | pytest | Every driver passes the same `PlcDriver` test suite |
| Simulated SLMP | `aslmp` conformance simulator (ships in its wheel) and/or custom simulator | Frame handling, errors, reconnect |
| Simulated OPC UA | `asyncua` demo server | Subscriptions, certificates, reconnect, clock skew |
| Software PLC | OpenPLC Runtime (Modbus TCP) | End-to-end tag flow with real PLC-style logic |
| Integration | docker-compose: backend + Mongo + simulators | WebSocket → UI |
| UI e2e | Playwright | Setup → map → monitor → terminal |
| **Hardware (read-only)** | Test PLC or approved isolated environment | See below |

### Hardware verification procedure (real PLC)
1. Authorised engineer confirms mode and approves read-only access.
2. Read a **known, harmless D register**; compare with GX Works value.
3. Read a known X input while engineer toggles it (approved test condition); compare.
4. Read an analog value; compare raw count and scaled value with GX Works monitor.
5. Unplug network / stop poll → confirm `STALE` → `BAD`, terminal messages, and clean recovery.
6. Record results in a signed **tag-by-tag verification sheet**; only then mark tags `VERIFIED`.
7. Cross-check same registers with `pymcprotocol` to detect driver-specific errors.
No experiments with unknown addresses on an operating plant.

---

## 13. Security

- Backend-only PLC access; PLC network segmented; only the backend host may reach the PLC IP (firewall rule). Where the PLC supports it, use the PLC's own allowed-IP/connection list.
- HTTPS/WSS, JWT with short expiry, RBAC (`viewer`, `operator`, `engineer`, `admin`).
- Secrets (passwords, certificates, private keys) in a secret store/env vault; MongoDB holds only references.
- Audit log is append-only; includes config changes, connect/disconnect, terminal commands, outputs.
- Rate-limit terminal commands and WebSocket subscriptions.
- Dependency pinning (lock file), release-age rule, and vulnerability scan (`pip-audit`) in CI.

---

## 14. Real-World Tasks: PLC Identification and Preparation

**Do these before the Mitsubishi driver phase. Have an authorised plant engineer do the inspection; do not open an energised cabinet just to take photos.**

| # | Task | Why it matters |
|---|------|----------------|
| 1 | Photograph CPU label (full model/order number) | Decides family, library profile, frame |
| 2 | Record series: FX / iQ-F / Q / L / iQ-R / iQ-L | Address notation (octal vs hex), frame |
| 3 | Record firmware (from GX Works) | Feature support |
| 4 | Photograph rack, expansion and communication modules | Build `io_modules` |
| 5 | Ethernet port / module model and current IP/subnet | Connectivity |
| 6 | Check in GX Works: **Module Parameter → Ethernet Port**: SLMP enabled? port? Binary vs ASCII? allowed IPs? | Without it the driver cannot connect |
| 7 | Check if OPC UA module/gateway or Modbus TCP is present/enabled | Alternative drivers |
| 8 | Obtain tag list, device (D/M/X/Y) map, I/O drawings and module datasheets | Real addresses and scaling |
| 9 | Confirm PLC run state and permission for read-only access | Safety/approval |
| 10 | Provide a test PLC or isolated test window | Hardware verification |

**Driver decision table (after CPU identified; candidates, not guarantees)**

| Finding | First driver to test |
|---------|----------------------|
| iQ-F (FX5U/FX5UC/FX5UJ/FX5S) | SLMP 3E (`plc_family=iq-f`); OPC UA only if FX5-OPC present |
| iQ-R | SLMP 4E (`iq-r`) or OPC UA if RD81OPC96 installed |
| iQ-L / L | SLMP (`iq-l` / `lcpu`) |
| Q | SLMP (`qcpu`), subject to Ethernet module |
| FX3 (older) | Model-specific; do not assume SLMP; may need adapter/module; consider `pymcprotocol` or Modbus per documentation |

---

## 15. Phased Implementation Plan

Estimates assume 1 full-stack developer; Phases 1 and 2 can overlap with two people.

### Phase 0: Foundations (3–4 days)
- [ ] Create FastAPI project, MongoDB connection, config/secrets handling, logging.
- [ ] Define Pydantic models and TS types from §4.
- [ ] Auth + RBAC skeleton.
- [ ] CI: lint, type-check, pytest, `pip-audit`.
- [ ] Start PLC identification (§14); send the checklist now.

**Exit:** backend boots, `/health` works, models validated.

### Phase 1: PLC Workspace (config only) (2 weeks)
- [ ] Catalogue seed (Mitsubishi families first, each entry with source doc).
- [ ] PLC Setup screen + device CRUD.
- [ ] Hardware & I/O: module picker, channel table, tag editor with validation.
- [ ] Import/export tags; persistent save to Mongo.
- [ ] Banner and tag-status badges.

**Exit:** a full I/O map can be created, saved, reloaded; invalid mappings rejected.

### Phase 2: Virtual PLC + Live Monitor + Terminal (2.5 weeks)
- [ ] `PlcDriver` interface, manager, quality, scaling.
- [ ] Virtual PLC driver reading the saved tag config.
- [ ] WebSocket `/ws/plc`; telemetry store; history writer.
- [ ] Live Monitor tab; PLC Terminal with read-only grammar, ring buffer, export.
- [ ] Plant module binding table → tank/pump mimic updates from tags.

**Exit:** change a tag mapping, see Plant module and terminal respond; fault injection works; unit/contract tests green.

### Phase 3: Protocol Rehearsal on Simulators (1.5 weeks)
- [ ] Mitsubishi SLMP driver with `slmp-connect-python`; address mapper (octal/hex tests); batch reads.
- [ ] Run against SLMP simulator; add `pymcprotocol` cross-check script.
- [ ] OPC UA driver (`asyncua`) against demo server incl. reconnect/clock-skew test.
- [ ] Modbus TCP driver (`pymodbus`) against OpenPLC.

**Exit:** the same tag config produces live values through each driver on simulators.

### Phase 4: Real PLC Read-Only (1–2 weeks, hardware dependent)
- [ ] Complete §14 identification; finalise profile (`iq-f`, `iq-r`, …).
- [ ] Connect to test PLC; follow §12 verification procedure.
- [ ] Diagnostics tab with real error mapping; failure/recovery tests.
- [ ] Sign tag-by-tag verification sheet; mark `VERIFIED`.

**Exit:** demonstrated live DI and AI data from a physical PLC with timestamps and quality; failures recover cleanly.

### Phase 5: History and Hardening (1 week)
- [ ] Trend views, retention/downsampling, audit viewer.
- [ ] Performance test (tag count × poll rate), WebSocket load test.
- [ ] Security review (network, secrets, RBAC).

### Phase 6: Controlled Outputs (2 weeks + site tests; only with approval)
- [ ] Command service, state machine, allow-list, interlock mirror.
- [ ] Writer module and feedback verification.
- [ ] Terminal `request` command via the same pipeline.
- [ ] Negative tests: wrong role, out-of-range, interlock active, PLC offline, no feedback.

**Exit:** engineer-approved commissioning test passed; full audit trail.

### Phase 7: Multi-vendor (later)
- [ ] Add Siemens (S7/OPC UA), Rockwell, Schneider, WAGO drivers after verifying libraries.
- [ ] Vendor project import where officially supported.

---

## 16. Acceptance Criteria for First Release

| Feature | Must work |
|---------|-----------|
| PLC selection | Select exact CPU from catalogue (with source references) |
| Hardware setup | Configure supported modules and channels |
| DI/AI mapping | Assign sensors, validation blocks conflicts |
| DO/AO mapping | Configure outputs (command vs feedback shown; writes disabled) |
| Virtual PLC | Live changing values driven by the saved tag config |
| Real PLC | At least one physical Mitsubishi PLC read through its verified protocol |
| Live monitor | Timestamped values with quality |
| Terminal | Connection, readings, errors, read-only commands, export |
| History | Stored and charted |
| Plant integration | Plant mimic driven by the same tags |
| Safety | **No uncontrolled physical output writes** |

A screen existing is not "done." The real PLC milestone is done only when data from the physical PLC is demonstrated and signed off.

---

## 17. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| CPU unidentified or SLMP not enabled | Phase 1–3 use simulators; §14 gate; GX Works settings change done by plant engineer |
| Library validated on different CPU than ours | Treat claims as unverified; hardware verification; `pymcprotocol` cross-check; fallback to MX Component bridge |
| Wrong address (octal vs hex, wrong area) reads/writes wrong data | Mapper unit tests; read-only default; engineer review of tag list; no writes until Phase 6 |
| OPC UA not available on PLC | Do not buy modules before identification; SLMP is primary |
| Reconnect or socket-leak bugs under real networks | Explicit reconnect/clock-skew tests; resource monitoring |
| Polling load slows PLC scan | Batch reads, sensible intervals, test with engineer watching scan time |
| Scope creep (multi-vendor) | One verified vendor first |
| Credential leakage | Secret store only; audit |
| Supply-chain issues | Lock files, pin versions, avoid releases newer than ~2 weeks, `pip-audit` |

---

## 18. Open Decisions Needed From You

1. Confirm **Python/FastAPI** as the single backend (recommended) or specify an existing Node backend constraint.
2. Exact Mitsubishi CPU model, communication module and firmware (§14).
3. Is a **test PLC or isolated test window** available?
4. Is MongoDB self-hosted or managed? (affects secrets and time-series retention)
5. Who is the responsible controls engineer for approving read-only access and, later, output tests?

---

## 19. First Two-Week Sprint (suggested)

1. FastAPI skeleton, Mongo, Pydantic models, auth skeleton.
2. Catalogue seed for 2–3 Mitsubishi families with source references.
3. PLC Setup screen and device CRUD.
4. Hardware & I/O channel table and tag editor with validation.
5. Virtual PLC driver reading the saved tags.
6. `/ws/plc` stream and Live Monitor tab.
7. Terminal ring buffer + `help/status/list-tags/read/read-all`.
8. Send §14 checklist to the plant engineer.

**Sprint demo:** create a tank-level and pump-feedback tag in the I/O workspace, watch live values in the monitor and terminal, and see the Plant tank and pump react to the same tags.
