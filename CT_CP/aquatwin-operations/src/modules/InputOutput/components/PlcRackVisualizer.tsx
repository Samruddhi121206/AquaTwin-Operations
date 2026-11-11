/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExtendedPlcTag } from '../types';
import {
  Save,
  CheckCircle,
  Network,
  HelpCircle,
  Plus,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Cpu,
  Power,
  Sliders,
  Check,
  AlertCircle,
  X,
  Radio,
  Zap,
} from 'lucide-react';

export interface RackModuleItem {
  slot: number | string; // 'PWR' | 'CPU' | 1 | 2 | 3 | 4
  slotNumber?: number;
  model: string;
  name: string;
  category: 'Power Supply' | 'CPU' | 'Discrete Input' | 'Discrete Output' | 'Analog Input' | 'Combo';
  colorTag: string;
  description: string;
  channels: number;
  terminalType: string;
  liveStates?: Record<number, boolean | number>;
  specs: Record<string, string>;
}

interface PlcRackVisualizerProps {
  tags: ExtendedPlcTag[];
  onToggleSimulatorSwitch?: (channel: number, value: boolean) => void;
  onSelectTagForEdit?: (tagId: string) => void;
  onSelectSlot?: (slot: number | string) => void;
}

export const PlcRackVisualizer: React.FC<PlcRackVisualizerProps> = ({
  tags,
  onToggleSimulatorSwitch,
  onSelectTagForEdit,
  onSelectSlot,
}) => {
  // Active window tab
  const [activeWindowTab, setActiveWindowTab] = useState<string>('CPU');

  // Selected module in rack (defaults to Slot 3 P1-08SIM matching user photo)
  const [selectedSlot, setSelectedSlot] = useState<string | number>(3);

  // Expanded categories in catalogue
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    Favorites: false,
    'Power Supply': true,
    CPU: true,
    'Discrete Input': true,
    'Discrete Output': true,
    'Analog Input': false,
  });

  // Simulator toggle switches for P1-08SIM (Channels 1 to 8) synced with tags
  const getTagValue = (tagId: string, fallback: boolean) => {
    const t = tags.find((x) => x.id === tagId);
    return t ? t.currentValue === true : fallback;
  };

  const [simSwitches, setSimSwitches] = useState<Record<number, boolean>>({
    1: getTagValue('P101_RUN_FB', true),
    2: getTagValue('P101_TRIP', false),
    3: getTagValue('P201_RUN_FB', true),
    4: getTagValue('XV101_OPEN_FB', true),
    5: getTagValue('XV101_CLOSE_FB', false),
    6: getTagValue('TK101_LSH', false),
    7: getTagValue('TK101_LSL', false),
    8: false,
  });

  // Keep in sync when tags change
  React.useEffect(() => {
    setSimSwitches({
      1: getTagValue('P101_RUN_FB', true),
      2: getTagValue('P101_TRIP', false),
      3: getTagValue('P201_RUN_FB', true),
      4: getTagValue('XV101_OPEN_FB', true),
      5: getTagValue('XV101_CLOSE_FB', false),
      6: getTagValue('TK101_LSH', false),
      7: getTagValue('TK101_LSL', false),
      8: false,
    });
  }, [tags]);

  // Notification message on toolbar action
  const [toolbarAlert, setToolbarAlert] = useState<string | null>(null);

  const handleSelectModuleSlot = (slot: string | number) => {
    setSelectedSlot(slot);
    if (onSelectSlot) {
      onSelectSlot(slot);
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleToggleSwitch = (swNum: number) => {
    const nextVal = !simSwitches[swNum];
    setSimSwitches((prev) => ({ ...prev, [swNum]: nextVal }));
    if (onToggleSimulatorSwitch) {
      onToggleSimulatorSwitch(swNum, nextVal);
    }
  };

  const triggerToolbarAction = (msg: string) => {
    setToolbarAlert(msg);
    setTimeout(() => setToolbarAlert(null), 3000);
  };

  // Modular Rack Modules based exactly on user's uploaded screenshot
  const rackModules: RackModuleItem[] = [
    {
      slot: 'PWR',
      model: 'P1-01AC',
      name: 'AC Power Supply Module',
      category: 'Power Supply',
      colorTag: '#64748b',
      description: '100-240V AC Input / 24V DC 28W Internal System Bus Supply',
      channels: 0,
      terminalType: 'Barrier Screw Terminal Block',
      specs: {
        'Input Voltage': '100-240 VAC (50/60Hz) / 125 VDC',
        'Output Power': '28W Maximum Internal Bus',
        'Terminals': 'AC(L), DC(+V), AC(N), DC(-V), Ground, Logic Ground',
        'Fuse Protection': 'Internal 2.0A Slow-Blow',
      },
    },
    {
      slot: 'CPU',
      model: 'P1-540',
      name: 'Productivity1000 CPU Controller',
      category: 'CPU',
      colorTag: '#0284c7',
      description: 'High-performance CPU with Ethernet, RS-485, RS-232, and MicroUSB ports',
      channels: 0,
      terminalType: 'RJ45 + 4-Pin Terminal Block',
      specs: {
        'Processor': '50 MHz High-Speed ARM Core',
        'Memory': '50 MB User Program / Data Register',
        'Ethernet Port': '10/100 Mbps RJ45 (Modbus TCP & EtherNet/IP)',
        'Serial Ports': 'RS-485 4-Pin & RS-232 RJ12',
        'Operating Mode': 'RUN / STOP / REMOTE Selector Switch',
      },
    },
    {
      slot: 1,
      slotNumber: 1,
      model: 'P1-16TR',
      name: 'Relay Output Module',
      category: 'Discrete Output',
      colorTag: '#ef4444', // Red header like in photo
      description: '16-Channel Isolated Form A (SPST) Relay Output Module',
      channels: 16,
      terminalType: 'Spring Clamp / Screw Terminal Block',
      specs: {
        'Output Points': '16 Electromechanical Relays',
        'Voltage Range': '6-240 VAC / 6-24 VDC',
        'Max Current': '2A per common, 8A per module',
        'Commons': '2 Isolated Groups (C1: 1-8, C2: 9-16)',
      },
    },
    {
      slot: 2,
      slotNumber: 2,
      model: 'P1-16CDR',
      name: 'Combination DC In / Relay Out',
      category: 'Combo',
      colorTag: '#1e293b', // Black header like in photo
      description: '8-Point 24V DC Input & 8-Point Relay Output Combo Module',
      channels: 16,
      terminalType: 'Terminal Block (Inputs 1-8 / Outputs 1-8)',
      specs: {
        'Discrete Inputs': '8 Points 12-24 VAC/VDC Sink/Source',
        'Relay Outputs': '8 Points Form A (SPST) Relays',
        'Status Display': 'Green Input LEDs / Red Output LEDs',
        'Response Time': 'Input: 3ms, Relay: 10ms',
      },
    },
    {
      slot: 3,
      slotNumber: 3,
      model: 'P1-08SIM',
      name: 'Input Simulator Module',
      category: 'Discrete Input',
      colorTag: '#10b981', // Highlighted in green in photo
      description: '8-Point Input Simulator with Physical Mechanical Toggle Switches',
      channels: 8,
      terminalType: 'Front Panel Toggle Switches 1-8',
      specs: {
        'Input Channels': '8 Points Manual Toggle Switches',
        'Function': 'Direct simulation of sensor dry-contacts and field limit switches',
        'Switch Rating': '3-Position / 2-Position Miniature Toggle',
        'LED Indicators': '8 Yellow/Amber Active Channel LEDs',
      },
    },
    {
      slot: 4,
      slotNumber: 4,
      model: 'P1-04THM',
      name: 'Thermocouple Input Module',
      category: 'Analog Input',
      colorTag: '#06b6d4', // Cyan header like in photo
      description: '4-Channel High-Resolution Thermocouple & Millivolt Input Module',
      channels: 4,
      terminalType: 'Screw Terminal Block (TC1+ TC1- .. TC4+ TC4-)',
      specs: {
        'Input Types': 'Type J, K, E, R, S, T, B, N, C & ±39.06mV',
        'Resolution': '16-Bit Sigma-Delta (0.1°C)',
        'Cold Junction': 'Integrated Precision Thermistor Compensation',
        'Common Mode Rejection': '120 dB at 50/60 Hz',
      },
    },
  ];

  // Catalogue data matching right panel of screenshot
  const catalogueTree: Record<string, string[]> = {
    Favorites: ['P1-540', 'P1-08SIM', 'P1-16TR', 'P1-04THM'],
    'Power Supply': ['P1-01AC', 'P1-01DC', 'P1-02AC'],
    CPU: ['P1-540', 'P1-550'],
    'Discrete Input': [
      'P1-08NA',
      'P1-08ND3',
      'P1-08NE3',
      'P1-08SIM',
      'P1-16ND3',
      'P1-16NE3',
    ],
    'Discrete Output': [
      'P1-08TA',
      'P1-08TD1',
      'P1-08TD2',
      'P1-08TRS',
      'P1-16TR',
    ],
    'Analog Input': [
      'P1-04AD-1',
      'P1-04AD-2',
      'P1-04THM',
      'P1-04RTD',
    ],
  };

  const selectedModule =
    rackModules.find((m) => m.slot === selectedSlot) || rackModules[4]; // Default to P1-08SIM

  return (
    <div className="bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden font-sans text-xs select-none">
      {/* Window Title Bar */}
      <div className="bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 border-b border-slate-400 dark:border-slate-700 px-3 py-1.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-cyan-600 flex items-center justify-center text-[9px] font-bold text-white shadow-2xs">
            ⚙
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-xs tracking-tight">
            Hardware Configuration — Productivity / Modular PLC Rack
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
          <span>Rack 0 (Base Chassis)</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</span>
        </div>
      </div>

      {/* Engineering Icon Toolbar */}
      <div className="bg-slate-200/80 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 px-3 py-1.5 flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1">
          <button
            onClick={() => triggerToolbarAction('Hardware configuration saved to plant database.')}
            className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            title="Save Hardware Configuration"
          >
            <Save className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </button>
          <button
            onClick={() => triggerToolbarAction('Hardware configuration validated: 0 conflicts, all address ranges OK.')}
            className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            title="Check / Validate Configuration"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>
          <button
            onClick={() => triggerToolbarAction('Network bus scanned: 6 modules responding.')}
            className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            title="Scan Network / Communication Modules"
          >
            <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </button>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
          <button
            onClick={() => triggerToolbarAction('Help manual: Click any module to inspect pinout. Toggle switches on P1-08SIM to simulate field DI states.')}
            className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            title="Help / Manual"
          >
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
        </div>

        {toolbarAlert && (
          <div className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[11px] font-mono animate-fadeIn">
            {toolbarAlert}
          </div>
        )}

        <div className="text-[11px] font-mono text-slate-500">
          Click module in chassis or drag from catalogue
        </div>
      </div>

      {/* Configuration Protocol Tabs (Matching Screenshot) */}
      <div className="bg-slate-200 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 px-3 flex items-center gap-0.5 overflow-x-auto text-[11px] font-mono">
        {[
          'CPU',
          'GS Drives',
          'Protos X',
          'EtherNet/IP',
          'CPoE',
          'ProNET',
          'Mail Accounts',
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveWindowTab(tab)}
            className={`px-3 py-1.5 font-semibold transition border-t-2 ${
              activeWindowTab === tab
                ? 'bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white border-cyan-500 shadow-xs'
                : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Workbench Body: Left Chassis Rack + Right Catalogue */}
      <div className="flex flex-col lg:flex-row h-[520px]">
        {/* Left Side: Modular PLC Rack Backplane */}
        <div className="flex-1 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4 relative overflow-x-auto flex flex-col justify-between">
          {/* Navigation Arrows on Upper Rack */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => handleSelectModuleSlot(typeof selectedSlot === 'number' && selectedSlot > 1 ? selectedSlot - 1 : 'CPU')}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs hover:bg-slate-50 text-cyan-600 dark:text-cyan-400"
              title="Scroll Rack Left"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleSelectModuleSlot(typeof selectedSlot === 'number' && selectedSlot < 4 ? selectedSlot + 1 : 1)}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs hover:bg-slate-50 text-cyan-600 dark:text-cyan-400"
              title="Scroll Rack Right"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-500">
              Backplane: 8-Slot Compact Aluminum DIN Base
            </span>
          </div>

          {/* Aluminum DIN Rail Bar Behind Modules */}
          <div className="relative py-4 flex items-end justify-start min-w-[720px] gap-2 px-2 my-auto">
            {/* Horizontal Rail Graphic */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-14 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 border-y border-slate-400 dark:border-slate-600 shadow-inner pointer-events-none" />

            {/* RACK MODULES (Rendered with realistic industrial physical elements) */}
            {rackModules.map((m) => {
              const isSelected = selectedSlot === m.slot;

              return (
                <div
                  key={m.slot}
                  onClick={() => handleSelectModuleSlot(m.slot)}
                  className="flex flex-col items-center cursor-pointer group relative z-10"
                >
                  {/* Slot Number Label Above Module */}
                  <div className="h-5 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
                    {m.slotNumber !== undefined ? m.slotNumber : ''}
                  </div>

                  {/* Module Physical Body */}
                  <div
                    className={`relative w-28 h-80 rounded-t-lg bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-850 border-2 transition-all duration-150 shadow-md flex flex-col justify-between p-2 select-none ${
                      isSelected
                        ? 'border-emerald-500 ring-4 ring-emerald-500/40 shadow-emerald-500/20 scale-102 z-20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    {/* Top Mounting Ear */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-3 bg-slate-300 dark:bg-slate-700 rounded-t border-t border-x border-slate-400 dark:border-slate-600 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-800 shadow-inner" />
                    </div>

                    {/* Module Header / Badge */}
                    <div className="border-b border-black/10 dark:border-white/10 pb-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-100 tracking-tight font-mono">
                          {m.model}
                        </span>
                        {/* Status LED */}
                        <span
                          className={`w-2 h-2 rounded-full ${
                            m.slot === 'PWR'
                              ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                              : m.slot === 'CPU'
                              ? 'bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <div className="text-[7.5px] font-mono text-slate-500 tracking-tighter truncate">
                        Productivity1000
                      </div>
                    </div>

                    {/* Module Face Front Elements */}
                    <div className="flex-1 py-1 flex flex-col justify-center">
                      {/* 1. POWER SUPPLY (P1-01AC) */}
                      {m.slot === 'PWR' && (
                        <div className="space-y-1.5 flex flex-col items-center">
                          <div className="text-[8px] font-mono text-slate-600 dark:text-slate-300 text-center leading-tight">
                            100-240V AC
                            <br />
                            50-60Hz
                            <br />
                            28W
                          </div>

                          {/* Screw Terminals */}
                          <div className="w-full bg-slate-200 dark:bg-slate-900 border border-slate-400 dark:border-slate-700 rounded p-1 space-y-1 text-[7px] font-mono">
                            {['AC (L)', 'DC (+V)', 'AC (N)', 'DC (-V)', 'G', 'LG'].map((term, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-400 dark:bg-slate-700 border border-slate-500 flex items-center justify-center text-[6px] shadow-inner font-bold">
                                  +
                                </div>
                                <span className="text-slate-700 dark:text-slate-300">{term}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. CPU CONTROLLER (P1-540) */}
                      {m.slot === 'CPU' && (
                        <div className="space-y-2 flex flex-col items-center">
                          {/* RS-485 Terminal Block */}
                          <div className="w-full bg-emerald-800 text-emerald-200 text-[6.5px] font-mono p-1 rounded flex justify-around">
                            <span>TX+</span>
                            <span>TX-</span>
                            <span>RX+</span>
                            <span>RX-</span>
                          </div>

                          {/* Ethernet RJ45 Jack */}
                          <div className="w-12 h-10 bg-slate-900 border-2 border-slate-700 rounded flex flex-col justify-between p-1 shadow-inner">
                            <div className="flex justify-between">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            </div>
                            <div className="text-[6px] text-cyan-400 font-mono text-center">
                              ETHERNET
                            </div>
                          </div>

                          {/* Run/Stop Selector */}
                          <div className="flex items-center gap-1.5 text-[8px] font-mono text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-emerald-600">RUN</span>
                            <div className="w-2.5 h-6 bg-slate-800 rounded-full border border-slate-600 flex flex-col justify-start p-0.5">
                              <span className="w-1.5 h-2 bg-white rounded-full shadow-xs" />
                            </div>
                            <span>STOP</span>
                          </div>
                        </div>
                      )}

                      {/* 3. RELAY OUTPUT (P1-16TR) */}
                      {m.slot === 1 && (
                        <div className="space-y-1">
                          <div className="h-3 bg-rose-600 text-white text-[7px] font-mono font-bold flex items-center justify-center rounded-xs">
                            RELAY OUTPUT
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[7px] font-mono p-1 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((ch) => (
                              <div key={ch} className="flex items-center justify-between px-0.5">
                                <span className="text-slate-400">{ch}</span>
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    ch === 1 || ch === 2
                                      ? 'bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]'
                                      : 'bg-slate-300 dark:bg-slate-700'
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. COMBO MODULE (P1-16CDR) */}
                      {m.slot === 2 && (
                        <div className="space-y-1">
                          <div className="h-3 bg-slate-800 text-white text-[7px] font-mono font-bold flex items-center justify-center rounded-xs">
                            8 DI / 8 RELAY
                          </div>
                          <div className="space-y-1 text-[7px] font-mono p-1 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700">
                            <div className="text-[6.5px] text-cyan-600 font-bold border-b border-slate-200 dark:border-slate-800 pb-0.5">
                              INPUTS 1-8
                            </div>
                            <div className="grid grid-cols-4 gap-0.5">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <span
                                  key={i}
                                  className={`h-2 rounded-xs flex items-center justify-center text-[6px] ${
                                    i === 1 || i === 3
                                      ? 'bg-emerald-500 text-white font-bold'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                  }`}
                                >
                                  {i}
                                </span>
                              ))}
                            </div>
                            <div className="text-[6.5px] text-rose-600 font-bold border-b border-slate-200 dark:border-slate-800 pb-0.5 pt-1">
                              OUTPUTS 1-8
                            </div>
                            <div className="grid grid-cols-4 gap-0.5">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <span
                                  key={i}
                                  className={`h-2 rounded-xs flex items-center justify-center text-[6px] ${
                                    i === 1
                                      ? 'bg-rose-500 text-white font-bold'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                  }`}
                                >
                                  {i}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 5. INPUT SIMULATOR (P1-08SIM) — Matching user screenshot with live toggle switches! */}
                      {m.slot === 3 && (
                        <div className="space-y-1">
                          <div className="h-3.5 bg-emerald-600 text-white text-[7px] font-mono font-bold flex items-center justify-center rounded-xs">
                            INPUT SIMULATOR
                          </div>

                          {/* 8 Mechanical Toggle Switches */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1 space-y-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((swNum) => {
                              const isOn = simSwitches[swNum];
                              return (
                                <div
                                  key={swNum}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleSwitch(swNum);
                                  }}
                                  className="flex items-center justify-between px-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded py-0.5 transition cursor-pointer"
                                  title={`Click to flip toggle switch ${swNum} (Currently ${isOn ? 'ON' : 'OFF'})`}
                                >
                                  <span className="text-[7.5px] font-bold font-mono text-slate-600 dark:text-slate-300">
                                    {swNum}
                                  </span>

                                  {/* Mechanical Toggle Switch Graphic */}
                                  <div className="w-7 h-3 bg-slate-300 dark:bg-slate-700 rounded-full border border-slate-400 dark:border-slate-600 flex items-center p-0.5 relative">
                                    <div
                                      className={`w-2.5 h-2.5 rounded-full transition-all duration-150 transform ${
                                        isOn
                                          ? 'translate-x-3.5 bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]'
                                          : 'translate-x-0 bg-slate-400 dark:bg-slate-500'
                                      }`}
                                    />
                                  </div>

                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isOn ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]' : 'bg-slate-300 dark:bg-slate-700'
                                    }`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 6. THERMOCOUPLE / ANALOG INPUT (P1-04THM) */}
                      {m.slot === 4 && (
                        <div className="space-y-1">
                          <div className="h-3.5 bg-cyan-600 text-white text-[7px] font-mono font-bold flex items-center justify-center rounded-xs">
                            THERMOCOUPLE
                          </div>

                          <div className="bg-emerald-900 text-emerald-200 text-[6.5px] font-mono p-1 rounded space-y-1">
                            {['TC1+', 'TC1-', 'TC2+', 'TC2-', 'TC3+', 'TC3-', 'TC4+', 'TC4-'].map(
                              (term, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  <span>{term}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Label on Module */}
                    <div className="pt-1 border-t border-black/10 dark:border-white/10 text-center">
                      <span className="text-[8px] font-mono text-slate-500 truncate block">
                        {m.name.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Under-Module Text Label (Matching Screenshot) */}
                  <div className="mt-1.5 text-center">
                    <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      {m.model}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Under Rack Status */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-300 dark:border-slate-800">
            <span>Productivity1000 P1-540 Modular Architecture</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Selected: Slot {selectedModule.slot} ({selectedModule.model})
            </span>
          </div>
        </div>

        {/* Right Side: Module Catalogue Sidebar (Matching Screenshot) */}
        <div className="w-full lg:w-64 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-300 dark:border-slate-800 p-3 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200 dark:border-slate-800 uppercase font-mono tracking-wider">
              Module Catalogue
            </div>

            {/* Tree Categories */}
            <div className="py-2 space-y-1 text-xs font-mono">
              {Object.entries(catalogueTree).map(([category, items]) => {
                const isExpanded = expandedCats[category] ?? false;
                return (
                  <div key={category} className="space-y-0.5">
                    <div
                      onClick={() => toggleCategory(category)}
                      className="cursor-pointer flex items-center gap-1.5 px-1 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      {isExpanded ? (
                        <span className="w-3.5 h-3.5 border border-slate-400 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300">
                          -
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5 border border-slate-400 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300">
                          +
                        </span>
                      )}
                      <span>{category}</span>
                    </div>

                    {isExpanded && (
                      <div className="pl-5 space-y-0.5 border-l border-slate-200 dark:border-slate-800 ml-2 py-0.5">
                        {items.map((itemModel) => (
                          <div
                            key={itemModel}
                            onClick={() =>
                              triggerToolbarAction(
                                `Selected catalogue module ${itemModel}. Ready to assign to rack slot.`
                              )
                            }
                            className={`cursor-pointer px-1.5 py-0.5 rounded text-[11px] hover:bg-cyan-500/10 hover:text-cyan-600 transition flex items-center justify-between ${
                              selectedModule.model === itemModel
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span>{itemModel}</span>
                            {selectedModule.model === itemModel && (
                              <span className="text-[9px] text-emerald-500 font-bold">IN RACK</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
            Drag & drop or double click to place in slot
          </div>
        </div>
      </div>

      {/* Selected Module Technical Details Drawer (Bottom) */}
      <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Slot {selectedModule.slot}: {selectedModule.name} ({selectedModule.model})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                {selectedModule.category}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">{selectedModule.description}</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Terminals:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {selectedModule.terminalType}
            </span>
          </div>
        </div>

        {/* Technical Specs Key-Values */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-xs font-mono">
          {Object.entries(selectedModule.specs).map(([key, value]) => (
            <div
              key={key}
              className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <span className="text-[10px] text-slate-400 block">{key}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate block">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
