/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRuntimeMode } from '../../context/RuntimeModeContext';
import { usePlant } from '../../context/PlantContext';
import { ModeBanner } from '../../components/shared/ModeBanner';
import { SimulatedBadge } from '../../components/shared/SimulatedBadge';

import { PlcSetupTab } from './tabs/PlcSetupTab';
import { HardwareIoTab } from './tabs/HardwareIoTab';
import { LiveMonitorTab } from './tabs/LiveMonitorTab';
import { PlcTerminalTab } from './tabs/PlcTerminalTab';
import { DiagnosticsTab } from './tabs/DiagnosticsTab';

import {
  INITIAL_PLC_DEVICE,
  INITIAL_MODULES,
  INITIAL_EXTENDED_TAGS,
  INITIAL_TERMINAL_LOGS,
} from './ioData';
import {
  PlcDeviceConfig,
  PlcHardwareModule,
  ExtendedPlcTag,
  TerminalLogMessage,
} from './types';

import {
  Cpu,
  Layers,
  Activity,
  Terminal as TerminalIcon,
  ShieldCheck,
  Settings,
  AlertTriangle,
} from 'lucide-react';

export const IOView: React.FC = () => {
  const { plcHealth, setMode, toggleReadOnly } = useRuntimeMode();
  const { telemetry } = usePlant();

  const [activeTab, setActiveTab] = useState<
    'setup' | 'hardware' | 'monitor' | 'terminal' | 'diagnostics'
  >('setup');

  const [deviceConfig, setDeviceConfig] = useState<PlcDeviceConfig>(INITIAL_PLC_DEVICE);
  const [hardwareModules, setHardwareModules] = useState<PlcHardwareModule[]>(INITIAL_MODULES);
  const [tags, setTags] = useState<ExtendedPlcTag[]>(INITIAL_EXTENDED_TAGS);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogMessage[]>(INITIAL_TERMINAL_LOGS);

  const handleUpdateDevice = (updated: Partial<PlcDeviceConfig>) => {
    setDeviceConfig((prev) => {
      const next = { ...prev, ...updated };
      if (updated.mode && updated.mode !== plcHealth.mode) {
        setMode(updated.mode);
      }
      return next;
    });
  };

  const handleUpdateTag = (updated: ExtendedPlcTag) => {
    setTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    handleAddLog({
      type: 'SYSTEM',
      level: 'INFO',
      source: 'CONFIG_SERVICE',
      text: `Updated calibration parameters for Tag "${updated.id}" (${updated.scaling.unit})`,
    });
  };

  const handleToggleFault = (tagId: string) => {
    setTags((prev) =>
      prev.map((t) => {
        if (t.id === tagId) {
          const hasFault = t.fault !== null;
          return {
            ...t,
            fault: hasFault ? null : 'WIRE_BREAK',
            quality: hasFault ? 'SIMULATED' : 'BAD',
            rawCounts: hasFault ? 23000 : 0,
            currentValue: hasFault ? (typeof t.currentValue === 'boolean' ? true : 18.0) : (typeof t.currentValue === 'boolean' ? false : 0),
          };
        }
        return t;
      })
    );
    handleAddLog({
      type: 'DIAGNOSTIC',
      level: 'WARN',
      source: 'FAULT_INJECTOR',
      tagId,
      text: `Toggled simulated hardware fault on tag "${tagId}"`,
    });
  };

  const handleToggleForce = (tagId: string) => {
    setTags((prev) =>
      prev.map((t) => (t.id === tagId ? { ...t, forced: !t.forced } : t))
    );
    handleAddLog({
      type: 'SYSTEM',
      level: 'WARN',
      source: 'OVERRIDE_DRIVER',
      tagId,
      text: `Channel manual force flag toggled for tag "${tagId}"`,
    });
  };

  const handleAddLog = (msg: Omit<TerminalLogMessage, 'id' | 'timestamp'>) => {
    const newMsg: TerminalLogMessage = {
      ...msg,
      id: `TL-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString() + '.' + String(Date.now() % 1000).padStart(3, '0'),
    };
    setTerminalLogs((prev) => [...prev.slice(-499), newMsg]);
  };

  const handleClearLogs = () => {
    setTerminalLogs([]);
  };

  return (
    <div className="space-y-4">
      {/* Top Operating Mode & Hardware Banner */}
      <ModeBanner />

      {/* Main Workspace Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Input / Output Module — PLC Engineering & Monitoring Workspace
              </h1>
              <SimulatedBadge verified={false} text="MITSUBISHI SLMP / S7-1500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              5-Area PLC engineering suite: Controller Setup, Hardware Rack & I/O Mapping, Live Monitor, Terminal Console & Diagnostics
            </p>
          </div>
        </div>

        {/* 5 Working Area Navigation Tabs */}
        <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-slate-50 dark:bg-slate-850 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3 py-1.5 font-medium rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'setup'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>1. PLC Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-3 py-1.5 font-medium rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'hardware'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Hardware & I/O</span>
          </button>

          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-3 py-1.5 font-medium rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'monitor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3. Live Monitor</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 font-medium rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>4. PLC Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 font-medium rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'diagnostics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5. Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Working Area Tab Panels */}
      {activeTab === 'setup' && (
        <PlcSetupTab device={deviceConfig} onUpdateDevice={handleUpdateDevice} />
      )}

      {activeTab === 'hardware' && (
        <HardwareIoTab
          modules={hardwareModules}
          tags={tags}
          onUpdateTag={handleUpdateTag}
        />
      )}

      {activeTab === 'monitor' && (
        <LiveMonitorTab
          tags={tags}
          onToggleFault={handleToggleFault}
          onToggleForce={handleToggleForce}
        />
      )}

      {activeTab === 'terminal' && (
        <PlcTerminalTab
          logs={terminalLogs}
          device={deviceConfig}
          tags={tags}
          onClearLogs={handleClearLogs}
          onAddLog={handleAddLog}
        />
      )}

      {activeTab === 'diagnostics' && (
        <DiagnosticsTab device={deviceConfig} tags={tags} />
      )}
    </div>
  );
};
