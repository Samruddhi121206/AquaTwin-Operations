/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlant } from '../../context/PlantContext';
import { AnimatedNumber } from '../../components/shared/AnimatedNumber';
import { SimulatedBadge } from '../../components/shared/SimulatedBadge';

const Donut: React.FC<{
  segments: { value: number; color: string }[];
  children: React.ReactNode;
}> = ({ segments, children }) => {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const R = 34;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="relative w-[88px] h-[88px] shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={R} fill="none" strokeWidth="9" className="stroke-slate-200 dark:stroke-navy-soft" />
        {segments.map((s, i) => {
          const len = (s.value / total) * C;
          const el = (
            <circle
              key={i}
              cx="40"
              cy="40"
              r={R}
              fill="none"
              strokeWidth="9"
              strokeLinecap="butt"
              stroke={s.color}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              style={{ transition: 'stroke-dasharray 600ms ease-out, stroke-dashoffset 600ms ease-out' }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {children}
      </div>
    </div>
  );
};

const Bar: React.FC<{ label: string; value: number; tone: string }> = ({ label, value, tone }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
        <AnimatedNumber value={value} decimals={1} suffix="%" />
      </span>
    </div>
    <div className="h-2 rounded-full bg-slate-200 dark:bg-navy-soft overflow-hidden">
      <div
        className={`h-full rounded-full ${tone} transition-[width] duration-600 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  </div>
);

export const PerformanceSummary: React.FC = () => {
  const { telemetry, alarms, equipmentList } = usePlant();

  const recovery = telemetry.ro_recoveryPercent;
  const critical = alarms.filter((a) => a.severity === 'critical').length;
  const warning = alarms.filter((a) => a.severity === 'warning').length;
  const advisory = alarms.filter((a) => a.severity === 'advisory').length;

  const healthy = equipmentList.filter((e) => e.status === 'running' || e.status === 'standby').length;
  const availability = equipmentList.length ? (healthy / equipmentList.length) * 100 : 0;

  const q = telemetry.permeateQuality;
  const checks = [q.tdsMgL <= 50, q.ph >= 6.5 && q.ph <= 8.5, q.turbidityNtu <= 1];
  const compliance = (checks.filter(Boolean).length / checks.length) * 100;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Performance Summary</h3>
        <SimulatedBadge verified={false} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-center">
        <div className="flex items-center gap-3">
          <Donut segments={[{ value: recovery, color: '#168BDB' }]}>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              <AnimatedNumber value={recovery} decimals={1} suffix="%" />
            </span>
          </Donut>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            RO Recovery
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Donut
            segments={[
              { value: critical, color: '#F43F5E' },
              { value: warning, color: '#F59E0B' },
              { value: advisory, color: '#6ACBFA' },
            ]}
          >
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              <AnimatedNumber value={alarms.length} />
            </span>
            <span className="text-[8px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
              alarms
            </span>
          </Donut>
          <div className="space-y-0.5 text-[10px] font-medium">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical {critical}
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Warning {warning}
            </div>
            <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Advisory {advisory}
            </div>
          </div>
        </div>

        <Bar label="Equipment Availability" value={availability} tone="bg-emerald-500" />
        <Bar label="Quality Compliance" value={compliance} tone="bg-cyan-500" />
      </div>
    </div>
  );
};
