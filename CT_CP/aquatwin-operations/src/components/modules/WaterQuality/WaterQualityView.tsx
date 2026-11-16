/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import { generateWaterQualityTrends, WaterQualityTrendPoint } from '../../../modules/Analysis/sampleData';
import {
  Droplets,
  FlaskConical,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Download,
  Info,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const WaterQualityView: React.FC = () => {
  const { telemetry, theme } = usePlant();
  const [selectedLocation, setSelectedLocation] = useState<'permeate' | 'raw' | 'reject'>('permeate');

  // Stable realistic fluctuating historical sample dataset (36 points)
  const [qualityTrends] = useState<WaterQualityTrendPoint[]>(() => generateWaterQualityTrends(36));

  // Phase 3: Track which individual series is hovered
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const samplingPoints = [
    {
      id: 'raw',
      title: 'Raw Water Source Intake',
      tag: 'SMP-101',
      ph: telemetry.rawQuality.ph,
      tds: telemetry.rawQuality.tdsMgL,
      ec: telemetry.rawQuality.conductivityUsCm,
      turbidity: telemetry.rawQuality.turbidityNtu,
      temp: telemetry.rawQuality.temperatureC,
      compliance: 'Untreated Borehole',
    },
    {
      id: 'pre_ro',
      title: 'Pre-RO Cartridge Filter Outlet',
      tag: 'SMP-201',
      ph: telemetry.preRoQuality.ph,
      tds: telemetry.preRoQuality.tdsMgL,
      ec: telemetry.preRoQuality.conductivityUsCm,
      turbidity: telemetry.preRoQuality.turbidityNtu,
      temp: telemetry.preRoQuality.temperatureC,
      compliance: 'SDI15 < 2.0 Nominal',
    },
    {
      id: 'permeate',
      title: 'Treated Permeate Product',
      tag: 'SMP-202',
      ph: telemetry.permeateQuality.ph,
      tds: telemetry.permeateQuality.tdsMgL,
      ec: telemetry.permeateQuality.conductivityUsCm,
      turbidity: telemetry.permeateQuality.turbidityNtu,
      temp: telemetry.permeateQuality.temperatureC,
      compliance: 'Demin Grade (< 50 mg/L)',
    },
    {
      id: 'reject',
      title: 'RO Concentrate Reject Brine',
      tag: 'SMP-203',
      ph: telemetry.rejectQuality.ph,
      tds: telemetry.rejectQuality.tdsMgL,
      ec: telemetry.rejectQuality.conductivityUsCm,
      turbidity: telemetry.rejectQuality.turbidityNtu,
      temp: telemetry.rejectQuality.temperatureC,
      compliance: 'Discharge Header',
    },
  ];

  const seriesMeta: Record<string, { label: string; unit: string; color: string }> = {
    tdsMgL: { label: 'Permeate TDS', unit: 'mg/L', color: '#06b6d4' },
    conductivityUsCm: { label: 'Conductivity', unit: 'µS/cm', color: '#6366f1' },
    ph: { label: 'pH Level', unit: '', color: '#10b981' },
    turbidityNtu: { label: 'Turbidity', unit: 'NTU', color: '#f59e0b' },
  };

  // Phase 3: Custom Tooltip that displays ONLY the hovered parameter
  const CustomSingleTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

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
              {targetItem.value} {meta.unit && <span className="text-[10px] font-normal text-slate-400">{meta.unit}</span>}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Phase 5: Download Water Quality Report
  const handleDownloadQuality = () => {
    const headers = [
      'Timestamp',
      'Permeate TDS (mg/L)',
      'Conductivity (uS/cm)',
      'pH Level',
      'Turbidity (NTU)',
      'Temperature (C)',
    ];
    const rows = qualityTrends.map((d) => [
      d.timestamp,
      d.tdsMgL,
      d.conductivityUsCm,
      d.ph,
      d.turbidityNtu,
      d.temperatureC,
    ]);
    const comments = [
      '# AquaTwin Operations — Water Quality Telemetry Report',
      `# Generated: ${new Date().toLocaleString()}`,
      '# Regulatory Standard: EPA / Industrial Demineralized Water Compliance',
      '#',
      '# Monitored Parameters:',
      '# 1. TDS: Total dissolved solids present in treated permeate product (< 50 mg/L limit)',
      '# 2. Conductivity: Electrical conductivity reflecting dissolved ionic minerals (uS/cm)',
      '# 3. pH: Hydrogen ion concentration acidity/alkalinity scale (6.5 - 8.5 target)',
      '# 4. Turbidity: Optical clarity based on suspended particles in permeate (NTU)',
      '#',
    ];

    const csvContent = [...comments, headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AquaTwin_Water_Quality_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Sampling Points Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {samplingPoints.map((s) => {
          const isSelected = selectedLocation === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setSelectedLocation(s.id as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{s.tag}</span>
                <span className="text-[10px] text-slate-500">{s.compliance}</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3">{s.title}</h4>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">TDS:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{s.tds} mg/L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Conductivity:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{s.ec} µS/cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">pH:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{s.ph}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Turbidity:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{s.turbidity} NTU</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PHASE 5: 2-COLUMN HALF-GRAPH + WATER QUALITY INFO PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Half-Graph (55% width -> col-span-12 lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Permeate Quality Telemetry Trend
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  TDS, Conductivity, pH & Turbidity. Upper regulatory limit: 50.0 mg/L TDS.
                </p>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[10px] flex items-center gap-1 self-start sm:self-auto bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                In Compliance
              </span>
            </div>

            <div className="h-80 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={qualityTrends} margin={{ top: 10, right: 15, left: 0, bottom: 15 }}>
                  <defs>
                    <linearGradient id="colorTds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCond" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorTurbidity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
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
                    label={{
                      value: 'Measurement Value (mg/L / µS/cm / pH)',
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

                  {/* 1. TDS */}
                  <Area
                    type="monotone"
                    dataKey="tdsMgL"
                    name="Permeate TDS (mg/L)"
                    stroke="#06b6d4"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill="url(#colorTds)"
                    dot={{ r: 2, fill: '#fff', stroke: '#06b6d4', strokeWidth: 1.5 }}
                    activeDot={{ r: 5 }}
                    onMouseEnter={() => setHoveredSeries('tdsMgL')}
                    onMouseLeave={() => setHoveredSeries(null)}
                  />

                  {/* 2. Conductivity */}
                  <Area
                    type="monotone"
                    dataKey="conductivityUsCm"
                    name="Conductivity (µS/cm)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCond)"
                    dot={{ r: 2, fill: '#fff', stroke: '#6366f1', strokeWidth: 1.5 }}
                    activeDot={{ r: 5 }}
                    onMouseEnter={() => setHoveredSeries('conductivityUsCm')}
                    onMouseLeave={() => setHoveredSeries(null)}
                  />

                  {/* 3. pH */}
                  <Area
                    type="monotone"
                    dataKey="ph"
                    name="pH Level"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPh)"
                    dot={{ r: 2, fill: '#fff', stroke: '#10b981', strokeWidth: 1.5 }}
                    activeDot={{ r: 5 }}
                    onMouseEnter={() => setHoveredSeries('ph')}
                    onMouseLeave={() => setHoveredSeries(null)}
                  />

                  {/* 4. Turbidity */}
                  <Area
                    type="monotone"
                    dataKey="turbidityNtu"
                    name="Turbidity (NTU)"
                    stroke="#f59e0b"
                    strokeWidth={1.8}
                    fillOpacity={1}
                    fill="url(#colorTurbidity)"
                    dot={{ r: 2, fill: '#fff', stroke: '#f59e0b', strokeWidth: 1.5 }}
                    activeDot={{ r: 5 }}
                    onMouseEnter={() => setHoveredSeries('turbidityNtu')}
                    onMouseLeave={() => setHoveredSeries(null)}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
            <span>Hover any curve to view single-parameter measurement</span>
            <span>36 Samples · High-Precision Telemetry</span>
          </div>
        </div>

        {/* Right: PHASE 5 Information Panel (45% width -> col-span-12 lg:col-span-5) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/30 dark:from-[#081a33] dark:via-[#0a1e3d] dark:to-[#061226] border border-cyan-200/80 dark:border-[#1a3a66] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-cyan-200/60 dark:border-[#1a3a66]">
              <div className="p-2 rounded-lg bg-cyan-600 text-white shadow-xs">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0a1b44] dark:text-white">
                  Understanding Water Quality
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-sky-300/70">
                  Key chemical and optical purity parameters
                </p>
              </div>
            </div>

            {/* 4 Parameter Explanations */}
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d2247]/80 border border-cyan-100 dark:border-[#1e4278] shadow-xs">
                <div className="flex items-center gap-2 font-bold text-cyan-600 dark:text-cyan-400 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>1. TDS (Total Dissolved Solids):</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                  Indicates the total dissolved solids present in the water (measured in mg/L). Lower values indicate superior mineral rejection.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d2247]/80 border border-cyan-100 dark:border-[#1e4278] shadow-xs">
                <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>2. Conductivity:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                  Indicates the water's ability to conduct electricity and directly reflects dissolved ionic mineral content (µS/cm).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d2247]/80 border border-cyan-100 dark:border-[#1e4278] shadow-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>3. pH Level:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                  Indicates whether the water is acidic, neutral or alkaline on a 0–14 logarithmic scale (6.5–8.5 target range).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d2247]/80 border border-cyan-100 dark:border-[#1e4278] shadow-xs">
                <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>4. Turbidity:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                  Indicates the optical clarity of water based on microscopic suspended particles (measured in NTU).
                </p>
              </div>
            </div>

            {/* Why it matters */}
            <div className="p-3 rounded-xl bg-cyan-100/50 dark:bg-[#0a1f40] border border-cyan-200/80 dark:border-[#1b3e70] text-xs">
              <span className="font-bold text-[#0a1b44] dark:text-cyan-300 block mb-1">
                Why it matters:
              </span>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Continuous online monitoring ensures treated-water quality complies with industrial boiler feed standards, prevents membrane scaling, and detects pre-treatment breakthrough before fouling occurs.
              </p>
            </div>
          </div>

          {/* PHASE 5: Download Water Quality Report Button */}
          <div className="pt-4 mt-3 border-t border-cyan-200/60 dark:border-[#1a3a66]">
            <button
              onClick={handleDownloadQuality}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0a1638] hover:bg-[#13255c] text-white font-semibold text-xs border border-[#1b3470] shadow-md flex items-center justify-center gap-2 transition cursor-pointer group"
            >
              <Download className="w-4 h-4 text-cyan-400 transition-transform group-hover:translate-y-0.5" />
              <span>Download Water Quality Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
