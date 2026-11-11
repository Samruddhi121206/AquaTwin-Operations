/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../context/PlantContext';
import { ModeBanner } from '../../components/shared/ModeBanner';
import { SimulatedBadge } from '../../components/shared/SimulatedBadge';
import { WaterQualityView } from '../../components/modules/WaterQuality/WaterQualityView';
import { EnergyView } from '../../components/modules/EnergyPerformance/EnergyView';
import { ReportsView } from '../../components/modules/ReportsAnalytics/ReportsView';
import {
  BarChart3,
  TrendingUp,
  Droplets,
  Zap,
  History,
  FileSpreadsheet,
  Calendar,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const AnalysisView: React.FC = () => {
  const { telemetry, productionHistory, alarms, auditLogs, theme } = usePlant();
  const [analysisTab, setAnalysisTab] = useState<'trends' | 'quality' | 'energy' | 'alarms' | 'reports'>('trends');

  const isDark = theme === 'dark';

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <ModeBanner />

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Analysis Module — Historical Performance, Water Quality & Reports
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ANALYTICAL HUB
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Long-term process trends, water quality compliance, energy consumption metrics & report exports
            </p>
          </div>
        </div>

        {/* Quick Performance Indicators */}
        <div className="flex items-center gap-3 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">RO Recovery</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {telemetry.ro_recoveryPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Product TDS</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              {telemetry.permeateQuality.tdsMgL} mg/L
            </span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Daily Production</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {telemetry.dailyProductionM3.toFixed(1)} m³
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 text-xs overflow-x-auto">
        <button
          onClick={() => setAnalysisTab('trends')}
          className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-1.5 ${
            analysisTab === 'trends'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Process Trends</span>
        </button>

        <button
          onClick={() => setAnalysisTab('quality')}
          className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-1.5 ${
            analysisTab === 'quality'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Water Quality</span>
        </button>

        <button
          onClick={() => setAnalysisTab('energy')}
          className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-1.5 ${
            analysisTab === 'energy'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Equipment & Energy</span>
        </button>

        <button
          onClick={() => setAnalysisTab('alarms')}
          className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-1.5 ${
            analysisTab === 'alarms'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Alarm & Event History</span>
        </button>

        <button
          onClick={() => setAnalysisTab('reports')}
          className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-1.5 ${
            analysisTab === 'reports'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Reports & CSV Generator</span>
        </button>
      </div>

      {/* Tab 1: Process Trends */}
      {analysisTab === 'trends' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Multi-Variable Process Trend Correlation
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Historical correlation of Tank Levels, Permeate Flow, RO Feed Pressure, and Power Load
              </p>
            </div>
            <span className="font-mono text-cyan-600 dark:text-cyan-400 text-xs">
              Live Buffer: 60 Samples
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="timestamp" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="permeateM3h"
                  name="Permeate Flow (m³/h)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="powerKw"
                  name="Power Consumption (kW)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="recoveryPercent"
                  name="RO Recovery (%)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 2: Water Quality */}
      {analysisTab === 'quality' && <WaterQualityView />}

      {/* Tab 3: Equipment & Energy Analysis */}
      {analysisTab === 'energy' && <EnergyView />}

      {/* Tab 4: Alarm History */}
      {analysisTab === 'alarms' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Historical Alarm & Event Transitions (ISA-18.2)
              </h2>
              <p className="text-slate-500 text-xs">
                Chronological sequence of alarm trip thresholds, acknowledgments, and clears
              </p>
            </div>
            <span className="font-mono text-slate-500 text-xs">
              {alarms.length} Total Logged
            </span>
          </div>

          <div className="space-y-2">
            {alarms.map((alm) => (
              <div
                key={alm.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alm.severity === 'critical'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {alm.severity}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {alm.message} ({alm.tag})
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      Timestamp: {alm.timestamp} · Value: {alm.value} · Threshold: {alm.threshold}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono">
                  {alm.acknowledged ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      ACKNOWLEDGED by {alm.acknowledgedBy || 'Operator'}
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      UNACKNOWLEDGED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Reports */}
      {analysisTab === 'reports' && <ReportsView />}
    </div>
  );
};

