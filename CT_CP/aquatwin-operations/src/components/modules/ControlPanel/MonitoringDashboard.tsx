/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlant } from '../../../context/PlantContext';
import { Activity, Zap, ShieldCheck } from 'lucide-react';

export const MonitoringDashboard: React.FC = () => {
  const { telemetry, alarms } = usePlant();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-500" />
        PLC Monitoring Status
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
          <div className="text-slate-500">CPU Load</div>
          <div className="text-emerald-500 font-bold">{((telemetry.totalPowerKw / 50) * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
          <div className="text-slate-500">Alarms</div>
          <div className={`${alarms.length > 0 ? 'text-rose-500' : 'text-emerald-500'} font-bold`}>{alarms.length} Active</div>
        </div>
      </div>

      {/* Basic I/O Summary */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono">
        <div className="flex justify-between border-b border-slate-800 pb-1 mb-1">
          <span>Digital Inputs (DI)</span>
          <span className="text-emerald-400">16 / 16 OK</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-1 mb-1">
          <span>Digital Outputs (DO)</span>
          <span className="text-emerald-400">16 / 16 OK</span>
        </div>
        <div className="flex justify-between">
          <span>Communication</span>
          <span className="text-emerald-400">PROFINET OK</span>
        </div>
      </div>
    </div>
  );
};
