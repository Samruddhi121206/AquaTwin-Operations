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
  Layers,
  LayoutDashboard,
  Cpu,
  BarChart3,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { telemetry, alarms, setActiveModule } = usePlant();
  const unackAlarms = alarms.filter((a) => !a.acknowledged);

  const modules = [
    { id: 'plant', name: 'Plant Overview', icon: Droplets, desc: 'Real-time flow & tank levels' },
    { id: 'io', name: 'Input/Output', icon: Activity, desc: 'Field device telemetry' },
    { id: 'operations', name: 'Control Panel', icon: Cpu, desc: 'Industrial cabinet diagnostics' },
    { id: 'analysis', name: 'Analysis', icon: BarChart3, desc: 'Performance & trends' },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
        <h1 className="text-2xl font-bold">AquaTwin Operations</h1>
        <p className="text-slate-400 text-sm mt-1">Industrial Digital Twin Performance Dashboard</p>
      </div>

      {/* Main Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id as any)}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-cyan-300 hover:shadow-md transition flex flex-col items-start text-left"
          >
            <div className="bg-cyan-50 text-cyan-600 p-3 rounded-lg mb-4">
              <m.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900">{m.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Key Plant Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">System Performance</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
                <span className="text-xs text-slate-500 block">Permeate Flow</span>
                <span className="text-lg font-bold text-slate-900">{telemetry.ro_permeateFlowM3h} <span className="text-xs font-normal">m³/h</span></span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <span className="text-xs text-slate-500 block">System Recovery</span>
                <span className="text-lg font-bold text-emerald-600">{telemetry.ro_recoveryPercent}%</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <span className="text-xs text-slate-500 block">Specific Energy</span>
                <span className="text-lg font-bold text-slate-900">{telemetry.specificEnergyKwhM3} <span className="text-xs font-normal">kWh/m³</span></span>
            </div>
          </div>
        </div>

        {/* Alarms Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active Alarms
            </h3>
            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">{unackAlarms.length}</span>
          </div>
          <div className="text-xs text-slate-500">
            {unackAlarms.length > 0 ? `${unackAlarms[0].message}` : 'No active critical alarms.'}
          </div>
        </div>
      </div>
    </div>
  );
};
