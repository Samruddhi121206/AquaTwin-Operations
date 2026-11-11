/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlant } from '../../context/PlantContext';
import { useRuntimeMode } from '../../context/RuntimeModeContext';
import { ModuleType } from '../../types/plant';
import { ModeBanner } from '../shared/ModeBanner';
import { SimulatedBadge } from '../shared/SimulatedBadge';
import {
  Workflow,
  Cpu,
  SlidersHorizontal,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Activity,
  Droplets,
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Server,
  Settings,
} from 'lucide-react';

interface ModuleCard {
  id: ModuleType;
  number: string;
  title: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  icon: React.ElementType;
  accentBorder: string;
  accentBg: string;
  features: string[];
  metrics: { label: string; value: string }[];
}

export const LandingPage: React.FC = () => {
  const { setActiveModule, telemetry, alarms } = usePlant();
  const { plcHealth } = useRuntimeMode();

  const unackAlarmsCount = alarms.filter((a) => !a.acknowledged).length;

  const modules: ModuleCard[] = [
    {
      id: 'plant',
      number: '01',
      title: 'Plant',
      badge: 'Operational Mimic',
      badgeColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
      tagline: 'Live plant operations, dynamic tank simulation & P&ID mimic',
      icon: Workflow,
      accentBorder: 'hover:border-cyan-500/60 dark:hover:border-cyan-500/50',
      accentBg: 'from-cyan-500/5 to-transparent',
      features: [
        'Live Process: Dynamic Equalization & Permeate Tanks',
        'Pumps & Valves: VFD speed, discharge pressure & trip status',
        'Sensors & Interlocks: Level, flow, differential pressures',
        'Equipment & Maintenance: Integrated asset registry & work orders',
      ],
      metrics: [
        { label: 'TK-101 Level', value: `${telemetry.tk101.currentLevelPercent.toFixed(1)}%` },
        { label: 'Feed Flow', value: `${telemetry.p101_flowM3h.toFixed(1)} m³/h` },
        { label: 'Active Alarms', value: `${unackAlarmsCount}` },
      ],
    },
    {
      id: 'io',
      number: '02',
      title: 'Input / Output',
      badge: 'Dedicated PLC Driver',
      badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
      tagline: 'Dedicated PLC inputs/outputs, tag addressing & bus communications',
      icon: Cpu,
      accentBorder: 'hover:border-indigo-500/60 dark:hover:border-indigo-500/50',
      accentBg: 'from-indigo-500/5 to-transparent',
      features: [
        'PLC Overview: S7-1500 connection, CPU state & protocol health',
        'Digital Inputs (DI): Pump run/trip feedbacks & limit switches',
        'Analog Inputs (AI): 4-20mA sensor counts (0-27648) & scaling',
        'Digital & Analog Outputs (DO/AO): Run commands & setpoints',
      ],
      metrics: [
        { label: 'Scan Cycle', value: `${plcHealth.latencyMs} ms` },
        { label: 'Hardware Mode', value: plcHealth.mode },
        { label: 'I/O Channels', value: '16 Active' },
      ],
    },
    {
      id: 'control_panel',
      number: '03',
      title: 'Control Panel',
      badge: 'Cabinet & Wiring',
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      tagline: 'Electrical panel layout, 25 callouts & interactive wiring paths',
      icon: Layers,
      accentBorder: 'hover:border-amber-500/60 dark:hover:border-amber-500/50',
      accentBg: 'from-amber-500/5 to-transparent',
      features: [
        'Cabinet Overview: Front door HMI/lamps & internal chassis',
        'DIN Rail Zones Z1-Z5: Breakers, SIRIUS contactors & PILZ relays',
        'Signal-Path Tracing: Click any sensor or tag to trace wiring',
        'Component Inspector: 25 numbered callouts with manufacturer specs',
      ],
      metrics: [
        { label: 'Chassis Type', value: 'IP55 / TS 8' },
        { label: 'Callouts', value: '25 Items' },
        { label: 'DC Bus', value: '24V / 20A' },
      ],
    },
    {
      id: 'analysis',
      number: '04',
      title: 'Analysis',
      badge: 'Trends & Reports',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      tagline: 'Process trends, water quality, energy efficiency & compliance reports',
      icon: BarChart3,
      accentBorder: 'hover:border-emerald-500/60 dark:hover:border-emerald-500/50',
      accentBg: 'from-emerald-500/5 to-transparent',
      features: [
        'Process Trends: Multi-variable real-time & historical Recharts plots',
        'Water Quality: TDS, pH, conductivity, turbidity & SDI tracking',
        'Energy Performance: Specific consumption (kWh/m³) & pump load',
        'Reports & Compliance: Daily, weekly & monthly export generator',
      ],
      metrics: [
        { label: 'Salt Rejection', value: `${telemetry.ro_saltRejectionPercent.toFixed(1)}%` },
        { label: 'RO Recovery', value: `${telemetry.ro_recoveryPercent.toFixed(1)}%` },
        { label: 'Energy Rate', value: '1.82 kWh/m³' },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto py-2">
      {/* Top Runtime Mode Banner */}
      <ModeBanner />

      {/* Platform Title Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-cyan-500/10 via-indigo-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
                AquaTwin Operations
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <SimulatedBadge verified={false} text="VIRTUAL PLC CORE" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              Industrial Water Operations Platform
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              High-purity Reverse Osmosis water treatment monitoring, digital twin simulation,
              dedicated Siemens S7 PLC input/output management, and electrical cabinet visualization.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Plant Status</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ONLINE · AUTO</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Production</div>
              <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {telemetry.ro_permeateFlowM3h.toFixed(1)} m³/h
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Alerts</div>
              <div
                className={`font-bold mt-0.5 ${
                  unackAlarmsCount > 0 ? 'text-amber-500' : 'text-slate-500'
                }`}
              >
                {unackAlarmsCount} Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The 4 Large Main Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`group cursor-pointer bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl relative flex flex-col justify-between bg-gradient-to-br ${mod.accentBg} ${mod.accentBorder}`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {mod.number}
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {mod.title}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {mod.tagline}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${mod.badgeColor} shrink-0`}
                  >
                    {mod.badge}
                  </span>
                </div>

                {/* Key Capabilities List */}
                <div className="py-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                    Core Capabilities
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {mod.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Quick Metrics & Launch Button */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-mono">
                  {mod.metrics.map((m, idx) => (
                    <div key={idx}>
                      <span className="text-[10px] text-slate-400 block">{m.label}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Open {mod.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

