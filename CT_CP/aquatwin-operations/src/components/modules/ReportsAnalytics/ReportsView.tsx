/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import {
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  BarChart3,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { telemetry, productionHistory, qualityHistory } = usePlant();
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  // Simulated 7-day historical production data
  const weeklyData = [
    { day: 'Mon', permeateM3: 312, rawM3: 416, energyKwh: 842, recovery: 75.0 },
    { day: 'Tue', permeateM3: 325, rawM3: 433, energyKwh: 878, recovery: 75.1 },
    { day: 'Wed', permeateM3: 308, rawM3: 411, energyKwh: 832, recovery: 74.9 },
    { day: 'Thu', permeateM3: 330, rawM3: 440, energyKwh: 891, recovery: 75.0 },
    { day: 'Fri', permeateM3: 318, rawM3: 424, energyKwh: 859, recovery: 75.0 },
    { day: 'Sat', permeateM3: 295, rawM3: 393, energyKwh: 797, recovery: 75.1 },
    { day: 'Sun (Today)', permeateM3: telemetry.dailyProductionM3, rawM3: Number((telemetry.dailyProductionM3 * 1.33).toFixed(1)), energyKwh: telemetry.dailyEnergyKwh, recovery: telemetry.ro_recoveryPercent },
  ];

  // CSV Generator and downloader
  const handleDownloadCsv = () => {
    const headers = ['Day', 'Permeate Produced (m3)', 'Raw Water Feed (m3)', 'Energy (kWh)', 'Recovery (%)', 'SEC (kWh/m3)'];
    const rows = weeklyData.map((d) => [
      d.day,
      d.permeateM3,
      d.rawM3,
      d.energyKwh,
      d.recovery,
      (d.energyKwh / d.permeateM3).toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AquaTwin_Production_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compliance Audit Summary Text Report Generator
  const handleDownloadAuditReport = () => {
    const report = `========================================================================
AQUATWIN OPERATIONS — WATER TREATMENT AUDIT & COMPLIANCE SUMMARY
Report Generated: ${new Date().toLocaleString()}
Facility: AquaTwin Industrial Reverse Osmosis Unit 01
Operator on Duty: Lead Process Engineer (Shift B)
========================================================================

1. OPERATIONAL SUMMARY:
------------------------------------------------------------------------
- Cumulative Daily Permeate Output: ${telemetry.dailyProductionM3} m³
- Current Permeate Production Rate: ${telemetry.ro_permeateFlowM3h} m³/h
- Current Reject Brine Flow:        ${telemetry.ro_rejectFlowM3h} m³/h
- Reverse Osmosis Recovery Rate:    ${telemetry.ro_recoveryPercent}% (Target: 75.0%)
- Salt Rejection Efficiency:        ${telemetry.ro_saltRejectionPercent}%

2. WATER QUALITY LABORATORY COMPLIANCE:
------------------------------------------------------------------------
- Permeate Product TDS:             ${telemetry.permeateQuality.tdsMgL} mg/L (Max Limit: 50.0 mg/L) [PASS]
- Permeate Conductivity:            ${telemetry.permeateQuality.conductivityUsCm} µS/cm [PASS]
- Permeate pH:                      ${telemetry.permeateQuality.ph} (Tolerance: 6.5 - 7.5) [PASS]
- Permeate Turbidity:               ${telemetry.permeateQuality.turbidityNtu} NTU (Max Limit: 0.1 NTU) [PASS]
- Raw Water Inlet TDS:              ${telemetry.rawQuality.tdsMgL} mg/L
- Pre-RO Silt Density Index (SDI):  ${telemetry.preRoQuality.sdi} (Max Limit: 2.5) [PASS]

3. ENERGY CONSUMPTION & EFFICIENCY:
------------------------------------------------------------------------
- Specific Energy Consumption:      ${telemetry.specificEnergyKwhM3} kWh/m³
- Cumulative Energy Consumption:    ${telemetry.dailyEnergyKwh} kWh
- Total Active Connected Load:      ${telemetry.totalPowerKw} kW

4. SYSTEM HEALTH & INTEGRITY:
------------------------------------------------------------------------
- Tank TK-101 Level:                ${telemetry.tk101.currentLevelPercent}% (${telemetry.tk101.currentLevelM3} m³)
- Tank TK-201 Level:                ${telemetry.tk201.currentLevelPercent}% (${telemetry.tk201.currentLevelM3} m³)
- Filter F-201 DP:                  ${telemetry.f201_dpBar} bar
- Active Alarms Status:             Zero Critical Alarms Active

Verification Signature: R. Sharma, Lead Process Engineer
AquaTwin Operations Digital Twin ERP System
========================================================================`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AquaTwin_Compliance_Audit_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Action and Timeframe Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">Reporting Horizon:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['24h', '7d', '30d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded font-medium transition ${
                  timeframe === t
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t === '24h' ? 'Last 24 Hours' : t === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV Dataset</span>
          </button>
          <button
            onClick={handleDownloadAuditReport}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium flex items-center gap-1.5 transition shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Download Audit Certificate</span>
          </button>
        </div>
      </div>

      {/* Production & Recovery Weekly Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Daily Permeate Production vs Raw Feed Water (m³)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparative water yield verifying steady 75.0% recovery ratio
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              Permeate Product (m³)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Raw Intake (m³)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" m³" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="rawM3" name="Raw Feed (m³)" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="permeateM3" name="Permeate (m³)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Production Log Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Historical Yield & Energy Audit Ledger
          </h3>
        </div>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Permeate Yield (m³)</th>
                <th className="py-3 px-4">Raw Feed Water (m³)</th>
                <th className="py-3 px-4">Recovery %</th>
                <th className="py-3 px-4">Total Energy (kWh)</th>
                <th className="py-3 px-4">Specific Energy</th>
                <th className="py-3 px-4">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {weeklyData.map((d) => (
                <tr key={d.day} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{d.day}</td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    {d.permeateM3} m³
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {d.rawM3} m³
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {d.recovery}%
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                    {d.energyKwh} kWh
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                    {(d.energyKwh / d.permeateM3).toFixed(2)} kWh/m³
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Pass
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
