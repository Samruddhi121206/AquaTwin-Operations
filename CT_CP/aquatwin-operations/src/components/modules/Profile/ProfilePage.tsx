/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import {
  User,
  ShieldCheck,
  Mail,
  BadgeCheck,
  Clock,
  Building,
  KeyRound,
  Bell,
  Sliders,
  CheckCircle2,
  ArrowLeft,
  Activity,
  History,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { setActiveModule, auditLogs, theme, toggleTheme } = usePlant();

  // Profile preferences
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [criticalPush, setCriticalPush] = useState<boolean>(true);
  const [autoSaveTelemetry, setAutoSaveTelemetry] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const operatorLogs = auditLogs.filter(
    (log) => log.user === 'R. Sharma' || log.role.includes('Engineer')
  );

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-[1200px] mx-auto py-2 px-1 sm:px-2 space-y-5">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#162544]">
        <button
          onClick={() => setActiveModule('landing')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-sky-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Platform Overview</span>
        </button>

        <span className="text-[11px] font-mono text-slate-400 dark:text-sky-300/60">
          OPERATOR ID: OP-8492 · SHIFT B (ACTIVE)
        </span>
      </div>

      {/* Main Profile Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-[#0a1533] dark:via-[#0c1b40] dark:to-[#071026] border border-slate-200 dark:border-[#192b57] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar with Circular Badge & Status Dot */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <div className="w-full h-full rounded-[14px] bg-[#0a1128] flex items-center justify-center text-2xl font-bold text-white tracking-wider">
                RS
              </div>
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0a1128] shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              title="Online (Active Shift)"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#0a1b44] dark:text-white tracking-tight">
                R. Sharma
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                <BadgeCheck className="w-3 h-3" />
                Verified Operator
              </span>
            </div>
            <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
              Lead Process Engineer
            </p>
            <p className="text-xs text-slate-500 dark:text-sky-300/70 mt-1 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>r.sharma@aquatwin.internal</span>
            </p>
          </div>
        </div>

        {/* Quick Role Badges */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0f214d] border border-slate-200 dark:border-[#1e3a78] text-slate-700 dark:text-slate-200">
            <span className="text-[10px] text-slate-400 dark:text-sky-300/60 block">ROLE CLEARANCE</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">Super Admin (L4)</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0f214d] border border-slate-200 dark:border-[#1e3a78] text-slate-700 dark:text-slate-200">
            <span className="text-[10px] text-slate-400 dark:text-sky-300/60 block">STATION</span>
            <span className="font-bold text-slate-900 dark:text-white">Unit 01 Control Room</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Account Information */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#091430] border border-slate-200 dark:border-[#192b57] shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              Account & Operational Privileges
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0d1d42] border border-slate-200/80 dark:border-[#18366e]">
                <span className="text-[10px] text-slate-400 block font-mono">DEPARTMENT</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                  Process Automation & Digital Twins
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0d1d42] border border-slate-200/80 dark:border-[#18366e]">
                <span className="text-[10px] text-slate-400 block font-mono">ASSIGNED ASSET</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                  AquaTwin Skid Unit 01 (Desalination)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0d1d42] border border-slate-200/80 dark:border-[#18366e]">
                <span className="text-[10px] text-slate-400 block font-mono">CURRENT SHIFT</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                  Shift B (06:00 – 14:00 IST)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0d1d42] border border-slate-200/80 dark:border-[#18366e]">
                <span className="text-[10px] text-slate-400 block font-mono">ACTUATION PRIVILEGES</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Authorized (VFD, Valves & Scenarios)
                </span>
              </div>
            </div>
          </div>

          {/* Recent Operator Activity Log */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#091430] border border-slate-200 dark:border-[#192b57] shadow-xs space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-500" />
              Recent Operator Action Trail
            </h2>

            <div className="space-y-2">
              {operatorLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#0d1d42] border border-slate-200/80 dark:border-[#18366e] flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-sky-300/70 mt-0.5 block">
                      {log.details}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-sky-300/50 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Notification Settings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#091430] border border-slate-200 dark:border-[#192b57] shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            Profile Preferences
          </h2>

          <div className="space-y-3 text-xs">
            {/* Audio Alerts */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0d1d42] border border-slate-200/80 dark:border-[#18366e]">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Audible Alarm Buzzer
                </span>
                <span className="text-[10px] text-slate-400">Chime on critical ISA-18.2 trip</span>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Critical Push */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0d1d42] border border-slate-200/80 dark:border-[#18366e]">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Critical Push Banners
                </span>
                <span className="text-[10px] text-slate-400">Display instant high-priority alerts</span>
              </div>
              <input
                type="checkbox"
                checked={criticalPush}
                onChange={(e) => setCriticalPush(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Auto-Save Telemetry */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0d1d42] border border-slate-200/80 dark:border-[#18366e]">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  High-Frequency Logging
                </span>
                <span className="text-[10px] text-slate-400">Log 1s simulation intervals</span>
              </div>
              <input
                type="checkbox"
                checked={autoSaveTelemetry}
                onChange={(e) => setAutoSaveTelemetry(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Theme Toggle Button within Profile */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0d1d42] border border-slate-200/80 dark:border-[#18366e]">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Interface Theme
                </span>
                <span className="text-[10px] text-slate-400">Currently: {theme.toUpperCase()}</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold cursor-pointer hover:bg-cyan-500 hover:text-white transition"
              >
                Switch
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSavePreferences}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Profile Preferences</span>
            </button>
            {savedSuccess && (
              <p className="text-[11px] text-emerald-500 font-semibold text-center mt-2 animate-fade-in">
                Preferences successfully updated!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
