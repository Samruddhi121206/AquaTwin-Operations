/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePlant } from '../../../context/PlantContext';
import { generateEnergyTrends } from '../../../modules/Analysis/sampleData';
import {
  Zap,
  TrendingDown,
  TrendingUp,
  Activity,
  Layers,
  Leaf,
  DollarSign,
  Gauge,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export const EnergyView: React.FC = () => {

  // Charts animate once on mount; live ticks update values without replaying the animation.
  const [chartAnimate, setChartAnimate] = useState<boolean>(true);
  useEffect(() => {
    const t = setTimeout(() => setChartAnimate(false), 900);
    return () => clearTimeout(t);
  }, []);
  const { telemetry, theme } = usePlant();
  const [energyTrends] = useState(() => generateEnergyTrends(24));

  const isDark = theme === 'dark';

  // Energy breakdown by equipment
  const powerData = [
    { name: 'P-202 (HP Pump)', powerKw: telemetry.p202_powerKw, color: '#A8DAFB' },
    { name: 'P-201 (Booster)', powerKw: telemetry.p201_powerKw, color: '#168BDB' },
    { name: 'P-101 (Feed)', powerKw: telemetry.p101_powerKw, color: '#6ACBFA' },
    { name: 'CD-201 & Controls', powerKw: 0.8, color: '#10b981' },
  ];

  const electricityRateKwh = 0.12; // $0.12 per kWh
  const costPerM3 = (telemetry.specificEnergyKwhM3 * electricityRateKwh).toFixed(3);
  const carbonKgPerM3 = (telemetry.specificEnergyKwhM3 * 0.42).toFixed(2); // 0.42 kg CO2 per kWh grid factor

  return (
    <div className="space-y-4">
      {/* Energy Metrics KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Specific Energy Consumption</span>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {telemetry.specificEnergyKwhM3}
            </span>
            <span className="text-xs text-slate-500 font-medium">kWh/m³</span>
          </div>
          <div className="mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
            Benchmark target: &lt; 2.80 kWh/m³
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Active Power</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {telemetry.totalPowerKw}
            </span>
            <span className="text-xs text-slate-500 font-medium">kW</span>
          </div>
          <div className="mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
            Cumulative Today: <span className="font-mono text-slate-800 dark:text-slate-200">{telemetry.dailyEnergyKwh} kWh</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Operating Energy Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${costPerM3}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ m³ product</span>
          </div>
          <div className="mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
            Based on $0.12/kWh industrial tariff
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Carbon Intensity Factor</span>
            <Leaf className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {carbonKgPerM3}
            </span>
            <span className="text-xs text-slate-500 font-medium">kg CO₂/m³</span>
          </div>
          <div className="mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
            Scope 2 electrical emissions
          </div>
        </div>
      </div>

      {/* Charts Grid: Power Breakdown & 24h SEC Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Power Breakdown by Asset */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Active Load Breakdown by Equipment
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            High pressure pump P-202 represents ~58-62% of primary electrical demand.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={powerData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1B3A66' : '#D3E4F5'} opacity={0.6} />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0a1128' : '#ffffff',
                    borderColor: isDark ? '#1e3366' : '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val} kW`, 'Active Power']}
                />
                <Bar
                      isAnimationActive={chartAnimate}
                      animationDuration={800} dataKey="powerKw" radius={[6, 6, 0, 0]}>
                  {powerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24-Hour Specific Energy (SEC) & Pump Load Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  24-Hour Diurnal Energy & SEC Trend
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono text-[9px]">
                  Sample Data
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dynamic diurnal variations in Specific Energy (kWh/m³) and Active Power Demand (kW).
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={energyTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1B3A66' : '#D3E4F5'} opacity={0.6} />
                <XAxis dataKey="timestamp" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0a1128' : '#ffffff',
                    borderColor: isDark ? '#1e3366' : '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Line
                      isAnimationActive={chartAnimate}
                      animationDuration={800}
                  type="monotone"
                  dataKey="secKwhM3"
                  name="SEC (kWh/m³)"
                  stroke="#A8DAFB"
                  strokeWidth={2.2}
                  dot={{ r: 2 }}
                />
                <Line
                      isAnimationActive={chartAnimate}
                      animationDuration={800}
                  type="monotone"
                  dataKey="totalPowerKw"
                  name="Active Power (kW)"
                  stroke="#168BDB"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
