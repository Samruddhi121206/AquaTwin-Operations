/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlant } from '../../context/PlantContext';
import { ModuleType } from '../../types/plant';
import {
  LayoutDashboard,
  Workflow,
  Cpu,
  Layers,
  AlertTriangle,
  Wrench,
  Droplets,
  Zap,
  BarChart3,
  Sliders,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface NavItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    alarms,
    isSimulating,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    resetSimulation,
    telemetry,
  } = usePlant();

  const unacknowledgedAlarms = alarms.filter((a) => !a.acknowledged).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Plant Dashboard', icon: LayoutDashboard },
    { id: 'operations', label: 'Live Operations (P&ID)', icon: Workflow },
    { id: 'twin', label: 'Digital Twin Simulation', icon: Cpu },
    { id: 'equipment', label: 'Equipment Registry', icon: Layers },
    { id: 'alarms', label: 'Alarms & Events', icon: AlertTriangle, badge: unacknowledgedAlarms },
    { id: 'maintenance', label: 'Maintenance & Work Orders', icon: Wrench },
    { id: 'water_quality', label: 'Water Quality Telemetry', icon: Droplets },
    { id: 'energy', label: 'Energy & Performance', icon: Zap },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Audit Logs', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 text-slate-700 dark:text-slate-300 select-none transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 dark:bg-cyan-600/20 border border-cyan-500/20 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold shadow-xs">
            <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">AquaTwin</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Operations & Digital Twin</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
          Modules & Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 ? (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums ${
                    isActive
                      ? 'bg-rose-500 text-white'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Simulation Engine Widget */}
      <div className="p-3 m-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                isSimulating ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'
              }`}
            />
            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
              {isSimulating ? 'SIMULATION RUNNING' : 'SIMULATION PAUSED'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">1.0s/tick</span>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
          Mass Balance: <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">Nominal</span> (Qf = Qp + Qr)
        </p>

        {/* Speed and Action Buttons */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSimulation}
              title={isSimulating ? 'Pause Simulation' : 'Resume Simulation'}
              className="p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition"
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={resetSimulation}
              title="Reset to Nominal Baseline"
              className="p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded p-0.5 border border-slate-200 dark:border-slate-800">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition ${
                  simulationSpeed === speed
                    ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Production Quick Footer */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div>
          <span>Permeate Flow</span>
          <p className="text-slate-900 dark:text-slate-200 font-mono font-semibold">
            {telemetry.ro_permeateFlowM3h} m³/h
          </p>
        </div>
        <div className="text-right">
          <span>Recovery</span>
          <p className="text-cyan-700 dark:text-cyan-400 font-mono font-semibold">
            {telemetry.ro_recoveryPercent}%
          </p>
        </div>
      </div>
    </aside>
  );
};
