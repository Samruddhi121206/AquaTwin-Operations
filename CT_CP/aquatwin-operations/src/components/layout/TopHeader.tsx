/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePlant } from '../../context/PlantContext';
import {
  Bell,
  Activity,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  User,
  Sun,
  Moon,
} from 'lucide-react';

export const TopHeader: React.FC = () => {
  const { activeModule, setActiveModule, alarms, activeScenario, applyScenario, theme, toggleTheme } = usePlant();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const moduleTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Plant Overview & KPIs', subtitle: 'Live telemetry, tank balances and operating summary' },
    operations: { title: 'Live Operations (P&ID)', subtitle: 'Piping & Instrumentation Diagram with interactive equipment' },
    twin: { title: 'Digital Twin Simulation', subtitle: 'Dynamic mass balance model, what-if scenarios & PID level control' },
    equipment: { title: 'Equipment Registry', subtitle: 'Asset specifications, vibration, thermal metrics & health scores' },
    alarms: { title: 'Alarms & Events', subtitle: 'ISA-18.2 compliant alarm management, acknowledgements & logs' },
    maintenance: { title: 'Maintenance & Work Orders', subtitle: 'Preventive schedules, work orders and equipment overhaul logs' },
    water_quality: { title: 'Water Quality Telemetry', subtitle: 'pH, TDS, conductivity, turbidity, SDI & sampling trends' },
    energy: { title: 'Energy & Performance', subtitle: 'Specific energy consumption (kWh/m³), pump power & recovery' },
    reports: { title: 'Reports & Analytics', subtitle: 'Operational data export, compliance summaries and PDF/CSV generator' },
    settings: { title: 'Settings & Audit Logs', subtitle: 'Plant configuration, user roles, audit trail & API bridge' },
  };

  const current = moduleTitles[activeModule] || { title: 'AquaTwin Operations', subtitle: '' };
  const unreadAlarms = alarms.filter((a) => !a.acknowledged);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between gap-6 shrink-0 z-10 transition-colors">
      {/* Zone 1: Breadcrumb & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">AquaTwin Plant 01</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-cyan-600 dark:text-cyan-400 font-medium capitalize">
            {activeModule.replace('_', ' ')}
          </span>
        </div>
        <div className="hidden lg:block h-4 w-px bg-slate-300 dark:bg-slate-700" />
        <h2 className="hidden lg:block text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
          {current.title}
        </h2>
      </div>

      {/* Zone 2: Digital Twin Scenario Quick Switch & Simulation Watermark */}
      <div className="flex items-center gap-3">
        {/* Notice of simulated data */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
          <Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
          <span className="font-semibold text-cyan-600 dark:text-cyan-400">Digital Twin Engine</span>
          <span className="text-slate-400">·</span>
          <span>Simulated Plant Data</span>
        </div>

        {/* Quick Scenario Preset Dropdown */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Scenario:</span>
          <select
            value={activeScenario}
            onChange={(e) => applyScenario(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="baseline" className="dark:bg-slate-900">Nominal Steady State</option>
            <option value="salinity_spike" className="dark:bg-slate-900">High Feed Salinity Spike</option>
            <option value="filter_fouling" className="dark:bg-slate-900">Cartridge F-201 Fouling</option>
            <option value="pump_trip" className="dark:bg-slate-900">P-202 HP Pump Trip</option>
            <option value="high_recovery" className="dark:bg-slate-900">Maximum Recovery Mode (80%)</option>
          </select>
        </div>
      </div>

      {/* Zone 3: Actions, Clock & Operator Profile */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Clock */}
        <div className="hidden xl:flex flex-col text-right">
          <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-200">{time}</span>
          <span className="text-[10px] text-slate-400">Shift B (06:00 - 14:00)</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-600 hover:text-cyan-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Alarm Notification Button */}
        <button
          onClick={() => setActiveModule('alarms')}
          className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`${unreadAlarms.length} Unacknowledged Alarms`}
        >
          <Bell className="w-4 h-4" />
          {unreadAlarms.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
          {unreadAlarms.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-semibold text-xs border border-slate-300 dark:border-slate-600">
            <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
              R. Sharma
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Lead Process Eng</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
