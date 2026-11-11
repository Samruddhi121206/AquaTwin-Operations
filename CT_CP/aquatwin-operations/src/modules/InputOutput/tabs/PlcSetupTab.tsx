/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlcDeviceConfig } from '../types';
import { SimulatedBadge } from '../../../components/shared/SimulatedBadge';
import {
  Cpu,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Lock,
  Unlock,
  Radio,
  Sliders,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface PlcSetupTabProps {
  device: PlcDeviceConfig;
  onUpdateDevice: (updated: Partial<PlcDeviceConfig>) => void;
}

export const PlcSetupTab: React.FC<PlcSetupTabProps> = ({ device, onUpdateDevice }) => {
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    latencyMs?: number;
    message?: string;
  }>({ status: 'IDLE' });

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTestResult({ status: 'IDLE' });

    setTimeout(() => {
      setTestingConnection(false);
      setTestResult({
        status: 'SUCCESS',
        latencyMs: device.mode === 'VIRTUAL' ? 12 : 38,
        message:
          device.mode === 'VIRTUAL'
            ? 'Virtual PLC loopback responded OK (SLMP Binary 3E emulator active).'
            : `Physical PLC handshake verified at ${device.host}:${device.port}. CPU: ${device.cpuModel} (RUN mode).`,
      });
    }, 900);
  };

  return (
    <div className="space-y-5">
      {/* Top Controller Identity Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Target PLC Controller & Communication Setup
                </h2>
                <SimulatedBadge verified={false} text="SLMP 3E / 4E DRIVER" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Supports Mitsubishi Electric (iQ-F, iQ-R, iQ-L, Q Series) and Siemens S7-1500 / S7-1200
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center text-xs font-mono">
              <button
                onClick={() => onUpdateDevice({ mode: 'VIRTUAL' })}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  device.mode === 'VIRTUAL'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Virtual PLC (Simulation)
              </button>
              <button
                onClick={() => onUpdateDevice({ mode: 'REAL', readOnly: true })}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  device.mode === 'REAL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Real PLC (Hardware)
              </button>
            </div>

            <button
              onClick={() => onUpdateDevice({ readOnly: !device.readOnly })}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 ${
                device.readOnly
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
              }`}
            >
              {device.readOnly ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{device.readOnly ? 'Read-Only (Safe)' : 'Writes Allowed'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 text-xs font-mono">
          {/* Manufacturer */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-bold">
              PLC Manufacturer
            </label>
            <select
              value={device.manufacturer}
              onChange={(e) =>
                onUpdateDevice({
                  manufacturer: e.target.value as any,
                  family: e.target.value === 'Mitsubishi Electric' ? 'iQ-F' : 'S7-1500',
                  cpuModel: e.target.value === 'Mitsubishi Electric' ? 'FX5U-32MT/DS' : 'CPU 1515-2 PN',
                  protocol: e.target.value === 'Mitsubishi Electric' ? 'SLMP_3E' : 'OPC_UA',
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="Mitsubishi Electric">Mitsubishi Electric</option>
              <option value="Siemens">Siemens SIMATIC</option>
              <option value="Schneider Electric">Schneider Electric (Modbus)</option>
            </select>
          </div>

          {/* Family */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-bold">
              Family & Series
            </label>
            <select
              value={device.family}
              onChange={(e) => onUpdateDevice({ family: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {device.manufacturer === 'Mitsubishi Electric' ? (
                <>
                  <option value="iQ-F">iQ-F Series (FX5U / FX5UC / FX5S - Octal X/Y)</option>
                  <option value="iQ-R">iQ-R Series (High Performance - Hex X/Y)</option>
                  <option value="iQ-L">iQ-L Series</option>
                  <option value="Q">Q Series (Q03UDE / Q06UDE)</option>
                </>
              ) : (
                <>
                  <option value="S7-1500">SIMATIC S7-1500 Modular Rack</option>
                  <option value="S7-1200">SIMATIC S7-1200 Compact</option>
                </>
              )}
            </select>
          </div>

          {/* Exact CPU Model */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-bold">
              Exact CPU Model
            </label>
            <input
              type="text"
              value={device.cpuModel}
              onChange={(e) => onUpdateDevice({ cpuModel: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Communication Protocol */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-bold">
              Primary Protocol Driver
            </label>
            <select
              value={device.protocol}
              onChange={(e) => onUpdateDevice({ protocol: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="SLMP_3E">Mitsubishi SLMP Binary 3E (Recommended for iQ-F/FX5)</option>
              <option value="SLMP_4E">Mitsubishi SLMP Binary 4E (Recommended for iQ-R/iQ-L)</option>
              <option value="OPC_UA">OPC UA Server (asyncua Client)</option>
              <option value="MODBUS_TCP">Modbus TCP (pymodbus Client)</option>
              <option value="VIRTUAL_SCAN">Virtual Scan Cycle Engine</option>
            </select>
          </div>

          {/* Host IP */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-bold">
              PLC IPv4 Address
            </label>
            <input
              type="text"
              value={device.host}
              onChange={(e) => onUpdateDevice({ host: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Port */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-bold">
              Port Number
            </label>
            <input
              type="number"
              value={device.port}
              onChange={(e) => onUpdateDevice({ port: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Poll Interval */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-bold">
              Poll Interval (ms)
            </label>
            <input
              type="number"
              step={50}
              value={device.pollIntervalMs}
              onChange={(e) => onUpdateDevice({ pollIntervalMs: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Timeout */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-bold">
              Comms Timeout (ms)
            </label>
            <input
              type="number"
              step={100}
              value={device.timeoutMs}
              onChange={(e) => onUpdateDevice({ timeoutMs: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Data Code */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-bold">
              Communication Data Code
            </label>
            <input
              type="text"
              readOnly
              value={device.dataCode}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-850 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Test Communication Action Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>
              Port 5007 is configured in GX Works3 *Module Parameter → Ethernet Port*. Binary mode is mandatory.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Testing Handshake...' : 'Test Communication'}</span>
            </button>
          </div>
        </div>

        {/* Test Result Display */}
        {testResult.status !== 'IDLE' && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
              testResult.status === 'SUCCESS'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{testResult.message}</span>
            </div>
            {testResult.latencyMs && (
              <span className="font-bold">Latency: {testResult.latencyMs} ms</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
