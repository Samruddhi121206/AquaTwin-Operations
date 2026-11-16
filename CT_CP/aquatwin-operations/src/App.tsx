/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { ProfilePage } from './components/modules/Profile/ProfilePage';
import { ArrowLeft } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeModule, setActiveModule } = usePlant();
  const isPlantModule =
    activeModule === 'plant' ||
    activeModule === 'operations' ||
    activeModule === 'dashboard' ||
    activeModule === 'twin' ||
    activeModule === 'equipment' ||
    activeModule === 'alarms' ||
    activeModule === 'maintenance';

  const isAnalysisModule =
    activeModule === 'analysis' ||
    activeModule === 'water_quality' ||
    activeModule === 'energy' ||
    activeModule === 'reports';

  return (
    <main
      className={`flex-1 overflow-y-auto ${
        isPlantModule ? 'p-3 md:p-4' : 'p-4 md:p-6'
      } bg-slate-50 dark:bg-[#070e24] text-slate-900 dark:text-slate-100 transition-colors`}
    >
      <div className={`${isPlantModule ? 'max-w-[1720px]' : 'max-w-[1600px]'} mx-auto`}>
        {/* Connected Navigation Bar for Inner Modules */}
        {activeModule !== 'landing' && activeModule !== 'profile' && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-200 dark:border-[#162544] text-xs">
            {/* Return to Platform Overview */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveModule('landing')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#0d1a38] border border-slate-200 dark:border-[#1c3366] text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 font-semibold shadow-xs transition cursor-pointer"
                title="Return to Platform Overview"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Platform Overview</span>
              </button>
              <span className="text-slate-400">/</span>
              <span className="font-bold text-slate-900 dark:text-white capitalize">
                {activeModule.replace('_', ' ')}
              </span>
            </div>

            {/* Quick Navigation Between the 4 Modules (Hidden on Analysis page per Phase 1 requirements) */}
            {!isAnalysisModule && (
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <button
                  onClick={() => setActiveModule('plant')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    isPlantModule
                      ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-cyan-400'
                  }`}
                >
                  01. Plant
                </button>
                <span className="text-slate-400">·</span>
                <button
                  onClick={() => setActiveModule('io')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    activeModule === 'io'
                      ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-cyan-400'
                  }`}
                >
                  02. I/O
                </button>
                <span className="text-slate-400">·</span>
                <button
                  onClick={() => setActiveModule('control_panel')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    activeModule === 'control_panel'
                      ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-cyan-400'
                  }`}
                >
                  03. Control Panel
                </button>
                <span className="text-slate-400">·</span>
                <button
                  onClick={() => setActiveModule('analysis')}
                  className="px-2 py-0.5 rounded transition cursor-pointer text-slate-500 dark:text-slate-400 hover:text-cyan-400"
                >
                  04. Analysis
                </button>
              </div>
            )}
          </div>
        )}

        {activeModule === 'landing' && <LandingPage />}

        {/* Module 1: Plant */}
        {isPlantModule && <PlantView />}

        {/* Module 2: Dedicated PLC Input / Output */}
        {activeModule === 'io' && <IOView />}

        {/* Module 3: Control Panel & Wiring */}
        {activeModule === 'control_panel' && <ControlPanelView />}

        {/* Module 4: Performance Trends, Water Quality, Energy & Reports */}
        {isAnalysisModule && <AnalysisView />}

        {/* Settings & Audit */}
        {activeModule === 'settings' && <SettingsView />}

        {/* Phase 4: Dedicated Operator Profile Page */}
        {activeModule === 'profile' && <ProfilePage />}
      </div>
    </main>
  );
};

const AppShell: React.FC = () => {
  const { theme } = usePlant();
  // Phase 2: Hidden / collapsed by default
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300">
        <TopHeader onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
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
