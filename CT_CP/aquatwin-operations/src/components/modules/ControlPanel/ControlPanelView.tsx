/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CabinetOverview } from './CabinetOverview';
import { WiringDiagram } from './WiringDiagram';
import { IoMonitoring } from './IoMonitoring';
import { ModeBanner } from '../../shared/ModeBanner';
import { SimulatedBadge } from '../../shared/SimulatedBadge';
import {
  Cpu,
  Layers,
  Workflow,
  Activity,
  ShieldCheck,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const ControlPanelView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cabinet' | 'wiring' | 'io'>('cabinet');

  return (
    <div className="space-y-4">
      {/* Top Operating Mode & Hardware Banner */}
      <ModeBanner />

      {/* Control Panel Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Electrical Control Panel & PLC Hardware Architecture
              </h2>
              <SimulatedBadge verified={false} text="SIMULATED CHASSIS" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Siemens S7-1500 / S7-1200 Enclosure layout, 25 Callouts, Signal-path tracing & I/O Channel Driver
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-slate-50 dark:bg-slate-850 text-xs">
          <button
            onClick={() => setActiveTab('cabinet')}
            className={`px-3.5 py-1.5 font-medium rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'cabinet'
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cabinet Overview (1-25)</span>
          </button>
          <button
            onClick={() => setActiveTab('wiring')}
            className={`px-3.5 py-1.5 font-medium rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'wiring'
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Wiring & Signal Path</span>
          </button>
          <button
            onClick={() => setActiveTab('io')}
            className={`px-3.5 py-1.5 font-medium rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'io'
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>I/O Monitoring</span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'cabinet' && <CabinetOverview />}
      {activeTab === 'wiring' && <WiringDiagram />}
      {activeTab === 'io' && <IoMonitoring />}
    </div>
  );
};

