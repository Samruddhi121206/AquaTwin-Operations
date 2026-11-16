/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRuntimeMode } from '../../context/RuntimeModeContext';
import { usePlant } from '../../context/PlantContext';
import { ModeBanner } from '../../components/shared/ModeBanner';
import { SimulatedBadge } from '../../components/shared/SimulatedBadge';
import { useTags } from '../../context/TagRegistryContext';

import { PlcOverviewTab } from './tabs/PlcOverviewTab';
import { HardwareConfigurationView } from './hardware/HardwareConfigurationView';
import { LadderLogicTab } from './tabs/LadderLogicTab';
import { LiveMonitorTab } from './tabs/LiveMonitorTab';
import { PlcTerminalTab } from './tabs/PlcTerminalTab';
import { DiagnosticsTab } from './tabs/DiagnosticsTab';

import {
  INITIAL_PLC_DEVICE,
  INITIAL_MODULES,
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
  FileCode,
  Sliders,
  CheckCircle2,
  User,
  Radio,
} from 'lucide-react';

export const IOView: React.FC = () => {
  const { plcHealth, setMode, toggleReadOnly } = useRuntimeMode();
  const { telemetry, togglePump, setXv101Opening } = usePlant();

  // 6 Screens matching user's exact specification
  const [activeTab, setActiveTab] = useState<
    'overview' | 'hardware' | 'ladder' | 'monitor' | 'terminal' | 'diagnostics'
  >('overview');

  const [deviceConfig, setDeviceConfig] = useState<PlcDeviceConfig>(INITIAL_PLC_DEVICE);
  const [hardwareModules, setHardwareModules] = useState<PlcHardwareModule[]>(INITIAL_MODULES);
  const { tags, setTags } = useTags();
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
            quality: hasFault ? 'GOOD' : 'BAD',
            rawCounts: hasFault ? 20864 : 0,
            currentValue: hasFault ? (typeof t.currentValue === 'boolean' ? true : 65.2) : (typeof t.currentValue === 'boolean' ? false : 0),
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
      prev.map((t) => {
        if (t.id === tagId) {
          return { ...t, forced: !t.forced };
        }
        return t;
      })
    );
    handleAddLog({
      type: 'OUTPUT',
      level: 'WARN',
      source: 'FORCE_TABLE',
      tagId,
      text: `Toggled manual force state on tag "${tagId}"`,
    });
  };

  const handleAddLog = (msg: Omit<TerminalLogMessage, 'id' | 'timestamp'>) => {
    const newLog: TerminalLogMessage = {
      ...msg,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTerminalLogs((prev) => [...prev.slice(-250), newLog]);
  };

  const handleClearLogs = () => {
    setTerminalLogs([]);
  };

  // Label map for header breadcrumbs matching screenshot
  const tabTitleMap: Record<typeof activeTab, string> = {
    overview: 'PLC Overview',
    hardware: 'Hardware Configuration',
    ladder: 'Ladder Logic View',
    monitor: 'I/O Monitoring',
    terminal: 'PLC Terminal',
    diagnostics: 'Connection & Diagnostics',
  };

  const TABS: { key: typeof activeTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'PLC Overview', icon: Cpu },
    { key: 'hardware', label: 'Hardware Configuration', icon: Layers },
    { key: 'ladder', label: 'Ladder Logic View', icon: FileCode },
    { key: 'monitor', label: 'I/O Monitoring', icon: Activity },
    { key: 'terminal', label: 'PLC Terminal', icon: TerminalIcon },
    { key: 'diagnostics', label: 'Connection & Diagnostics', icon: ShieldCheck },
  ];
  const simulation = plcHealth.mode === 'VIRTUAL';

  return (
    <div className="space-y-0 border border-slate-400 bg-slate-100 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
      {/* GX Works3-style title bar */}
      <div className="flex flex-wrap items-center gap-3 bg-gradient-to-b from-[#1b4f9c] to-[#0f3a7a] px-3 py-1.5 text-xs text-white">
        <span className="font-bold">AquaTwin Engineering</span>
        <span className="opacity-60">|</span>
        <span>Input / Output - {tabTitleMap[activeTab]}</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-sm bg-white/15 px-2 py-0.5 font-semibold">
          <Radio className="h-3 w-3" />{simulation ? 'Virtual PLC (SIMULATION)' : 'Real PLC (read-only)'}
        </span>
      </div>

      <ModeBanner />

      {/* Document tabs */}
      <div className="flex overflow-x-auto border-b border-slate-400 bg-slate-200 px-1 pt-1 dark:border-slate-600 dark:bg-slate-800">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 whitespace-nowrap border border-b-0 px-3 py-1.5 text-xs ${
              activeTab === key
                ? 'border-slate-400 bg-white font-semibold text-[#0f3a7a] dark:border-slate-600 dark:bg-slate-900 dark:text-blue-300'
                : 'border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2 p-2">
      {/* Screen 1: PLC Overview */}
      {activeTab === 'overview' && (
        <PlcOverviewTab
          device={deviceConfig}
          modules={hardwareModules}
          tags={tags}
          onUpdateDevice={handleUpdateDevice}
          onNavigateTab={(tabKey) => setActiveTab(tabKey as any)}
        />
      )}

      {/* Screen 2: Hardware Configuration */}
      {activeTab === 'hardware' && (
        <HardwareConfigurationView device={deviceConfig} />
      )}

      {/* Screen 3: Ladder Logic View */}
      {activeTab === 'ladder' && (
        <LadderLogicTab tags={tags} />
      )}

      {/* Screen 4: I/O Monitoring */}
      {activeTab === 'monitor' && (
        <LiveMonitorTab
          tags={tags}
          onToggleFault={handleToggleFault}
          onToggleForce={handleToggleForce}
        />
      )}

      {/* Screen 5: PLC Terminal */}
      {activeTab === 'terminal' && (
        <PlcTerminalTab
          logs={terminalLogs}
          device={deviceConfig}
          tags={tags}
          onClearLogs={handleClearLogs}
          onAddLog={handleAddLog}
        />
      )}

      {/* Screen 6: Connection & Diagnostics */}
      {activeTab === 'diagnostics' && (
        <DiagnosticsTab device={deviceConfig} tags={tags} />
      )}
      </div>
    </div>
  );
};
