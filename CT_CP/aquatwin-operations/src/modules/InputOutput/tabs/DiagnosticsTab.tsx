import React, { useState } from 'react';
import { PlcDeviceConfig, ExtendedPlcTag } from '../types';
import { plcBackend, usePlcGateway } from '../../../services/plcBackendService';
import { useRuntimeMode } from '../../../context/RuntimeModeContext';

interface Props { device?: PlcDeviceConfig; tags: ExtendedPlcTag[] }

const KEY = 'aquatwin.plcprofile.v1';
const FAMILIES = ['iQ-R', 'iQ-F', 'Q', 'L', 'FX5'];
const loadProfile = () => {
  try { return { host: '', port: '', family: 'iQ-R', cpuModel: '', ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; }
  catch { return { host: '', port: '', family: 'iQ-R', cpuModel: '' }; }
};

export const DiagnosticsTab: React.FC<Props> = ({ tags }) => {
  const gw = usePlcGateway();
  const { plcHealth, setMode } = useRuntimeMode();
  const [p, setP] = useState(loadProfile);
  const [testAddr, setTestAddr] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const s = gw.status;
  const sim = plcHealth.mode === 'VIRTUAL';

  const set = (k: string, v: string) => { const n = { ...p, [k]: v }; setP(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* ignore */ } };
  const act = async (label: string, fn: () => Promise<{ success: boolean; message?: string; [k: string]: any }>, fmt?: (r: any) => string) => {
    setBusy(true);
    const r = await fn();
    setResult({ ok: r.success, text: `${label}: ${fmt ? fmt(r) : r.message ?? (r.success ? 'OK' : 'failed')}` });
    setBusy(false);
    return r;
  };
  const valid = p.host.trim() !== '' && Number.isInteger(+p.port) && +p.port > 0 && +p.port < 65536;
  const input = 'w-full rounded-sm border border-slate-300 bg-white px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-800';
  const btn = 'rounded-sm border border-slate-300 px-3 py-1 text-xs enabled:hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:enabled:hover:bg-slate-800';
  const Stat: React.FC<{ k: string; v: React.ReactNode }> = ({ k, v }) => (
    <div className="flex justify-between border-b border-slate-200 py-1 text-xs dark:border-slate-700"><span className="text-slate-500">{k}</span><span className="font-mono font-medium">{v}</span></div>
  );

  const state = !gw.reachable ? 'GATEWAY UNREACHABLE' : sim ? 'SIMULATION' : s?.protocolVerified ? 'CONNECTED (protocol verified)' : s?.tcpOpen ? 'TCP OPEN - protocol NOT verified' : 'DISCONNECTED';

  return (
    <div className="grid gap-2 lg:grid-cols-2">
      <section className="border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-2 text-sm font-bold">Connection Profile (Mitsubishi SLMP, read-only)</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label>PLC IP address<input className={input} value={p.host} onChange={(e) => set('host', e.target.value)} placeholder="not configured" /></label>
          <label>Port<input className={input} value={p.port} onChange={(e) => set('port', e.target.value)} placeholder="not configured" inputMode="numeric" /></label>
          <label>Family<select className={input} value={p.family} onChange={(e) => set('family', e.target.value)}>{FAMILIES.map((f) => <option key={f}>{f}</option>)}</select></label>
          <label>CPU model<input className={input} value={p.cpuModel} onChange={(e) => set('cpuModel', e.target.value)} placeholder="from CPU label" /></label>
        </div>
        <p className="mt-1 text-[10px] text-slate-500">No defaults are assumed. Enter values from the confirmed hardware and PLC Ethernet settings. SLMP needs no credentials; none are stored.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className={btn} disabled={busy || !valid} onClick={() => act('Test Network', () => plcBackend.networkTest(p.host, +p.port), (r) => r.message)} title="TCP reachability only">Test Network</button>
          <button className={btn} disabled={busy || !valid} onClick={async () => { const r = await act('Connect', () => plcBackend.connectReal({ host: p.host, port: +p.port, family: p.family, cpuModel: p.cpuModel }), (r) => (r.success ? 'TCP open. Protocol not verified until a Read Test succeeds.' : r.message ?? 'TCP connection failed')); if (r.success) setMode('REAL'); }}>Connect</button>
          <button className={btn} disabled={busy || sim} onClick={() => act('Disconnect', () => plcBackend.disconnect())}>Disconnect</button>
          <button className={btn} disabled={busy || sim} onClick={async () => { const r = await act('Reconnect', () => plcBackend.connectReal({ host: p.host, port: +p.port, family: p.family, cpuModel: p.cpuModel })); void r; }}>Reconnect</button>
          <button className={btn} disabled={busy || sim} onClick={async () => { await act('Virtual PLC', () => plcBackend.useVirtual()); setMode('VIRTUAL'); }}>Use Virtual PLC</button>
        </div>
        <div className="mt-3 flex items-end gap-2 text-xs">
          <label className="flex-1">Read Test device (known, read-only)<input className={input} value={testAddr} onChange={(e) => setTestAddr(e.target.value)} placeholder="e.g. D100 (from approved I/O list)" /></label>
          <button className={btn} disabled={busy || sim || !testAddr.trim()} onClick={() => act('Read Test', () => plcBackend.readTest(testAddr), (r) => (r.success ? `${testAddr} = ${String(r.reading.value)} in ${r.durationMs} ms. Compare with GX Works3.` : r.message ?? `read failed (${r.status?.lastErrorCode})`))}>Read Test</button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <button className={btn} disabled={busy || sim || !s?.protocolVerified} title="Sends the mapped addresses to the gateway as the poll list" onClick={() => act('Poll list', () => plcBackend.setPollList(tags.map((t) => ({ tagId: t.id, address: t.address }))), (r) => (r.success ? `${r.count} mapped device(s) will be polled. Mapping is unverified sample data unless you edited it.` : r.message ?? 'rejected'))}>Apply mapping as poll list</button>
          <span className="text-slate-500">Enabled only after a verified Read Test.</span>
        </div>
        {result && <div role="status" className={`mt-3 border px-2 py-1 text-xs ${result.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{result.text}</div>}
      </section>

      <section className="border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-2 text-sm font-bold">Diagnostics</h3>
        <Stat k="State" v={<b className={state.startsWith('CONNECTED') || state === 'SIMULATION' ? 'text-emerald-700' : 'text-red-700'}>{state}</b>} />
        <Stat k="Endpoint" v={sim ? 'n/a (simulation)' : s ? `${s.host || '-'}:${s.port || '-'}` : '-'} />
        <Stat k="Protocol" v={s?.protocol ?? '-'} />
        <Stat k="Last successful read" v={s?.lastCommunicationTime ? new Date(s.lastCommunicationTime).toLocaleTimeString() : '-'} />
        <Stat k="Round-trip time" v={sim ? 'simulated' : s?.lastRttMs !== undefined ? `${s.lastRttMs} ms` : '-'} />
        <Stat k="Reads OK / failed" v={sim ? '-' : `${s?.readsOk ?? 0} / ${s?.readsFailed ?? 0}`} />
        <Stat k="Timeouts" v={sim ? '-' : s?.timeouts ?? 0} />
        <Stat k="Reconnects" v={sim ? '-' : s?.reconnects ?? 0} />
        <Stat k="Last error code" v={sim ? '-' : s?.lastErrorCode ?? '-'} />
        <Stat k="CPU RUN/STOP" v="Not read (unknown)" />
        <Stat k="Polled devices" v={s?.gatewayTagCount ?? '-'} />
        <Stat k="Data freshness" v={gw.lastPacketAt ? `${Math.round((Date.now() - gw.lastPacketAt) / 1000)} s ago` : 'no data'} />
        <p className="mt-2 text-[10px] text-slate-500">A TCP connection is not a verified PLC session: the state becomes CONNECTED only after a valid protocol read. CPU mode is not read, so it is never shown as RUN.</p>
      </section>
    </div>
  );
};
