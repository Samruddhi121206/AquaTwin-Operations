# MongoDB Data Model & Persistence Design

## 1. Database choice

Use MongoDB for:
- Organisations / tenants.
- Users and role assignments.
- Plants, process areas, assets and tag configuration.
- Plant model parameters and configuration revisions.
- Alarm definitions and alarm lifecycle records.
- Commands and acknowledgements.
- Maintenance work orders and PM schedules.
- Documents and report metadata.
- Audit events.
- High-volume time-stamped telemetry using a MongoDB time-series collection.

MongoDB is appropriate for the flexible plant/asset configuration and event-oriented records. Define indexes and retention policies before high-frequency telemetry is deployed.

## 2. Database naming

- Database: `aquatwin`
- Collections:
  - `organisations`
  - `users`
  - `memberships`
  - `plants`
  - `processAreas`
  - `assets`
  - `tags`
  - `plantConfigurations`
  - `alarmRules`
  - `alarms`
  - `commands`
  - `workOrders`
  - `maintenancePlans`
  - `documents`
  - `auditEvents`
  - `telemetry` (time-series collection)
  - `simulationRuns`

## 3. Tenant strategy

For an initial product with a modest number of customers, use a shared database and shared collections with a mandatory `organisationId` field and `plantId` scoping. Enforce scope in server-side repository/service functions.

Rules:
- Never trust `organisationId` or `plantId` from the browser without checking membership.
- Every tenant-owned document includes `organisationId`.
- Plant-level records also include `plantId`.
- Add compound indexes beginning with tenant/plant scope where appropriate.
- Use a repository layer to avoid ad hoc unscoped queries.
- Consider database-per-tenant only if customer isolation, compliance or workload requires it.

## 4. Collection schemas

### organisations
```json
{
  "_id": "ObjectId",
  "name": "Example Water Operations",
  "slug": "example-water-ops",
  "status": "active",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### users
```json
{
  "_id": "ObjectId",
  "email": "operator@example.com",
  "displayName": "Demo Operator",
  "authProviderId": "identity-provider-subject",
  "status": "active",
  "lastLoginAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
Do not store plaintext passwords. Prefer a managed identity provider or securely implemented authentication.

### memberships
```json
{
  "_id": "ObjectId",
  "organisationId": "ObjectId",
  "userId": "ObjectId",
  "roles": ["operator"],
  "plantIds": ["ObjectId"],
  "permissions": ["plant.read", "alarm.acknowledge"],
  "status": "active",
  "createdAt": "Date"
}
```

### plants
```json
{
  "_id": "ObjectId",
  "organisationId": "ObjectId",
  "name": "Demo Water Treatment Plant",
  "code": "DEMO-WTP-01",
  "location": {
    "city": "Pune",
    "state": "Maharashtra",
    "country": "India"
  },
  "mode": "simulation",
  "status": "commissioning",
  "designStatus": "assumed",
  "timezone": "Asia/Kolkata",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### assets
```json
{
  "_id": "ObjectId",
  "organisationId": "ObjectId",
  "plantId": "ObjectId",
  "parentAssetId": null,
  "tag": "TK-101",
  "name": "Raw Water Storage Tank",
  "assetType": "tank",
  "area": "raw-water",
  "description": "Reference model tank; dimensions require plant approval",
  "status": "available",
  "designStatus": "assumed",
  "criticality": "high",
  "specification": {
    "geometry": "vertical_cylinder",
    "diameterM": null,
    "workingHeightM": null,
    "capacityM3": null
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### tags
```json
{
  "_id": "ObjectId",
  "organisationId": "ObjectId",
  "plantId": "ObjectId",
  "assetId": "ObjectId",
  "tag": "LIT-101",
  "name": "Raw Water Tank Level",
  "signalType": "analog_input",
  "engineeringUnit": "%",
  "range": {"min": 0, "max": 100},
  "source": "simulation",
  "sourceAddress": null,
  "quality": "simulated",
  "readOnly": true,
  "enabled": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### plantConfigurations
```json
{
  "_id": "ObjectId",
  "organisationId": "ObjectId",
  "plantId": "ObjectId",
  "version": 1,
  "status": "draft",
  "designStatus": "assumed",
  "parameters": {
    "tankAreaM2": null,
    "tankMaxVolumeM3": null,
    "pumpRatedFlowM3h": null,
    "roRatedFeedM3h": null
  },
  "sourceDocuments": [],
  "createdBy": "ObjectId",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "Date"
}
```
Configuration changes create a new version; do not silently overwrite an approved configuration.

### telemetry time-series collection
Recommended measurement shape:
```json
{
  "ts": "Date",
  "meta": {
    "organisationId": "ObjectId",
    "plantId": "ObjectId",
    "assetTag": "TK-101",
    "tag": "LIT-101",
    "source": "simulation"
  },
  "value": 62.4,
  "unit": "%",
  "quality": "SIMULATED",
  "sequence": 100245
}
```
For MongoDB time-series collection, configure `ts` as `timeField` and `meta` as `metaField`. The metadata should be stable; changing values belong in measurements, not metadata.

### alarms
```json
{
  "_id": "ObjectId",
  "organisationId": "ObjectId",
  "plantId": "ObjectId",
  "alarmCode": "TK101_LEVEL_HIGH",
  "assetTag": "TK-101",
  "tag": "LIT-101",
  "severity": "high",
  "state": "active_unacknowledged",
  "message": "Raw water tank level high",
  "triggerValue": 90,
  "threshold": 90,
  "unit": "%",
  "firstOccurredAt": "Date",
  "lastOccurredAt": "Date",
  "acknowledgedBy": null,
  "acknowledgedAt": null,
  "clearedAt": null
}
```

### commands
```json
{
  "_id": "ObjectId",
  "organisationId": "ObjectId",
  "plantId": "ObjectId",
  "assetTag": "P-101",
  "action": "start",
  "mode": "simulation",
  "requestedBy": "ObjectId",
  "requestedAt": "Date",
  "status": "requested",
  "reason": "Operator test",
  "validation": {
    "authorised": true,
    "permissivesPassed": true,
    "interlocksPassed": true
  },
  "acknowledgedAt": null,
  "completedAt": null,
  "result": null
}
```

### workOrders
```json
{
  "_id": "ObjectId",
  "organisationId": "ObjectId",
  "plantId": "ObjectId",
  "workOrderNo": "WO-2026-0001",
  "assetTag": "P-101",
  "title": "Inspect transfer pump",
  "priority": "medium",
  "status": "open",
  "assignedTo": "ObjectId",
  "dueAt": "Date",
  "checklist": [],
  "notes": [],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### auditEvents
```json
{
  "_id": "ObjectId",
  "organisationId": "ObjectId",
  "plantId": "ObjectId",
  "actorUserId": "ObjectId",
  "action": "command.requested",
  "entityType": "command",
  "entityId": "ObjectId",
  "before": {},
  "after": {},
  "ipAddress": "redacted-or-policy-approved",
  "userAgent": "browser metadata",
  "occurredAt": "Date"
}
```
Audit events should be append-only at the application layer. Restrict database permissions so normal application flows cannot rewrite history.

## 5. Index strategy

Create indexes after confirming query patterns:

- `users`: unique `{ email: 1 }` (case-normalised).
- `memberships`: unique `{ organisationId: 1, userId: 1 }`.
- `plants`: `{ organisationId: 1, status: 1 }`.
- `assets`: unique `{ organisationId: 1, plantId: 1, tag: 1 }`.
- `tags`: unique `{ organisationId: 1, plantId: 1, tag: 1 }`.
- `alarms`: `{ organisationId: 1, plantId: 1, state: 1, lastOccurredAt: -1 }`.
- `commands`: `{ organisationId: 1, plantId: 1, requestedAt: -1 }`.
- `workOrders`: `{ organisationId: 1, plantId: 1, status: 1, dueAt: 1 }`.
- `auditEvents`: `{ organisationId: 1, plantId: 1, occurredAt: -1 }`.
- `telemetry`: use time-series meta/time query patterns; verify supported index options for the deployed MongoDB version.

## 6. Telemetry frequency and retention

Do not select a sampling interval without knowing the PLC scan, process dynamics, historian requirements and network capacity. For a student/demo simulator, 1–2 second updates may be adequate for UI demonstration; this is not a control-loop sampling recommendation.

Retention proposal:
- Raw high-frequency telemetry: configurable, e.g. 30–90 days only if customer policy permits.
- Aggregated 1-minute/hourly values: longer retention.
- Alarm and audit records: policy-defined retention, often much longer than raw telemetry.
- Export/archive before deletion.
- Never use TTL deletion on audit records without formal retention approval.

## 7. MongoDB connection pattern for Next.js

Use server-only connection code. Keep the URI in `.env.local` locally and a secret manager in production. Never prefix it with `NEXT_PUBLIC_`.

Example using Mongoose:

```ts
// src/lib/db.ts
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not configured");

declare global {
  // eslint-disable-next-line no-var
  var mongoosePromise: Promise<typeof mongoose> | undefined;
}

export async function connectDB() {
  if (!global.mongoosePromise) {
    global.mongoosePromise = mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
  }
  return global.mongoosePromise;
}
```

For production serverless or multi-instance deployment, review connection-pool behaviour and hosting runtime constraints. Mongoose does not support the Next.js Edge runtime; use Node.js runtime for database access.

## 8. Example telemetry ingestion validation

Validate:
- Tag exists and is enabled.
- Plant and organisation match authenticated gateway.
- Value is numeric and finite.
- Unit matches configured engineering unit.
- Timestamp is plausible and source time is recorded.
- Quality code is valid.
- Sequence number / idempotency key prevents duplicate processing where required.
- Out-of-range values are flagged, not silently clamped into normal values.

## 9. Data governance

- Store source document ID and revision for every engineering parameter.
- Store model version with every simulation run.
- Store tag mapping version with every gateway session.
- Use UTC timestamps in storage; render plant timezone in UI.
- Use decimal precision appropriate to each engineering quantity.
- Avoid using MongoDB documents as a substitute for immutable historian or regulatory archive if the customer has a mandated system.
- Define backup, restore, retention and disaster-recovery procedures.
