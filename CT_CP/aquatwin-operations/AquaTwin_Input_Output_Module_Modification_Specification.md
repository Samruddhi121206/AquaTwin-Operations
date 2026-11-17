# AquaTwin Operations --- Input / Output Module Modification Specification

**Document purpose:** Replace the current PLC Overview-led screen with a
practical PLC engineering and runtime workspace that can connect to a
physical Mitsubishi PLC, acquire real input values, expose safe output
commands, and provide the live tag data consumed by the Plant module.

**Priority:** Complete and validate this module before modifying the
Plant module.

**Status:** Implementation specification. The exact PLC CPU, firmware,
rack, I/O modules, network settings, device addresses, and approved
control narrative must be confirmed from the physical installation
before enabling a real connection or outputs.

------------------------------------------------------------------------

## 1. The required outcome

The Input / Output module must become the working connection between
AquaTwin and the plant's PLC.

The desired end-to-end behaviour is:

``` text
PHYSICAL FIELD DEVICES
  Sensors / switches / transmitters / actuator feedback
                  |
                  v
       MITSUBISHI PLC I/O MODULES
                  |
                  v
        MITSUBISHI PLC CPU
                  |
          Ethernet / SLMP
                  |
                  v
       AQUATWIN PLC GATEWAY
       - Connect / reconnect
       - Read PLC devices
       - Decode and scale values
       - Validate quality and freshness
       - Enforce command allowlist
       - Audit every command
                  |
                  v
          SHARED TAG SERVICE
             /        \
            v          v
     INPUT / OUTPUT   PLANT MODULE
      Live I/O        Tank / pumps /
      Terminal        valves / process
      Diagnostics     mimic and status
```

For a command originating from AquaTwin:

``` text
Plant operator action
       |
       v
AquaTwin command request
       |
       v
Authentication + role check + interlocks + limits
       |
       v
PLC gateway writes ONLY an approved command tag
       |
       v
PLC ladder logic validates permissives and drives output
       |
       v
Physical output module / relay / actuator
       |
       v
Independent feedback input confirms the result
       |
       v
AquaTwin displays command state AND actual feedback
```

**Important:** The browser must never communicate directly with the PLC.
A backend service/gateway owns the PLC connection. The PLC remains
responsible for machine sequencing, interlocks, motor protection,
emergency stops and fail-safe behaviour.

## 2. Scope and non-goals

### In scope

-   Mitsubishi PLC connection, initially using Ethernet where the
    installed CPU supports it.
-   Virtual PLC mode for development and offline demonstration.
-   Real PLC mode with an honest connection state.
-   Hardware/rack and module configuration based on the actual installed
    hardware.
-   Digital input (DI), digital output (DO), analog input (AI) and
    analog output (AO) monitoring/mapping where those module types
    exist.
-   Tag/address mapping, scaling, units, quality and timestamps.
-   Live I/O monitoring with status changes.
-   An engineering-style PLC terminal/log window.
-   Connection diagnostics, scan/read statistics and communication
    errors.
-   Controlled, permissioned output commands after a formal
    commissioning gate.
-   One shared tag contract consumed by the Plant module.

### Not in scope for the first release

-   Replacing GX Works3 or Mitsubishi engineering software.
-   Uploading, editing, compiling or downloading arbitrary ladder
    programs from AquaTwin.
-   Arbitrary writes to any PLC memory address.
-   Bypassing PLC logic, forcing physical outputs, overriding safety
    interlocks or replacing the HMI.
-   Pretending an unconnected or simulated PLC is a real connected PLC.
-   Inventing the installed rack, module list, terminal layout, IP
    address, firmware or I/O addresses.

AquaTwin's Ladder Logic View can initially be a read-only representation
of approved logic/tag relationships or a placeholder explaining that
program upload is not supported. Do not build a fake ladder editor that
implies it can program the physical PLC.

------------------------------------------------------------------------

## 3. Change the current screen structure

The attached screenshot is the visual starting point. Keep the AquaTwin
shell, dark/navy header, restrained blue accents, engineering density
and hardware-rack visual. Change the information architecture and remove
the large, redundant overview dashboard.

### Remove / minimise

-   Remove **PLC Overview** as a full tab and as the default landing
    screen.
-   Do not show a large PLC Information card, generic KPI cards,
    repeated connection cards or a decorative hardware photo as the main
    content.
-   Do not show a made-up IP address, CPU model, firmware, scan time,
    slot count or "Connected" state.
-   Do not show a rack or module configuration as verified unless it is
    saved from a confirmed configuration or read from supported
    hardware.
-   Avoid multiple buttons that do the same thing, such as Refresh,
    Re-scan and Read PLC without distinct documented behaviours.

### New internal navigation

These remain tabs within the existing **Input / Output** main module;
they are not new top-level modules.

1.  **Hardware Configuration**
2.  **I/O Mapping**
3.  **Live I/O Monitor**
4.  **PLC Terminal**
5.  **Connection & Diagnostics**
6.  **Ladder Logic** --- read-only/limited until an approved program
    integration exists

Default landing tab: **Live I/O Monitor** when a PLC is configured;
otherwise **Hardware Configuration**.

A compact connection strip must remain visible on every tab:

-   Mode: `VIRTUAL PLC` or `REAL PLC`
-   Connection state: `SIMULATION`, `CONNECTED`, `DISCONNECTED`,
    `RECONNECTING`, `FAULT`
-   PLC identity: configured manufacturer / family / CPU, or
    `Not configured`
-   Protocol and endpoint, masked or restricted according to permissions
-   Last successful read / data age
-   Read cycle duration and communication quality
-   Safety/write state: `READ ONLY` by default; `COMMANDS ENABLED` only
    after authorisation

Do not present "Virtual PLC" as "Online". These are different states.

------------------------------------------------------------------------

## 4. Screen specifications

### 4.1 Hardware Configuration

Purpose: configure the actual PLC identity and the installed physical
rack.

**Layout**

-   Left: manufacturer/family and module catalogue.
-   Centre: realistic rack/chassis view with numbered slots and physical
    module proportions.
-   Right: selected CPU/module properties.
-   Bottom: configuration validation messages and a compact slot/I/O
    summary.

**Configuration workflow**

1.  Select manufacturer: Mitsubishi Electric.
2.  Select PLC family only after confirming it from the hardware label:
    for example MELSEC iQ-R, iQ-F, Q, L or FX. Do not default to iQ-R
    merely because an earlier mockup showed it.
3.  Select exact CPU model.
4.  Select base/rack model if applicable.
5.  Add the installed power supply and modules in the correct physical
    slots.
6.  Enter module model numbers and slot positions from the actual rack.
7.  Configure channel-level I/O mapping.
8.  Validate module compatibility, slot restrictions, channel count,
    signal types and address ranges against official Mitsubishi
    documentation.
9.  Save as a named configuration with revision, author, timestamp and
    source (`Manually verified`, `Imported`, or `Simulation template`).

**Module catalogue requirements**

-   Search by exact Mitsubishi part number.
-   Filter by category: power supply, CPU, DI, DO, AI, AO, temperature,
    communication, special/function module.
-   Display manufacturer part number, module type, channel count, signal
    type, electrical range, terminal/base requirements and
    source/reference.
-   Show compatibility only when supported by verified module
    compatibility data.
-   Allow a module to be added, removed or moved only in configuration
    mode.
-   Warn before a change that would invalidate existing channel
    mappings.

**Rack rendering**

The rack should look like a real industrial engineering configuration
tool, not a cartoon illustration. Use accurate front-panel images or
carefully constructed technical vector/CAD-style module faces. Do not
use one generic image for every module. The selected slot should be
highlighted. Empty slots must look empty. Show slot numbers, part
numbers, status LEDs and terminal areas only where the real module has
them.

**Critical accuracy rule:** A previous visual mockup showed an R08CPU,
R6B8 base, R61P, RX40C7, RY40NT5P, R60AD8 and R60DA8. Treat these as
example/mockup values only. Do not silently copy them into the live
plant configuration. Confirm the actual hardware labels and module
positions first.

### 4.2 I/O Mapping

Purpose: connect a physical field device to a PLC channel and to an
AquaTwin process tag.

Each mapping row must contain:

  -----------------------------------------------------------------------
  Field                               Meaning
  ----------------------------------- -----------------------------------
  Enabled                             Whether the mapping is active

  PLC module                          Actual part number and slot

  Channel                             Physical channel number

  I/O type                            DI / DO / AI / AO

  PLC device/address                  Verified PLC device or
                                      buffer/register mapping

  Tag                                 Unique AquaTwin tag name

  Field device                        Sensor, switch, relay, contactor
                                      feedback, valve, etc.

  Signal type                         24 VDC, dry contact, 4--20 mA,
                                      0--10 V, RTD, thermocouple, etc.

  Raw range                           Raw PLC/module range

  Engineering range                   Converted range, e.g. 0--100 % or
                                      0--10 bar

  Unit                                %, m³/h, bar, °C, pH, etc.

  Direction                           Read input / command output /
                                      feedback

  Quality                             Good / uncertain / bad / stale

  Notes                               Wiring drawing, terminal,
                                      calibration reference
  -----------------------------------------------------------------------

Features:

-   Add/edit/disable mappings.
-   Import/export CSV.
-   Validate duplicate addresses and duplicate tag names.
-   Validate module/channel compatibility.
-   Configure scaling and offset for analog signals.
-   Configure inversion/debounce only where appropriate and documented.
-   Configure read-only versus commandable tag.
-   Show the exact path:
    `Field Device → Terminal → Module/Slot/Channel → PLC Device → AquaTwin Tag`.
-   Keep command tags separate from feedback tags.
-   Every mapping change must be versioned and audited.

Example tags below are illustrative only, not verified site addresses:

  Example tag         Type         Meaning
  ------------------- ------------ ------------------------------
  `TK101_LEVEL_PCT`   AI           Tank level scaled to percent
  `FIT101_FLOW`       AI           Flow measurement
  `P101_RUN_FB`       DI           Pump run feedback
  `P101_TRIP_FB`      DI           Pump trip feedback
  `P101_START_REQ`    DO/command   Approved pump start request
  `XV101_OPEN_FB`     DI           Valve open limit feedback
  `XV101_OPEN_REQ`    DO/command   Approved valve open request

Never assume that the above addresses, channels, signal types or devices
exist at the plant.

### 4.3 Live I/O Monitor

This should be the primary working screen.

**Top compact toolbar**

-   Current mode and connection status.
-   Search tags.
-   Filter: All / DI / DO / AI / AO / Fault / Stale.
-   Pause display (pause UI rendering only; do not stop required PLC
    safety/control logic).
-   Export current view.
-   Last update and read cycle.

**Main table**

  Column       Behaviour
  ------------ ----------------------------------------------------------
  Status       Live indicator with Good / Stale / Fault
  Tag          Human-readable tag
  Type         DI / DO / AI / AO
  Address      Verified PLC address
  Channel      Module, slot and channel
  Live value   Actual value with unit
  Raw value    Raw PLC/module value, optionally expandable
  Quality      Good / uncertain / bad
  Timestamp    Last update time
  Source       Virtual / Real
  Action       Details; command control only for authorised output tags

Digital signals must display a clear ON/OFF state and optionally the
electrical state. Analog signals must show engineering value, unit, raw
value and configured range. Bad/stale values must not appear as healthy
green values.

**Detail drawer**

On selecting a tag, show:

-   Tag description and source.
-   Current value, raw value, unit and quality.
-   PLC device/address.
-   Module part number, slot and channel.
-   Scaling equation and configured range.
-   Last change time and last successful update.
-   Recent value history.
-   Mapping/wiring reference.
-   Read-only or command-enabled status.

**Update behaviour**

-   Use backend polling or a supported subscription mechanism.
-   Publish changed values through WebSocket/SSE to the UI.
-   Do not create independent `setInterval` polling loops inside
    individual React components.
-   Show data age. A disconnected value must become stale after the
    configured timeout; do not freeze the last value while continuing to
    show it as live.
-   Group reads efficiently according to supported device/address
    ranges.
-   Avoid flooding the PLC with one request per tag.

### 4.4 PLC Terminal

Purpose: give the operator/engineer a serial-monitor-like live terminal
for communication visibility.

The terminal is an **AquaTwin diagnostic console**, not an unrestricted
PLC memory console.

Show timestamped lines such as:

``` text
[10:42:01.102] CONNECT  Mitsubishi MELSEC — configured CPU profile
[10:42:01.118] READ     Batch 01 — 24 devices — OK
[10:42:01.120] VALUE    TK101_LEVEL_PCT = 63.4 %
[10:42:01.121] VALUE    P101_RUN_FB = ON
[10:42:01.125] QUALITY  FIT101_FLOW = STALE
[10:42:02.006] WRITE    P101_START_REQ — BLOCKED: command permission disabled
```

Terminal requirements:

-   Live log stream with timestamps and severity.
-   Filter: all / info / warning / error / read / write / connection.
-   Clear visible buffer (must not delete permanent audit logs).
-   Pause/resume display.
-   Copy/export logs.
-   Show request duration, result code and error text.
-   Optional command input only for a restricted, documented set of
    diagnostic actions such as `help`, `status`, `read <tag>`,
    `history <tag>`.
-   `write <address>`, raw hex commands, arbitrary memory writes and
    force commands must not be exposed in the normal operator terminal.
-   Any approved command must use the same permission, interlock, audit
    and confirmation flow as the UI.

### 4.5 Connection & Diagnostics

**Connection profile fields**

-   PLC manufacturer and family.
-   Exact CPU model and firmware.
-   Ethernet interface: built-in CPU port or communication module.
-   PLC IP address and port.
-   Protocol and frame type.
-   Binary/ASCII mode if relevant.
-   Network number, station number, routing fields if applicable.
-   Timeout, retry and reconnect settings.
-   Read batch size and configured polling interval.
-   Credentials or certificates if the chosen architecture/protocol
    requires them.
-   Connection profile name and environment.

Sensitive endpoint/configuration details must be permission-controlled.
Never put PLC credentials in frontend code, local storage, public
environment variables or browser requests.

**Diagnostics panel**

-   Connection attempt/result.
-   Last successful read.
-   Round-trip time.
-   Read errors and protocol error codes.
-   Timeout count.
-   Reconnect count.
-   Data freshness.
-   PLC CPU RUN/STOP/error status only if the chosen PLC/protocol
    exposes it reliably.
-   Backend gateway health.
-   Tag-level quality status.

**Connection actions**

-   Test Network: checks basic reachability only; it does not prove
    valid PLC protocol access.
-   Connect: opens the configured PLC protocol session.
-   Disconnect: closes the session safely.
-   Read Test: reads an approved, known, read-only device/tag.
-   Reconnect: performs controlled reconnection.
-   Export Diagnostics: exports logs and configuration metadata with
    secrets removed.

A successful ping is not proof that the PLC protocol is configured
correctly. A successful protocol handshake is not proof that all I/O
addresses are correct.

### 4.6 Ladder Logic

For the first release:

-   Display a clear read-only status.
-   If an approved PLC program export or tag/comment list is available,
    display documented rungs or logic references as a read-only
    engineering aid.
-   Link mapped tags to relevant logic references when known.
-   Otherwise show:
    `Ladder program integration not configured. Use Mitsubishi GX Works engineering software for PLC program changes.`
-   Do not simulate editing/downloading a ladder program to the real
    PLC.

------------------------------------------------------------------------

## 5. Mitsubishi connection strategy

### 5.1 Do not select a driver from the manufacturer name alone

"Mitsubishi" is not enough to determine a driver. The installed family
and CPU determine supported protocols, device addressing, frame type and
configuration. Before implementation, inspect the actual PLC label and
collect:

-   PLC family.
-   CPU model and full part number.
-   Firmware version.
-   Built-in Ethernet port or separate Ethernet module model.
-   Existing IP address and subnet.
-   Configured port and protocol.
-   Whether SLMP/MC protocol is enabled.
-   Device types and address ranges used by the PLC program.
-   I/O module models and slot order.
-   PLC program tag/device comments or approved I/O list.
-   Whether the PLC is connected to a live process and what read/write
    access is authorised.

Do not change IP, port, PLC parameters, RUN/STOP mode or communication
settings on a live system without the plant automation engineer's
approval.

### 5.2 Preferred initial protocol path

For a Mitsubishi MELSEC iQ-R CPU with a supported Ethernet interface,
investigate **SLMP / MC Protocol 3E frame over TCP** first, subject to
the exact CPU firmware and configured Ethernet connection. Mitsubishi's
iQ-R Ethernet documentation describes SLMP/MC protocol communication and
device read/write operations. Confirm the applicable settings in the
manual for the exact CPU/interface before coding.

Official references:

-   Mitsubishi iQ-R R08CPU manuals and downloads:
    https://www.mitsubishielectric.com/fa/products/faspec/download.page?formNm=RnCPU_R08CPU_3443&kisyu=%2Fplcr&lang=2&popup=1
-   MELSEC iQ-R Ethernet User's Manual (Application):
    https://dl.mitsubishielectric.com/dl/fa/document/manual/plc/sh081257eng/sh081257engad.pdf
-   Mitsubishi iQ-R CPU and communication capability reference:
    https://www.mitsubishielectric.com/fa/products/cnt/plcr/pmerit/cpu/cpu.html

If the actual PLC is not iQ-R, re-check the exact family manual and
protocol support. Do not assume the iQ-R settings apply to FX, Q, L or
iQ-F.

### 5.3 Library choices

Choose one implementation path after a small bench test against the
exact PLC.

**Option A --- Python gateway (recommended when a stable Python service
is acceptable)**

-   `pymcprotocol` package: https://pypi.org/project/pymcprotocol/
-   GitHub/source: https://github.com/ (verify the current upstream
    project and release before pinning a dependency)
-   Supports Mitsubishi MC Protocol 3E in its documented scope and lists
    iQ-R among supported families.
-   Use only after verifying the exact CPU, frame type, binary/ASCII
    mode, device types and addressing.
-   Pin a tested version; write integration tests against a bench PLC or
    simulator.

**Option B --- Node.js gateway**

-   Candidate `mcprotocol` implementation:
    https://github.com/raydotac/mcprotocol
-   The repository describes Node.js/TypeScript MC Protocol support for
    several Mitsubishi families, including iQ-R.
-   Treat it as a candidate, not a Mitsubishi-certified driver. Review
    maintenance activity, test coverage, supported frame/device types
    and write behaviour before production use.
-   Do not select an old or narrowly tested package solely because it
    installs successfully.

**Option C --- Mitsubishi-supported engineering/communication stack**

If the site already uses Mitsubishi-supported software or an approved
OPC UA/OPC DA gateway, evaluate that path with the plant automation
engineer. OPC UA is a good integration boundary when a supported server
exists, but do not assume the PLC exposes OPC UA natively. The exact
product, license and configuration must be confirmed.

**Recommendation:** Keep the AquaTwin application independent of the
chosen driver. Implement a `PlcAdapter` interface and a
Mitsubishi-specific adapter behind the backend gateway. Start with
read-only SLMP/MC protocol communication if the actual CPU supports it.
Do not build a browser-side PLC driver.

------------------------------------------------------------------------

## 6. Backend and frontend architecture

Keep the project simple. Do not create unnecessary microservices for the
first integration.

``` text
React + TypeScript UI
   |
   | REST: configuration, commands, history
   | WebSocket/SSE: live tags and terminal logs
   v
AquaTwin Backend
   |
   +-- PLC Session Manager
   |     +-- Mitsubishi SLMP/MC Adapter
   |     +-- Virtual PLC Adapter
   |
   +-- Tag Registry + Scaling
   +-- Command Service + Permission Checks
   +-- Alarm/Event Service
   +-- Audit Log
   |
   v
MongoDB (configuration, mappings, events, history)
```

### 6.1 Required backend responsibilities

-   Maintain one managed connection per configured PLC session.
-   Prevent duplicate polling loops and concurrent uncontrolled writes.
-   Read configured PLC devices in efficient batches.
-   Convert raw values into typed engineering values.
-   Attach timestamp, quality, source and configuration revision.
-   Publish tag updates to connected UI clients.
-   Detect timeout, disconnect and stale data.
-   Reconnect with bounded backoff.
-   Validate and audit every command.
-   Keep secrets on the backend only.
-   Expose health/diagnostic endpoints.
-   Persist configuration and important events.

### 6.2 Suggested backend API

Use REST for configuration/actions and WebSocket for streaming.

``` text
GET    /api/plc/config
PUT    /api/plc/config
POST   /api/plc/validate-config
POST   /api/plc/connect
POST   /api/plc/disconnect
POST   /api/plc/read-test
GET    /api/plc/status
GET    /api/plc/modules
PUT    /api/plc/modules
GET    /api/io/mappings
POST   /api/io/mappings
PUT    /api/io/mappings/:id
DELETE /api/io/mappings/:id
GET    /api/io/tags
GET    /api/io/tags/:tag/history
POST   /api/plc/commands
GET    /api/plc/terminal/history
GET    /api/plc/diagnostics
WS     /ws/plc/live
```

The API must validate schemas and permissions server-side. Hiding a
button in React is not a security control.

### 6.3 Shared tag contract

Virtual and Real PLC adapters must produce the same data shape.

``` ts
type PlcSource = "virtual" | "real";
type IoType = "DI" | "DO" | "AI" | "AO";
type Quality = "good" | "uncertain" | "bad" | "stale";

interface PlcTagValue {
  tag: string;
  ioType: IoType;
  value: boolean | number;
  rawValue?: number | boolean;
  unit?: string;
  source: PlcSource;
  quality: Quality;
  timestamp: string;
  plcAddress?: string;
  moduleId?: string;
  slot?: number;
  channel?: number;
  configRevision: number;
}
```

Do not make the Plant module read directly from a mock array or PLC
library. It subscribes to this shared tag service. The same tag name and
type must be used in Virtual PLC and Real PLC modes.

### 6.4 Suggested code organisation

Adapt the existing repository rather than replacing it wholesale.

``` text
src/
  modules/
    InputOutput/
      InputOutputLayout.tsx
      HardwareConfiguration/
      IOMapping/
      LiveIOMonitor/
      PLCTerminal/
      ConnectionDiagnostics/
      LadderLogic/
  services/
    plcApi.ts
    plcStream.ts
    tagService.ts
  types/
    plc.ts
    io.ts
    tag.ts

server/
  plc/
    PlcAdapter.ts
    VirtualPlcAdapter.ts
    MitsubishiMcAdapter.ts
    PlcSessionManager.ts
    deviceAddressing.ts
    scaling.ts
  services/
    TagRegistry.ts
    CommandService.ts
    AuditService.ts
  routes/
    plc.routes.ts
    io.routes.ts
  websocket/
    plcStream.ts
```

The backend language can follow the current repository. If the frontend
repository has no backend yet, add one small backend service. Do not
force a full microservices migration.

------------------------------------------------------------------------

## 7. Virtual PLC behaviour

Virtual PLC is a real software simulation mode, not a fake Real PLC
connection.

It must:

-   Use the same tag registry and I/O mappings as Real PLC.
-   Generate deterministic values from a process model or selected test
    scenario.
-   Simulate digital inputs, analog inputs, outputs and feedback.
-   Allow the developer to set a simulated input value or trigger a
    fault.
-   Log each simulated action in the terminal with `SIM` source.
-   Feed the Plant module through the same WebSocket/tag service.
-   Show `SIMULATION ACTIVE` and never show a real PLC IP/connection
    unless one exists.

Useful first scenarios:

-   Normal tank filling.
-   Tank draining.
-   Pump running.
-   Pump stopped.
-   Pump trip.
-   High-level switch active.
-   Low-level switch active.
-   Analog sensor out of range.
-   Communication loss / stale tag.

A simulated output command should change the virtual process and its
feedback according to the Virtual PLC model. It must not be mistaken for
physical actuation.

------------------------------------------------------------------------

## 8. Real PLC operating modes and command safety

### 8.1 Three distinct operating states

1.  **Virtual PLC:** simulated I/O and simulated plant. No physical
    connection.
2.  **Real PLC --- Read Only:** physical PLC values are read and
    displayed. This is the first real-hardware milestone.
3.  **Real PLC --- Command Enabled:** only approved commands can be
    requested. This requires separate commissioning and written
    approval.

Never use a single `online` boolean to represent all three.

### 8.2 Read-only first

The first physical integration acceptance test is successful reading
only:

-   Establish a protocol connection.
-   Read a known, approved device/register.
-   Compare displayed value with GX Works3 / approved HMI / meter.
-   Verify bit order, word order, signedness, scaling and units.
-   Verify timestamps and stale detection.
-   Confirm no PLC memory is changed.
-   Run for an agreed observation period and record errors.

Do not enable writes during this stage.

### 8.3 Safe command model

Do not allow a user to select any arbitrary PLC output address and write
a bit/word. Instead, create an explicit allowlist of named commands,
such as `P101_START_REQUEST`, only if the plant's approved control
narrative supports it.

Each command definition must include:

-   Unique command ID and display label.
-   Target PLC tag/address.
-   Allowed user roles.
-   Data type and allowed value.
-   Required permissive/feedback checks.
-   Minimum/maximum and rate limit where applicable.
-   Confirmation requirement.
-   Timeout.
-   Expected feedback tag.
-   Command expiry.
-   Audit metadata.

Example command lifecycle:

``` text
Requested
  -> Authenticated
  -> Authorised
  -> Preconditions checked
  -> Sent to PLC request tag
  -> PLC logic evaluates permissives
  -> Await feedback
  -> Confirmed OR Timed out OR Rejected
```

A successful write acknowledgement does not mean the pump started. The
UI must wait for independent run feedback and show
`Command sent — awaiting feedback` until confirmed.

### 8.4 Safety boundaries

-   Emergency stop, overload, dry-run protection, high-high/low-low
    protection and machine interlocks remain in PLC/hardwired safety
    systems.
-   AquaTwin must never bypass or replace those functions.
-   PLC ladder logic must independently validate every request and
    permissive.
-   On network loss, stop sending new commands and mark command state
    uncertain. Do not assume equipment stopped.
-   Do not automatically toggle outputs during reconnect.
-   Require role-based access, re-authentication for sensitive actions,
    operator confirmation and audit trail.
-   Use a plant-approved commissioning procedure and a controlled test
    environment before connecting writes to a live process.
-   If a safe command interface cannot be established, keep Real PLC
    mode read-only.

------------------------------------------------------------------------

## 9. Data storage

Persist configuration and operational history. Do not store every
high-frequency sample forever without a retention plan.

Suggested collections/tables:

-   `plc_connections`: family, CPU, firmware, endpoint reference,
    protocol, enabled state; secrets stored separately and encrypted.
-   `plc_hardware_configs`: rack/base, slot order, modules, revision,
    validation state.
-   `io_mappings`: module, slot, channel, type, PLC address, tag,
    scaling, units, source references.
-   `tag_latest`: latest value, raw value, quality, timestamp, source.
-   `tag_history`: sampled values with retention/aggregation policy.
-   `plc_events`: connect/disconnect, errors, scan statistics,
    configuration changes.
-   `plc_commands`:
    requested/sent/acknowledged/feedback/rejected/timed-out states.
-   `audit_logs`: user, role, action, target, before/after, time,
    result, reason.

Use UTC timestamps in storage and render local time in the UI. Record
the configuration revision with each value/command so historic data can
be interpreted correctly.

------------------------------------------------------------------------

## 10. Implementation phases

Do not try to complete every screen and real PLC control in one large
code-generation step. Implement and test in this order.

### Phase 0 --- Inspect current code and physical PLC

-   Inspect the existing repository and preserve the current
    React/Vite/TypeScript structure.
-   Identify the current Input/Output components, state management and
    mock data.
-   Inspect the physical PLC label, CPU and modules with the plant
    engineer.
-   Collect the network/protocol settings and approved I/O list.
-   Record unknowns explicitly.
-   Do not change PLC settings or connect writes.

**Exit criteria:** Exact hardware and communication facts are
documented, or the application remains in Virtual PLC mode.

### Phase 1 --- Refactor the Input/Output UI

-   Remove the redundant Overview tab and KPI dashboard.
-   Add the compact persistent connection strip.
-   Implement Hardware Configuration, I/O Mapping, Live I/O Monitor, PLC
    Terminal and Connection & Diagnostics.
-   Keep Ladder Logic read-only/limited.
-   Make every tab functional with Virtual PLC data.
-   Improve the rack view with accurate, model-specific module faces.

**Exit criteria:** The screens are navigable and functional; no fake
Real PLC status or invented hardware details are shown.

### Phase 2 --- Build shared tag service and Virtual PLC

-   Define the tag contract.
-   Implement Virtual PLC adapter.
-   Implement deterministic simulated input/output behaviour.
-   Implement scaling, quality, timestamp and stale detection.
-   Stream tag updates to the UI.
-   Verify that the Plant module can subscribe to the same tags without
    its own timer/mock data.

**Exit criteria:** Changing a simulated input updates I/O Monitor,
terminal log and the same shared tag value available to Plant.

### Phase 3 --- Mitsubishi read-only connection

-   Select the driver after confirming CPU family and protocol.
-   Implement the backend Mitsubishi adapter.
-   Configure one known read-only test device.
-   Connect through the approved OT network path.
-   Read one bit and one numeric/word value first.
-   Compare against GX Works3/HMI.
-   Expand to approved tag batches.
-   Add timeouts, reconnect, diagnostics and quality handling.

**Exit criteria:** Actual PLC values are verified against an independent
trusted display/instrument, with no writes performed.

### Phase 4 --- Plant data integration

This is still part of making the I/O module complete, but do not
redesign the Plant screen yet.

-   Publish live PLC tags through the shared tag service.
-   Confirm that the Plant module can consume them.
-   Keep a visible source marker: `REAL PLC` or `VIRTUAL PLC`.
-   Confirm that stale/disconnected values propagate as stale/unknown.
-   Validate tank level, pump feedback and valve feedback mappings with
    approved tags.

**Exit criteria:** A physical sensor/input change is visible in the I/O
Monitor and in the Plant module without manual refresh.

### Phase 5 --- Controlled output commands

Only after written approval and safety review:

-   Define a small allowlist of command request tags.
-   Add role checks and command confirmation.
-   Add PLC-side permissive handling.
-   Test with disconnected/non-hazardous loads or a bench setup first.
-   Verify independent feedback and timeout behaviour.
-   Audit all command attempts.
-   Perform site commissioning under the plant's procedures.

**Exit criteria:** An approved command is requested, validated by PLC
logic, physically reflected and confirmed by feedback; rejected and
timed-out cases behave safely.

### Phase 6 --- Hardening

-   Test cable unplug/network outage.
-   Test PLC STOP/fault state.
-   Test wrong IP/port/protocol.
-   Test invalid address and bad mapping.
-   Test stale and out-of-range analog values.
-   Test reconnect during a pending command.
-   Test permission failures.
-   Test duplicate command and replay.
-   Test backend restart.
-   Verify no automatic output activation after restart/reconnect.
-   Add retention, audit export and operational documentation.

------------------------------------------------------------------------

## 11. Acceptance checklist

The module is not complete merely because it looks realistic. It must
pass the functional checks below.

### Hardware and mapping

-   [ ] Exact Mitsubishi family and CPU can be configured.
-   [ ] Rack and module list match the physical PLC.
-   [ ] Slot positions and channel counts are validated.
-   [ ] Module compatibility is based on verified data.
-   [ ] I/O channels map to named tags.
-   [ ] Analog scaling and units are correct.
-   [ ] Configuration revisions and changes are audited.

### Virtual PLC

-   [ ] Virtual PLC is visibly labelled as simulation.
-   [ ] Virtual input changes update the live monitor.
-   [ ] Simulated output changes affect simulated process feedback.
-   [ ] Terminal logs show simulated reads/actions.
-   [ ] Virtual and Real adapters use the same tag contract.

### Real PLC read-only

-   [ ] Real connection is shown only after a successful protocol
    session.
-   [ ] Read-only values match GX Works3/HMI or an approved instrument.
-   [ ] Bit/word order and scaling are verified.
-   [ ] Data age and quality are visible.
-   [ ] Disconnect and reconnect are handled.
-   [ ] No write operation occurs in read-only mode.

### Commands

-   [ ] No arbitrary address write is available.
-   [ ] Only allowlisted commands can be requested.
-   [ ] Role and permission checks are enforced on backend.
-   [ ] PLC-side permissives/interlocks remain authoritative.
-   [ ] Command acknowledgement is distinct from equipment feedback.
-   [ ] Timeout, rejection and network-loss cases are safe.
-   [ ] Every attempt is audited.

### User experience

-   [ ] No redundant PLC Overview dashboard.
-   [ ] Default screen is Live I/O Monitor or Hardware Configuration
    when unconfigured.
-   [ ] Connection strip is compact and consistent across tabs.
-   [ ] Terminal is readable and useful.
-   [ ] No simulated values are presented as real.
-   [ ] No invented CPU, IP, module or address is shown as verified.

------------------------------------------------------------------------

## 12. Required information to collect from the physical PLC

Before choosing the exact driver configuration, record the following
from the hardware and GX Works engineering environment:

  Item                              Required value
  --------------------------------- ----------------------------------------------
  Manufacturer                      Mitsubishi Electric
  PLC family                        To be inspected
  CPU full model                    To be inspected
  CPU firmware                      To be inspected
  Ethernet interface                Built-in port or exact module
  PLC IP/subnet                     To be supplied by OT engineer
  Protocol                          Confirm SLMP/MC support and configured frame
  TCP/UDP port                      Confirm from PLC settings
  Data code                         Binary or ASCII
  Rack/base model                   To be inspected
  Power supply model                To be inspected
  DI/DO/AI/AO module part numbers   To be inspected
  Slot/channel layout               To be inspected
  PLC device/address list           Approved I/O list or program comments
  Scaling and units                 Instrument/module documentation
  Command tags                      Approved control narrative
  Safety/permissives                Approved PLC logic/control narrative
  Network access                    Approved OT network route/firewall rules
  Write permission                  Explicit commissioning approval

Do not ask the user to share PLC passwords or sensitive network
credentials in chat. Use a secure configuration mechanism inside the
deployment environment.

------------------------------------------------------------------------

## 13. Instructions for the coding agent (Claude Code / Antigravity)

Use this document as the implementation brief. Before editing:

1.  Inspect the full current repository and identify the actual
    framework, existing state provider, routes, components and mock PLC
    logic.
2.  Read the current AquaTwin project specification and preserve its
    four primary modules: Plant, Input / Output, Control Panel and
    Analysis.
3.  Do not replace the entire application or introduce unnecessary
    microservices.
4.  Implement Input / Output only in this phase. Do not redesign Plant,
    Control Panel or Analysis.
5.  Remove the PLC Overview dashboard as specified. The first usable tab
    should be Live I/O Monitor; if no PLC is configured, show Hardware
    Configuration.
6.  Use the attached screenshot as a layout reference, not as proof of
    the actual installed hardware.
7.  Keep the Mitsubishi family/CPU configurable. Do not hard-code
    R08CPU, R6B8, R61P, RX40C7, RY40NT5P, R60AD8, R60DA8, sample IP
    addresses or sample device addresses as real installation data.
8.  Build the Virtual PLC and shared tag service first. All tabs must
    work with deterministic simulation data.
9.  Build the real PLC backend adapter behind an interface. Do not
    connect from the browser.
10. Implement real PLC read-only mode only until the physical model,
    network settings and approved I/O map are verified.
11. Keep command/write functionality disabled by default. Do not
    implement arbitrary memory writes or output forcing.
12. Do not claim a real PLC is connected unless the backend has
    completed a valid protocol read.
13. Make each visible button functional. If a feature is not implemented
    or cannot be safely supported, label it clearly as unavailable
    rather than showing a fake success state.
14. Add tests for tag scaling, quality/staleness, connection lifecycle,
    permissions and command state transitions.
15. Run the project's build and tests. Fix errors before finishing.
16. At the end, report: files changed, features completed, tests run,
    current limitations, and the exact physical PLC details still
    needed.

**Definition of done for this phase:** AquaTwin's Input / Output module
is a coherent, functional PLC workspace in Virtual PLC mode, has a
tested read-only Mitsubishi connection path ready for the confirmed
hardware, streams one shared set of tags for Plant consumption, and
keeps physical output control safely disabled until the commissioning
gate is passed.

------------------------------------------------------------------------

## 14. Reference notes

-   The screenshot supplied with this request shows the current AquaTwin
    PLC Overview screen and is the visual baseline for the redesign.
-   Earlier project mockups included a Mitsubishi MELSEC iQ-R /
    R08CPU-style rack. These are design references only until the actual
    PLC is inspected.
-   Mitsubishi official manuals and product references listed in Section
    5 take precedence over generic library examples.
-   Third-party protocol libraries are not Mitsubishi-certified solely
    because they implement MC/SLMP. Pin versions, inspect source and
    validate against the actual PLC before any live deployment.
