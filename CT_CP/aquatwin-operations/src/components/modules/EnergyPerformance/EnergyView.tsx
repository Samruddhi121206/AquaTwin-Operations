/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlant } from '../../../context/PlantContext';
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
} from 'recharts';

export const EnergyView: React.FC = () => {
  const { telemetry } = usePlant();

  // Energy breakdown by equipment
  const powerData = [
    { name: 'P-202 (HP Pump)', powerKw: telemetry.p202_powerKw, color: '#6366f1' },
    { name: 'P-201 (Booster)', powerKw: telemetry.p201_powerKw, color: '#06b6d4' },
    { name: 'P-101 (Feed)', powerKw: telemetry.p101_powerKw, color: '#3b82f6' },
    { name: 'CD-201 & Controls', powerKw: 0.8, color: '#10b981' },
  ];

  // Specific energy trade-off curve across recovery percentages
  const tradeOffCurve = [
    { recovery: 65, sec: 2.15, flux: 16.5 },
    { recovery: 70, sec: 2.38, flux: 17.8 },
    { recovery: 75, sec: 2.70, flux: 19.4 },
    { recovery: 80, sec: 3.18, flux: 21.0 },
    { recovery: 85, sec: 3.85, flux: 22.8 },
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

      {/* Charts Grid: Power Breakdown & Recovery vs SEC curve */}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} kW`, 'Active Power']}
                />
                <Bar dataKey="powerKw" radius={[6, 6, 0, 0]}>
                  {powerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recovery vs SEC Trade-off Curve */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Recovery (%) vs Specific Energy (SEC) Curve
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Thermodynamic curve: increasing recovery increases brine osmotic backpressure and energy intensity.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tradeOffCurve} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="recovery" stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" kWh" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sec"
                  name="SEC (kWh/m³)"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
