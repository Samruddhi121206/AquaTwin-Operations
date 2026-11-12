/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlantProvider, usePlant } from './context/PlantContext';
import { RuntimeModeProvider } from './context/RuntimeModeContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { LandingPage } from './components/layout/LandingPage';
import { PlantView } from './modules/Plant/PlantView';
import { IOView } from './modules/InputOutput/IOView';
import { ControlPanelView } from './modules/ControlPanel/ControlPanelView';
import { AnalysisView } from './modules/Analysis/AnalysisView';
import { SettingsView } from './components/modules/SettingsAudit/SettingsView';

const MainContent: React.FC = () => {
  const { activeModule } = usePlant();
  const isPlantModule =
    activeModule === 'plant' ||
    activeModule === 'operations' ||
    activeModule === 'dashboard' ||
    activeModule === 'twin' ||
    activeModule === 'equipment' ||
    activeModule === 'alarms' ||
    activeModule === 'maintenance';

  return (
    <main
      className={`flex-1 overflow-y-auto ${
        isPlantModule ? 'p-3 md:p-4' : 'p-4 md:p-6'
      } bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors`}
    >
      <div className={`${isPlantModule ? 'max-w-[1720px]' : 'max-w-[1600px]'} mx-auto`}>
        {activeModule === 'landing' && <LandingPage />}

        {/* Module 1: Plant */}
        {(activeModule === 'plant' ||
          activeModule === 'operations' ||
          activeModule === 'dashboard' ||
          activeModule === 'twin' ||
          activeModule === 'equipment' ||
          activeModule === 'alarms' ||
          activeModule === 'maintenance') && <PlantView />}

        {/* Module 2: Dedicated PLC Input / Output */}
        {activeModule === 'io' && <IOView />}

        {/* Module 3: Control Panel & Wiring */}
        {activeModule === 'control_panel' && <ControlPanelView />}

        {/* Module 4: Performance Trends, Water Quality, Energy & Reports */}
        {(activeModule === 'analysis' ||
          activeModule === 'water_quality' ||
          activeModule === 'energy' ||
          activeModule === 'reports') && <AnalysisView />}

        {/* Settings & Audit */}
        {activeModule === 'settings' && <SettingsView />}
      </div>
    </main>
  );
};

const AppShell: React.FC = () => {
  const { theme } = usePlant();

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
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
    <RuntimeModeProvider>
      <PlantProvider>
        <AppShell />
      </PlantProvider>
    </RuntimeModeProvider>
  );
}
