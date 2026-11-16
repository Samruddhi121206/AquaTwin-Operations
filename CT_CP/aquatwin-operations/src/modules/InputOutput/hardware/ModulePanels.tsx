import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { CatalogueModule, getModule, RackConfig, slotLabel, slotRole } from './hardware';
import { Msg, powerBudget } from './validation';
import { ModuleThumb } from './PLCModule';

const NA = 'Not specified (unverified)';
const Row: React.FC<{ k: string; v: React.ReactNode }> = ({ k, v }) => (
  <div className="flex border-b border-slate-200 text-xs dark:border-slate-700">
    <div className="w-[42%] shrink-0 bg-slate-50 px-2 py-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{k}</div>
    <div className="px-2 py-1.5 font-medium text-slate-900 dark:text-slate-100">{v}</div>
  </div>
);

/** Typed model of the selected module's values (everything shown comes from the catalogue or the rack layout). */
const describe = (m: CatalogueModule, i: number, c: RackConfig) => ({
  slot: slotLabel(i),
  channels: m.channels || '-',
  signal: m.signalType,
  resolution: m.resolution ?? NA,
  range: m.range ?? NA,
  power: m.category === 'Power Supply' ? `Supplies ${m.supply5V.toFixed(1)} A @ 5 V` : `${m.draw5V.toFixed(2)} A @ 5 V`,
  install: `Main base ${c.baseUnit}, ${slotRole(i) === 'PSU' ? 'power supply position' : `slot ${slotLabel(i)}`}`,
});

export const ModuleProperties: React.FC<{ config: RackConfig; selected: number; onRemove: () => void }> = ({ config, selected, onRemove }) => {
  const m = getModule(config.slots[selected]);
  return (
    <aside className="w-[280px] shrink-0 border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="bg-blue-700 px-3 py-2 text-sm font-bold text-white">Module Properties</div>
      {!m ? (
        <div className="p-3 text-xs text-slate-600 dark:text-slate-400">
          <p className="font-semibold">Slot {slotLabel(selected)} is empty.</p>
          <p className="mt-1">Accepts: {slotRole(selected) === 'PSU' ? 'power supply' : slotRole(selected) === 'CPU' ? 'CPU' : 'I/O, analog, communication and temperature modules'}.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-700">
            <ModuleThumb m={m} h={64} />
            <div><div className="text-lg font-bold leading-tight">{m.model}</div><div className="text-xs text-slate-600 dark:text-slate-400">{m.category} Module</div></div>
          </div>
          {(() => { const d = describe(m, selected, config); return (<>
            <Row k="Manufacturer" v={m.manufacturer} />
            <Row k="Model" v={m.model} />
            <Row k="Module Type" v={m.category} />
            <Row k="Slot Number" v={d.slot} />
            <Row k="Channels" v={d.channels} />
            <Row k="Signal Type" v={d.signal} />
            <Row k="Resolution" v={d.resolution} />
            <Row k="Input Range" v={d.range} />
            <Row k="Power Supply" v={d.power} />
            <Row k="Installation" v={d.install} />
          </>); })()}
          <div className="p-2">
            <button onClick={onRemove} className="flex w-full items-center justify-center gap-1 rounded-sm border border-red-300 py-1 text-xs text-red-700 hover:bg-red-50"><Trash2 className="h-3 w-3" />Remove module</button>
          </div>
        </>
      )}
    </aside>
  );
};

type Tab = 'Module Properties' | 'Terminal Wiring' | 'Address Assignment' | 'Diagnostics';
export const BOTTOM_TABS: Tab[] = ['Module Properties', 'Terminal Wiring', 'Address Assignment', 'Diagnostics'];

/** Default-parameter start I/O numbers: cumulative points over I/O slots. ponytail: DI/DO use channels, all others assumed 16 points. */
const startIo = (c: RackConfig, i: number) => {
  let n = 0;
  for (let s = 2; s < i; s++) {
    const m = getModule(c.slots[s]);
    if (m) n += m.category === 'Digital Input' || m.category === 'Digital Output' ? Math.max(16, m.channels) : 16;
  }
  return n.toString(16).toUpperCase().padStart(4, '0');
};

export const BottomModulePanel: React.FC<{ config: RackConfig; selected: number; msgs: Msg[]; simulation: boolean }> = ({ config, selected, msgs, simulation }) => {
  const [tab, setTab] = useState<Tab>('Module Properties');
  const m = getModule(config.slots[selected]);
  const { supply, draw } = powerBudget(config);
  const slotMsgs = msgs.filter((x) => x.text.toLowerCase().includes(`slot ${slotLabel(selected)}`));

  let body: React.ReactNode;
  if (!m) body = <p className="p-3 text-xs text-slate-500">Slot {slotLabel(selected)} is empty. Select an installed module to see its {tab.toLowerCase()}.</p>;
  else if (tab === 'Module Properties')
    body = (
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 p-3 text-xs md:grid-cols-4">
        <div><div className="text-slate-500">Part Number</div><b className="text-sm">{m.model}</b></div>
        <div><div className="text-slate-500">Head I/O Points</div><b>{slotRole(selected) === 'IO' ? startIo(config, selected) : '-'}</b></div>
        <div><div className="text-slate-500">Series</div><b>{m.series}</b></div>
        <div><div className="text-slate-500">Terminals</div><b>{m.terminalType}</b></div>
        <div className="col-span-2 md:col-span-4 text-slate-700 dark:text-slate-300">{m.description}</div>
      </div>
    );
  else if (tab === 'Terminal Wiring')
    body = (
      <div className="p-3 text-xs">
        <p className="mb-1 text-slate-600">Connector: {m.terminalType} · Signal: {m.signalType}</p>
        {m.channels > 0 ? (
          <div className="grid max-h-28 grid-cols-4 gap-1 overflow-auto md:grid-cols-8">
            {Array.from({ length: m.channels }).map((_, ch) => (
              <div key={ch} className="rounded-sm border border-slate-300 px-1.5 py-0.5 text-center dark:border-slate-600">CH{ch}</div>
            ))}
          </div>
        ) : <p className="text-slate-500">This module has no field wiring channels.</p>}
        <p className="mt-1 text-[10px] text-amber-700">Terminal pin numbering is not in the sample catalogue; confirm against the module manual.</p>
      </div>
    );
  else if (tab === 'Address Assignment')
    body = (
      <div className="p-3 text-xs">
        {slotRole(selected) === 'IO' ? (
          <p>Start I/O No. <b className="font-mono">{startIo(config, selected)}H</b> (default auto-assignment preview).</p>
        ) : <p>Slot {slotLabel(selected)} has no I/O address range.</p>}
        <p className="mt-1 text-[10px] text-amber-700">Computed from slot order; DI/DO use their point count, other modules are assumed 16 points. Not read from a PLC.</p>
      </div>
    );
  else
    body = (
      <div className="space-y-1 p-3 text-xs">
        {slotMsgs.length ? slotMsgs.map((x, k) => <p key={k} className={x.level === 'error' ? 'text-red-700' : 'text-amber-700'}>{x.text}</p>) : <p className="text-emerald-700">No configuration issues for this slot.</p>}
        {slotRole(selected) !== 'PSU' && <p>5 V budget: {draw.toFixed(2)} A drawn of {supply ? supply.toFixed(1) + ' A' : 'n/a'}; this module {m.draw5V.toFixed(2)} A.</p>}
        <p className="text-slate-500">{simulation ? 'SIMULATION: no live module status (LED/error registers) is available.' : 'No live module status: hardware link not verified.'}</p>
      </div>
    );

  return (
    <section className="border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-300 bg-slate-50 pr-2 dark:border-slate-700 dark:bg-slate-800">
        <div className="px-3 py-1.5 text-xs font-bold">Selected Module: Slot {slotLabel(selected)} [{m?.model ?? 'empty'}]{m ? ` | ${m.category}` : ''}</div>
        <div className="flex">{BOTTOM_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs ${tab === t ? 'border-x border-t border-slate-300 bg-white font-semibold text-blue-700 dark:bg-slate-900' : 'text-slate-600'}`}>{t}</button>
        ))}</div>
      </div>
      {body}
    </section>
  );
};
