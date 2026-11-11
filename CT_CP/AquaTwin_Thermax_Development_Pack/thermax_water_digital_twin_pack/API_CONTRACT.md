# API Contract (Starter)

Base path: `/api/v1`  
Authentication: secure session or bearer token from the configured identity provider.  
All endpoints enforce organisation and plant membership server-side.

## 1. Standard response envelope

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01...",
    "timestamp": "2026-11-11T06:00:00.000Z"
  },
  "error": null
}
```

Error response:
```json
{
  "data": null,
  "meta": {"requestId": "req_01..."},
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission for this action"
  }
}
```

## 2. Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/plants` | List plants visible to user |
| GET | `/plants/{plantId}` | Plant details and mode |
| GET | `/plants/{plantId}/overview` | Current KPI snapshot |
| GET | `/plants/{plantId}/process` | Process diagram model |
| GET | `/plants/{plantId}/assets` | Asset register |
| GET | `/plants/{plantId}/assets/{assetId}` | Asset detail |
| GET | `/plants/{plantId}/tags` | Tag dictionary |
| GET | `/plants/{plantId}/telemetry` | Historical telemetry query |
| GET | `/plants/{plantId}/alarms` | Alarm list |
| POST | `/alarms/{alarmId}/acknowledge` | Acknowledge active alarm |
| GET | `/plants/{plantId}/commands` | Command history |
| POST | `/plants/{plantId}/commands` | Request a permitted command |
| GET | `/plants/{plantId}/work-orders` | List maintenance work orders |
| POST | `/plants/{plantId}/work-orders` | Create work order |
| PATCH | `/work-orders/{id}` | Update work order |
| GET | `/plants/{plantId}/reports/daily` | Daily report |
| POST | `/plants/{plantId}/simulation/start` | Start virtual simulation |
| POST | `/plants/{plantId}/simulation/stop` | Stop virtual simulation |
| GET | `/plants/{plantId}/simulation/status` | Simulation status |

## 3. Command request contract

`POST /plants/{plantId}/commands`

```json
{
  "assetTag": "P-101",
  "action": "start",
  "mode": "simulation",
  "reason": "Functional test",
  "idempotencyKey": "f7e4c6f7-..."
}
```

Response:
```json
{
  "data": {
    "commandId": "ObjectId",
    "status": "requested",
    "message": "Command submitted for validation"
  },
  "meta": {"requestId": "req_..."},
  "error": null
}
```

Possible command states:
`requested`, `rejected`, `validated`, `queued`, `acknowledged`, `completed`, `failed`, `cancelled`, `expired`.

The HTTP response confirms only that a request was received. It does not mean the equipment started. The UI must wait for a later acknowledgement and process feedback.

## 4. Telemetry contract

```json
{
  "plantId": "plant-id",
  "source": "simulation",
  "measurements": [
    {
      "tag": "LIT-101",
      "value": 62.4,
      "unit": "%",
      "timestamp": "2026-11-11T06:00:00.000Z",
      "quality": "SIMULATED",
      "sequence": 100245
    }
  ]
}
```

Allowed quality values:
`GOOD`, `UNCERTAIN`, `BAD`, `STALE`, `COMM_LOSS`, `SIMULATED`.

## 5. WebSocket events

Channel example: `plant:{plantId}`. Authorise subscription server-side.

Event types:
- `telemetry.updated`
- `asset.state.changed`
- `alarm.raised`
- `alarm.acknowledged`
- `alarm.cleared`
- `command.updated`
- `gateway.status.changed`
- `simulation.status.changed`

Each event includes `eventId`, `plantId`, `occurredAt`, `source`, `quality` where applicable.

## 6. Security requirements

- Validate payload with Zod or equivalent.
- Check user, organisation, plant and action permissions.
- Use CSRF protection where cookie-authenticated mutations require it.
- Rate-limit command and authentication endpoints.
- Require idempotency for command submissions.
- Reject unknown tags and unsupported actions.
- Do not accept arbitrary PLC addresses from the browser.
- Keep physical command capability disabled by configuration and feature flag until approved.
- Log both accepted and rejected command attempts.
