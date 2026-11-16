/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePlant } from '../../context/PlantContext';
import { ModeBanner } from '../../components/shared/ModeBanner';
import { WaterQualityView } from '../../components/modules/WaterQuality/WaterQualityView';
import { EnergyView } from '../../components/modules/EnergyPerformance/EnergyView';
import { ReportsView } from '../../components/modules/ReportsAnalytics/ReportsView';
import { generateProcessTrends, ProcessTrendPoint } from './sampleData';
import {
  BarChart3,
  TrendingUp,
  Droplets,
  Zap,
  History,
  FileSpreadsheet,
  Download,
  Info,
  CheckCircle2,
  Activity,
  Layers,
  Gauge,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const AnalysisView: React.FC = () => {
  const { telemetry, alarms, theme } = usePlant();
  const [analysisTab, setAnalysisTab] = useState<'trends' | 'quality' | 'energy' | 'alarms' | 'reports'>('trends');

  // Stable realistic fluctuating sample dataset (48 historical sample points)
  const [trendData, setTrendData] = useState<ProcessTrendPoint[]>(() => generateProcessTrends(48));

  // Phase 3: Track which individual series is hovered for single-parameter tooltip
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  // Periodic controlled incremental update with live telemetry correlation
  useEffect(() => {
    const timer = setInterval(() => {
      setTrendData((prev) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const jitter = Math.random() - 0.5;
        const newPoint: ProcessTrendPoint = {
          timestamp: timeStr,
          tankLevelPercent: Number((telemetry.tk101.currentLevelPercent + jitter * 0.4).toFixed(1)),
          permeateFlowM3h: Number((telemetry.ro_permeateFlowM3h + jitter * 0.15).toFixed(2)),
          recoveryPercent: Number((telemetry.ro_recoveryPercent + jitter * 0.25).toFixed(1)),
          powerKw: Number((telemetry.totalPowerKw + jitter * 0.35).toFixed(1)),
          feedPressureBar: Number((15.4 + jitter * 0.2).toFixed(2)),
        };

        return [...prev.slice(1), newPoint];
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [telemetry]);

  const isDark = theme === 'dark';

  // Units and labels dictionary for individual hover tooltip
  const seriesMeta: Record<string, { label: string; unit: string; color: string }> = {
    tankLevelPercent: { label: 'Tank Level', unit: '%', color: '#06b6d4' },
    permeateFlowM3h: { label: 'Permeate Flow', unit: 'm³/h', color: '#10b981' },
    recoveryPercent: { label: 'RO Recovery', unit: '%', color: '#3b82f6' },
    powerKw: { label: 'Power Consumption', unit: 'kW', color: '#f59e0b' },
    feedPressureBar: { label: 'RO Feed Pressure', unit: 'bar', color: '#a855f7' },
  };

  // Phase 3: Custom Tooltip that displays ONLY the hovered parameter
  const CustomSingleTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    // Filter to the active hovered series if hovered, else pick the first active series
    const targetKey = hoveredSeries || payload[0]?.dataKey;
    const targetItem = payload.find((item: any) => item.dataKey === targetKey) || payload[0];
    if (!targetItem) return null;

    const meta = seriesMeta[targetItem.dataKey] || {
      label: targetItem.name,
      unit: '',
      color: targetItem.stroke || targetItem.color,
    };

    return (
      <div className="bg-white dark:bg-[#0a1128] border border-slate-200 dark:border-[#1e3366] rounded-xl p-2.5 shadow-lg text-xs font-sans min-w-[150px]">
        <div className="text-[10px] text-slate-400 font-mono pb-1 mb-1.5 border-b border-slate-100 dark:border-[#182952]">
          Time: <span className="font-bold text-slate-700 dark:text-slate-200">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: meta.color }}
          />
          <div className="flex-1">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">
              {meta.label}
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
              {targetItem.value} <span className="text-[10px] font-normal text-slate-400">{meta.unit}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Phase 4: Download Process Trends CSV
  const handleDownloadTrends = () => {
    const headers = [
      'Timestamp',
      'Tank Level (%)',
      'Permeate Flow (m3/h)',
      'RO Recovery (%)',
      'Power Consumption (kW)',
      'RO Feed Pressure (bar)',
    ];
    const rows = trendData.map((d) => [
      d.timestamp,
      d.tankLevelPercent,
      d.permeateFlowM3h,
      d.recoveryPercent,
      d.powerKw,
      d.feedPressureBar,
    ]);
    const comments = [
      '# AquaTwin Operations — Process Trends Report',
      `# Generated: ${new Date().toLocaleString()}`,
      '#',
      '# Parameter Specifications:',
      '# 1. Tank Level: Water volume percentage in equalization tank TK-101 (%)',
      '# 2. Permeate Flow: Rate of treated demineralized water production (m3/h)',
      '# 3. RO Recovery: Ratio of permeate production to raw feed inflow (%)',
      '# 4. Power Consumption: Active electrical demand of pumps and skid drives (kW)',
      '# 5. RO Feed Pressure: Membrane inlet pressure supplied by HP pump P-202 (bar)',
      '#',
    ];

    const csvContent = [...comments, headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AquaTwin_Process_Trends_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const subNavTabs = [
    { id: 'trends' as const, label: 'Process Trends', icon: TrendingUp },
    { id: 'quality' as const, label: 'Water Quality', icon: Droplets },
    { id: 'energy' as const, label: 'Equipment & Energy', icon: Zap },
    { id: 'alarms' as const, label: 'Alarm & Event History', icon: History },
    { id: 'reports' as const, label: 'Reports & CSV Generator', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <ModeBanner />

      {/* PHASE 1: Title Header - Redesigned with Light Sky-Blue / Ice-Blue Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-50 via-blue-50/80 to-cyan-50 border border-sky-200/90 p-4 sm:p-5 rounded-2xl shadow-sm shadow-sky-100/50">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white border border-sky-200 text-blue-600 shadow-xs">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-[#0a1b44] tracking-tight">
                Analysis Module — Historical Performance, Water Quality & Reports
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-xs tracking-wider font-mono">
                ANALYTICAL HUB
              </span>
            </div>
            <p className="text-xs text-[#1e3a66] font-medium mt-0.5">
              Long-term process trends, water quality compliance, energy consumption metrics & report exports
            </p>
          </div>
        </div>

        {/* Quick Performance Indicators — Prominent Visual Metrics */}
        <div className="flex items-center gap-3.5 text-xs font-mono bg-white/90 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-sky-200 shadow-xs shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">RO Recovery</span>
            <span className="text-base font-black text-blue-700 font-mono">
              {telemetry.ro_recoveryPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-px h-8 bg-sky-200" />
          <div>
            <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">Product TDS</span>
            <span className="text-base font-black text-cyan-600 font-mono">
              {telemetry.permeateQuality.tdsMgL} <span className="text-[10px] font-normal text-slate-500">mg/L</span>
            </span>
          </div>
          <div className="w-px h-8 bg-sky-200" />
          <div>
            <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">Daily Production</span>
            <span className="text-base font-black text-[#0a1b44] font-mono">
              {telemetry.dailyProductionM3.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">m³</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
        {subNavTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = analysisTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAnalysisTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer group select-none ${
                isActive
                  ? 'bg-sky-50 dark:bg-[#0d224d] border-2 border-cyan-500 dark:border-cyan-400 text-[#091b40] dark:text-cyan-200 font-bold shadow-xs shadow-cyan-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-cyan-400/40 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                  isActive
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-400 dark:text-slate-400 group-hover:text-cyan-500'
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Process Trends — PHASE 4: 2-COLUMN HALF-GRAPH + INFO PANEL */}
      {analysisTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Half-Graph (55% width -> col-span-12 lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Multi-Variable Process Trend Correlation
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    Live dynamic correlation of tank levels, permeate flow, recovery, power & pressure
                  </p>
                </div>
                <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 self-start sm:self-auto">
                  Simulated Sample Data
                </span>
              </div>

              {/* Chart with Soft Gradients, Point Markers & Phase 3 Individual Tooltip */}
              <div className="h-80 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 15, left: 0, bottom: 15 }}>
                    <defs>
                      <linearGradient id="colorTank" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorPermeate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.6} />

                    {/* PHASE 2: Clear X-Axis Label */}
                    <XAxis
                      dataKey="timestamp"
                      stroke={isDark ? '#94a3b8' : '#64748b'}
                      fontSize={10}
                      tickLine={false}
                      label={{
                        value: 'Time (HH:MM)',
                        position: 'insideBottom',
                        offset: -10,
                        fill: isDark ? '#94a3b8' : '#64748b',
                        fontSize: 10,
                      }}
                    />

                    {/* PHASE 2: Clear Y-Axis Label */}
                    <YAxis
                      stroke={isDark ? '#94a3b8' : '#64748b'}
                      fontSize={10}
                      tickLine={false}
                      domain={[0, 100]}
                      label={{
                        value: 'Operating Parameter Value (% / m³/h / kW / bar)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 12,
                        fill: isDark ? '#94a3b8' : '#64748b',
                        fontSize: 10,
                        style: { textAnchor: 'middle' },
                      }}
                    />

                    {/* PHASE 3: Individual Hover Tooltip */}
                    <Tooltip content={<CustomSingleTooltip />} />

                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }}
                      onMouseEnter={(o) => setHoveredSeries(o.dataKey as string)}
                      onMouseLeave={() => setHoveredSeries(null)}
                    />

                    {/* 1. Tank Level */}
                    <Area
                      type="monotone"
                      dataKey="tankLevelPercent"
                      name="Tank Level (%)"
                      stroke="#06b6d4"
                      strokeWidth={2.2}
                      fillOpacity={1}
                      fill="url(#colorTank)"
                      dot={{ r: 2, fill: '#fff', stroke: '#06b6d4', strokeWidth: 1.5 }}
                      activeDot={{ r: 5 }}
                      onMouseEnter={() => setHoveredSeries('tankLevelPercent')}
                      onMouseLeave={() => setHoveredSeries(null)}
                    />

                    {/* 2. Permeate Flow */}
                    <Area
                      type="monotone"
                      dataKey="permeateFlowM3h"
                      name="Permeate Flow (m³/h)"
                      stroke="#10b981"
                      strokeWidth={2.2}
                      fillOpacity={1}
                      fill="url(#colorPermeate)"
                      dot={{ r: 2, fill: '#fff', stroke: '#10b981', strokeWidth: 1.5 }}
                      activeDot={{ r: 5 }}
                      onMouseEnter={() => setHoveredSeries('permeateFlowM3h')}
                      onMouseLeave={() => setHoveredSeries(null)}
                    />

                    {/* 3. RO Recovery */}
                    <Area
                      type="monotone"
                      dataKey="recoveryPercent"
                      name="RO Recovery (%)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRecovery)"
                      dot={{ r: 2, fill: '#fff', stroke: '#3b82f6', strokeWidth: 1.5 }}
                      activeDot={{ r: 5 }}
                      onMouseEnter={() => setHoveredSeries('recoveryPercent')}
                      onMouseLeave={() => setHoveredSeries(null)}
                    />

                    {/* 4. Power Consumption */}
                    <Area
                      type="monotone"
                      dataKey="powerKw"
                      name="Power Consumption (kW)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPower)"
                      dot={{ r: 2, fill: '#fff', stroke: '#f59e0b', strokeWidth: 1.5 }}
                      activeDot={{ r: 5 }}
                      onMouseEnter={() => setHoveredSeries('powerKw')}
                      onMouseLeave={() => setHoveredSeries(null)}
                    />

                    {/* 5. RO Feed Pressure */}
                    <Area
                      type="monotone"
                      dataKey="feedPressureBar"
                      name="RO Feed Pressure (bar)"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPressure)"
                      dot={{ r: 2, fill: '#fff', stroke: '#a855f7', strokeWidth: 1.5 }}
                      activeDot={{ r: 5 }}
                      onMouseEnter={() => setHoveredSeries('feedPressureBar')}
                      onMouseLeave={() => setHoveredSeries(null)}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
              <span>Hover any curve or legend item to view single-point value</span>
              <span>48 Samples · 4s Rolling Update</span>
            </div>
          </div>

          {/* Right Column: PHASE 4 Information Panel (45% width -> col-span-12 lg:col-span-5) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 dark:from-[#0a1530] dark:via-[#0c1a3d] dark:to-[#071126] border border-sky-200/80 dark:border-[#1a3366] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-sky-200/60 dark:border-[#1a3366]">
                <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0a1b44] dark:text-white">
                    Understanding Process Trends
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-sky-300/70">
                    Live telemetry correlation & parameter overview
                  </p>
                </div>
              </div>

              {/* 5 Parameter Explanations */}
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d1f47]/80 border border-sky-100 dark:border-[#1e3d78] shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-cyan-600 dark:text-cyan-400 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>1. Tank Level:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                    Shows the changing water level in the equalization and storage tanks over time.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d1f47]/80 border border-sky-100 dark:border-[#1e3d78] shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>2. Permeate Flow:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                    Shows the rate of treated water production from the reverse osmosis membranes.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d1f47]/80 border border-sky-100 dark:border-[#1e3d78] shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>3. RO Recovery:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                    Shows the percentage of feed water successfully converted into usable permeate.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d1f47]/80 border border-sky-100 dark:border-[#1e3d78] shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>4. Power Consumption:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                    Shows the electrical energy demand of operating pumps and high-pressure drives.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d1f47]/80 border border-sky-100 dark:border-[#1e3d78] shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>5. RO Feed Pressure:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                    Shows the pressure supplied to the reverse osmosis process by HP pump P-202.
                  </p>
                </div>
              </div>

              {/* What to observe */}
              <div className="p-3 rounded-xl bg-sky-100/50 dark:bg-[#0b1c40] border border-sky-200/80 dark:border-[#1c3a70] text-xs">
                <span className="font-bold text-[#0a1b44] dark:text-sky-300 block mb-1">
                  What to observe:
                </span>
                <ul className="text-slate-600 dark:text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                  <li>Rising and falling tank levels during fill/draw cycles</li>
                  <li>Changes in permeate production rate under varying demand</li>
                  <li>Recovery stability around the 75% nominal target</li>
                  <li>Power consumption variations correlating with HP pump speed</li>
                  <li>Feed pressure fluctuations indicating membrane osmotic resistance</li>
                </ul>
              </div>
            </div>

            {/* PHASE 4: Download Process Trends Report Button */}
            <div className="pt-4 mt-3 border-t border-sky-200/60 dark:border-[#1a3366]">
              <button
                onClick={handleDownloadTrends}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0a1638] hover:bg-[#13255c] text-white font-semibold text-xs border border-[#1b3470] shadow-md flex items-center justify-center gap-2 transition cursor-pointer group"
              >
                <Download className="w-4 h-4 text-cyan-400 transition-transform group-hover:translate-y-0.5" />
                <span>Download Process Trends Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Water Quality — Handled in WaterQualityView */}
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
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : alm.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}
                  >
                    {alm.severity}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {alm.tag} — {alm.equipmentName}
                    </span>
                    <span className="text-slate-500 ml-2">{alm.message}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
                  <span>Val: {alm.value}</span>
                  <span>{new Date(alm.timestamp).toLocaleTimeString()}</span>
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
