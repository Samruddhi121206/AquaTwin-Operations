import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useRuntimeMode } from '../../../context/RuntimeModeContext';
import { usePlcGateway } from '../../../services/plcBackendService';
import { useTags } from '../../../context/TagRegistryContext';
import { getModule, loadSavedRack } from './hardware';

/** Compact connection strip shown on every Input/Output tab. Never shows a real link that does not exist. */
export const ConnectionStrip: React.FC<{ protocol: string }> = ({ protocol }) => {
  const { plcHealth, setMode, toggleReadOnly } = useRuntimeMode();
  const { tags, history } = useTags();
  const gw = usePlcGateway().status;
  const sim = plcHealth.mode === 'VIRTUAL';
  const state = sim ? 'SIMULATION' : !gw ? 'DISCONNECTED (gateway unreachable)' : gw.protocolVerified ? 'CONNECTED' : gw.tcpOpen ? 'TCP OPEN (protocol unverified)' : 'DISCONNECTED';
  const live = !sim && gw?.protocolVerified;
  const rack = loadSavedRack();
  const cpu = getModule(rack?.slots[1] ?? null)?.model;
  const lastT = Math.max(0, ...Object.values(history).map((h) => h[h.length - 1]?.t ?? 0));
  const bad = tags.filter((t) => t.fault || t.quality === 'BAD').length;
  const cell = 'flex items-center gap-1 whitespace-nowrap';
  const k = 'text-slate-500 dark:text-slate-400';

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-300 bg-white px-3 py-1 text-[11px] dark:border-slate-600 dark:bg-slate-900">
      <span className={`rounded-sm px-1.5 py-0.5 font-bold ${sim ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-800'}`}>{sim ? 'VIRTUAL PLC' : 'REAL PLC'}</span>
      <span className={`${cell} font-semibold ${sim ? 'text-blue-700' : live ? 'text-emerald-700' : 'text-red-700'}`}>{state}</span>
      <span className={cell}><span className={k}>PLC:</span> Mitsubishi / {cpu ? `${cpu} (unverified)` : 'Not configured'}</span>
      <span className={cell}><span className={k}>Protocol:</span> {sim ? 'VIRTUAL_SCAN' : gw?.protocol ?? `${protocol} (configured)`}</span>
      <span className={cell}><span className={k}>Last read:</span> {sim && lastT ? new Date(lastT).toLocaleTimeString() : gw?.lastCommunicationTime ? new Date(gw.lastCommunicationTime).toLocaleTimeString() : '-'}</span>
      <span className={cell}><span className={k}>Read cycle:</span> {sim ? 'simulated' : gw?.lastRttMs ? `${gw.lastRttMs} ms` : '-'}</span>
      <span className={`${cell} ${bad ? 'text-red-700' : ''}`}><span className={k}>Quality:</span> {sim || lastT ? (bad ? `${bad} bad` : 'good') : 'unknown'}</span>
      <span className="ml-auto flex items-center gap-2">
        <span className={`${cell} rounded-sm border px-1.5 py-0.5 font-semibold ${plcHealth.readOnly ? 'border-slate-300 text-slate-700' : 'border-red-300 bg-red-50 text-red-700'}`}>
          {plcHealth.readOnly ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}{plcHealth.readOnly ? 'READ ONLY' : 'COMMANDS ENABLED'}
        </span>
        <button onClick={() => setMode(sim ? 'REAL' : 'VIRTUAL')} className="rounded-sm border border-slate-300 px-2 py-0.5 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">Switch to {sim ? 'REAL' : 'VIRTUAL'}</button>
        <button onClick={toggleReadOnly} className="rounded-sm border border-slate-300 px-2 py-0.5 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">{plcHealth.readOnly ? 'Enable Writes' : 'Disable Writes'}</button>
      </span>
    </div>
  );
};
