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
        className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col h-screen nav-surface nav-border-r select-none shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-64 translate-x-0 opacity-100'
            : 'w-0 -translate-x-full lg:w-0 opacity-0 pointer-events-none'
        } overflow-hidden`}
      >
        <div className="w-64 h-full flex flex-col shrink-0 justify-between">
          <div>
            {/* Brand Header */}
            <div className="nav-surface p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--nav-border)' }}>
              <div
                onClick={onToggle}
                className="flex items-center gap-3 cursor-pointer group select-none"
                title="Click AquaTwin Logo to toggle sidebar"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-transform group-hover:scale-105">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h1 className="nav-text text-base font-bold tracking-tight leading-tight">
                    AquaTwin
                  </h1>
                  <p className="nav-muted text-[11px] font-medium">
                    4-Module Operations Platform
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="nav-item p-1.5 rounded-lg transition border border-transparent cursor-pointer"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Navigation List */}
            <nav className="p-3 space-y-1.5 overflow-y-auto">
              <div className="nav-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider font-mono">
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
                        ? 'nav-item-active font-semibold border border-transparent'
                        : 'nav-item border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isSelected
                            ? ''
                            : ''
                        }`}
                      />
                      <div className="text-left">
                        <span className="block leading-tight">
                          {item.number && (
                            <span className="font-mono text-[10px] opacity-75 mr-1.5">
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
                            ? 'raised border'
                            : 'nav-muted border'
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
              <div className="p-3 mx-3 mb-3 rounded-xl border text-xs shadow-inner" style={{ backgroundColor: 'var(--nav-active-bg)', borderColor: 'var(--nav-border)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSimulating
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span className="nav-text text-[10px] font-bold uppercase font-mono">
                      {isSimulating ? 'SIMULATION TICK' : 'SIMULATION FROZEN'}
                    </span>
                  </div>
                  <span className="nav-muted text-[10px] font-mono">1.0s</span>
                </div>

                <div className="flex items-center justify-between gap-1 pt-2 border-t" style={{ borderColor: 'var(--nav-border)' }}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={toggleSimulation}
                      title={isSimulating ? 'Pause Simulation' : 'Resume Simulation'}
                      className="nav-item p-1.5 rounded border transition cursor-pointer" style={{ borderColor: 'var(--nav-border)' }}
                    >
                      {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
                    </button>
                    <button
                      onClick={resetSimulation}
                      title="Reset to Baseline"
                      className="nav-item p-1.5 rounded border transition cursor-pointer" style={{ borderColor: 'var(--nav-border)' }}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="nav-surface flex items-center rounded p-0.5 border" style={{ borderColor: 'var(--nav-border)' }}>
                    {[1, 2, 5].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setSimulationSpeed(speed)}
                        className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition cursor-pointer ${
                          simulationSpeed === speed
                            ? 'btn-primary font-bold'
                            : 'nav-item'
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
              className={`nav-item p-3.5 border-t flex items-center justify-between cursor-pointer transition-colors group ${
                activeModule === 'profile' ? 'nav-item-active' : ''
              }`}
              title="View Operator Profile"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-sm">
                    <div className="nav-surface w-full h-full rounded-full flex items-center justify-center text-xs font-bold">
                      RS
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border" style={{ borderColor: 'var(--bg-nav)' }} />
                </div>
                <div className="text-left">
                  <div className="nav-text text-xs font-bold transition-colors flex items-center gap-1">
                    <span>R. Sharma</span>
                  </div>
                  <div className="nav-muted text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Lead Process Eng</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
