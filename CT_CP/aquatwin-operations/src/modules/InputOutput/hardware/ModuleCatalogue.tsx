import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Repeat, Search } from 'lucide-react';
import { CATALOGUE, CATEGORIES } from './hardware';
import { ModuleThumb } from './PLCModule';

interface Props {
  picked: string | null;
  onPick: (model: string) => void;
  onAdd: (model: string) => void; // into selected slot (must be empty)
  onReplace: (model: string) => void; // selected slot (must be occupied)
  onAutoAdd: (model: string) => void; // first compatible empty slot
  onDragModel: (model: string | null) => void;
}

const btn = 'flex flex-1 items-center justify-center gap-1 rounded-sm border border-slate-300 bg-slate-50 py-1 text-xs enabled:hover:bg-blue-50 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800';

export const ModuleCatalogue: React.FC<Props> = ({ picked, onPick, onAdd, onReplace, onAutoAdd, onDragModel }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(CATEGORIES.map((c) => [c.key, true])));
  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CATEGORIES.map((c) => ({
      ...c,
      items: CATALOGUE.filter((m) => m.category === c.key && (!s || `${m.model} ${m.name} ${m.description} ${c.label}`.toLowerCase().includes(s))),
    })).filter((g) => g.items.length);
  }, [q]);

  return (
    <aside className="flex w-[270px] shrink-0 flex-col border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:text-slate-100">Module Catalogue</div>
      <div className="relative m-2">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search modules..." aria-label="Search modules"
          className="w-full rounded-sm border border-slate-300 bg-white py-1 pl-7 pr-2 text-xs dark:border-slate-600 dark:bg-slate-800" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2" style={{ maxHeight: 340 }}>
        {groups.length === 0 && <p className="p-2 text-xs text-slate-500">No modules match "{q}".</p>}
        {groups.map((g) => {
          const isOpen = q ? true : open[g.key];
          return (
            <div key={g.key}>
              <button onClick={() => setOpen((o) => ({ ...o, [g.key]: !o[g.key] }))} className="flex w-full items-center gap-1 py-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {g.label} <span className="font-normal text-slate-400">({g.items.length})</span>
              </button>
              {isOpen && g.items.map((m) => (
                <div key={m.model} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', m.model); onDragModel(m.model); }} onDragEnd={() => onDragModel(null)}
                  onClick={() => onPick(m.model)} onDoubleClick={() => onAutoAdd(m.model)} title="Click to select · double-click to add · drag onto a slot"
                  className={`flex cursor-grab items-center gap-2 border-b border-slate-100 py-1.5 pl-3 pr-1 dark:border-slate-800 ${picked === m.model ? 'bg-blue-50 outline outline-1 -outline-offset-1 outline-blue-500 dark:bg-blue-950' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <div className="flex w-9 shrink-0 justify-center"><ModuleThumb m={m} h={44} /></div>
                  <div className="min-w-0 text-[11px] leading-tight">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{m.model}</div>
                    <div className="truncate text-slate-500" title={m.description}>{m.name}</div>
                    <div className="text-slate-400">{m.channels ? `${m.channels} ch · ` : ''}{g.label}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 border-t border-slate-300 p-2 dark:border-slate-700">
        <button disabled={!picked} onClick={() => picked && onAdd(picked)} className={btn} title="Add to the selected (empty) slot"><Plus className="h-3 w-3" />Add</button>
        <button disabled={!picked} onClick={() => picked && onReplace(picked)} className={btn} title="Replace the module in the selected slot"><Repeat className="h-3 w-3" />Replace</button>
      </div>
      <div className="border-t border-slate-200 px-3 py-1 text-[10px] text-amber-700 dark:border-slate-700 dark:text-amber-400">SAMPLE / UNVERIFIED catalogue data</div>
    </aside>
  );
};
