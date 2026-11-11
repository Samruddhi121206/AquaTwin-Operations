# AquaTwin Operations - Project Architecture

AquaTwin Operations is an industrial water treatment plant Digital Twin and SCADA monitoring dashboard built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 📁 Directory Structure

```text
aquatwin-operations/
├── index.html                  # HTML entry point (mounting #root)
├── metadata.json               # Application metadata and description
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite configuration (React + Tailwind plugins)
│
└── src/
    ├── main.tsx                # Application bootstrap (ReactDOM root mount)
    ├── App.tsx                 # Root component: AppShell & module router
    ├── index.css               # Global stylesheets and Tailwind directives
    │
    ├── types/
    │   └── plant.ts            # Core TypeScript models (alarms, equipment, metrics)
    │
    ├── context/
    │   └── PlantContext.tsx    # Global state management & real-time simulation
    │
    └── components/
        ├── layout/             # Shell and navigation components
        │   ├── Sidebar.tsx     # Navigation drawer with module links and badges
        │   └── TopHeader.tsx   # Top system status bar, notifications & user profile
        │
        └── modules/            # Domain-specific feature modules
            ├── Dashboard/
            │   └── DashboardView.tsx          # High-level overview & primary plant KPIs
            │
            ├── LiveOperations/
            │   ├── LiveOperationsView.tsx     # SCADA operational controls & telemetry
            │   └── PidDiagram.tsx             # Piping & Instrumentation Diagram (P&ID)
            │
            ├── DigitalTwin/
            │   └── DigitalTwinView.tsx        # Digital twin visualization & simulation
            │
            ├── EquipmentManagement/
            │   └── EquipmentView.tsx          # Asset health, runtime & pump/valve specs
            │
            ├── AlarmsEvents/
            │   └── AlarmsView.tsx             # Active alarms, severity filter & acknowledgment
            │
            ├── Maintenance/
            │   └── MaintenanceView.tsx        # Preventive maintenance & work orders
            │
            ├── WaterQuality/
            │   └── WaterQualityView.tsx       # Water parameter monitoring (pH, turbidity, etc.)
            │
            ├── EnergyPerformance/
            │   └── EnergyView.tsx             # Power consumption, efficiency & cost analysis
            │
            ├── ReportsAnalytics/
            │   └── ReportsView.tsx            # Trends & historical charts (Recharts)
            │
            └── SettingsAudit/
                └── SettingsView.tsx           # System preferences, audit logs & thresholds
```

---

## 🧩 Architectural Layers

### 1. State & Simulation Layer (`src/context/` & `src/types/`)
* **`PlantContext.tsx`**: Serves as the single source of truth for the plant's runtime data. Manages state for:
  - Active module navigation (`activeModule`)
  - Simulated real-time sensor updates & tick timers
  - Equipment states (running, standby, warning, tripped)
  - Active alarms and acknowledgment actions
  - Theme switching (Light / Dark mode)
* **`plant.ts`**: Contains strongly typed interfaces for domain models including `EquipmentSpec`, `AlarmItem`, `WaterQualitySample`, and `MaintenanceTask`.

### 2. Application Shell (`src/components/layout/`)
* **`Sidebar.tsx`**: Left navigation bar enabling seamless switching between operational modules with live alarm counter badges.
* **`TopHeader.tsx`**: Displays system connectivity status, active emergency alerts, current plant timestamp, and user actions.

### 3. Module Views (`src/components/modules/`)
* Each folder inside `modules/` represents an independent operational domain (e.g. SCADA P&ID, Digital Twin, Alarms, Water Quality, and Reports).
* **`ReportsView.tsx`** utilizes **Recharts** for rendering historical trends and telemetry plots.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build
```

