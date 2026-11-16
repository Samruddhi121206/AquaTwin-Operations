import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleHelp, Download, Info, Maximize2, Save, ScanSearch, ShieldCheck, Upload, XCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { useRuntimeMode } from '../../../context/RuntimeModeContext';
import { PlcDeviceConfig } from '../types';
import { BASE_UNITS, getModule, makeRack, RackConfig, SAMPLE_RACK, slotLabel } from './hardware';
import { canPlace, Msg, validate } from './validation';
import { ModuleCatalogue } from './ModuleCatalogue';
import { HardwareRack, ViewMode } from './HardwareRack';
import { BottomModulePanel, ModuleProperties } from './ModulePanels';

const KEY = 'aquatwin.hwconfig.v1';
const load = (): RackConfig => {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    const b = BASE_UNITS.find((x) => x.model === c?.baseUnit);
    if (b && Array.isArray(c.slots) && c.slots.length === b.slots + 1) return c;
  } catch { /* storage unavailable or corrupt: fall back to sample */ }
  return SAMPLE_RACK;
};

const tbtn = 'flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-800 enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:enabled:hover:bg-slate-800';
const ICON = { ok: CheckCircle2, warn: AlertTriangle, error: XCircle, info: Info } as const;
const COLOR = { ok: 'text-emerald-700', warn: 'text-amber-700', error: 'text-red-700', info: 'text-blue-700' } as const;

export const HardwareConfigurationView: React.FC<{ device: PlcDeviceConfig }> = ({ device }) => {
  const { plcHealth } = useRuntimeMode();
  const simulation = plcHealth.mode === 'VIRTUAL';

  const [cfg, setCfg] = useState<RackConfig>(load);
  const [selected, setSelected] = useState(4);
  const [picked, setPicked] = useState<string | null>(null);
  const [dragModel, setDragModel] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('FRONT');
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(0);
  const [angle, setAngle] = useState(-25);
  const [log, setLog] = useState<Msg[]>([]);
  const [dirty, setDirty] = useState(false);

  const msgs = useMemo(() => validate(cfg), [cfg]);
  const note = (level: Msg['level'], text: string) => setLog((l) => [{ level, text }, ...l].slice(0, 3));
  const edit = (slots: (string | null)[], baseUnit = cfg.baseUnit) => { setCfg({ baseUnit, slots }); setDirty(true); };

  const place = (model: string, i: number) => {
    const m = getModule(model);
    if (!m) return note('error', `Unknown module "${model}"`);
    const why = canPlace(m, i);
    if (why) return note('error', `Incompatible module detected: ${m.model} in slot ${slotLabel(i)}. ${why}.`);
    const prev = cfg.slots[i];
    edit(cfg.slots.map((s, k) => (k === i ? model : s)));
    setSelected(i);
    note('ok', prev ? `Module replaced in slot ${slotLabel(i)}: ${prev} → ${model}` : `Module assigned successfully: ${model} → slot ${slotLabel(i)}`);
  };
  const add = (model: string) => (cfg.slots[selected] ? note('warn', `Slot ${slotLabel(selected)} already occupied by ${cfg.slots[selected]}. Select an empty slot or use Replace.`) : place(model, selected));
  const replace = (model: string) => (cfg.slots[selected] ? place(model, selected) : note('warn', `Slot ${slotLabel(selected)} is empty; use Add.`));
  const autoAdd = (model: string) => {
    const m = getModule(model)!;
    const i = cfg.slots.findIndex((s, k) => !s && !canPlace(m, k));
    i < 0 ? note('warn', `No free compatible slot for ${model}.`) : place(model, i);
  };
  const remove = () => { edit(cfg.slots.map((s, k) => (k === selected ? null : s))); note('info', `Module ${cfg.slots[selected]} removed from slot ${slotLabel(selected)}`); };

  const changeBase = (model: string) => {
    const next = makeRack(model);
    const lost = cfg.slots.slice(next.slots.length).filter(Boolean);
    if (lost.length && !window.confirm(`Changing to ${model} removes ${lost.length} module(s). Continue?`)) return;
    edit(next.slots.map((_, k) => cfg.slots[k] ?? null), model);
    setSelected((s) => Math.min(s, next.slots.length - 1));
  };

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(cfg)); setDirty(false); note('ok', 'Configuration saved to this browser (not written to a PLC).'); }
    catch { note('error', 'Save failed: browser storage unavailable.'); }
  };
  const runValidate = () => {
    const e = msgs.filter((m) => m.level === 'error').length, w = msgs.filter((m) => m.level === 'warn').length;
    note(e ? 'error' : w ? 'warn' : 'ok', `Validation finished: ${e} error(s), ${w} warning(s).`);
  };
  // Real-PLC operations: no module read/write/scan API exists in the backend, so never report success.
  const hw = (what: string) => () => note('error', `${what} not performed: no hardware configuration transfer is implemented and no verified PLC link exists. Nothing was read or written.`);

  const populated = cfg.slots.filter(Boolean).length;
  const simTitle = simulation ? 'Unavailable in SIMULATION mode (no hardware)' : undefined;
  const shown: Msg[] = [...log, ...msgs];

  return (
    <div className="space-y-2 text-slate-900 dark:text-slate-100">
      {/* toolbar */}
      <div className="flex flex-wrap items-center border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
        <button className={tbtn} onClick={save} disabled={!dirty} title={dirty ? 'Save configuration' : 'No unsaved changes'}><Save className="h-4 w-4" />Save</button>
        <button className={tbtn} onClick={runValidate}><CheckCircle2 className="h-4 w-4 text-emerald-600" />Validate</button>
        <button className={tbtn} onClick={hw('Read PLC')} disabled={simulation} title={simTitle}><Download className="h-4 w-4" />Read PLC</button>
        <button className={tbtn} onClick={hw('Write PLC')} disabled={simulation} title={simTitle}><Upload className="h-4 w-4" />Write PLC</button>
        <button className={tbtn} onClick={hw('Scan')} disabled={simulation} title={simTitle}><ScanSearch className="h-4 w-4" />Scan</button>
        <button className={tbtn} onClick={() => note('info', 'Drag a catalogue module onto a slot, or select a slot and use Add / Replace. Double-click a catalogue item to add it to the first compatible empty slot.')}><CircleHelp className="h-4 w-4" />Help</button>
        {dirty && <span className="ml-auto pr-3 text-[11px] text-amber-700">Unsaved changes</span>}
      </div>

      {/* identification bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900">
        <span className="font-semibold">Mitsubishi Electric · MELSEC iQ-R</span>
        <span>Base unit: <b>{cfg.slots[1] ?? 'no CPU'}</b></span>
        <label className="flex items-center gap-1">Rack:
          <select value={cfg.baseUnit} onChange={(e) => changeBase(e.target.value)} className="rounded-sm border border-slate-300 bg-white px-1 py-0.5 dark:border-slate-600 dark:bg-slate-800">
            {BASE_UNITS.map((b) => <option key={b.model} value={b.model}>{b.model}</option>)}
          </select>
        </label>
        <span className={`flex items-center gap-1 ${msgs.some((m) => m.level === 'error') ? 'text-red-700' : 'text-emerald-700'}`}>
          <ShieldCheck className="h-3.5 w-3.5" />{msgs.some((m) => m.level === 'error') ? 'Configuration errors' : 'Configuration OK'}
        </span>
        <span className="ml-auto rounded-sm bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">SAMPLE / UNVERIFIED PROFILE</span>
      </div>

      <div className="flex items-stretch gap-2">
        <ModuleCatalogue picked={picked} onPick={setPicked} onAdd={add} onReplace={replace} onAutoAdd={autoAdd} onDragModel={setDragModel} />

        <section className="flex min-w-0 flex-1 flex-col border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-end gap-1 border-b border-slate-300 p-1.5 text-xs dark:border-slate-700">
            {(['FRONT', '3D', 'REAL'] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`rounded-sm border px-2.5 py-1 ${view === v ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800'}`}>
                {v === 'FRONT' ? 'Front View' : v === '3D' ? '3D View' : 'Real Image'}
              </button>
            ))}
            {view === '3D' && <input type="range" min={-50} max={50} value={angle} onChange={(e) => setAngle(+e.target.value)} aria-label="Rotate rack" title="Rotate (CSS perspective view of the front elevation, not a 3D model)" className="w-20" />}
            <button className={tbtn + ' border border-slate-300 !py-1'} onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}><ZoomIn className="h-3.5 w-3.5" />Zoom In</button>
            <button className={tbtn + ' border border-slate-300 !py-1'} onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}><ZoomOut className="h-3.5 w-3.5" />Zoom Out</button>
            <button className={tbtn + ' border border-slate-300 !py-1'} onClick={() => setFit((f) => f + 1)}><Maximize2 className="h-3.5 w-3.5" />Fit to Screen</button>
          </div>
          <HardwareRack config={cfg} selected={selected} onSelect={setSelected} onDrop={(i, m) => m && place(m, i)} dragModel={dragModel}
            view={view} zoom={zoom} fitSignal={fit} onZoom={setZoom} angle={angle} />
        </section>

        <ModuleProperties config={cfg} selected={selected} onRemove={remove} />
      </div>

      <BottomModulePanel config={cfg} selected={selected} msgs={msgs} simulation={simulation} />

      {/* configuration messages */}
      <div className="border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900" role="status">
        {shown.map((m, i) => {
          const I = ICON[m.level];
          return <div key={i} className={`flex items-center gap-1.5 py-0.5 ${COLOR[m.level]}`}><I className="h-3.5 w-3.5 shrink-0" />{m.text}</div>;
        })}
      </div>

      {/* connection status bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800">
        <span className={`font-bold ${simulation ? 'text-blue-700' : 'text-slate-600'}`}>{simulation ? 'SIMULATION' : 'REAL PLC · OFFLINE (link unverified)'}</span>
        <span>IP: {simulation ? '-' : `${device.host}:${device.port} (configured)`}</span>
        <span>Protocol: {simulation ? 'VIRTUAL_SCAN' : device.protocol}</span>
        <span>Scan cycle: -</span>
        <span className="ml-auto">Rack: {cfg.baseUnit}</span>
        <span>Slots populated: {populated} / {cfg.slots.length}</span>
      </div>
    </div>
  );
};
