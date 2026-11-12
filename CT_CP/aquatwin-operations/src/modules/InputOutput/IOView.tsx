/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRuntimeMode } from '../../context/RuntimeModeContext';
import { usePlant } from '../../context/PlantContext';
import { ModeBanner } from '../../components/shared/ModeBanner';
import { SimulatedBadge } from '../../components/shared/SimulatedBadge';
import { plcBackend } from '../../services/plcBackendService';

import { PlcOverviewTab } from './tabs/PlcOverviewTab';
import { HardwareConfigTab } from './tabs/HardwareConfigTab';
import { LadderLogicTab } from './tabs/LadderLogicTab';
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
  const [tags, setTags] = useState<ExtendedPlcTag[]>(INITIAL_EXTENDED_TAGS);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogMessage[]>(INITIAL_TERMINAL_LOGS);

  // Synchronize unified plant telemetry into PLC tags
  useEffect(() => {
    setTags((prev) =>
      prev.map((tag) => {
        if (tag.id === 'TK101_LEVEL') {
          const lvl = telemetry.tk101?.currentLevelPercent ?? 65.2;
          return {
            ...tag,
            currentValue: Number(lvl.toFixed(1)),
            rawCounts: Math.round((lvl / 100) * 32000),
            lastUpdate: new Date().toLocaleTimeString(),
          };
        }
        if (tag.id === 'FT101_FLOW') {
          const flow = telemetry.p101_flowM3h ?? 12.5;
          return {
            ...tag,
            currentValue: Number(flow.toFixed(1)),
            rawCounts: Math.round((flow / 25) * 32000),
            lastUpdate: new Date().toLocaleTimeString(),
          };
        }
        if (tag.id === 'PT101_PRESSURE') {
          const press = telemetry.p101_pressureBar ?? 3.2;
          return {
            ...tag,
            currentValue: Number(press.toFixed(2)),
            rawCounts: Math.round((press / 6) * 32000),
            lastUpdate: new Date().toLocaleTimeString(),
          };
        }
        if (tag.id === 'RO_FEED_PRESS') {
          const roPress = telemetry.p202_pressureBar ?? 15.4;
          return {
            ...tag,
            currentValue: Number(roPress.toFixed(1)),
            rawCounts: Math.round((roPress / 25) * 32000),
            lastUpdate: new Date().toLocaleTimeString(),
          };
        }
        if (tag.id === 'P101_RUN_FB' || tag.id === 'P101_RUN_CMD') {
          return {
            ...tag,
            currentValue: telemetry.p101_running,
            lastUpdate: new Date().toLocaleTimeString(),
          };
        }
        if (tag.id === 'P201_RUN_FB' || tag.id === 'P201_RUN_CMD') {
          return {
            ...tag,
            currentValue: telemetry.p201_running,
            lastUpdate: new Date().toLocaleTimeString(),
          };
        }
        if (tag.id === 'XV101_OPEN_FB' || tag.id === 'XV101_OPEN_CMD') {
          const isOpen = (telemetry.xv101_openingPercent ?? 100) > 10;
          return {
            ...tag,
            currentValue: isOpen,
            lastUpdate: new Date().toLocaleTimeString(),
          };
        }
        return tag;
      })
    );
  }, [telemetry]);

  // Connect to backend WebSocket gateway for real/virtual PLC telemetry
  useEffect(() => {
    plcBackend.connect();
    const unsubscribe = plcBackend.subscribe((packet) => {
      if (packet.readings && packet.readings.length > 0) {
        setTags((prev) =>
          prev.map((tag) => {
            const match = packet.readings.find(
              (r) => r.tagId === tag.id || r.address === tag.address
            );
            if (match) {
              return {
                ...tag,
                currentValue: match.value,
                rawCounts: match.rawCounts ?? tag.rawCounts,
                quality: match.quality as any,
                lastUpdate: match.timestamp,
              };
            }
            return tag;
          })
        );
      }
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <div className="space-y-4">
      {/* Top Application Breadcrumb & Plant Status Bar matching screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 shadow-xs">
        {/* Left: Input / Output > Subscreen Title */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-slate-500">Input / Output</span>
          <span className="text-slate-400 font-mono">&gt;</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
            {tabTitleMap[activeTab]}
          </span>
        </div>

        {/* Right Status: Plant Online & Operator */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-bold text-slate-800 dark:text-slate-200">Plant Online</span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium">Operator</span>
          </div>
        </div>
      </div>

      {/* Safety Mode Banner */}
      <ModeBanner />

      {/* 6 Workspace Navigation Tabs matching user reference */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max text-xs font-mono">
          {/* Tab 1: PLC Overview */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 font-medium rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>1. PLC Overview</span>
          </button>

          {/* Tab 2: Hardware Configuration */}
          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-3.5 py-2 font-medium rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'hardware'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Hardware Configuration</span>
          </button>

          {/* Tab 3: Ladder Logic View */}
          <button
            onClick={() => setActiveTab('ladder')}
            className={`px-3.5 py-2 font-medium rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ladder'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>3. Ladder Logic View</span>
          </button>

          {/* Tab 4: I/O Monitoring */}
          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-3.5 py-2 font-medium rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'monitor'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>4. I/O Monitoring</span>
          </button>

          {/* Tab 5: PLC Terminal */}
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3.5 py-2 font-medium rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>5. PLC Terminal</span>
          </button>

          {/* Tab 6: Connection & Diagnostics */}
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3.5 py-2 font-medium rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'diagnostics'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>6. Connection & Diagnostics</span>
          </button>
        </div>
      </div>

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
        <HardwareConfigTab
          modules={hardwareModules}
          tags={tags}
          onUpdateModules={setHardwareModules}
          onUpdateTag={handleUpdateTag}
        />
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
  );
};
