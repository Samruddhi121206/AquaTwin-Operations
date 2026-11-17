/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRuntimeMode } from '../../context/RuntimeModeContext';
import { usePlcGateway } from '../../services/plcBackendService';
import { Cpu, ShieldAlert, CheckCircle, Wifi, Lock, Unlock } from 'lucide-react';

export const ModeBanner: React.FC = () => {
  const { plcHealth, setMode, toggleReadOnly } = useRuntimeMode();
  const gateway = usePlcGateway();

  const isVirtual = plcHealth.mode === 'VIRTUAL';
  const isReadOnly = plcHealth.readOnly;

  // A real link counts only once the backend reports a protocol-verified session.
  const realVerified =
    gateway.status?.mode === 'REAL' &&
    gateway.status?.connected === true &&
    gateway.status?.protocolVerified === true;
  const realUnverified = !isVirtual && !realVerified;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
        isVirtual || realUnverified
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-bold tracking-wide">
          <Cpu className="w-3.5 h-3.5" />
          <span>
            {isVirtual
              ? 'VIRTUAL PLC · SIMULATION'
              : realUnverified
                ? 'Real PLC: not connected'
                : 'REAL PLC · HARDWARE'}
          </span>
        </div>
        <span className="opacity-50">•</span>
        <span className="text-[11px] font-sans opacity-85">
          {plcHealth.protocol} ({plcHealth.ipAddress})
        </span>
        {!realUnverified && (
          <>
            <span className="opacity-50">•</span>
            <div className="flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Scan: {plcHealth.latencyMs}ms</span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
            isReadOnly
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
          }`}
        >
          {isReadOnly ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          <span>{isReadOnly ? 'READ-ONLY (SAFE)' : 'WRITABLE (FAT/SAT)'}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode(isVirtual ? 'REAL' : 'VIRTUAL')}
            className="px-2 py-0.5 text-[11px] font-medium rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle between Virtual simulation and Real PLC communication adapter"
          >
            Switch to {isVirtual ? 'REAL' : 'VIRTUAL'}
          </button>
          <button
            onClick={toggleReadOnly}
            disabled={!isVirtual}
            className="px-2 py-0.5 text-[11px] font-medium rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-900"
            title={
              isVirtual
                ? 'Toggle Read-Only or Control command allowance'
                : 'Writes are disabled in REAL mode'
            }
          >
            {isReadOnly ? 'Enable Writes' : 'Lock Read-Only'}
          </button>
        </div>
      </div>
    </div>
  );
};

