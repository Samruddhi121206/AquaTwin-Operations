/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AquaTwin Industrial Hardware Rack Visualizer - Mitsubishi MELSEC iQ-R
 * Matches Reference B & D: Authentic DIN Rail Mounting, Front Panels, Screw Terminals & 3D Views
 */

import React, { useState } from 'react';
import { PlcHardwareModule, ExtendedPlcTag } from '../types';
import {
  Cpu,
  Layers,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface MitsubishiRackVisualizerProps {
  modules: PlcHardwareModule[];
  tags: ExtendedPlcTag[];
  selectedSlot: number | 'POW' | null;
  onSelectSlot: (slot: number | 'POW') => void;
  viewMode?: 'FRONT' | '3D' | 'REAL';
  zoomLevel?: number;
}

export const MitsubishiRackVisualizer: React.FC<MitsubishiRackVisualizerProps> = ({
  modules,
  tags,
  selectedSlot,
  onSelectSlot,
  viewMode = 'FRONT',
  zoomLevel = 100,
}) => {
  // Check active state of digital inputs/outputs for real-time channel LEDs
  const getDiActive = (channelIndex: number) => {
    const tag = tags.find(
      (t) => t.moduleId === 'SLOT-1-DI' && t.channelIndex === channelIndex
    );
    return tag ? tag.currentValue === true : false;
  };

  const getDoActive = (channelIndex: number) => {
    const tag = tags.find(
      (t) => t.moduleId === 'SLOT-2-DO' && t.channelIndex === channelIndex
    );
    return tag ? tag.currentValue === true : false;
  };

  // 8 Rack positions: Slot 0 (Power Supply R61P), Slot 1 (CPU R08CPU), Slot 2 (RX40C7), Slot 3 (RY40NT5P), Slot 4 (R60AD8), Slot 5 (R60DA8), Slot 6 (Empty), Slot 7 (Empty)
  const rackSlots = [
    { slotIdx: 0, type: 'POW', model: 'R61P', name: 'Power Supply' },
    { slotIdx: 1, type: 'CPU', model: 'R08CPU', name: 'Sequence CPU' },
    { slotIdx: 2, type: 'DI', model: 'RX40C7', name: '16-Pt DC Input' },
    { slotIdx: 3, type: 'DO', model: 'RY40NT5P', name: '16-Pt Transistor' },
    { slotIdx: 4, type: 'AI', model: 'R60AD8', name: '8-Ch Analog Input' },
    { slotIdx: 5, type: 'AO', model: 'R60DA8', name: '8-Ch Analog Output' },
    { slotIdx: 6, type: 'EMPTY', model: '—', name: 'Empty Slot' },
    { slotIdx: 7, type: 'EMPTY', model: '—', name: 'Empty Slot' },
  ];

  if (viewMode === 'REAL') {
    return (
      <div className="flex items-center justify-center p-6 bg-slate-900 rounded-lg border border-slate-700 min-h-[380px]">
        <div className="relative max-w-4xl rounded-lg overflow-hidden border border-slate-700 shadow-2xl bg-black">
          <img
            src="/assets/mitsubishi/melsec_iq_r_front.jpg"
            alt="Mitsubishi MELSEC iQ-R Modular Rack"
            className="w-full h-auto object-contain max-h-[360px]"
          />
          <div className="absolute bottom-2 left-3 bg-black/80 backdrop-blur-xs px-3 py-1 rounded text-[11px] font-mono text-slate-300 border border-white/10">
            Official Mitsubishi Electric MELSEC iQ-R Product Photograph (R68B Base Unit)
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === '3D') {
    return (
      <div className="flex items-center justify-center p-6 bg-slate-900 rounded-lg border border-slate-700 min-h-[380px]">
        <div className="relative max-w-4xl rounded-lg overflow-hidden border border-slate-700 shadow-2xl bg-black">
          <img
            src="/assets/mitsubishi/melsec_iq_r_isometric.jpg"
            alt="Mitsubishi MELSEC iQ-R 3D Isometric View"
            className="w-full h-auto object-contain max-h-[360px]"
          />
          <div className="absolute bottom-2 left-3 bg-black/80 backdrop-blur-xs px-3 py-1 rounded text-[11px] font-mono text-slate-300 border border-white/10">
            Mitsubishi MELSEC iQ-R 3D Isometric View (R38B Base / R61P / R12CCPU-V)
          </div>
        </div>
      </div>
    );
  }

  // Front View — Photorealistic DIN Rail Assembly matching Reference Image 2
  return (
    <div className="overflow-x-auto py-3 px-1 flex items-center justify-center select-none">
      <div
        className="transition-transform duration-200"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
      >
        {/* DIN Rail Assembly Container with Metallic Side Mounting Flanges */}
        <div className="relative flex items-center bg-slate-200 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-300 dark:border-slate-700 shadow-inner min-w-[840px]">
          {/* Left Aluminum Mounting Flange with Bolt Hole */}
          <div className="w-8 h-80 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-l border border-slate-400 dark:border-slate-600 flex flex-col justify-around items-center shadow-md shrink-0">
            <div className="w-4 h-4 rounded-full bg-slate-500 dark:bg-slate-900 border border-slate-400 shadow-inner flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-700" />
            </div>
            <div className="w-1.5 h-24 bg-slate-500/30 rounded-full" />
            <div className="w-4 h-4 rounded-full bg-slate-500 dark:bg-slate-900 border border-slate-400 shadow-inner flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-700" />
            </div>
          </div>

          {/* Horizontal Brushed Aluminum DIN Rail Bar behind Modules */}
          <div className="relative flex items-center px-1 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-300 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-y-2 border-slate-400 dark:border-slate-600 shadow-lg py-2">
            {/* Horizontal Rail Grooves */}
            <div className="absolute left-0 right-0 top-3 h-1 bg-slate-400/50 dark:bg-slate-900/60 border-y border-white/20" />
            <div className="absolute left-0 right-0 bottom-3 h-1 bg-slate-400/50 dark:bg-slate-900/60 border-y border-white/20" />

            {/* Modular PLC Rack: Modules Mounted Side-by-Side */}
            <div className="relative z-10 flex items-stretch gap-1">
              {/* ========================================================
                  SLOT 0: R61P POWER SUPPLY MODULE
                  ======================================================== */}
              <div
                onClick={() => onSelectSlot('POW')}
                className={`w-28 h-84 rounded-t-sm rounded-b-xs cursor-pointer transition-all duration-150 border-2 flex flex-col justify-between overflow-hidden shadow-xl relative ${
                  selectedSlot === 'POW' || selectedSlot === 0
                    ? 'border-blue-500 ring-4 ring-blue-500/30 z-20 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
                style={{
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                }}
              >
                {/* Slot Number Above Module matching Reference Image 2 */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  0
                </div>

                {/* Upper Black Section with Mitsubishi Logo & POWER LED */}
                <div className="p-2 space-y-2">
                  {/* Mitsubishi 3-Diamond Logo */}
                  <div className="flex items-center gap-1.5 border-b border-slate-700/80 pb-1.5">
                    <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-red-600 shrink-0">
                      <polygon points="50,15 65,40 50,65 35,40" />
                      <polygon points="20,65 35,40 20,15 5,40" transform="rotate(60 35 40)" />
                      <polygon points="80,65 95,40 80,15 65,40" transform="rotate(-60 65 40)" />
                    </svg>
                    <div className="text-[7px] font-black text-white tracking-tighter font-mono leading-tight">
                      MITSUBISHI
                      <br />
                      ELECTRIC
                    </div>
                  </div>

                  {/* Power Status LED */}
                  <div className="pt-2 flex flex-col items-center justify-center gap-1">
                    <span className="text-[7.5px] font-mono font-bold text-slate-300 tracking-wider">
                      POWER
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                  </div>
                </div>

                {/* Lower Signature Red Bezel Door matching Reference Image 2 & C */}
                <div
                  className="h-36 p-2 flex flex-col justify-between rounded-b border-t border-red-500/30"
                  style={{
                    background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
                  }}
                >
                  <div className="text-[8px] font-black font-mono text-white tracking-wider text-center drop-shadow-xs">
                    MELSEC iQ-R
                  </div>

                  <div className="text-[6.5px] font-mono text-white/80 text-center leading-tight">
                    100-240V AC
                    <br />
                    5V DC 6.5A
                  </div>

                  <div className="h-2.5 bg-black/20 rounded-xs flex items-center justify-center text-[6px] font-mono text-white/90">
                    ▼ PULL
                  </div>
                </div>

                {/* Model Label Underneath matching Reference Image 2 */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  R61P
                </div>
              </div>

              {/* ========================================================
                  SLOT 1: R08CPU CONTROLLER MODULE
                  ======================================================== */}
              <div
                onClick={() => onSelectSlot(1)}
                className={`w-24 h-84 rounded-t-sm rounded-b-xs cursor-pointer transition-all duration-150 border-2 flex flex-col justify-between overflow-hidden shadow-xl relative ${
                  selectedSlot === 1
                    ? 'border-blue-500 ring-4 ring-blue-500/30 z-20 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
                style={{
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  1
                </div>

                {/* CPU Top Header */}
                <div className="p-1.5 border-b border-slate-700">
                  <div className="text-[9px] font-black font-mono text-white tracking-tight">
                    R08CPU
                  </div>
                </div>

                {/* 4 Status LEDs: RUN (green), ERR (red), P.RUN (green), BAT (green) */}
                <div className="px-2 py-1 space-y-1 text-[7px] font-mono text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>RUN</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,1)]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ERR</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>P.RUN</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BAT</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>

                {/* Gigabit Ethernet RJ45 Port */}
                <div className="px-2 py-2 border-t border-slate-700/80 bg-slate-900/60 flex flex-col items-center gap-1">
                  <span className="text-[6.5px] font-mono text-slate-400">100BASE-TX / SD/RD</span>
                  <div className="w-10 h-8 bg-slate-950 border border-slate-600 rounded flex flex-col justify-between p-0.5 shadow-inner">
                    <div className="flex justify-between">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                    </div>
                    <div className="w-6 h-3 mx-auto bg-slate-800 rounded-xs border border-slate-700" />
                  </div>
                </div>

                {/* SD Card / USB Door */}
                <div className="h-10 bg-slate-900 border-t border-slate-700 flex items-center justify-center text-[7px] font-mono text-slate-400">
                  ▼ SD CARD
                </div>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  R08CPU
                </div>
              </div>

              {/* ========================================================
                  SLOT 2: RX40C7 DIGITAL INPUT MODULE (Screw Terminals)
                  ======================================================== */}
              <div
                onClick={() => onSelectSlot(2)}
                className={`w-24 h-84 rounded-t-sm rounded-b-xs cursor-pointer transition-all duration-150 border-2 flex flex-col justify-between overflow-hidden shadow-xl relative ${
                  selectedSlot === 2
                    ? 'border-blue-500 ring-4 ring-blue-500/30 z-20 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
                style={{
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  2
                </div>

                <div className="p-1.5 border-b border-slate-700 text-center">
                  <div className="text-[9px] font-black font-mono text-white">RX40C7</div>
                  <div className="text-[6.5px] font-mono text-emerald-400">16-Pt 24VDC</div>
                </div>

                {/* Full-Length Screw Terminal Block matching Reference Image 2 */}
                <div className="flex-1 px-1.5 py-1 flex flex-col justify-between bg-slate-950/70 border-x border-slate-700/60 my-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((rowIdx) => {
                    const isLeftActive = getDiActive(rowIdx);
                    const isRightActive = getDiActive(rowIdx + 8);

                    return (
                      <div key={rowIdx} className="flex items-center justify-between text-[6px] font-mono text-slate-400">
                        {/* Left Screw Terminal */}
                        <div className="flex items-center gap-0.5">
                          <div className={`w-2.5 h-2.5 rounded-full border border-slate-500 flex items-center justify-center shadow-inner ${isLeftActive ? 'bg-amber-400 text-black' : 'bg-slate-700 text-slate-300'}`}>
                            +
                          </div>
                          <span>{rowIdx}</span>
                        </div>

                        {/* Right Screw Terminal */}
                        <div className="flex items-center gap-0.5">
                          <span>{rowIdx + 8}</span>
                          <div className={`w-2.5 h-2.5 rounded-full border border-slate-500 flex items-center justify-center shadow-inner ${isRightActive ? 'bg-amber-400 text-black' : 'bg-slate-700 text-slate-300'}`}>
                            +
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="h-5 bg-slate-900 border-t border-slate-700 flex items-center justify-center text-[6px] font-mono text-slate-400">
                  18-POINT BLOCK
                </div>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  RX40C7
                </div>
              </div>

              {/* ========================================================
                  SLOT 3: RY40NT5P DIGITAL OUTPUT MODULE (Screw Terminals)
                  ======================================================== */}
              <div
                onClick={() => onSelectSlot(3)}
                className={`w-24 h-84 rounded-t-sm rounded-b-xs cursor-pointer transition-all duration-150 border-2 flex flex-col justify-between overflow-hidden shadow-xl relative ${
                  selectedSlot === 3
                    ? 'border-blue-500 ring-4 ring-blue-500/30 z-20 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
                style={{
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  3
                </div>

                <div className="p-1.5 border-b border-slate-700 text-center">
                  <div className="text-[9px] font-black font-mono text-white">RY40NT5P</div>
                  <div className="text-[6.5px] font-mono text-indigo-400">16-Pt SINK</div>
                </div>

                {/* Full-Length Screw Terminal Block */}
                <div className="flex-1 px-1.5 py-1 flex flex-col justify-between bg-slate-950/70 border-x border-slate-700/60 my-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((rowIdx) => {
                    const isLeftActive = getDoActive(rowIdx);
                    const isRightActive = getDoActive(rowIdx + 8);

                    return (
                      <div key={rowIdx} className="flex items-center justify-between text-[6px] font-mono text-slate-400">
                        <div className="flex items-center gap-0.5">
                          <div className={`w-2.5 h-2.5 rounded-full border border-slate-500 flex items-center justify-center shadow-inner ${isLeftActive ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            +
                          </div>
                          <span>Y{rowIdx}</span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          <span>Y{rowIdx + 8}</span>
                          <div className={`w-2.5 h-2.5 rounded-full border border-slate-500 flex items-center justify-center shadow-inner ${isRightActive ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            +
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="h-5 bg-slate-900 border-t border-slate-700 flex items-center justify-center text-[6px] font-mono text-slate-400">
                  0.5A / POINT
                </div>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  RY40NT5P
                </div>
              </div>

              {/* ========================================================
                  SLOT 4: R60AD8 ANALOG INPUT MODULE (Selected in Ref Image 2)
                  ======================================================== */}
              <div
                onClick={() => onSelectSlot(4)}
                className={`w-24 h-84 rounded-t-sm rounded-b-xs cursor-pointer transition-all duration-150 border-2 flex flex-col justify-between overflow-hidden shadow-xl relative ${
                  selectedSlot === 4
                    ? 'border-blue-500 ring-4 ring-blue-500/30 z-20 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
                style={{
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  4
                </div>

                <div className="p-1.5 border-b border-slate-700 text-center">
                  <div className="text-[9px] font-black font-mono text-white">R60AD8</div>
                  <div className="text-[6.5px] font-mono text-cyan-400">8-Ch 4-20mA</div>
                </div>

                {/* Analog Differential Screw Terminal Block */}
                <div className="flex-1 px-1.5 py-1 flex flex-col justify-between bg-slate-950/70 border-x border-slate-700/60 my-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((ch) => (
                    <div key={ch} className="flex items-center justify-between text-[6.5px] font-mono text-slate-300">
                      <span className="text-slate-400">CH{ch}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-[5.5px] text-cyan-400">
                          +
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-[5.5px] text-slate-400">
                          -
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-5 bg-slate-900 border-t border-slate-700 flex items-center justify-center text-[6px] font-mono text-cyan-400 font-bold">
                  5 µs / CH • 16-BIT
                </div>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  R60AD8
                </div>
              </div>

              {/* ========================================================
                  SLOT 5: R60DA8 ANALOG OUTPUT MODULE
                  ======================================================== */}
              <div
                onClick={() => onSelectSlot(5)}
                className={`w-24 h-84 rounded-t-sm rounded-b-xs cursor-pointer transition-all duration-150 border-2 flex flex-col justify-between overflow-hidden shadow-xl relative ${
                  selectedSlot === 5
                    ? 'border-blue-500 ring-4 ring-blue-500/30 z-20 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
                style={{
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  5
                </div>

                <div className="p-1.5 border-b border-slate-700 text-center">
                  <div className="text-[9px] font-black font-mono text-white">R60DA8</div>
                  <div className="text-[6.5px] font-mono text-purple-400">8-Ch 0-10V/mA</div>
                </div>

                {/* Analog Output Terminal Block */}
                <div className="flex-1 px-1.5 py-1 flex flex-col justify-between bg-slate-950/70 border-x border-slate-700/60 my-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((ch) => (
                    <div key={ch} className="flex items-center justify-between text-[6.5px] font-mono text-slate-300">
                      <span className="text-slate-400">V/I{ch}</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-[5.5px] text-purple-400">
                        +
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-5 bg-slate-900 border-t border-slate-700 flex items-center justify-center text-[6px] font-mono text-purple-400 font-bold">
                  10 µs / CH • DAC
                </div>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  R60DA8
                </div>
              </div>

              {/* ========================================================
                  SLOT 6 & 7: EMPTY BLANK COVER PLATES (RG60)
                  ======================================================== */}
              {[6, 7].map((slotIdx) => (
                <div
                  key={slotIdx}
                  onClick={() => onSelectSlot(slotIdx)}
                  className={`w-20 h-84 rounded-t-sm rounded-b-xs cursor-pointer transition-all duration-150 border-2 flex flex-col justify-between overflow-hidden shadow-md relative ${
                    selectedSlot === slotIdx
                      ? 'border-blue-500 ring-4 ring-blue-500/30 z-20 scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                  style={{
                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                  }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {slotIdx}
                  </div>

                  <div className="p-1.5 border-b border-slate-800 text-center">
                    <div className="text-[8px] font-mono text-slate-500">RG60</div>
                  </div>

                  {/* Vertical Cooling Vent Ribs on Blank Plate */}
                  <div className="flex-1 px-3 py-6 flex flex-col justify-around items-center opacity-40">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((rib) => (
                      <div key={rib} className="w-full h-1 bg-slate-700 rounded-full" />
                    ))}
                  </div>

                  <div className="h-5 bg-slate-950 border-t border-slate-800 flex items-center justify-center text-[6px] font-mono text-slate-500">
                    BLANK
                  </div>

                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    —
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Aluminum Mounting Flange with Bolt Hole */}
          <div className="w-8 h-80 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-r border border-slate-400 dark:border-slate-600 flex flex-col justify-around items-center shadow-md shrink-0">
            <div className="w-4 h-4 rounded-full bg-slate-500 dark:bg-slate-900 border border-slate-400 shadow-inner flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-700" />
            </div>
            <div className="w-1.5 h-24 bg-slate-500/30 rounded-full" />
            <div className="w-4 h-4 rounded-full bg-slate-500 dark:bg-slate-900 border border-slate-400 shadow-inner flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
