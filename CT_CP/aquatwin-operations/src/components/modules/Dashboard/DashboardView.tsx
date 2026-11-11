/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlant } from '../../../context/PlantContext';
import {
  Droplets,
  Zap,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Layers,
  Sliders,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    telemetry,
    equipmentList,
    alarms,
    acknowledgeAlarm,
    productionHistory,
    setActiveModule,
  } = usePlant();

  const unackAlarms = alarms.filter((a) => !a.acknowledged);

  return (
    <div className="space-y-5">
      {/* Top Notice Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-cyan-800 dark:text-cyan-300">
            DIGITAL TWIN VIRTUAL ENGINE ONLINE
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Real-time mass balance model active · 1-sec physics resolution
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModule('operations')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 transition flex items-center gap-1.5"
          >
            <span>Open P&ID Schematic</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (60-30-10 palette discipline, tabular numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Treated Permeate Production */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Permeate Production Flow</span>
            <Droplets className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {telemetry.ro_permeateFlowM3h}
            </span>
            <span className="text-xs text-slate-500 font-medium">m³/h</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Cumulative Today:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {telemetry.dailyProductionM3} m³
            </span>
          </div>
        </div>

        {/* KPI 2: RO Recovery Efficiency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">System Recovery Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {telemetry.ro_recoveryPercent}%
            </span>
            <span className="text-xs text-slate-500 font-medium">target 75.0%</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Reject Flow:</span>
            <span className="font-mono font-semibold text-amber-500">
              {telemetry.ro_rejectFlowM3h} m³/h
            </span>
          </div>
        </div>

        {/* KPI 3: Specific Energy Consumption */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Specific Energy (SEC)</span>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {telemetry.specificEnergyKwhM3}
            </span>
            <span className="text-xs text-slate-500 font-medium">kWh/m³</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Active Power:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {telemetry.totalPowerKw} kW
            </span>
          </div>
        </div>

        {/* KPI 4: Water Quality Purity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Permeate Salt Rejection</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
              {telemetry.ro_saltRejectionPercent}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {telemetry.permeateQuality.tdsMgL} mg/L TDS
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Raw Water TDS:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {telemetry.rawQuality.tdsMgL} mg/L
            </span>
          </div>
        </div>
      </div>

      {/* Tank Mass Balance & Visual Level Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* TK-101: Raw Water Equalization Tank */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400">
                  TK-101
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Raw Water Equalization Tank
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">50 m³ Capacity · Ultrasonic LT-101</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
              {telemetry.tk101.pidControlEnabled ? 'PID AUTO LOOP' : 'MANUAL'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Fill Level</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {telemetry.tk101.currentLevelPercent}%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({telemetry.tk101.currentLevelM3} / 50.0 m³)
                </span>
              </div>
            </div>

            {/* Visual Tank Bar */}
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60">
              <div
                className="h-full bg-cyan-500 rounded transition-all duration-700 relative"
                style={{ width: `${Math.min(100, Math.max(0, telemetry.tk101.currentLevelPercent))}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Inflow (XV-101)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {telemetry.tk101.inflowM3h} m³/h
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Outflow (P-101)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {telemetry.tk101.outflowM3h} m³/h
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">PID Setpoint</span>
                <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                  {telemetry.tk101.pidSetpointPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TK-201: Treated Permeate Storage Tank */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                  TK-201
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Treated Permeate Storage Tank
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">35 m³ Capacity · Sanitary Product Buffer</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              PRODUCT BUFFER
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Fill Level</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {telemetry.tk201.currentLevelPercent}%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({telemetry.tk201.currentLevelM3} / 35.0 m³)
                </span>
              </div>
            </div>

            {/* Visual Tank Bar */}
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60">
              <div
                className="h-full bg-emerald-500 rounded transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, telemetry.tk201.currentLevelPercent))}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">RO Inflow (Qp)</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {telemetry.tk201.inflowM3h} m³/h
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Plant Demand</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {telemetry.tk201.outflowM3h} m³/h
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Permeate TDS</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {telemetry.permeateQuality.tdsMgL} mg/L
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production & Energy Real-time Trend Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Real-time Water Production & Power Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synchronized permeate output (m³/h) and active power consumption (kW)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              Permeate Flow (m³/h)
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Active Power (kW)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={productionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="flowColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="powerColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="permeateM3h" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#flowColor)" />
              <Area type="monotone" dataKey="powerKw" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#powerColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Equipment Status Strip & Recent Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Equipment Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Equipment Fleet</h3>
              </div>
              <button
                onClick={() => setActiveModule('equipment')}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                View all ({equipmentList.length})
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 my-3 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-lg font-mono block">
                  {equipmentList.filter((e) => e.status === 'running').length}
                </span>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300">Running Active</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300 font-semibold text-lg font-mono block">
                  {equipmentList.filter((e) => e.status === 'standby').length}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Standby / Auto</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Average fleet health index: <span className="font-semibold text-emerald-500 font-mono">94.2%</span>
          </div>
        </div>

        {/* Recent Alarms */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Active Alarms & Operational Events
              </h3>
              {unackAlarms.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono">
                  {unackAlarms.length} Unacknowledged
                </span>
              )}
            </div>
            <button
              onClick={() => setActiveModule('alarms')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Alarm Console
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {alarms.slice(0, 3).map((alarm) => (
              <div
                key={alarm.id}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                  alarm.severity === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : alarm.severity === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-black/20 shrink-0">
                    {alarm.tag}
                  </span>
                  <div className="truncate">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{alarm.message}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Val: {alarm.value}</span>
                      <span>·</span>
                      <span>{alarm.timestamp}</span>
                    </div>
                  </div>
                </div>

                {!alarm.acknowledged ? (
                  <button
                    onClick={() => acknowledgeAlarm(alarm.id)}
                    className="shrink-0 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-medium transition"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="shrink-0 text-[10px] text-emerald-500 font-medium">Ack'd</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
