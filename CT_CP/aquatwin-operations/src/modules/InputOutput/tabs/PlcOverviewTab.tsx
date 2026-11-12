/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlcDeviceConfig, PlcHardwareModule, ExtendedPlcTag } from '../types';
import { useRuntimeMode } from '../../../context/RuntimeModeContext';
import {
  Cpu,
  RefreshCw,
  Power,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  HardDrive,
  Network,
} from 'lucide-react';

interface PlcOverviewTabProps {
  device: PlcDeviceConfig;
  modules: PlcHardwareModule[];
  tags: ExtendedPlcTag[];
  onUpdateDevice: (updated: Partial<PlcDeviceConfig>) => void;
  onNavigateTab: (tabKey: string) => void;
}

export const PlcOverviewTab: React.FC<PlcOverviewTabProps> = ({
  device,
  modules,
  tags,
  onUpdateDevice,
  onNavigateTab,
}) => {
  const { plcHealth, setMode } = useRuntimeMode();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [photoAngle, setPhotoAngle] = useState<'FRONT' | 'ISOMETRIC'>('FRONT');
  const [confirmModeModal, setConfirmModeModal] = useState<boolean>(false);

  const isConnected = plcHealth.connected;
  const isReal = plcHealth.mode === 'REAL';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleToggleConnect = () => {
    onUpdateDevice({
      mode: isConnected ? 'VIRTUAL' : 'REAL',
    });
  };

  const handleChangeMode = (newMode: 'VIRTUAL' | 'REAL') => {
    setMode(newMode);
    onUpdateDevice({ mode: newMode });
    setConfirmModeModal(false);
  };

  return (
    <div className="space-y-5">
      {/* 2-Column Hero Card Section matching user reference screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 Cols): PLC Information Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header with Title and Brand */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                PLC Information
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500">Node ID:</span>
                <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {device.id}
                </span>
              </div>
            </div>

            {/* Mitsubishi Electric Logo & Brand Heading */}
            <div className="my-5 flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              {/* Mitsubishi Electric 3-Diamond Emblem */}
              <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-8 h-8 fill-red-600 drop-shadow-xs">
                  {/* Top diamond */}
                  <polygon points="50,15 65,40 50,65 35,40" />
                  {/* Bottom-left diamond */}
                  <polygon points="20,65 35,40 20,15 5,40" transform="rotate(60 35 40)" />
                  {/* Bottom-right diamond */}
                  <polygon points="80,65 95,40 80,15 65,40" transform="rotate(-60 65 40)" />
                </svg>
              </div>

              <div>
                <div className="text-xs font-black tracking-wider text-slate-900 dark:text-white font-mono leading-tight">
                  MITSUBISHI ELECTRIC
                </div>
                <div className="text-[10px] text-slate-500 font-mono tracking-tight">
                  MELSEC iQ-R Series Industrial Controller
                </div>
              </div>
            </div>

            {/* Hardware Specification Key-Values */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Model</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  : iQ-R Series
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">CPU</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  : {device.cpuModel}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Firmware</span>
                <span className="text-slate-700 dark:text-slate-300">
                  : {device.firmware}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">IP Address</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400">
                  : {device.host}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Protocol</span>
                <span className="text-slate-700 dark:text-slate-300">
                  : SLMP (3E Frame)
                </span>
              </div>
            </div>

            {/* Connection Status Pill */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Connection State:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  isConnected
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Disconnect / Refresh */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <button
              onClick={handleToggleConnect}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 border ${
                isConnected
                  ? 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  : 'bg-cyan-600 text-white hover:bg-cyan-500 border-cyan-600'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isConnected ? 'Disconnect' : 'Connect PLC'}</span>
            </button>

            <button
              onClick={handleRefresh}
              className="py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Genuine Mitsubishi Hardware Rack Visual Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  MELSEC iQ-R Hardware Assembly
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                  R68B 8-Slot Rack
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setPhotoAngle('FRONT')}
                  className={`px-2.5 py-1 rounded text-[11px] transition ${
                    photoAngle === 'FRONT'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setPhotoAngle('ISOMETRIC')}
                  className={`px-2.5 py-1 rounded text-[11px] transition ${
                    photoAngle === 'ISOMETRIC'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  3D View
                </button>
              </div>
            </div>

            {/* Hardware Image Container */}
            <div className="mt-3 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center p-2 min-h-[260px]">
              <img
                src={
                  photoAngle === 'FRONT'
                    ? '/assets/mitsubishi/melsec_iq_r_front.jpg'
                    : '/assets/mitsubishi/melsec_iq_r_isometric.jpg'
                }
                alt="Mitsubishi MELSEC iQ-R Rack"
                className="w-full h-auto object-contain max-h-[250px] transition-all duration-300 hover:scale-102"
              />

              {/* Module Slot Hotspot Labels matching screenshot */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between bg-black/75 backdrop-blur-xs px-3 py-1 rounded-md text-[9px] font-mono text-slate-300 border border-white/10">
                <span className="text-red-400 font-bold">POW (R61P)</span>
                <span className="text-cyan-400 font-bold">CPU (R08CPU)</span>
                <span className="text-emerald-400 font-bold">DI (RX40C7)</span>
                <span className="text-indigo-400 font-bold">DO (RY40NT5P)</span>
                <span className="text-blue-400 font-bold">AI (R60AD8)</span>
                <span className="text-purple-400 font-bold">AO (R60DA8)</span>
              </div>
            </div>
          </div>

          {/* Quick Jump to Hardware Configuration */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">
              Slots Configured: 5 Modules ({tags.length} Mapped I/O Channels)
            </span>
            <button
              onClick={() => onNavigateTab('hardware')}
              className="text-cyan-600 dark:text-cyan-400 font-mono font-bold flex items-center gap-1 hover:underline"
            >
              <span>Configure Rack & Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom KPI Metrics Bar matching user screenshot (Scan Time, Data Quality, Mode) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Scan Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-mono">Scan Time</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
              12:34:56 PM
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              Cycle: {device.scanTimeMs} ms • Healthy
            </div>
          </div>
        </div>

        {/* Metric 2: Data Quality */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-mono">Data Quality</div>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              Good
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              0 Communication Errors • Frame 3E Validated
            </div>
          </div>
        </div>

        {/* Metric 3: Mode (Real PLC / Virtual PLC) with Mode Switcher */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isReal
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-mono">Mode</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                {isReal ? 'Real PLC' : 'Virtual PLC'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {isReal ? 'SLMP TCP 192.168.1.10' : 'In-Memory Software Simulator'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setConfirmModeModal(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 transition"
          >
            Change
          </button>
        </div>
      </div>

      {/* Mode Switch Modal */}
      {confirmModeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              Select PLC Runtime Mode
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Switch between Virtual PLC (in-memory physics simulation) and Real PLC (connecting to physical Mitsubishi MELSEC iQ-R hardware via SLMP protocol).
            </p>

            <div className="space-y-2 mb-5">
              <div
                onClick={() => handleChangeMode('REAL')}
                className={`p-3 rounded-lg border-2 cursor-pointer transition flex items-center justify-between ${
                  isReal
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Real PLC (Physical Hardware)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Direct SLMP communication with physical R08CPU at 192.168.1.10:5007
                  </div>
                </div>
                {isReal && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>

              <div
                onClick={() => handleChangeMode('VIRTUAL')}
                className={`p-3 rounded-lg border-2 cursor-pointer transition flex items-center justify-between ${
                  !isReal
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Virtual PLC (Simulation)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Simulated tags and process dynamics without requiring physical PLC wiring
                  </div>
                </div>
                {!isReal && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-mono">
              <button
                onClick={() => setConfirmModeModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
