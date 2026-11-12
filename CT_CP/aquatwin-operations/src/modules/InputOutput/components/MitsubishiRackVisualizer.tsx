/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
  Image as ImageIcon,
  Sliders,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface MitsubishiRackVisualizerProps {
  modules: PlcHardwareModule[];
  tags: ExtendedPlcTag[];
  selectedSlot: number | 'POW' | null;
  onSelectSlot: (slot: number | 'POW') => void;
  onOpenCatalogue?: () => void;
}

export const MitsubishiRackVisualizer: React.FC<MitsubishiRackVisualizerProps> = ({
  modules,
  tags,
  selectedSlot,
  onSelectSlot,
  onOpenCatalogue,
}) => {
  const [viewMode, setViewMode] = useState<'INTERACTIVE' | 'PHOTO'>('INTERACTIVE');
  const [photoAngle, setPhotoAngle] = useState<'FRONT' | 'ISOMETRIC'>('FRONT');

  // Check active state of digital inputs/outputs for LED indicators
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

  const cpuModule = modules.find((m) => m.type === 'CPU') || modules[0];
  const diModule = modules.find((m) => m.slot === 1);
  const doModule = modules.find((m) => m.slot === 2);
  const aiModule = modules.find((m) => m.slot === 3);
  const aoModule = modules.find((m) => m.slot === 4);

  return (
    <div className="bg-slate-900 border border-slate-750 rounded-xl overflow-hidden shadow-xl select-none font-sans">
      {/* Top Engineering Rack Toolbar */}
      <div className="bg-slate-850 px-4 py-2 border-b border-slate-750 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-bold text-slate-100 tracking-wide font-mono">
              MELSEC iQ-R Base Rack: R68B (8 Slots)
            </span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
            Main Base Unit • 5V DC Bus: 2.15A / 6.5A
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch between Interactive Vector Rack & Real Mitsubishi Photo */}
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-700 flex items-center text-[11px] font-mono">
            <button
              onClick={() => setViewMode('INTERACTIVE')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'INTERACTIVE'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Chassis Model</span>
            </button>
            <button
              onClick={() => setViewMode('PHOTO')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'PHOTO'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Real Hardware Photo</span>
            </button>
          </div>

          {onOpenCatalogue && (
            <button
              onClick={onOpenCatalogue}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-[11px] font-mono flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Body */}
      {viewMode === 'PHOTO' ? (
        /* Real Photograph View of Mitsubishi iQ-R Rack */
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[340px]">
          <div className="relative max-w-4xl rounded-lg overflow-hidden border border-slate-700 shadow-2xl bg-black">
            <img
              src={
                photoAngle === 'FRONT'
                  ? '/assets/mitsubishi/melsec_iq_r_front.jpg'
                  : '/assets/mitsubishi/melsec_iq_r_isometric.jpg'
              }
              alt="Mitsubishi MELSEC iQ-R Modular PLC Rack"
              className="w-full h-auto object-contain max-h-[380px]"
            />
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200">
              <span className="font-bold text-emerald-400">● Genuine Hardware Inspection</span>
              <span className="text-[10px] text-slate-400 block">
                Mitsubishi Electric MELSEC iQ-R R08CPU / R61P / RX40C7 / RY40NT5P / R60AD8
              </span>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xs border border-slate-700 p-1 rounded-lg text-[10px] font-mono">
              <button
                onClick={() => setPhotoAngle('FRONT')}
                className={`px-2 py-0.5 rounded ${
                  photoAngle === 'FRONT' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Front View
              </button>
              <button
                onClick={() => setPhotoAngle('ISOMETRIC')}
                className={`px-2 py-0.5 rounded ${
                  photoAngle === 'ISOMETRIC' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                3D Isometric
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Modular Chassis View */
        <div className="p-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-x-auto">
          {/* Base Chassis Aluminum Rail Frame */}
          <div className="min-w-[860px] bg-slate-900/90 border-2 border-slate-700 rounded-lg p-2.5 shadow-2xl relative">
            {/* Top DIN Rail / Backplane Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] font-mono text-slate-400 px-2">
              <div className="flex items-center gap-1.5">
                <span className="text-red-500 font-bold">MITSUBISHI ELECTRIC</span>
                <span>•</span>
                <span>MELSEC iQ-R Series</span>
              </div>
              <div className="flex items-center gap-6">
                <span>R68B 8-SLOT EXPANSION BACKPLANE</span>
                <span>OPTICAL INTER-MODULE BUS: 40 Gbps</span>
              </div>
            </div>

            {/* Modules Rack Slots */}
            <div className="flex items-stretch gap-1.5 pt-1">
              {/* SLOT 'POW' - Power Supply Module (R61P) with iconic red bezel door */}
              <div
                onClick={() => onSelectSlot('POW')}
                className={`w-32 rounded-lg cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between overflow-hidden relative ${
                  selectedSlot === 'POW'
                    ? 'border-red-500 ring-2 ring-red-500/40 shadow-lg shadow-red-500/20 scale-102 z-10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-850'
                }`}
              >
                {/* Slot Tag Header */}
                <div className="bg-slate-800 px-2 py-1 flex items-center justify-between border-b border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-red-400">POW</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>

                {/* Upper Module Body */}
                <div className="p-2 space-y-1 bg-gradient-to-b from-slate-800 to-slate-850 text-center">
                  <div className="text-[8px] font-mono text-slate-400 font-bold">R61P</div>
                  <div className="text-[7.5px] font-mono text-slate-400">100-240VAC</div>

                  {/* Power Status LED */}
                  <div className="flex items-center justify-center gap-1 pt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                    <span className="text-[7px] font-mono font-bold text-emerald-300">POWER</span>
                  </div>
                </div>

                {/* Lower Red Front Bezel (Signature Mitsubishi R61P Door) */}
                <div className="h-32 bg-gradient-to-b from-red-600 via-red-700 to-red-800 p-2 flex flex-col justify-between text-white rounded-b border-t border-red-500/40">
                  <div className="flex items-center gap-1 opacity-90">
                    <div className="w-2 h-2 rotate-45 border border-white bg-white/30" />
                    <span className="text-[7.5px] font-black tracking-tighter">MELSEC</span>
                  </div>

                  <div className="text-[7px] font-mono leading-tight opacity-80 text-center">
                    5V DC 6.5A
                    <br />
                    OUT: READY
                  </div>

                  {/* Pull Door Tab */}
                  <div className="h-2 bg-red-900/60 rounded-xs flex items-center justify-center text-[6px] font-mono opacity-70">
                    ▼ PULL
                  </div>
                </div>
              </div>

              {/* SLOT 0 - CPU Module (R08CPU) */}
              <div
                onClick={() => onSelectSlot(0)}
                className={`w-36 rounded-lg cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between overflow-hidden relative ${
                  selectedSlot === 0
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-400/20 scale-102 z-10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-850'
                }`}
              >
                {/* Slot Tag Header */}
                <div className="bg-slate-800 px-2 py-1 flex items-center justify-between border-b border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">CPU (Slot 0)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Upper Module Body: LED Matrix */}
                <div className="p-2 space-y-1.5 bg-gradient-to-b from-slate-800 to-slate-850">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-100">R08CPU</span>
                    <span className="text-[7px] font-mono text-emerald-400 bg-emerald-950 px-1 rounded">
                      RUN
                    </span>
                  </div>

                  {/* CPU Status LED Cluster */}
                  <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[6.5px] font-mono text-slate-400 bg-slate-900/80 p-1 rounded border border-slate-750">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
                      <span>READY</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <span>ERROR</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>PRG.RUN</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <span>USER</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>BATTERY</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>SD CARD</span>
                    </div>
                  </div>
                </div>

                {/* Middle Port Area: USB & Gigabit LAN */}
                <div className="p-2 space-y-1.5 bg-slate-850 border-t border-slate-750">
                  {/* Gigabit Ethernet Port (SLMP) */}
                  <div className="bg-slate-950 border border-slate-700 rounded p-1 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[6px] font-mono text-slate-400">1000BASE-T</span>
                      <span className="text-[7px] font-mono font-bold text-cyan-400">SLMP 3E</span>
                    </div>
                    <div className="w-4 h-3 bg-slate-800 border border-slate-600 rounded flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                  </div>

                  {/* USB Port */}
                  <div className="flex items-center justify-between text-[6.5px] font-mono text-slate-400 px-1">
                    <span>USB (GX Works)</span>
                    <span className="text-[6px] bg-slate-800 px-1 rounded">TYPE-C</span>
                  </div>
                </div>

                {/* Bottom Pull Door */}
                <div className="h-6 bg-slate-900 border-t border-slate-750 flex items-center justify-center text-[7px] font-mono text-slate-400">
                  ▼ PULL FOR SD
                </div>
              </div>

              {/* SLOT 1 - Digital Input Module (RX40C7) */}
              <div
                onClick={() => onSelectSlot(1)}
                className={`w-28 rounded-lg cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between overflow-hidden relative ${
                  selectedSlot === 1
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-400/20 scale-102 z-10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-850'
                }`}
              >
                <div className="bg-slate-800 px-2 py-1 flex items-center justify-between border-b border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">Slot 1 (DI)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>

                <div className="p-1.5 space-y-1 bg-slate-800/80">
                  <div className="text-[8.5px] font-mono font-bold text-slate-100 text-center">RX40C7</div>
                  <div className="text-[7px] font-mono text-emerald-400 text-center">16-Pt 24VDC</div>

                  {/* 16-channel LED indicator block (Octal 0..7, 10..17) */}
                  <div className="grid grid-cols-4 gap-0.5 p-1 bg-slate-950 rounded border border-slate-750">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((ch) => {
                      const isActive = getDiActive(ch);
                      return (
                        <div
                          key={ch}
                          className={`h-3 rounded-xs flex items-center justify-center text-[6px] font-mono font-bold transition-all ${
                            isActive
                              ? 'bg-amber-400 text-black shadow-[0_0_4px_rgba(251,191,36,0.9)]'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {ch.toString(16).toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Screw Terminal Blocks */}
                <div className="p-1.5 bg-slate-900 border-t border-slate-750 flex-1 flex flex-col justify-around text-[6px] font-mono text-slate-400">
                  <div className="flex justify-between border-b border-slate-800 pb-0.5">
                    <span>TB1: X0-X7</span>
                    <span className="text-emerald-400 font-bold">LIVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TB2: X8-XF</span>
                    <span className="text-slate-500">READY</span>
                  </div>
                </div>

                <div className="h-5 bg-slate-950 border-t border-slate-750 flex items-center justify-center text-[6.5px] font-mono text-slate-400">
                  18-PIN TERMINAL
                </div>
              </div>

              {/* SLOT 2 - Digital Output Module (RY40NT5P) */}
              <div
                onClick={() => onSelectSlot(2)}
                className={`w-28 rounded-lg cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between overflow-hidden relative ${
                  selectedSlot === 2
                    ? 'border-indigo-400 ring-2 ring-indigo-400/40 shadow-lg shadow-indigo-400/20 scale-102 z-10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-850'
                }`}
              >
                <div className="bg-slate-800 px-2 py-1 flex items-center justify-between border-b border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-indigo-400">Slot 2 (DO)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>

                <div className="p-1.5 space-y-1 bg-slate-800/80">
                  <div className="text-[8.5px] font-mono font-bold text-slate-100 text-center">RY40NT5P</div>
                  <div className="text-[7px] font-mono text-indigo-400 text-center">16-Pt Transistor</div>

                  {/* 16-channel LED indicator block */}
                  <div className="grid grid-cols-4 gap-0.5 p-1 bg-slate-950 rounded border border-slate-750">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((ch) => {
                      const isActive = getDoActive(ch);
                      return (
                        <div
                          key={ch}
                          className={`h-3 rounded-xs flex items-center justify-center text-[6px] font-mono font-bold transition-all ${
                            isActive
                              ? 'bg-rose-500 text-white shadow-[0_0_4px_rgba(244,63,94,0.9)]'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {ch.toString(16).toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Screw Terminal Blocks */}
                <div className="p-1.5 bg-slate-900 border-t border-slate-750 flex-1 flex flex-col justify-around text-[6px] font-mono text-slate-400">
                  <div className="flex justify-between border-b border-slate-800 pb-0.5">
                    <span>TB1: Y0-Y7</span>
                    <span className="text-indigo-400 font-bold">SINK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TB2: Y8-YF</span>
                    <span className="text-slate-500">READY</span>
                  </div>
                </div>

                <div className="h-5 bg-slate-950 border-t border-slate-750 flex items-center justify-center text-[6.5px] font-mono text-slate-400">
                  0.5A / POINT
                </div>
              </div>

              {/* SLOT 3 - Analog Input Module (R60AD8) */}
              <div
                onClick={() => onSelectSlot(3)}
                className={`w-28 rounded-lg cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between overflow-hidden relative ${
                  selectedSlot === 3
                    ? 'border-blue-400 ring-2 ring-blue-400/40 shadow-lg shadow-blue-400/20 scale-102 z-10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-850'
                }`}
              >
                <div className="bg-slate-800 px-2 py-1 flex items-center justify-between border-b border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-blue-400">Slot 3 (AI)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>

                <div className="p-1.5 space-y-1 bg-slate-800/80">
                  <div className="text-[8.5px] font-mono font-bold text-slate-100 text-center">R60AD8</div>
                  <div className="text-[7px] font-mono text-blue-400 text-center">8-Ch 4-20mA</div>

                  {/* Channel Active Status */}
                  <div className="grid grid-cols-4 gap-0.5 p-1 bg-slate-950 rounded border border-slate-750">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((ch) => (
                      <div
                        key={ch}
                        className={`h-3 rounded-xs flex items-center justify-center text-[6px] font-mono font-bold ${
                          ch <= 5 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        CH{ch}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-1.5 bg-slate-900 border-t border-slate-750 flex-1 flex flex-col justify-around text-[6px] font-mono text-slate-400">
                  <div className="flex justify-between border-b border-slate-800 pb-0.5">
                    <span>5 µs / CH</span>
                    <span className="text-cyan-400 font-bold">16-BIT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>D100 - D107</span>
                    <span className="text-slate-300">CALIB OK</span>
                  </div>
                </div>

                <div className="h-5 bg-slate-950 border-t border-slate-750 flex items-center justify-center text-[6.5px] font-mono text-slate-400">
                  DIFFERENTIAL
                </div>
              </div>

              {/* SLOT 4 - Analog Output Module (R60DA8) */}
              <div
                onClick={() => onSelectSlot(4)}
                className={`w-28 rounded-lg cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between overflow-hidden relative ${
                  selectedSlot === 4
                    ? 'border-purple-400 ring-2 ring-purple-400/40 shadow-lg shadow-purple-400/20 scale-102 z-10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-850'
                }`}
              >
                <div className="bg-slate-800 px-2 py-1 flex items-center justify-between border-b border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-purple-400">Slot 4 (AO)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                </div>

                <div className="p-1.5 space-y-1 bg-slate-800/80">
                  <div className="text-[8.5px] font-mono font-bold text-slate-100 text-center">R60DA8</div>
                  <div className="text-[7px] font-mono text-purple-400 text-center">8-Ch 4-20mA/10V</div>

                  {/* Channel Active Status */}
                  <div className="grid grid-cols-4 gap-0.5 p-1 bg-slate-950 rounded border border-slate-750">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((ch) => (
                      <div
                        key={ch}
                        className={`h-3 rounded-xs flex items-center justify-center text-[6px] font-mono font-bold ${
                          ch <= 2 ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        CH{ch}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-1.5 bg-slate-900 border-t border-slate-750 flex-1 flex flex-col justify-around text-[6px] font-mono text-slate-400">
                  <div className="flex justify-between border-b border-slate-800 pb-0.5">
                    <span>10 µs / CH</span>
                    <span className="text-purple-400 font-bold">16-BIT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>D200 - D207</span>
                    <span className="text-slate-300">VFD / FCV</span>
                  </div>
                </div>

                <div className="h-5 bg-slate-950 border-t border-slate-750 flex items-center justify-center text-[6.5px] font-mono text-slate-400">
                  MODULATING
                </div>
              </div>

              {/* SLOTS 5, 6, 7 - Empty / Expansion Slots with RG60 Dummy Cover Plate */}
              {[5, 6, 7].map((slotIdx) => (
                <div
                  key={slotIdx}
                  onClick={() => onSelectSlot(slotIdx)}
                  className={`w-20 rounded-lg cursor-pointer transition-all duration-200 border border-dashed flex flex-col justify-between overflow-hidden relative ${
                    selectedSlot === slotIdx
                      ? 'border-cyan-400 bg-cyan-950/20'
                      : 'border-slate-800 hover:border-slate-600 bg-slate-950/60'
                  }`}
                >
                  <div className="bg-slate-900/80 px-1.5 py-0.5 flex items-center justify-between border-b border-slate-800 text-[9px] font-mono text-slate-500">
                    <span>Slot {slotIdx}</span>
                  </div>

                  <div className="p-2 text-center my-auto flex flex-col items-center justify-center gap-1 opacity-50 hover:opacity-100 transition">
                    <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                      +
                    </div>
                    <span className="text-[7.5px] font-mono text-slate-400">EMPTY / RG60</span>
                  </div>

                  <div className="h-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center text-[6px] font-mono text-slate-600">
                    EXPANSION
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Module Properties Quick-Banner */}
      <div className="bg-slate-850 px-4 py-2 border-t border-slate-750 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-100">
            {selectedSlot === 'POW'
              ? 'Slot POW: AC Power Supply R61P (100-240V AC / 5V DC 6.5A)'
              : selectedSlot === 0
              ? 'Slot 0 (CPU): Mitsubishi Electric R08CPU (80K Steps, SLMP 3E Native)'
              : selectedSlot === 1
              ? 'Slot 1 (DI): RX40C7 (16 Channels 24VDC, Addressing X0 - XF)'
              : selectedSlot === 2
              ? 'Slot 2 (DO): RY40NT5P (16 Channels Sink Transistor, Addressing Y0 - YF)'
              : selectedSlot === 3
              ? 'Slot 3 (AI): R60AD8 (8 Channels 4-20mA, Buffer D100 - D107)'
              : selectedSlot === 4
              ? 'Slot 4 (AO): R60DA8 (8 Channels Modulating 4-20mA/0-10V, Buffer D200 - D207)'
              : `Slot ${selectedSlot}: Empty / Available for expansion`}
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Click any module to inspect pinout or map hardware channels
        </div>
      </div>
    </div>
  );
};
