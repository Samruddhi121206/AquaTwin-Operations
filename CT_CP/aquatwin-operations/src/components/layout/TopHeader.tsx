/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
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

  // Shake the bell once each time a new alarm arrives (remount restarts the CSS animation).
  const [shakeKey, setShakeKey] = useState<number>(0);
  const prevCount = useRef<number>(alarms.length);
  useEffect(() => {
    if (alarms.length > prevCount.current) setShakeKey((k) => k + 1);
    prevCount.current = alarms.length;
  }, [alarms.length]);

  return (
    <header className="nav-surface nav-border-b h-14 px-4 sm:px-5 flex items-center justify-between gap-4 shrink-0 z-20 shadow-md select-none">
      {/* Zone 1: Clickable AquaTwin Logo (Toggles Sidebar) & Scenario Preset */}
      <div className="flex items-center gap-4">
        {/* Clickable AquaTwin Logo to Open / Close Sidebar */}
        <button
          onClick={onToggleSidebar}
          className="nav-item flex items-center gap-2.5 p-1 -ml-1 rounded-lg transition group cursor-pointer"
          title={isSidebarOpen ? 'Close Navigation Sidebar' : 'Open Navigation Sidebar'}
          aria-label="Toggle navigation menu"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-transform group-hover:scale-105">
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="nav-text text-sm font-bold tracking-tight leading-tight">
              AquaTwin
            </span>
            <div className="nav-muted transition-colors">
              {isSidebarOpen ? (
                <PanelLeftClose className="w-3.5 h-3.5" />
              ) : (
                <PanelLeft className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
        </button>

        <div className="h-4 w-px hidden sm:block" style={{ backgroundColor: 'var(--nav-border)' }} />

        {/* Quick Scenario Preset Dropdown */}
        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs shadow-xs" style={{ backgroundColor: 'var(--nav-active-bg)', borderColor: 'var(--nav-border)' }}>
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="nav-muted text-[11px] font-semibold tracking-wide hidden sm:inline">
            Scenario:
          </span>
          <select
            value={activeScenario}
            onChange={(e) => applyScenario(e.target.value)}
            className="nav-text bg-transparent text-xs font-semibold cursor-pointer pr-1"
          >
            <option value="baseline" style={{ backgroundColor: 'var(--bg-nav)', color: 'var(--nav-text)' }}>
              Nominal Steady State
            </option>
            <option value="salinity_spike" style={{ backgroundColor: 'var(--bg-nav)', color: 'var(--nav-text)' }}>
              High Feed Salinity Spike
            </option>
            <option value="filter_fouling" style={{ backgroundColor: 'var(--bg-nav)', color: 'var(--nav-text)' }}>
              Cartridge F-201 Fouling
            </option>
            <option value="pump_trip" style={{ backgroundColor: 'var(--bg-nav)', color: 'var(--nav-text)' }}>
              P-202 HP Pump Trip
            </option>
            <option value="high_recovery" style={{ backgroundColor: 'var(--bg-nav)', color: 'var(--nav-text)' }}>
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
          className="nav-item btn p-2 rounded-lg border border-transparent transition cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 transition-colors" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
          )}
        </button>

        {/* Alarm Notification Button */}
        <button
          onClick={() => setActiveModule('alarms')}
          className="nav-item btn relative p-2 rounded-lg border border-transparent transition cursor-pointer"
          title={`${unreadAlarms.length} Unacknowledged Alarms`}
          aria-label="Alarm notifications"
        >
          <Bell key={shakeKey} className={`w-4 h-4 ${shakeKey > 0 ? 'bell-shake' : ''}`} />
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
