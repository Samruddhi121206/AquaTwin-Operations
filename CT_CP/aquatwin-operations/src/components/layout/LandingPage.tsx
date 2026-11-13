/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlant } from '../../context/PlantContext';
import {
  Workflow,
  Cpu,
  Layers,
  BarChart3,
  ArrowRight,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveModule } = usePlant();

  const cards = [
    {
      id: 'plant' as const,
      number: '01',
      title: 'Plant',
      icon: Workflow,
      tagline: 'Water treatment operations & dynamic tank simulation.',
      items: [
        'Tank level monitoring for raw equalization & treated permeate tanks',
        'Pump operating states, VFD speed tracking & trip status monitoring',
        'Valve open/close feedback and feed flow rate monitoring',
        'Live process operations mimic with dynamic simulated physics',
      ],
      border: 'border-cyan-500/30 dark:border-cyan-500/40 hover:border-cyan-400',
      glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.22)]',
      btnBg: 'bg-cyan-500/10 hover:bg-cyan-500 text-cyan-700 dark:text-cyan-300 hover:text-slate-950 border-cyan-500/30',
      accent: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/20 text-cyan-600 dark:text-cyan-300',
      bgGradient: 'dark:from-[#0b1736] dark:via-[#091530] dark:to-[#050e24]',
    },
    {
      id: 'io' as const,
      number: '02',
      title: 'Input / Output',
      icon: Cpu,
      tagline: 'PLC bus communications & channel signal processing.',
      items: [
        'Dedicated PLC input and output channel monitoring',
        'Digital inputs (DI) and analog sensor signals (AI)',
        'Controller health and PROFINET communication status',
        'Active I/O channel mapping, addressing and signal validation',
      ],
      border: 'border-indigo-400/30 dark:border-indigo-400/40 hover:border-cyan-400',
      glow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.22)]',
      btnBg: 'bg-indigo-500/10 hover:bg-indigo-500 text-indigo-700 dark:text-indigo-300 hover:text-white border-indigo-500/30',
      accent: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20 text-indigo-600 dark:text-indigo-300',
      bgGradient: 'dark:from-[#0c1840] dark:via-[#0a1538] dark:to-[#050e24]',
    },
    {
      id: 'control_panel' as const,
      number: '03',
      title: 'Control Panel',
      icon: Layers,
      tagline: 'Siemens industrial electrical enclosure & chassis wiring.',
      items: [
        'Electrical cabinet overview and physical layout representation',
        'Siemens S7 PLC modules, power supplies and electrical components',
        'DIN rail protection breakers, SIRIUS contactors and safety relays',
        'Component inspection with interactive signal-path tracing',
      ],
      border: 'border-sky-400/30 dark:border-sky-400/40 hover:border-cyan-400',
      glow: 'hover:shadow-[0_0_20px_rgba(56,189,248,0.22)]',
      btnBg: 'bg-sky-500/10 hover:bg-sky-500 text-sky-700 dark:text-sky-300 hover:text-slate-950 border-sky-500/30',
      accent: 'text-sky-600 dark:text-sky-400',
      badgeBg: 'bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/20 text-sky-600 dark:text-sky-300',
      bgGradient: 'dark:from-[#091a38] dark:via-[#071530] dark:to-[#040e21]',
    },
    {
      id: 'analysis' as const,
      number: '04',
      title: 'Analysis',
      icon: BarChart3,
      tagline: 'Multi-variable trends, water quality & compliance reports.',
      items: [
        'Plant performance trends and multi-variable operational telemetry',
        'Water quality chemistry including TDS, pH and conductivity',
        'Specific energy consumption (kWh/m³) and pump power efficiency',
        'Operational compliance summaries and automated export reports',
      ],
      border: 'border-teal-400/30 dark:border-teal-400/40 hover:border-cyan-400',
      glow: 'hover:shadow-[0_0_20px_rgba(45,212,191,0.22)]',
      btnBg: 'bg-teal-500/10 hover:bg-teal-500 text-teal-700 dark:text-teal-300 hover:text-slate-950 border-teal-500/30',
      accent: 'text-teal-600 dark:text-teal-400',
      badgeBg: 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/20 text-teal-600 dark:text-teal-300',
      bgGradient: 'dark:from-[#081a33] dark:via-[#061429] dark:to-[#030d1c]',
    },
  ];

  return (
    <div className="max-w-[1480px] mx-auto py-1 px-1 sm:px-2 space-y-4">
      {/* Dashboard Heading — Redesigned with Sky / Light Blue Theme */}
      <div className="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50/80 to-cyan-50 border border-sky-200/90 shadow-sm shadow-sky-100/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-blue-700">
              INDUSTRIAL DIGITAL TWIN PLATFORM
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0a1b44] leading-tight">
            System Performance Summary
          </h1>
          <p className="text-xs text-[#1e3a66] font-medium mt-0.5">
            Industrial Digital Twin Performance Dashboard
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#0a1b44] bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-sky-200 shadow-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span>4 Connected Modules</span>
        </div>
      </div>

      {/* 2 × 2 Grid Layout with Compact Heights & All-Text Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              className={`rounded-xl bg-white dark:bg-gradient-to-br ${c.bgGradient} border ${c.border} ${c.glow} p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between group`}
            >
              <div>
                {/* Card Title & Icon */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-[#162544]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${c.badgeBg}`}>
                          {c.number}
                        </span>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                          {c.title}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2 mb-2.5">
                  {c.tagline}
                </p>

                {/* Explanatory Information Items (All Text, What It Shows) */}
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {c.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-3.5 h-3.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#162544]">
                <button
                  onClick={() => setActiveModule(c.id)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border shadow-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${c.btnBg} group/btn`}
                >
                  <span>Open {c.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
