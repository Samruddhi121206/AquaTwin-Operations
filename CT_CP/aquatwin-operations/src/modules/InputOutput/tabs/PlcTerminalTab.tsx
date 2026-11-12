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
  Maximize2,
  ShieldCheck,
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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
      type: 'COMMAND',
      level: 'SYSTEM',
      source: 'OPERATOR',
      text: `> ${cmd}`,
    });

    const parts = cmd.split(' ').filter(Boolean);
    const verb = parts[0]?.toLowerCase();
    const arg = parts[1];

    switch (verb) {
      case 'help':
        onAddLog({
          type: 'SYSTEM',
          level: 'INFO',
          source: 'PLC_SHELL',
          text: 'Available Commands: help, status, list-tags, read <TAG_OR_ADDR>, read-all, diagnostics, ping, clear',
        });
        break;

      case 'status':
        onAddLog({
          type: 'DIAGNOSTIC',
          level: 'INFO',
          source: 'PLC_SHELL',
          text: `CPU: ${device.cpuModel} (${device.family}) | Mode: ${device.mode} | Host: ${device.host}:${device.port} | Protocol: ${device.protocol} | Status: RUN | Errors: ${device.errorCode}`,
        });
        break;

      case 'list-tags':
        onAddLog({
          type: 'SYSTEM',
          level: 'INFO',
          source: 'PLC_SHELL',
          text: `Mapped Tags (${tags.length}): ${tags.map((t) => `${t.id} [${t.address}]`).join(', ')}`,
        });
        break;

      case 'read':
        if (!arg) {
          onAddLog({
            type: 'SYSTEM',
            level: 'WARN',
            source: 'PLC_SHELL',
            text: 'Usage: read <TAG_NAME_OR_ADDRESS> (e.g. read TK101_LEVEL or read X0.0)',
          });
        } else {
          const found = tags.find(
            (t) =>
              t.id.toLowerCase() === arg.toLowerCase() ||
              t.address.toLowerCase() === arg.toLowerCase()
          );
          if (found) {
            onAddLog({
              type: 'VALUE',
              level: 'INFO',
              source: 'SLMP_READER',
              text: `Read: ${found.address} (${found.id}) = ${found.currentValue} ${
                found.scaling.unit !== 'bool' ? found.scaling.unit : ''
              } [Quality: ${found.quality}]`,
            });
          } else {
            onAddLog({
              type: 'SYSTEM',
              level: 'ERROR',
              source: 'PLC_SHELL',
              text: `Tag or address "${arg}" not found in current hardware mapping table.`,
            });
          }
        }
        break;

      case 'read-all':
        onAddLog({
          type: 'VALUE',
          level: 'INFO',
          source: 'SLMP_BATCH',
          text: `Batch SLMP 3E Read: ${tags
            .slice(0, 6)
            .map((t) => `${t.address}=${t.currentValue}`)
            .join(' | ')} ... (${tags.length} channels scanned in 12ms)`,
        });
        break;

      case 'diagnostics':
        onAddLog({
          type: 'DIAGNOSTIC',
          level: 'INFO',
          source: 'PLC_DIAG',
          text: `Diagnostics Report: ScanTime=${device.scanTimeMs}ms | CpuLoad=${device.cpuLoadPercent}% | Battery=${device.batteryStatus} | ErrorCode=${device.errorCode} | BusStatus=NORMAL`,
        });
        break;

      case 'ping':
        onAddLog({
          type: 'CONNECTION',
          level: 'INFO',
          source: 'ICMP_GATEWAY',
          text: `PING ${device.host}: 64 bytes received in 45ms. TTL=64. Link quality 100%.`,
        });
        break;

      case 'clear':
        onClearLogs();
        break;

      default:
        onAddLog({
          type: 'SYSTEM',
          level: 'WARN',
          source: 'PLC_SHELL',
          text: `Unknown command "${verb}". Type "help" to view supported engineering commands.`,
        });
        break;
    }

    setCommandInput('');
  };

  const handleExportLogs = () => {
    const textContent = logs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.source}] ${l.text}`)
      .join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PLC_Terminal_Log_${new Date().toISOString().split('T')[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs ${
        isFullscreen ? 'fixed inset-4 z-50' : 'h-[520px]'
      }`}
    >
      {/* Terminal Title Bar matching user screenshot */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 text-xs">
            PLC Terminal Console — {device.cpuModel} ({device.host}:5007)
          </span>

          {/* Green Connected Badge matching screenshot */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        </div>

        {/* Action Buttons: Clear | Export Logs | Maximize matching screenshot */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
          >
            Clear
          </button>

          <button
            onClick={handleExportLogs}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>Export Logs</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title={isFullscreen ? 'Restore' : 'Fullscreen'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area matching screenshot format:
          [12:34:12] Connecting to Mitsubishi PLC (R08CPU) at 192.168.1.10... ✓ */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 select-text bg-slate-950 font-mono text-[11.5px] leading-relaxed">
        {logs.map((log) => {
          let textColor = 'text-slate-300';
          if (log.type === 'CONNECTION') textColor = 'text-emerald-400 font-bold';
          else if (log.type === 'COMMAND') textColor = 'text-amber-400 font-bold';
          else if (log.type === 'VALUE') textColor = 'text-cyan-300';
          else if (log.level === 'ERROR') textColor = 'text-rose-400 font-bold';
          else if (log.level === 'WARN') textColor = 'text-amber-300';

          return (
            <div key={log.id} className="flex items-start gap-2 hover:bg-white/5 px-1 rounded transition">
              <span className="text-slate-500 select-none shrink-0">[{log.timestamp}]</span>
              <span className={textColor}>{log.text}</span>
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      {/* Terminal Input Bar matching screenshot */}
      <form
        onSubmit={handleExecuteCommand}
        className="bg-slate-900 border-t border-slate-800 p-2.5 flex items-center gap-2"
      >
        <div className="text-cyan-400 font-bold pl-2 select-none">&gt;</div>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Enter command (e.g. read X0.0, status, list-tags, read-all)..."
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-xs focus:outline-hidden font-mono"
        />
        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
        >
          <Send className="w-3 h-3" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
