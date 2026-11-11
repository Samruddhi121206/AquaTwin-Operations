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
  BarChart3,
  Sliders,
  Droplets,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  id: ModuleType;
  number?: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    isSimulating,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    resetSimulation,
    telemetry,
  } = usePlant();

  // Primary 4 Modules + Landing + Settings
  const navItems: NavItem[] = [
    {
      id: 'landing',
      label: 'Platform Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'plant',
      number: '01',
      label: 'Plant',
      icon: Workflow,
      badge: `${telemetry.tk101.currentLevelPercent.toFixed(0)}%`,
    },
    {
      id: 'io',
      number: '02',
      label: 'Input / Output',
      icon: Cpu,
      badge: 'PLC',
    },
    {
      id: 'control_panel',
      number: '03',
      label: 'Control Panel',
      icon: Layers,
      badge: '25',
    },
    {
      id: 'analysis',
      number: '04',
      label: 'Analysis',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings & Audit',
      icon: Sliders,
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 text-slate-700 dark:text-slate-300 select-none transition-colors">
      {/* Brand Header */}
      <div
        onClick={() => setActiveModule('landing')}
        className="cursor-pointer p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 dark:bg-cyan-600/20 border border-cyan-500/20 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold shadow-xs">
            <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
              AquaTwin
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              4-Module Operations Platform
            </p>
          </div>
        </div>
      </div>

      {/* Primary Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Main Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          // Check if current activeModule matches item id or any legacy alias
          const isSelected =
            activeModule === item.id ||
            (item.id === 'plant' &&
              ['operations', 'dashboard', 'twin', 'equipment', 'alarms', 'maintenance'].includes(
                activeModule
              )) ||
            (item.id === 'analysis' &&
              ['water_quality', 'energy', 'reports'].includes(activeModule));

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isSelected
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isSelected
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                <div className="text-left">
                  <span className="block leading-tight">
                    {item.number && (
                      <span className="font-mono text-[10px] opacity-60 mr-1.5">
                        {item.number}.
                      </span>
                    )}
                    {item.label}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Virtual PLC Simulator Status Box */}
      <div className="p-3 mx-3 mb-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                isSimulating
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                  : 'bg-amber-500'
              }`}
            />
            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
              {isSimulating ? 'SIMULATION TICK' : 'SIMULATION FROZEN'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">1.0s</span>
        </div>

        <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSimulation}
              title={isSimulating ? 'Pause Simulation' : 'Resume Simulation'}
              className="p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            >
              {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={resetSimulation}
              title="Reset to Baseline"
              className="p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded p-0.5 border border-slate-200 dark:border-slate-800">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition ${
                  simulationSpeed === speed
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Production Quick Footer */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block">Permeate</span>
          <span className="text-slate-900 dark:text-slate-200 font-bold">
            {telemetry.ro_permeateFlowM3h.toFixed(1)} m³/h
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Recovery</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">
            {telemetry.ro_recoveryPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </aside>
  );
};
