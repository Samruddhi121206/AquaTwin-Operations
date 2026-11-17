/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CabinetOverview } from '../../components/modules/ControlPanel/CabinetOverview';
import { WiringDiagram } from '../../components/modules/ControlPanel/WiringDiagram';
import { IoMonitoring } from '../../components/modules/ControlPanel/IoMonitoring';
import { ModeBanner } from '../../components/shared/ModeBanner';
import { SimulatedBadge } from '../../components/shared/SimulatedBadge';
import {
  Layers,
  Workflow,
  Activity,
  Cpu,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const ControlPanelView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cabinet' | 'wiring' | 'io'>('cabinet');

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <ModeBanner />

      {/* Control Panel Title & Mode */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Control Panel
              </h1>
              <SimulatedBadge verified={false} text="CHASSIS REFERENCE" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Siemens S7 industrial enclosure layout with 25 Callouts, DIN rail zones Z1-Z5, and live signal-path tracing
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-slate-50 dark:bg-slate-850 text-xs">
          <button
            onClick={() => setActiveTab('cabinet')}
            className={`btn relative px-3.5 py-1.5 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'cabinet'
                ? 'text-cyan-700 dark:text-cyan-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === 'cabinet' && (
              <motion.span
                layoutId="cp-tab-indicator"
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute inset-0 rounded-md bg-cyan-500/15 border border-cyan-500/30"
              />
            )}
            <Layers className="relative w-3.5 h-3.5" />
            <span className="relative">Cabinet Overview (1-25)</span>
          </button>
          <button
            onClick={() => setActiveTab('wiring')}
            className={`btn relative px-3.5 py-1.5 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'wiring'
                ? 'text-cyan-700 dark:text-cyan-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === 'wiring' && (
              <motion.span
                layoutId="cp-tab-indicator"
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute inset-0 rounded-md bg-cyan-500/15 border border-cyan-500/30"
              />
            )}
            <Workflow className="relative w-3.5 h-3.5" />
            <span className="relative">Interactive Wiring Tracer</span>
          </button>
          <button
            onClick={() => setActiveTab('io')}
            className={`btn relative px-3.5 py-1.5 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'io'
                ? 'text-cyan-700 dark:text-cyan-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === 'io' && (
              <motion.span
                layoutId="cp-tab-indicator"
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute inset-0 rounded-md bg-cyan-500/15 border border-cyan-500/30"
              />
            )}
            <Activity className="relative w-3.5 h-3.5" />
            <span className="relative">Channel Terminals</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'cabinet' && <CabinetOverview />}
      {activeTab === 'wiring' && <WiringDiagram />}
      {activeTab === 'io' && <IoMonitoring />}
    </div>
  );
};
