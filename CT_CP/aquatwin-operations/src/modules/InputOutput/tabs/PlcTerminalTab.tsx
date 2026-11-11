/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { TerminalLogMessage, ExtendedPlcTag, PlcDeviceConfig } from '../types';
import {
  Terminal as TerminalIcon,
  Play,
  Pause,
  Download,
  Trash2,
  Send,
  HelpCircle,
  Filter,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface PlcTerminalTabProps {
  logs: TerminalLogMessage[];
  device: PlcDeviceConfig;
  tags: ExtendedPlcTag[];
  onClearLogs: () => void;
  onAddLog: (msg: Omit<TerminalLogMessage, 'id' | 'timestamp'>) => void;
}

export const PlcTerminalTab: React.FC<PlcTerminalTabProps> = ({
  logs,
  device,
  tags,
  onClearLogs,
  onAddLog,
}) => {
  const [commandInput, setCommandInput] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && !isPaused) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isPaused]);

  // Safe Command Grammar Parser
  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    // Log the user's input command
    onAddLog({
      type: 'SYSTEM',
      level: 'INFO',
      source: 'OPERATOR_CONSOLE',
      text: `> ${cmd}`,
    });

    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const arg1 = parts[1];

    if (mainCmd === 'help') {
      onAddLog({
        type: 'SYSTEM',
        level: 'INFO',
        source: 'TERMINAL_HELP',
        text: 'Supported Read-Only Commands: help | status | list-tags [DI|AI|DO|AO] | read <TAG> | read-all | diagnostics | clear',
      });
    } else if (mainCmd === 'status') {
      onAddLog({
        type: 'DIAGNOSTIC',
        level: 'INFO',
        source: 'STATUS_QUERY',
        text: `PLC Status: ${device.cpuModel} (${device.mode}) | Protocol: ${device.protocol} (${device.host}:${device.port}) | Mode: ${device.readOnly ? 'READ_ONLY (Safe)' : 'WRITABLE'} | Poll: ${device.pollIntervalMs}ms`,
      });
    } else if (mainCmd === 'list-tags') {
      const typeFilter = arg1 ? arg1.toUpperCase() : null;
      const targetTags = typeFilter ? tags.filter((t) => t.type === typeFilter) : tags;
      onAddLog({
        type: 'SYSTEM',
        level: 'INFO',
        source: 'TAG_REGISTRY',
        text: `Active Tags (${targetTags.length}): ${targetTags.map((t) => `${t.id} [${t.address}]`).join(', ')}`,
      });
    } else if (mainCmd === 'read') {
      if (!arg1) {
        onAddLog({
          type: 'SYSTEM',
          level: 'WARN',
          source: 'TERMINAL_ERROR',
          text: 'Usage: read <TAG_ID> (e.g. read TK101_LEVEL)',
        });
      } else {
        const found = tags.find((t) => t.id.toLowerCase() === arg1.toLowerCase());
        if (found) {
          onAddLog({
            type: 'VALUE',
            level: 'INFO',
            source: 'TAG_POLL',
            tagId: found.id,
            text: `[${found.id}] Address: ${found.address} | Value: ${found.currentValue} ${found.scaling.unit || ''} | Raw: ${found.rawCounts || 'N/A'} counts | Quality: ${found.quality}`,
          });
        } else {
          onAddLog({
            type: 'SYSTEM',
            level: 'WARN',
            source: 'TERMINAL_ERROR',
            text: `Tag "${arg1}" not found in current hardware configuration.`,
          });
        }
      }
    } else if (mainCmd === 'read-all') {
      onAddLog({
        type: 'VALUE',
        level: 'INFO',
        source: 'SNAPSHOT',
        text: `SNAPSHOT DUMP (${tags.length} tags): ${tags.map((t) => `${t.id}=${t.currentValue}`).join(' | ')}`,
      });
    } else if (mainCmd === 'diagnostics') {
      onAddLog({
        type: 'DIAGNOSTIC',
        level: 'INFO',
        source: 'BUS_DIAGNOSTICS',
        text: `Packets: 28,420 Tx / 28,418 Rx | Latency: 12ms | Reconnects: 0 | Frame: SLMP 3E Binary | Memory Area: D, X, Y OK`,
      });
    } else if (mainCmd === 'clear') {
      onClearLogs();
    } else {
      onAddLog({
        type: 'SYSTEM',
        level: 'WARN',
        source: 'TERMINAL_ERROR',
        text: `Unrecognized command "${cmd}". Type "help" for allowed read-only commands.`,
      });
    }

    setCommandInput('');
  };

  // Export Log File
  const handleExportLogs = (format: 'txt' | 'json') => {
    let content = '';
    let mime = 'text/plain';
    if (format === 'json') {
      content = JSON.stringify(logs, null, 2);
      mime = 'application/json';
    } else {
      content = logs.map((l) => `[${l.timestamp}] [${l.level}] [${l.source}]: ${l.text}`).join('\n');
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AquaTwin_PLC_Terminal_Log_${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter((l) => {
    if (selectedLevel === 'ALL') return true;
    return l.level === selectedLevel;
  });

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px] text-xs font-mono">
      {/* Terminal Title & Status Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white tracking-wide">
            AquaTwin Industrial PLC Terminal
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">
            {device.cpuModel} ({device.protocol} @ {device.host}:{device.port})
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO Only</option>
            <option value="WARN">WARN Only</option>
            <option value="ERROR">ERROR Only</option>
          </select>

          {/* Pause / Resume Stream */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-2 py-1 rounded border text-[11px] flex items-center gap-1 transition ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'Resume Stream' : 'Pause'}</span>
          </button>

          {/* Auto Scroll */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded border text-[11px] transition ${
              autoScroll
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            AutoScroll: {autoScroll ? 'ON' : 'OFF'}
          </button>

          {/* Export */}
          <button
            onClick={() => handleExportLogs('txt')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1 text-[11px]"
            title="Download terminal ring buffer as text file"
          >
            <Download className="w-3 h-3" />
            <span>Export TXT</span>
          </button>

          {/* Clear */}
          <button
            onClick={onClearLogs}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white"
            title="Clear current terminal view"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Log Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 selection:bg-cyan-500/30">
        {filteredLogs.map((log) => {
          const levelColor =
            log.level === 'ERROR'
              ? 'text-rose-400 font-bold'
              : log.level === 'WARN'
              ? 'text-amber-400'
              : log.type === 'CONNECTION'
              ? 'text-cyan-400'
              : log.type === 'VALUE'
              ? 'text-emerald-400'
              : 'text-slate-300';

          return (
            <div key={log.id} className="leading-relaxed flex items-start gap-2">
              <span className="text-slate-500 select-none shrink-0">[{log.timestamp}]</span>
              <span className="text-slate-400 select-none shrink-0 font-bold">
                [{log.source}]
              </span>
              <span className={levelColor}>{log.text}</span>
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      {/* Interactive Command Input Prompt */}
      <form
        onSubmit={handleExecuteCommand}
        className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <span className="text-cyan-400 font-bold select-none text-sm">$</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Type command ('help', 'status', 'list-tags', 'read <TAG>', 'read-all')..."
          className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-hidden text-xs font-mono"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center gap-1 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

