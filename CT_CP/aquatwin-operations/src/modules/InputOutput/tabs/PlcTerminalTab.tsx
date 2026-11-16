import React, { useMemo, useRef, useState } from 'react';
import { Copy, Download, Pause, Play, Trash2 } from 'lucide-react';
import { TerminalLogMessage, ExtendedPlcTag, PlcDeviceConfig } from '../types';
import { useTags } from '../../../context/TagRegistryContext';
import { usePlcGateway } from '../../../services/plcBackendService';

interface Props {
  logs: TerminalLogMessage[];
  device?: PlcDeviceConfig;
  tags: ExtendedPlcTag[];
  onClearLogs: () => void;
  onAddLog: (m: Omit<TerminalLogMessage, 'id' | 'timestamp'>) => void;
}

interface Line { t: number; kind: string; level: string; text: string; src: 'GATEWAY' | 'UI' }
const FILTERS = ['ALL', 'INFO', 'WARN', 'ERROR', 'READ', 'WRITE', 'CONNECT'] as const;
const stamp = (t: number) => { const d = new Date(t); return `${d.toLocaleTimeString([], { hour12: false })}.${String(d.getMilliseconds()).padStart(3, '0')}`; };

export const PlcTerminalTab: React.FC<Props> = ({ logs, tags, onClearLogs, onAddLog }) => {
  const gw = usePlcGateway();
  const { history, source } = useTags();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');
  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState<Line[] | null>(null);
  const [cleared, setCleared] = useState(0); // clears the visible buffer only; the gateway keeps its own history
  const [cmd, setCmd] = useState('');
  const [local, setLocal] = useState<Line[]>([]);
  const box = useRef<HTMLDivElement>(null);

  const lines = useMemo<Line[]>(() => {
    const g = gw.events.map((e) => ({ t: Date.parse(e.ts), kind: e.kind, level: e.level, text: e.text, src: 'GATEWAY' as const }));
    const u = logs.map((l: any) => ({ t: l.epoch ?? 0, kind: l.type === 'OUTPUT' ? 'WRITE' : l.type, level: l.level === 'SYSTEM' ? 'INFO' : l.level, text: l.text, src: 'UI' as const })).filter((l) => l.t);
    return [...g, ...u, ...local].filter((l) => l.t > cleared).sort((a, b) => a.t - b.t);
  }, [gw.events, logs, local, cleared]);

  const shown = (paused ? frozen ?? lines : lines).filter((l) => filter === 'ALL' || l.level === filter || l.kind === filter);
  const toggle = () => { setFrozen(paused ? null : lines); setPaused(!paused); };
  const text = () => shown.map((l) => `[${stamp(l.t)}] ${l.kind.padEnd(8)} ${l.src === 'UI' ? '(ui) ' : ''}${l.text}`).join('\n');

  const run = (raw: string) => {
    const [c, arg] = raw.trim().split(/\s+/);
    const out = (t: string, level = 'INFO') => setLocal((p) => [...p, { t: Date.now(), kind: 'COMMAND', level, text: t, src: 'UI' }]);
    out(`> ${raw}`);
    const tag = tags.find((x) => x.id.toLowerCase() === (arg ?? '').toLowerCase());
    if (c === 'help') out('Commands: help | status | read <tag> | history <tag>. Writes are not available in the terminal.');
    else if (c === 'status') out(`mode=${source} gateway=${gw.reachable ? 'reachable' : 'UNREACHABLE'} ${gw.status ? `protocolVerified=${!!gw.status.protocolVerified} tcpOpen=${!!gw.status.tcpOpen}` : ''} tags=${tags.length}`);
    else if (c === 'read' && tag) out(`${tag.id} = ${String(tag.currentValue)} ${tag.scaling.unit} quality=${tag.quality} source=${source} at ${tag.lastUpdate}`);
    else if (c === 'history' && tag) { const h = history[tag.id] ?? []; out(h.length ? `${tag.id}: ${h.length} samples, last 5: ${h.slice(-5).map((s) => s.v).join(', ')}` : `${tag.id}: no numeric history`); }
    else if (c === 'read' || c === 'history') out(`Unknown tag "${arg ?? ''}"`, 'WARN');
    else out(`Unknown or restricted command "${c}". Type help.`, 'WARN');
    onAddLog({ type: 'COMMAND', level: 'INFO', source: 'TERMINAL', text: `terminal: ${raw}` });
  };

  const btn = 'flex items-center gap-1 rounded-sm border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800';
  const color = (l: Line) => (l.level === 'ERROR' ? 'text-red-400' : l.level === 'WARN' ? 'text-amber-300' : l.kind === 'VALUE' ? 'text-emerald-300' : l.kind === 'COMMAND' ? 'text-cyan-300' : 'text-slate-200');

  return (
    <div className="border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-300 p-2 dark:border-slate-700">
        {FILTERS.map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded-sm border px-2 py-1 text-xs ${filter === f ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>{f}</button>)}
        <button className={`${btn} ml-auto`} onClick={toggle}>{paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}{paused ? 'Resume' : 'Pause'}</button>
        <button className={btn} onClick={() => { setCleared(Date.now()); setFrozen(null); onClearLogs(); }} title="Clears the visible buffer only"><Trash2 className="h-3 w-3" />Clear</button>
        <button className={btn} onClick={() => navigator.clipboard?.writeText(text())}><Copy className="h-3 w-3" />Copy</button>
        <button className={btn} onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text()], { type: 'text/plain' })); a.download = 'plc-terminal.log'; a.click(); URL.revokeObjectURL(a.href); }}><Download className="h-3 w-3" />Export</button>
      </div>
      {!gw.reachable && <div className="border-b border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-900">Backend gateway not reachable (ws://localhost:5001). Only local UI events are shown. Start it with <code>npm run server</code>.</div>}
      <div ref={box} className="h-[420px] overflow-auto bg-slate-950 p-2 font-mono text-[11px] leading-5">
        {shown.length === 0 && <div className="text-slate-500">No events yet.</div>}
        {shown.map((l, i) => (
          <div key={i} className={color(l)}>
            <span className="text-slate-500">[{stamp(l.t)}]</span> <span className="inline-block w-16">{l.kind}</span>{l.src === 'UI' && <span className="text-slate-500">(ui) </span>}{l.text}
          </div>
        ))}
      </div>
      <form className="flex border-t border-slate-300 dark:border-slate-700" onSubmit={(e) => { e.preventDefault(); if (cmd.trim()) run(cmd); setCmd(''); }}>
        <span className="px-2 py-1.5 font-mono text-xs text-slate-500">&gt;</span>
        <input value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="help | status | read <tag> | history <tag>" aria-label="Terminal command" className="flex-1 bg-transparent py-1.5 font-mono text-xs outline-none" />
      </form>
    </div>
  );
};
