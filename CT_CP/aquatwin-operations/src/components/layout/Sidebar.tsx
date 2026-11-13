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
  PanelLeftClose,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  id: ModuleType;
  number?: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onToggle,
}) => {
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

  const handleNavClick = (id: ModuleType) => {
    setActiveModule(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Collapsible Sidebar Container */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col h-screen bg-[#0a1128] border-r border-[#162544] text-slate-200 select-none shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-64 translate-x-0 opacity-100'
            : 'w-0 -translate-x-full lg:w-0 opacity-0 pointer-events-none'
        } overflow-hidden`}
      >
        <div className="w-64 h-full flex flex-col shrink-0 justify-between">
          <div>
            {/* Brand Header */}
            <div className="p-4 border-b border-[#162544] flex items-center justify-between bg-[#080e22]">
              <div
                onClick={onToggle}
                className="flex items-center gap-3 cursor-pointer group select-none"
                title="Click AquaTwin Logo to toggle sidebar"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-transform group-hover:scale-105">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                    AquaTwin
                  </h1>
                  <p className="text-[11px] text-sky-300/70 font-medium">
                    4-Module Operations Platform
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#132247] transition border border-transparent hover:border-[#1e3366] cursor-pointer"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="w-4 h-4 text-sky-300/80" />
              </button>
            </div>

            {/* Primary Navigation List */}
            <nav className="p-3 space-y-1.5 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-400/60 font-mono">
                Main Modules
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
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
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:bg-[#132247] hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isSelected
                            ? 'text-cyan-400'
                            : 'text-sky-300/80 group-hover:text-cyan-300'
                        }`}
                      />
                      <div className="text-left">
                        <span className="block leading-tight">
                          {item.number && (
                            <span className="font-mono text-[10px] opacity-75 mr-1.5 text-sky-400">
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
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                            : 'bg-[#121f42] text-sky-300 border border-[#1e3366]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            {/* Phase 5: Hide Simulation Tick from Platform Overview (landing) */}
            {activeModule !== 'landing' && (
              <div className="p-3 mx-3 mb-3 bg-[#0d1733] rounded-xl border border-[#182a52] text-xs shadow-inner">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSimulating
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-[10px] font-bold text-slate-200 uppercase font-mono">
                      {isSimulating ? 'SIMULATION TICK' : 'SIMULATION FROZEN'}
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-300/60 font-mono">1.0s</span>
                </div>

                <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#182a52]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={toggleSimulation}
                      title={isSimulating ? 'Pause Simulation' : 'Resume Simulation'}
                      className="p-1.5 rounded bg-[#132247] hover:bg-[#1a2f61] text-slate-200 border border-[#1e3366] transition cursor-pointer"
                    >
                      {isSimulating ? <Pause className="w-3 h-3 text-sky-300" /> : <Play className="w-3 h-3 text-emerald-400" />}
                    </button>
                    <button
                      onClick={resetSimulation}
                      title="Reset to Baseline"
                      className="p-1.5 rounded bg-[#132247] hover:bg-[#1a2f61] text-slate-200 border border-[#1e3366] transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-sky-300" />
                    </button>
                  </div>

                  <div className="flex items-center bg-[#091024] rounded p-0.5 border border-[#182a52]">
                    {[1, 2, 5].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setSimulationSpeed(speed)}
                        className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition cursor-pointer ${
                          simulationSpeed === speed
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Phase 4: Operator Profile Information Footer */}
            <div
              onClick={() => handleNavClick('profile')}
              className={`p-3.5 bg-[#080d21] border-t border-[#162544] flex items-center justify-between cursor-pointer hover:bg-[#111c3d] transition-colors group ${
                activeModule === 'profile' ? 'bg-[#111c3d] border-t-cyan-400' : ''
              }`}
              title="View Operator Profile"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-sm">
                    <div className="w-full h-full rounded-full bg-[#0a1128] flex items-center justify-center text-xs font-bold text-white">
                      RS
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#080d21]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                    <span>R. Sharma</span>
                  </div>
                  <div className="text-[10px] text-sky-300/70 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Lead Process Eng</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
