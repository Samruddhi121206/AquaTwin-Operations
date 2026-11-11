# Test Strategy & Validation Plan

## 1. Test layers

| Layer | Test focus |
|---|---|
| Unit | Tank equations, RO balance, PID, alarm hysteresis, unit conversions |
| API | Authentication, validation, RBAC, tenant isolation, command lifecycle |
| Database | Schema validation, indexes, time-series inserts, retention |
| UI | Role-based views, responsive layouts, stale/bad quality display |
| Integration | Next.js ↔ MongoDB, web ↔ simulation service, telemetry events |
| Simulation | Disturbances, pump trip, sensor failure, tank boundaries |
| Security | IDOR, cross-tenant access, CSRF, rate limit, secrets exposure |
| Performance | Telemetry ingest, dashboard queries, chart rendering |
| Industrial acceptance | P&ID/tag verification, gateway read-only tests, OT review |

## 2. Core engineering tests

### Tank balance
- Given fixed tank area, inlet and outlet flow, predicted level slope matches analytical result.
- With equal inlet and outlet flow, level remains constant.
- With zero inlet and positive outlet, level decreases.
- With zero outlet and positive inlet, level increases.
- Tank volume remains within configured bounds.

### Pump
- Stopped pump produces no simulated pump flow.
- Running pump with valid permissives produces configured flow response.
- Trip state stops simulated flow and raises the configured alarm.
- Loss of flow while running is detected if flow measurement is enabled.

### RO
- Feed equals permeate plus reject within numerical tolerance.
- Recovery calculation handles zero feed safely.
- Recovery is flagged invalid if flow sensors are bad or inconsistent.
- Salt balance is checked where concentration data exists.
- No RO quality metric is displayed as verified when source data is simulated.

### PID
- Output saturates within limits.
- Anti-windup prevents excessive integral accumulation.
- Step response is repeatable.
- Disturbance response is recorded.
- Manual/auto transfer does not create an uncontrolled output jump in simulation.

## 3. Failure-mode tests
- Level transmitter stuck at one value.
- Level transmitter bad quality.
- Flow transmitter communication loss.
- Pump fails to start.
- Pump trips while running.
- Valve feedback disagrees with command.
- MongoDB temporarily unavailable.
- WebSocket disconnected.
- Gateway heartbeat lost.
- Out-of-order or duplicate telemetry.
- User loses plant permission during active session.

## 4. UX acceptance tests
- Operator finds tank level and pump state within two clicks from overview.
- Active alarms are visible without opening the engineering configuration.
- Alarm acknowledgement clearly states that acknowledgement does not clear the condition.
- A command cannot be mistaken for confirmed equipment state.
- Simulation badge is always visible in simulation mode.
- Stale data has an explicit timestamp and visual state.
- Operator workflow works on a standard desktop and tablet viewport.

## 5. Validation evidence package
- Approved P&ID revision list.
- Tag mapping spreadsheet.
- Parameter register with units and source.
- Model equations and assumptions.
- Calculation examples.
- Simulation test cases and results.
- Calibration report.
- Security test report.
- Role/permission test results.
- Known limitations and residual risks.
- Engineering sign-off before physical connection.
