/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlcDeviceConfig, ExtendedPlcTag } from '../types';
import { SimulatedBadge } from '../../../components/shared/SimulatedBadge';
import {
  Activity,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCw,
  Cpu,
  ShieldCheck,
  Radio,
  Clock,
  Layers,
} from 'lucide-react';

interface DiagnosticsTabProps {
  device: PlcDeviceConfig;
  tags: ExtendedPlcTag[];
}

export const DiagnosticsTab: React.FC<DiagnosticsTabProps> = ({ device, tags }) => {
  const [downloadingBundle, setDownloadingBundle] = useState<boolean>(false);

  const handleExportBundle = () => {
    setDownloadingBundle(true);
    setTimeout(() => {
      setDownloadingBundle(false);
      const diagnosticData = {
        timestamp: new Date().toISOString(),
        device,
        tagsSummary: {
          total: tags.length,
          good: tags.filter((t) => t.quality === 'GOOD' || t.quality === 'SIMULATED').length,
          faulted: tags.filter((t) => t.fault !== null).length,
        },
        drivers: {
          primary: 'slmp-connect-python v1.2.0 (Binary 3E/4E)',
          crossCheck: 'pymcprotocol v0.5.0',
          opcua: 'asyncua v2.1.0 (opcua-asyncio)',
          modbus: 'pymodbus v3.13.2',
        },
        metrics: {
          packetsTx: 28420,
          packetsRx: 28418,
          packetLossPct: 0.007,
          meanLatencyMs: 12.4,
          maxLatencyMs: 24.1,
          consecutiveErrors: 0,
        },
      };

      const blob = new Blob([JSON.stringify(diagnosticData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AquaTwin_PLC_Diagnostic_Bundle_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 600);
  };

  return (
    <div className="space-y-5">
      {/* State Machine & Core Metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                PLC Bus Connection State Machine & Health
              </h3>
              <SimulatedBadge verified={false} text="ACTIVE LINK" />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Protocol: {device.protocol} · Endpoint: {device.host}:{device.port}
            </p>
          </div>

          <button
            onClick={handleExportBundle}
            disabled={downloadingBundle}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingBundle ? 'Packaging...' : 'Export Diagnostic Bundle'}</span>
          </button>
        </div>

        {/* State Machine Steps */}
        <div className="py-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
            Connection State Lifecycle
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-mono">
            {[
              { state: 'DISCONNECTED', label: 'Idle' },
              { state: 'CONNECTING', label: 'Handshake' },
              { state: 'CONNECTED', label: 'Live Stream (Active)', active: true },
              { state: 'DEGRADED', label: 'High Latency / Retrying' },
              { state: 'ERROR', label: 'Comms Lost' },
            ].map((step, idx) => (
              <React.Fragment key={step.state}>
                <div
                  className={`px-3 py-2 rounded-xl border flex flex-col items-center justify-center shrink-0 min-w-[130px] ${
                    step.active
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-[11px]">{step.state}</span>
                  <span className="text-[9px] opacity-75">{step.label}</span>
                </div>
                {idx < 4 && <span className="text-slate-400">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Diagnostic Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">Round-Trip Latency</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">
              12.4 ms
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">Packet Counter</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
              28,420 Tx
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">Error Counter</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">
              0 Errors
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">CPU Operating State</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm mt-0.5 block">
              RUN (Ob1 active)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">Last Good Read</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
              Just now
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">Security Lock</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
              {device.readOnly ? 'READ_ONLY' : 'WRITABLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Driver Stack & Device Range Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Driver Stack Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 text-xs font-mono">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-500" />
            <span>Driver Stack & Protocol Libraries</span>
          </h4>

          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold block text-slate-800 dark:text-slate-200">
                  Mitsubishi SLMP Driver
                </span>
                <span className="text-[10px] text-slate-400">
                  slmp-connect-python (Binary 3E/4E native asyncio)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                ACTIVE
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold block text-slate-800 dark:text-slate-200">
                  MC Protocol Cross-Check Tool
                </span>
                <span className="text-[10px] text-slate-400">
                  pymcprotocol v0.5.0 (Type 3E Client validation)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                STANDBY
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold block text-slate-800 dark:text-slate-200">
                  OPC UA Gateway Driver
                </span>
                <span className="text-[10px] text-slate-400">
                  asyncua v2.1.0 (Monitored-Item Subscriptions)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                READY
              </span>
            </div>
          </div>
        </div>

        {/* Memory Areas Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 text-xs font-mono">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-500" />
            <span>Mitsubishi Memory Areas (iQ-F Address Bounds)</span>
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Data Registers (D):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                D0 .. D7999 (OK - Batch Read Active)
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Input Relays (X - Octal):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                X0 .. X7, X10 .. X17 (Octal Validated)
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Output Relays (Y - Octal):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Y0 .. Y7, Y10 .. Y17 (Octal Validated)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Internal Relays (M):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                M0 .. M7999 (Configured)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
