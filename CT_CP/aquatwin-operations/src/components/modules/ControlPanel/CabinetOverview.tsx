/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PANEL_CALLOUTS_25 } from './panelData';
import CabinetImg from './assets/cabinet.jpg';
import { InfoPanel } from './InfoPanel';
import { MonitoringDashboard } from './MonitoringDashboard';
import { PanelComponent } from '../../../types/io';
import { SimulatedBadge } from '../../shared/SimulatedBadge';
import {
  Cpu,
  Layers,
  Power,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  Sliders,
  X,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const CabinetOverview: React.FC = () => {
  const [doorOpen, setDoorOpen] = useState<boolean>(true);
  const [selectedCallout, setSelectedCallout] = useState<PanelComponent | null>(
    PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 21) || PANEL_CALLOUTS_25[0]
  );
  const [filterZone, setFilterZone] = useState<string>('ALL');
  const [showCalloutBadges, setShowCalloutBadges] = useState<boolean>(true);

  const filteredComponents =
    filterZone === 'ALL'
      ? PANEL_CALLOUTS_25
      : PANEL_CALLOUTS_25.filter((c) => c.zone === filterZone);

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full">
      {/* Main Cabinet Visualizer Canvas */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col shadow-2xl">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">
              Cabinet Enclosure Model:
            </span>
            <span className="font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Siemens Industrial S7 Standard Enclosure (IP55 / NEMA 12)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Door Toggle */}
            <div className="inline-flex rounded-lg border border-slate-700 p-0.5 bg-slate-800 text-[11px]">
              <button
                onClick={() => setDoorOpen(false)}
                className={`px-2.5 py-1 rounded font-medium transition ${!doorOpen ? 'bg-slate-900 text-cyan-400 shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}              >
                Front Door (Closed)
              </button>
              <button
                onClick={() => setDoorOpen(true)}
                className={`px-2.5 py-1 rounded font-medium transition ${doorOpen ? 'bg-slate-900 text-cyan-400 shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Internal Chassis (Open)
              </button>
            </div>

            <button
              onClick={() => setShowCalloutBadges(!showCalloutBadges)}
              className={`px-2.5 py-1 text-[11px] rounded border transition flex items-center gap-1 ${
                showCalloutBadges
                  ? 'bg-cyan-950 border-cyan-800 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{showCalloutBadges ? 'Callouts 1-25: ON' : 'Callouts: OFF'}</span>
            </button>
          </div>
        </div>

        {/* Physical Cabinet Layout Representation */}
        <div className="flex-1 min-h-[560px] relative mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4 overflow-y-auto">
          {!doorOpen ? (
            /* FRONT DOOR VIEW (Matching Image 1 Left) */
            <div className="max-w-[520px] mx-auto h-[530px] rounded-lg border-4 border-slate-400 dark:border-slate-700 shadow-xl relative flex flex-col justify-between p-6">
              {/* Cabinet Image */}
              <img src={CabinetImg} alt="AquaTwin Control Panel" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
              {/* Clickable Callout Overlays */}
              {showCalloutBadges && filteredComponents.map((c) => (
                <div
                  key={c.id}
                  className="absolute cursor-pointer hover:border-2 hover:border-cyan-500"
                  style={{
                    left: `${c.position.x}%`,
                    top: `${c.position.y}%`,
                    width: `${c.position.w}%`,
                    height: `${c.position.h}%`,
                  }}
                  onClick={() => setSelectedCallout(c)}
                />
              ))}
              {/* Siemens Logo Header */}
              <div className="flex items-center justify-between border-b border-slate-400/40 pb-3">
                <span className="font-black text-cyan-700 dark:text-cyan-400 tracking-widest text-lg font-sans">AquaTwin</span>
                <span className="text-[10px] text-slate-500 font-mono">ENCLOSURE REV 2.4</span>
              </div>

              {/* Door Front Controls Container */}
              <div className="flex items-start justify-between h-full pt-8">
                {/* Left Glass Window / Inspection Aperture */}
                <div className="w-[48%] h-[380px] rounded border-2 border-slate-400 dark:border-slate-700 bg-cyan-950/20 backdrop-blur-xs p-3 flex flex-col justify-between shadow-inner">
                  <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400/80 uppercase">
                    Chassis Inspection Window
                  </div>
                  <div className="space-y-2 opacity-60">
                    <div className="h-10 bg-slate-400/30 dark:bg-slate-700/50 rounded flex items-center justify-center text-[10px] text-slate-700 dark:text-slate-300 font-mono">
                      SINAMICS DRIVE RACK
                    </div>
                    <div className="h-16 bg-slate-400/30 dark:bg-slate-700/50 rounded flex items-center justify-center text-[10px] text-slate-700 dark:text-slate-300 font-mono">
                      PLC & I/O MODULES
                    </div>
                    <div className="h-12 bg-slate-400/30 dark:bg-slate-700/50 rounded flex items-center justify-center text-[10px] text-slate-700 dark:text-slate-300 font-mono">
                      CONTACTOR ARRAY
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-400 text-center font-mono">
                    Laminated Safety Glass (IP54)
                  </div>
                </div>

                {/* Right Steel Panel with Operator Controls */}
                <div className="w-[48%] h-[380px] flex flex-col items-center justify-between py-2">
                  {/* Callout 1: Pilot Lights */}
                  <div
                    onClick={() =>
                      setSelectedCallout(
                        PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 1) || null
                      )
                    }
                    className="cursor-pointer p-2 rounded-lg border border-transparent hover:border-cyan-500/50 hover:bg-cyan-500/5 transition flex flex-col items-center gap-1.5 relative"
                  >
                    {showCalloutBadges && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[11px] flex items-center justify-center shadow-md">
                        1
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                      STATUS LAMPS
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] border border-emerald-300" />
                        <span className="text-[8px] font-mono text-slate-500">RUN</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/40 border border-amber-600/50" />
                        <span className="text-[8px] font-mono text-slate-500">WARN</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="w-5 h-5 rounded-full bg-rose-500/40 border border-rose-600/50" />
                        <span className="text-[8px] font-mono text-slate-500">FAULT</span>
                      </div>
                    </div>
                  </div>

                  {/* Callout 2: HMI Touch Panel */}
                  <div
                    onClick={() =>
                      setSelectedCallout(
                        PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 2) || null
                      )
                    }
                    className="cursor-pointer w-full bg-slate-900 border-4 border-slate-700 rounded-lg p-2.5 shadow-lg relative hover:border-cyan-500 transition"
                  >
                    {showCalloutBadges && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[11px] flex items-center justify-center shadow-md">
                        2
                      </span>
                    )}
                    <div className="text-[9px] font-mono text-cyan-400 flex items-center justify-between pb-1 border-b border-slate-800">
                      <span>SIMATIC HMI</span>
                      <span className="text-emerald-400 font-bold">ONLINE</span>
                    </div>
                    <div className="py-3 flex flex-col items-center justify-center text-center">
                      <div className="text-[11px] font-bold text-slate-100">
                        AquaTwin Skid 01
                      </div>
                      <div className="text-[10px] text-cyan-300 font-mono">
                        Level: 73.6% | Press: 15.4 bar
                      </div>
                      <div className="mt-1 text-[8px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        Auto-Sequencing Normal
                      </div>
                    </div>
                  </div>

                  {/* Callout 3: E-Stop & Selector */}
                  <div
                    onClick={() =>
                      setSelectedCallout(
                        PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 3) || null
                      )
                    }
                    className="cursor-pointer p-2 rounded-lg border border-transparent hover:border-cyan-500/50 hover:bg-cyan-500/5 transition flex items-center gap-5 relative"
                  >
                    {showCalloutBadges && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[11px] flex items-center justify-center shadow-md">
                        3
                      </span>
                    )}
                    {/* E-Stop Mushroom Button */}
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-9 h-9 rounded-full bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center shadow-md">
                        <div className="w-6 h-6 rounded-full bg-rose-600 border border-rose-800 shadow-inner flex items-center justify-center">
                          <span className="text-[7px] font-bold text-white uppercase tracking-tighter">
                            STOP
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-slate-600 dark:text-slate-400">
                        E-STOP
                      </span>
                    </div>

                    {/* Rotary Selector */}
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                        <div className="w-1.5 h-5 bg-white rounded-full shadow-xs transform rotate-45" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-600 dark:text-slate-400">
                        HAND/AUTO
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Plinth */}
              <div className="border-t border-slate-400/40 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Rittal TS 8 Series Chassis</span>
                <span>Width: 800mm | Height: 2000mm</span>
              </div>
            </div>
          ) : (
            /* INTERNAL CHASSIS VIEW (Matching Image 1 Right & Image 2 DIN Rails) */
            <div className="space-y-4">
              {/* DIN RAIL TIER 1: Protection Zone Z1 */}
              <div className="p-3 bg-slate-200/70 dark:bg-slate-900/90 rounded-lg border border-slate-300 dark:border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-300 dark:border-slate-800 text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    DIN Rail Tier 1: Protection & Breakers (Zone Z1)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    MCBs F1-F8 & Motor Protection Q1-Q8
                  </span>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-2">
                  {/* Callout 11: Main Isolator */}
                  <div
                    onClick={() =>
                      setSelectedCallout(
                        PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 11) || null
                      )
                    }
                    className="cursor-pointer relative p-2.5 rounded bg-slate-800 text-white border border-slate-700 hover:border-cyan-400 transition"
                  >
                    {showCalloutBadges && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                        11
                      </span>
                    )}
                    <div className="text-[9px] font-bold text-amber-400">ISOLATOR</div>
                    <div className="text-[11px] font-mono">3VA1 100A</div>
                    <div className="text-[8px] text-emerald-400">CLOSED</div>
                  </div>

                  {/* Callout 12: Surge Protector */}
                  <div
                    onClick={() =>
                      setSelectedCallout(
                        PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 12) || null
                      )
                    }
                    className="cursor-pointer relative p-2.5 rounded bg-slate-800 text-white border border-slate-700 hover:border-cyan-400 transition"
                  >
                    {showCalloutBadges && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                        12
                      </span>
                    )}
                    <div className="text-[9px] font-bold text-cyan-400">SPD TYPE 2</div>
                    <div className="text-[11px] font-mono">VAL-MS 40kA</div>
                    <div className="text-[8px] text-emerald-400">HEALTHY</div>
                  </div>

                  {/* Callout 19: MCBs Row */}
                  <div
                    onClick={() =>
                      setSelectedCallout(
                        PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 19) || null
                      )
                    }
                    className="cursor-pointer relative flex-1 p-2.5 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 hover:border-cyan-400 transition flex items-center justify-around"
                  >
                    {showCalloutBadges && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                        19
                      </span>
                    )}
                    {['F1 10A', 'F2 16A', 'F3 16A', 'F4 25A', 'F5 6A', 'F6 10A', 'F7 10A', 'F8 16A'].map(
                      (mcb, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-4 h-9 bg-white dark:bg-slate-700 border border-slate-400 dark:border-slate-600 rounded-xs flex flex-col justify-between py-1 px-0.5">
                            <span className="w-full h-1.5 bg-emerald-500 rounded-xs" />
                            <div className="w-2.5 h-3 bg-slate-900 dark:bg-slate-200 mx-auto rounded-xs" />
                          </div>
                          <span className="text-[8px] font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                            {mcb}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* DIN RAIL TIER 2: Switching & Safety Zone Z2 */}
              <div className="p-3 bg-slate-200/70 dark:bg-slate-900/90 rounded-lg border border-slate-300 dark:border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-300 dark:border-slate-800 text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" />
                    DIN Rail Tier 2: Contactors & Safety Relays (Zone Z2)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    SIRIUS K9-K16 & Yellow PILZ PNOZ Safety Interlocks
                  </span>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  {/* Callout 18: Contactors */}
                  <div
                    onClick={() =>
                      setSelectedCallout(
                        PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 18) || null
                      )
                    }
                    className="cursor-pointer relative flex-1 p-2.5 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 hover:border-cyan-400 transition flex items-center justify-around"
                  >
                    {showCalloutBadges && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                        18
                      </span>
                    )}
                    {['K9 (P-101)', 'K10 (P-201)', 'K11 (P-202)', 'K12 (CD-201)', 'K13 (AUX1)', 'K14 (AUX2)'].map(
                      (k, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-9 h-14 bg-slate-800 border-2 border-slate-600 rounded flex flex-col justify-between p-1 shadow-xs">
                            <span className="text-[8px] font-bold text-amber-400 text-center font-mono">
                              24VDC
                            </span>
                            <span className="w-3 h-1.5 bg-emerald-500 rounded-full mx-auto shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                            <span className="text-[8px] text-slate-300 text-center font-mono">
                              3RT20
                            </span>
                          </div>
                          <span className="text-[8px] font-semibold text-slate-700 dark:text-slate-300 mt-1">
                            {k}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Callout 20: Pilz Safety Relays */}
                  <div
                    onClick={() =>
                      setSelectedCallout(
                        PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 20) || null
                      )
                    }
                    className="cursor-pointer relative p-2.5 rounded bg-amber-400/90 dark:bg-yellow-500 text-slate-900 border-2 border-amber-600 hover:border-cyan-400 transition flex items-center gap-2 shadow-sm"
                  >
                    {showCalloutBadges && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                        20
                      </span>
                    )}
                    {['PNOZ s4 (E-STOP)', 'PNOZ s5 (DOOR)'].map((p, idx) => (
                      <div
                        key={idx}
                        className="w-14 h-16 bg-yellow-400 dark:bg-yellow-500 border border-yellow-700 rounded p-1 flex flex-col justify-between text-center"
                      >
                        <span className="text-[7px] font-black tracking-tighter text-slate-950">
                          PILZ SAFETY
                        </span>
                        <div className="space-y-0.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-700 mx-auto" />
                          <div className="w-2 h-2 rounded-full bg-emerald-700 mx-auto" />
                        </div>
                        <span className="text-[7px] font-bold text-slate-950 font-mono">
                          {p.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DIN RAIL TIER 3: Controller & Power Core (Siemens S7-1500) Zone Z3 */}
              <div className="p-3 bg-slate-200/70 dark:bg-slate-900/90 rounded-lg border border-slate-300 dark:border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-300 dark:border-slate-800 text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                    DIN Rail Tier 3: Controller & Power Core (Zone Z3)
                  </span>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                    SIMATIC S7-1500 + SITOP PSU100L + SCALANCE
                  </span>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  {/* Siemens S7-1500 Modular Rack */}
                  <div className="flex items-center bg-slate-800 p-1.5 rounded-lg border-2 border-slate-700 shadow-md">
                    {/* CPU 1515-2 PN */}
                    <div
                      onClick={() =>
                        setSelectedCallout(
                          PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 6) || null
                        )
                      }
                      className="cursor-pointer relative w-20 h-24 bg-slate-900 border-r border-slate-700 p-1.5 flex flex-col justify-between text-center hover:bg-slate-850"
                    >
                      {showCalloutBadges && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                          6
                        </span>
                      )}
                      <div className="text-[8px] font-black text-cyan-400 font-mono">
                        CPU 1515-2
                      </div>
                      <div className="w-12 h-6 bg-cyan-950 border border-cyan-800 rounded mx-auto flex items-center justify-center text-[7px] text-cyan-300 font-mono">
                        RUN v2.9
                      </div>
                      <div className="flex justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      </div>
                      <div className="text-[7px] text-slate-400 font-mono">PROFINET</div>
                    </div>

                    {/* AI Module */}
                    <div
                      onClick={() =>
                        setSelectedCallout(
                          PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 15) || null
                        )
                      }
                      className="cursor-pointer relative w-12 h-24 bg-slate-900 border-r border-slate-700 p-1 flex flex-col justify-between text-center hover:bg-slate-850"
                    >
                      {showCalloutBadges && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                          15
                        </span>
                      )}
                      <div className="text-[7px] font-bold text-amber-300 font-mono">
                        AI 8xU/I
                      </div>
                      <div className="grid grid-cols-2 gap-1 py-1 px-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < 6 ? 'bg-emerald-400' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[6px] text-slate-400 font-mono">%IW64</div>
                    </div>

                    {/* DI Module */}
                    <div className="w-12 h-24 bg-slate-900 border-r border-slate-700 p-1 flex flex-col justify-between text-center">
                      <div className="text-[7px] font-bold text-cyan-300 font-mono">
                        DI 16x24
                      </div>
                      <div className="grid grid-cols-2 gap-0.5 py-1 px-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              i % 2 === 0 ? 'bg-emerald-400' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[6px] text-slate-400 font-mono">%I0.0</div>
                    </div>

                    {/* DO Module */}
                    <div className="w-12 h-24 bg-slate-900 border-r border-slate-700 p-1 flex flex-col justify-between text-center">
                      <div className="text-[7px] font-bold text-cyan-300 font-mono">
                        DO 16x24
                      </div>
                      <div className="grid grid-cols-2 gap-0.5 py-1 px-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              i < 3 ? 'bg-emerald-400' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[6px] text-slate-400 font-mono">%Q0.0</div>
                    </div>

                    {/* AO Module */}
                    <div className="w-12 h-24 bg-slate-900 p-1 flex flex-col justify-between text-center">
                      <div className="text-[7px] font-bold text-amber-300 font-mono">
                        AO 4xU/I
                      </div>
                      <div className="grid grid-cols-2 gap-1 py-1 px-1">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i === 0 ? 'bg-emerald-400' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[6px] text-slate-400 font-mono">%QW64</div>
                    </div>
                  </div>

                  {/* Callout 21: SITOP 24V PSU */}
                  <div
                    onClick={() =>
                      setSelectedCallout(
                        PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 21) || null
                      )
                    }
                    className="cursor-pointer relative w-24 h-24 bg-slate-800 rounded-lg border-2 border-slate-700 p-2 flex flex-col justify-between hover:border-cyan-400 transition shadow-sm"
                  >
                    {showCalloutBadges && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                        21
                      </span>
                    )}
                    <div className="text-[8px] font-black text-cyan-400 font-mono">
                      SITOP PSU100L
                    </div>
                    <div className="text-center font-mono">
                      <div className="text-[12px] font-bold text-white">24.0 V</div>
                      <div className="text-[8px] text-emerald-400">20A / 480W</div>
                    </div>
                    <div className="flex items-center gap-1 text-[7px] text-emerald-400 font-mono justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>OK</span>
                    </div>
                  </div>

                  {/* Callout 4: SINAMICS Drive */}
                  <div
                    onClick={() =>
                      setSelectedCallout(
                        PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 4) || null
                      )
                    }
                    className="cursor-pointer relative flex-1 min-w-[120px] h-24 bg-slate-800 rounded-lg border-2 border-slate-700 p-2 flex flex-col justify-between hover:border-cyan-400 transition shadow-sm"
                  >
                    {showCalloutBadges && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                        4
                      </span>
                    )}
                    <div className="text-[7px] text-slate-400 font-mono text-center">
                      CU240E-2 PN Vector
                    </div>
                  </div>
                </div>
              </div>

              {/* DIN RAIL TIER 4: Field Terminal Strip X1 Zone Z4 */}
              <div className="p-3 bg-slate-200/70 dark:bg-slate-900/90 rounded-lg border border-slate-300 dark:border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-300 dark:border-slate-800 text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-500" />
                    DIN Rail Tier 4: Field Marshalling Terminals (Zone Z4)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Terminal Strip X1 with Numbered Ferrules (X1:1 to X1:64)
                  </span>
                </div>

                <div
                  onClick={() =>
                    setSelectedCallout(
                      PANEL_CALLOUTS_25.find((c) => c.calloutNumber === 22) || null
                    )
                  }
                  className="cursor-pointer relative mt-3 p-2 bg-slate-100 dark:bg-slate-800/80 rounded border border-slate-300 dark:border-slate-700 hover:border-cyan-400 transition"
                >
                  {showCalloutBadges && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                      22
                    </span>
                  )}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {[
                      { t: 'X1:1', tag: 'L1', col: 'bg-slate-700 text-white' },
                      { t: 'X1:2', tag: 'L2', col: 'bg-slate-700 text-white' },
                      { t: 'X1:3', tag: 'L3', col: 'bg-slate-700 text-white' },
                      { t: 'X1:4', tag: 'PE', col: 'bg-yellow-400 text-slate-950 font-bold' },
                      { t: 'X1:14', tag: 'LT-101 (+)', col: 'bg-cyan-600 text-white' },
                      { t: 'X1:15', tag: 'LT-101 (-)', col: 'bg-cyan-600 text-white' },
                      { t: 'X1:16', tag: 'FIT-101 (+)', col: 'bg-cyan-600 text-white' },
                      { t: 'X1:17', tag: 'FIT-101 (-)', col: 'bg-cyan-600 text-white' },
                      { t: 'X1:20', tag: 'PT-202 (+)', col: 'bg-cyan-600 text-white' },
                      { t: 'X1:21', tag: 'PT-202 (-)', col: 'bg-cyan-600 text-white' },
                      { t: 'X1:28', tag: 'P101-FB', col: 'bg-indigo-600 text-white' },
                      { t: 'X1:40', tag: 'P101-CMD', col: 'bg-emerald-600 text-white' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap border border-black/20 ${item.col}`}
                      >
                        <div className="font-bold">{item.t}</div>
                        <div className="text-[8px] opacity-85">{item.tag}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Component Inspector Drawer */}
      <div className="w-full lg:w-[380px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Component Inspector
            </h3>
          </div>
          {selectedCallout && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[11px] flex items-center justify-center">
              {selectedCallout.calloutNumber}
            </span>
          )}
        </div>

        {selectedCallout ? (
          <div className="mt-4 space-y-4 text-xs overflow-y-auto flex-1">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {selectedCallout.name}
                </span>
                <SimulatedBadge verified={selectedCallout.verified} />
              </div>
              <p className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                {selectedCallout.manufacturer} · {selectedCallout.model}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Electrical Specifications:
              </span>
              <div className="grid grid-cols-1 gap-1 font-mono text-[11px]">
                {Object.entries(selectedCallout.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-200 dark:border-slate-700/40 pb-0.5">
                    <span className="text-slate-500">{k}:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Connected I/O Channels:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {selectedCallout.linkedChannels.length > 0 ? (
                  selectedCallout.linkedChannels.map((ch) => (
                    <span
                      key={ch}
                      className="px-2 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded font-mono text-[10px]"
                    >
                      {ch}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400">None (Power / Safety Hardware)</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Linked Process Equipment:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {selectedCallout.linkedEquipment.map((eq) => (
                  <span
                    key={eq}
                    className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px]"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                Engineering Trace Note:
              </span>
              <p className="mt-1">
                Linked to the unified Virtual PLC I/O mapping model. Clicking this component in
                Wiring View reveals the physical wire path and terminal terminations.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
            <Info className="w-8 h-8 mb-2 opacity-50" />
            <span>Click any component or numbered callout to inspect technical specifications</span>
          </div>
        )}

        {/* Monitoring Dashboard */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mb-4">
          <MonitoringDashboard />
        </div>

        {/* 25 Callouts Quick Selector */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Callout Legend (1-25):
          </span>
          <div className="grid grid-cols-5 gap-1">
            {PANEL_CALLOUTS_25.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCallout(c)}
                className={`py-1 text-[10px] font-bold rounded transition border ${
                  selectedCallout?.calloutNumber === c.calloutNumber
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.calloutNumber}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
