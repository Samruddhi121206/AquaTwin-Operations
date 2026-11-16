/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlant } from '../../context/PlantContext';
import {
  Bell,
  SlidersHorizontal,
  Sun,
  Moon,
  Droplets,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface TopHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen = false,
}) => {
  const { setActiveModule, alarms, activeScenario, applyScenario, theme, toggleTheme } = usePlant();
  const unreadAlarms = alarms.filter((a) => !a.acknowledged);

  return (
    <header className="h-14 bg-[#0a1128] border-b border-[#162544] px-4 sm:px-5 flex items-center justify-between gap-4 shrink-0 z-20 text-white shadow-md select-none">
      {/* Zone 1: Clickable AquaTwin Logo (Toggles Sidebar) & Scenario Preset */}
      <div className="flex items-center gap-4">
        {/* Clickable AquaTwin Logo to Open / Close Sidebar */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center gap-2.5 p-1 -ml-1 rounded-lg hover:bg-[#132247] transition group cursor-pointer focus:outline-hidden"
          title={isSidebarOpen ? 'Close Navigation Sidebar' : 'Open Navigation Sidebar'}
          aria-label="Toggle navigation menu"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-transform group-hover:scale-105">
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-white leading-tight">
              AquaTwin
            </span>
            <div className="text-sky-400/80 group-hover:text-cyan-400 transition-colors">
              {isSidebarOpen ? (
                <PanelLeftClose className="w-3.5 h-3.5" />
              ) : (
                <PanelLeft className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
        </button>

        <div className="h-4 w-px bg-[#1e3366] hidden sm:block" />

        {/* Quick Scenario Preset Dropdown */}
        <div className="flex items-center gap-2 bg-[#0f1d3d] px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#1e3366] text-xs shadow-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[11px] text-sky-200/90 font-semibold tracking-wide hidden sm:inline">
            Scenario:
          </span>
          <select
            value={activeScenario}
            onChange={(e) => applyScenario(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
          >
            <option value="baseline" className="bg-[#0a1128] text-white">
              Nominal Steady State
            </option>
            <option value="salinity_spike" className="bg-[#0a1128] text-white">
              High Feed Salinity Spike
            </option>
            <option value="filter_fouling" className="bg-[#0a1128] text-white">
              Cartridge F-201 Fouling
            </option>
            <option value="pump_trip" className="bg-[#0a1128] text-white">
              P-202 HP Pump Trip
            </option>
            <option value="high_recovery" className="bg-[#0a1128] text-white">
              Maximum Recovery Mode (80%)
            </option>
          </select>
        </div>
      </div>

      {/* Zone 2: Theme Toggle & Alarm / Notification Icon */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-sky-300 hover:text-white hover:bg-[#132247] border border-transparent hover:border-[#1e3366] transition cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-sky-300 hover:text-cyan-300 transition-colors" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
          )}
        </button>

        {/* Alarm Notification Button */}
        <button
          onClick={() => setActiveModule('alarms')}
          className="relative p-2 rounded-lg text-sky-300 hover:text-white hover:bg-[#132247] border border-transparent hover:border-[#1e3366] transition cursor-pointer"
          title={`${unreadAlarms.length} Unacknowledged Alarms`}
          aria-label="Alarm notifications"
        >
          <Bell className="w-4 h-4 text-sky-300" />
          {unreadAlarms.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
          {unreadAlarms.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>
      </div>
    </header>
  );
};
