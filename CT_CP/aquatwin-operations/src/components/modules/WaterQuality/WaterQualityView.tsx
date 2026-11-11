/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import {
  Droplets,
  FlaskConical,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const WaterQualityView: React.FC = () => {
  const { telemetry, qualityHistory } = usePlant();
  const [selectedLocation, setSelectedLocation] = useState<'permeate' | 'raw' | 'reject'>('permeate');

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

      {/* Historical Trend Chart (Recharts) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Permeate Quality Telemetry Trend (TDS & Conductivity)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous online monitoring. Upper regulatory alarm limit: 50.0 mg/L TDS.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              In Compliance
            </span>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qualityHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="tdsMgL"
                name="Permeate TDS (mg/L)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="conductivityUsCm"
                name="Conductivity (µS/cm)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Water Treatment Chemistry Specs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Comprehensive Laboratory Analytical Assay
        </h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Raw Water</th>
                <th className="py-2.5 px-3">Pre-RO (Dosed)</th>
                <th className="py-2.5 px-3">Permeate (Product)</th>
                <th className="py-2.5 px-3">Reject (Brine)</th>
                <th className="py-2.5 px-3">Removal Rate %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-medium">TDS (Total Dissolved Solids)</td>
                <td className="py-2.5 px-3 font-mono">{telemetry.rawQuality.tdsMgL} mg/L</td>
                <td className="py-2.5 px-3 font-mono">{telemetry.preRoQuality.tdsMgL} mg/L</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {telemetry.permeateQuality.tdsMgL} mg/L
                </td>
                <td className="py-2.5 px-3 font-mono text-amber-600">{telemetry.rejectQuality.tdsMgL} mg/L</td>
                <td className="py-2.5 px-3 font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  {telemetry.ro_saltRejectionPercent}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Electrical Conductivity (EC)</td>
                <td className="py-2.5 px-3 font-mono">{telemetry.rawQuality.conductivityUsCm} µS/cm</td>
                <td className="py-2.5 px-3 font-mono">{telemetry.preRoQuality.conductivityUsCm} µS/cm</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {telemetry.permeateQuality.conductivityUsCm} µS/cm
                </td>
                <td className="py-2.5 px-3 font-mono text-amber-600">{telemetry.rejectQuality.conductivityUsCm} µS/cm</td>
                <td className="py-2.5 px-3 font-mono text-cyan-600 dark:text-cyan-400 font-bold">98.2%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">pH</td>
                <td className="py-2.5 px-3 font-mono">{telemetry.rawQuality.ph}</td>
                <td className="py-2.5 px-3 font-mono">{telemetry.preRoQuality.ph}</td>
                <td className="py-2.5 px-3 font-mono">{telemetry.permeateQuality.ph}</td>
                <td className="py-2.5 px-3 font-mono">{telemetry.rejectQuality.ph}</td>
                <td className="py-2.5 px-3 font-mono">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Turbidity</td>
                <td className="py-2.5 px-3 font-mono">{telemetry.rawQuality.turbidityNtu} NTU</td>
                <td className="py-2.5 px-3 font-mono">{telemetry.preRoQuality.turbidityNtu} NTU</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {telemetry.permeateQuality.turbidityNtu} NTU
                </td>
                <td className="py-2.5 px-3 font-mono">{telemetry.rejectQuality.turbidityNtu} NTU</td>
                <td className="py-2.5 px-3 font-mono text-cyan-600 dark:text-cyan-400 font-bold">99.1%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Silt Density Index (SDI15)</td>
                <td className="py-2.5 px-3 font-mono">3.8</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">{telemetry.preRoQuality.sdi}</td>
                <td className="py-2.5 px-3 font-mono">&lt; 0.5</td>
                <td className="py-2.5 px-3 font-mono">—</td>
                <td className="py-2.5 px-3 font-mono">Membrane Safe</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
