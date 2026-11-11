/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlantProvider, usePlant } from './context/PlantContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DashboardView } from './components/modules/Dashboard/DashboardView';
import { LiveOperationsView } from './components/modules/LiveOperations/LiveOperationsView';
import { DigitalTwinView } from './components/modules/DigitalTwin/DigitalTwinView';
import { EquipmentView } from './components/modules/EquipmentManagement/EquipmentView';
import { AlarmsView } from './components/modules/AlarmsEvents/AlarmsView';
import { MaintenanceView } from './components/modules/Maintenance/MaintenanceView';
import { WaterQualityView } from './components/modules/WaterQuality/WaterQualityView';
import { EnergyView } from './components/modules/EnergyPerformance/EnergyView';
import { ReportsView } from './components/modules/ReportsAnalytics/ReportsView';
import { SettingsView } from './components/modules/SettingsAudit/SettingsView';

const MainContent: React.FC = () => {
  const { activeModule } = usePlant();

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-[1600px] mx-auto">
        {activeModule === 'dashboard' && <DashboardView />}
        {activeModule === 'operations' && <LiveOperationsView />}
        {activeModule === 'twin' && <DigitalTwinView />}
        {activeModule === 'equipment' && <EquipmentView />}
        {activeModule === 'alarms' && <AlarmsView />}
        {activeModule === 'maintenance' && <MaintenanceView />}
        {activeModule === 'water_quality' && <WaterQualityView />}
        {activeModule === 'energy' && <EnergyView />}
        {activeModule === 'reports' && <ReportsView />}
        {activeModule === 'settings' && <SettingsView />}
      </div>
    </main>
  );
};

const AppShell: React.FC = () => {
  const { theme } = usePlant();

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopHeader />
        <MainContent />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <PlantProvider>
      <AppShell />
    </PlantProvider>
  );
}
