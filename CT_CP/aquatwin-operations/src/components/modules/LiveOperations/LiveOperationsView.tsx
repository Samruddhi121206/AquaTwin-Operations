/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PidDiagram } from './PidDiagram';
import { LiveBottomTabs } from './LiveBottomTabs';
import { ModeBanner } from '../../shared/ModeBanner';
import { usePlant } from '../../../context/PlantContext';
import {
  ShieldCheck,
  CheckCircle2,
  Workflow,
  Radio,
  Gauge,
  ArrowRight,
  Sliders,
} from 'lucide-react';

export const LiveOperationsView: React.FC = () => {
  const { telemetry, activeScenario, applyScenario } = usePlant();
  const [activeTab, setActiveTab] = useState<'pid' | 'sequence' | 'valves'>('pid');

  return (
    <div className="space-y-4">
      {/* Region A: Top Operating Mode & Hardware Banner */}
      <ModeBanner />

      {/* Process Header & Interlock Safety Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                P&ID Process Schematic & Live Control
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                AUTO-SUPERVISORY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive process flow from Raw Water Intake through Pre-treatment, Micro-filtration, High-Pressure RO & Permeate Buffer
            </p>
          </div>
        </div>

        {/* Interlock Safety Strip */}
        <div className="flex items-center gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold">Safety Interlocks:</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Low Suction (PSLL-101)
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              High Feed Press (PSHH-202)
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              TK-201 High Level Cutoff
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('pid')}
          className={`px-4 py-2 font-medium rounded-lg transition ${
            activeTab === 'pid'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Interactive P&ID Schematic
        </button>
        <button
          onClick={() => setActiveTab('sequence')}
          className={`px-4 py-2 font-medium rounded-lg transition ${
            activeTab === 'sequence'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Process Train Flow Sequence (Detailed)
        </button>
      </div>

      {/* Region B: Process Mimic Schematic */}
      {activeTab === 'pid' ? (
        <PidDiagram />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Industrial Reverse Osmosis Water Treatment Process Chain
          </h3>
          <div className="space-y-4">
            {[
              {
                step: '01',
                tag: 'Raw Intake & Equalization',
                equipment: 'Source → XV-101 → TK-101',
                desc: 'Raw borehole or municipal feed water passes through XV-101 actuated butterfly valve into 50 m³ equalization tank TK-101. Ultrasonic radar level sensor LT-101 modulates valve stroke via PID control loop.',
                flow: `${telemetry.tk101.inflowM3h} m³/h inlet`,
                state: `Tank Level: ${telemetry.tk101.currentLevelPercent}% (${telemetry.tk101.currentLevelM3} m³)`,
              },
              {
                step: '02',
                tag: 'Pre-Filtration Strainer & Transfer',
                equipment: 'STR-101 → P-101',
                desc: 'Raw water flows through duplex basket strainer STR-101 (150 mesh) to remove macro particles, then transfers via centrifugal feed pump P-101 delivering regulated discharge pressure into the RO feed header.',
                flow: `${telemetry.p101_flowM3h} m³/h @ ${telemetry.p101_pressureBar} bar`,
                state: `Strainer DP: ${telemetry.str101_dpBar} bar · Pump VFD: ${telemetry.p101_speedPercent}%`,
              },
              {
                step: '03',
                tag: 'Booster & Dual Micron Filtration',
                equipment: 'P-201 → F-201 → F-202',
                desc: 'Vertical multistage booster pump P-201 pressurizes feed across 5-micron guard cartridge filter F-201 followed by 1-micron polishing filter F-202, guaranteeing Silt Density Index (SDI15 < 2.0).',
                flow: `${telemetry.p201_flowM3h} m³/h @ ${telemetry.p201_pressureBar} bar`,
                state: `F-201 DP: ${telemetry.f201_dpBar} bar · F-202 DP: ${telemetry.f202_dpBar} bar`,
              },
              {
                step: '04',
                tag: 'Chemical Conditioning',
                equipment: 'CD-201 Skid',
                desc: 'Precision chemical metering pump CD-201 doses polymeric antiscalant and biocide (sodium metabisulfite) proportionally to feed flow to inhibit calcium carbonate and silica precipitation on membranes.',
                flow: `Dosing Rate: ${telemetry.cd201_dosingPpm} ppm`,
                state: `Stroke: 45% · Continuous pacing active`,
              },
              {
                step: '05',
                tag: 'High Pressure RO Separation',
                equipment: 'P-202 → RO-201 Membrane Array',
                desc: 'Danfoss axial piston high-pressure pump P-202 boosts feed pressure up to 15.5 bar to overcome osmotic pressure. RO-201 splits stream into purified permeate water and concentrated brine reject.',
                flow: `Permeate: ${telemetry.ro_permeateFlowM3h} m³/h · Reject: ${telemetry.ro_rejectFlowM3h} m³/h`,
                state: `Recovery: ${telemetry.ro_recoveryPercent}% · Rejection: ${telemetry.ro_saltRejectionPercent}%`,
              },
              {
                step: '06',
                tag: 'Permeate Buffer & Plant Distribution',
                equipment: 'TK-201 Storage & Reject Line V-201',
                desc: 'Demineralized permeate flows into 35 m³ sanitary buffer tank TK-201 for industrial utility distribution. High salinity reject is discharged through motorized backpressure throttle valve V-201 to brine recovery.',
                flow: `Plant Distribution Demand: ${telemetry.distributionDemandM3h} m³/h`,
                state: `Product TDS: ${telemetry.permeateQuality.tdsMgL} mg/L · Reject TDS: ${telemetry.rejectQuality.tdsMgL} mg/L`,
              },
            ].map((s) => (
              <div
                key={s.step}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    {s.step}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.tag}</h4>
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">{s.equipment}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">{s.desc}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">{s.flow}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{s.state}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Region D: Bottom Tab Diagnostics Container */}
      <LiveBottomTabs />
    </div>
  );
};
