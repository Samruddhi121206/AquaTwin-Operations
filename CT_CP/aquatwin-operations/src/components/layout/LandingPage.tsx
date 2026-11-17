/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import MicroSlats from '../shared/MicroSlats';
import SpotlightCard from '../shared/SpotlightCard';
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
  const { setActiveModule, telemetry, alarms, equipmentList, theme } = usePlant();
  const isDark = theme === 'dark';

  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);


  const activeAlarms = alarms.filter((a) => !a.acknowledged).length;
  const runningCount = equipmentList.filter((e) => e.status === 'running').length;
  const plantHealthy = alarms.every((a) => a.severity !== 'critical' || a.acknowledged);

  const heroStats: {
    label: string;
    value?: number;
    text?: string;
    decimals?: number;
    unit?: string;
    tone: string;
  }[] = [
    {
      label: 'Plant Status',
      text: plantHealthy ? 'Nominal' : 'Alarm',
      tone: plantHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
    },
    {
      label: 'RO Recovery',
      value: telemetry.ro_recoveryPercent,
      decimals: 1,
      unit: '%',
      tone: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Permeate Flow',
      value: telemetry.ro_permeateFlowM3h,
      decimals: 1,
      unit: 'm³/h',
      tone: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Active Alarms',
      value: activeAlarms,
      decimals: 0,
      tone: activeAlarms > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  const cardStats: Record<string, { label: string; value: number; decimals: number; unit: string }> = {
    plant: { label: 'Equipment running', value: runningCount, decimals: 0, unit: '' },
    io: { label: 'Mapped channels', value: 32, decimals: 0, unit: '' },
    control_panel: { label: 'Cabinet callouts', value: 25, decimals: 0, unit: '' },
    analysis: { label: 'RO recovery', value: telemetry.ro_recoveryPercent, decimals: 1, unit: '%' },
  };

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
      accentDark: '#6ACBFA',
      accentLight: '#6ACBFA',
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
      accentDark: '#3DB5F5',
      accentLight: '#3DB5F5',
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
      accentDark: '#168BDB',
      accentLight: '#168BDB',
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
      accentDark: '#A8DAFB',
      accentLight: '#0E5C93',
    },
  ];

  return (
    <div className="relative isolate max-w-[1480px] mx-auto py-1 px-1 sm:px-2 space-y-4">
      {/* Animated slat field behind the hero strip and module cards */}
      {!reducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl opacity-[0.35] dark:opacity-60"
        >
          <MicroSlats
            preset="swell"
            color="#168bdb"
            glintColor="#6acbfa"
            backgroundColor="transparent"
            slatWidth={10}
            slatHeight={25}
            gap={3}
            roundness={0.75}
            cursorStrength={1}
            cursorSize={40}
            swirl={0}
            trail={1.4}
            lean={0}
            intro
            interactive
          />
        </div>
      )}

      {/* Dashboard Heading — Redesigned with Sky / Light Blue Theme */}
      <div className="card flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-blue-700">
              INDUSTRIAL DIGITAL TWIN PLATFORM
            </span>
          </div>
          <h1 className="t-heading text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
            System Performance Summary
          </h1>
          <p className="t-muted text-xs font-medium mt-0.5">
            Industrial Digital Twin Performance Dashboard
          </p>
        </div>

        <div className="raised hidden sm:flex items-center gap-2 text-xs font-mono px-3.5 py-2 rounded-xl border shadow-xs font-bold" style={{ borderColor: 'var(--border)' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span>4 Connected Modules</span>
        </div>
      </div>

      {/* Live plant summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {heroStats.map((s) => (
          <div
            key={s.label}
            className="card rounded-xl px-3.5 py-2.5"
          >
            <div className="t-muted text-[10px] font-semibold uppercase tracking-widest">
              {s.label}
            </div>
            <div className={`mt-0.5 flex items-baseline gap-1 text-xl font-bold ${s.tone}`}>
              {s.text ? (
                <span className="text-base">{s.text}</span>
              ) : (
                <AnimatedNumber value={s.value as number} decimals={s.decimals} />
              )}
              {s.unit && <span className="text-[11px] font-semibold opacity-70">{s.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 2 × 2 Grid Layout with Compact Heights & All-Text Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const accent = isDark ? c.accentDark : c.accentLight;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: i * 0.06 }}
              className="flex"
            >
              <SpotlightCard
                theme={isDark ? 'dark' : 'light'}
                spotlightColor={isDark ? '#6acbfa' : '#168bdb'}
                intensity={isDark ? 0.22 : 0.18}
                spotlightSize={260}
                softness={0.75}
                shape="circle"
                borderGlow={0.6}
                proximity={80}
                smoothing={0.3}
                grain={0}
                flare
                className="landing-card flex flex-col justify-between group w-full"
                data-accent-top="true"
                style={
                  {
                    // Use the app's semantic card surface and a 2px module-accent top border.
                    '--spotlight-card-surface': 'var(--bg-card)',
                    borderTop: `2px solid ${accent}`,
                    '--spotlight-card-border': 'var(--border)',
                  } as React.CSSProperties
                }
              >
              <div>
                {/* Card Title & Icon */}
                <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: `${accent}26`, color: accent }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="raised font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border)' }}>
                          {c.number}
                        </span>
                        <h2 className="t-heading text-base font-bold tracking-tight">
                          {c.title}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                <p className="t-body text-xs font-medium mt-2 mb-2.5">
                  {c.tagline}
                </p>

                {/* Explanatory Information Items (All Text, What It Shows) */}
                <ul className="t-body space-y-1.5 text-xs">
                  {c.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${accent}26`, color: accent }}>
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="t-muted text-[10px] font-semibold uppercase tracking-widest">
                    {cardStats[c.id].label}
                  </span>
                  <span className="font-bold" style={{ color: isDark ? accent : 'var(--text-heading)' }}>
                    <AnimatedNumber
                      value={cardStats[c.id].value}
                      decimals={cardStats[c.id].decimals}
                    />
                    <span className="ml-0.5 text-[11px] opacity-70">{cardStats[c.id].unit}</span>
                  </span>
                </div>
                <button
                  onClick={() => setActiveModule(c.id)}
                  className="btn btn-primary w-full py-2 px-3 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer group/btn"
                >
                  <span>Open {c.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
