import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, Pencil } from 'lucide-react';
import { ExtendedPlcTag } from '../types';
import { TagEditorModal } from '../components/TagEditorModal';

interface Props {
  tags: ExtendedPlcTag[];
  onUpdateTag: (t: ExtendedPlcTag) => void;
}

const FILTERS = ['ALL', 'DI', 'DO', 'AI', 'AO'] as const;
const direction = (t: ExtendedPlcTag) => (t.type === 'DO' || t.type === 'AO' ? 'Command output' : t.id.endsWith('_FB') ? 'Feedback input' : 'Read input');

/** Mapping problems found in the current tag list (pure, so it is easy to test later). */
export const mappingIssues = (tags: ExtendedPlcTag[]) => {
  const issues: Record<string, string[]> = {};
  const add = (id: string, m: string) => (issues[id] ??= []).push(m);
  const byAddr = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const t of tags) {
    if (!t.address) add(t.id, 'No PLC address');
    if (byAddr.has(t.address)) { add(t.id, `Duplicate address ${t.address} (also ${byAddr.get(t.address)})`); add(byAddr.get(t.address)!, `Duplicate address ${t.address} (also ${t.id})`); }
    else byAddr.set(t.address, t.id);
    if (byName.has(t.name)) add(t.id, `Duplicate tag name ${t.name}`); else byName.set(t.name, t.id);
    if (t.scaling.mode === 'LINEAR' && t.scaling.rawMax === t.scaling.rawMin) add(t.id, 'Raw range is zero width');
  }
  return issues;
};

export const IoMappingTab: React.FC<Props> = ({ tags, onUpdateTag }) => {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<ExtendedPlcTag | null>(null);
  const issues = useMemo(() => mappingIssues(tags), [tags]);
  const rows = tags.filter((t) => (filter === 'ALL' || t.type === filter) && `${t.id} ${t.name} ${t.address} ${t.deviceName ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  const nIssues = Object.keys(issues).length;

  const exportCsv = () => {
    const head = 'tag,type,address,module,channel,device,signal,rawMin,rawMax,engMin,engMax,unit,direction,terminal,status';
    const body = tags.map((t) => [t.id, t.type, t.address, t.moduleId, t.channelIndex, t.deviceName ?? '', t.signal, t.scaling.rawMin, t.scaling.rawMax, t.scaling.engMin, t.scaling.engMax, t.scaling.unit, direction(t), t.terminal, t.status].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[head, ...body].join('\n')], { type: 'text/csv' }));
    a.download = 'io-mapping.csv'; a.click(); URL.revokeObjectURL(a.href);
  };

  const th = 'border-b border-slate-300 bg-slate-100 px-2 py-1.5 text-left font-semibold dark:border-slate-600 dark:bg-slate-800';
  const td = 'border-b border-slate-200 px-2 py-1 dark:border-slate-700';

  return (
    <div className="border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 p-2 text-xs dark:border-slate-700">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-sm border px-2.5 py-1 ${filter === f ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 hover:bg-slate-50 dark:border-slate-600'}`}>{f === 'ALL' ? 'All' : f}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tag, address, device..." aria-label="Search mappings" className="w-56 rounded-sm border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800" />
        <span className={`flex items-center gap-1 ${nIssues ? 'text-red-700' : 'text-emerald-700'}`}>
          {nIssues ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {nIssues ? `${nIssues} mapping(s) with issues` : 'No duplicate addresses or tag names'}
        </span>
        <button onClick={exportCsv} className="ml-auto flex items-center gap-1 rounded-sm border border-slate-300 px-2.5 py-1 hover:bg-slate-50 dark:border-slate-600"><Download className="h-3.5 w-3.5" />Export CSV</button>
      </div>
      <div className="overflow-auto" style={{ maxHeight: 520 }}>
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0"><tr>
            {['Tag', 'Type', 'PLC address', 'Module / ch', 'Field device', 'Signal', 'Raw range', 'Eng. range', 'Direction', 'Terminal', 'Status', ''].map((h) => <th key={h} className={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className={issues[t.id] ? 'bg-red-50 dark:bg-red-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'} title={issues[t.id]?.join('\n')}>
                <td className={`${td} font-mono font-bold`}>{t.id}</td>
                <td className={td}>{t.type}</td>
                <td className={`${td} font-mono`}>{t.address}</td>
                <td className={`${td} font-mono`}>{t.moduleId} / {t.channelIndex}</td>
                <td className={td}>{t.deviceName ?? '-'}</td>
                <td className={td}>{t.signal}</td>
                <td className={`${td} font-mono`}>{t.scaling.mode === 'NONE' ? '-' : `${t.scaling.rawMin} .. ${t.scaling.rawMax}`}</td>
                <td className={`${td} font-mono`}>{t.scaling.mode === 'NONE' ? '-' : `${t.scaling.engMin} .. ${t.scaling.engMax} ${t.scaling.unit}`}</td>
                <td className={td}>{direction(t)}</td>
                <td className={`${td} font-mono`}>{t.terminal}</td>
                <td className={td}>{t.status === 'VERIFIED' ? 'Sample (unverified)' : t.status}</td>
                <td className={td}><button onClick={() => setEditing(t)} className="flex items-center gap-1 rounded-sm border border-slate-300 px-1.5 py-0.5 hover:bg-slate-100 dark:border-slate-600"><Pencil className="h-3 w-3" />Edit</button></td>
              </tr>
            ))}
            {!rows.length && <tr><td className={td} colSpan={12}>No mappings match.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-300 px-3 py-1 text-[10px] text-amber-700 dark:border-slate-700">
        Sample mapping from the development tag list. Addresses, channels and ranges are not verified against a physical PLC. CSV import and revision history are not implemented yet.
      </div>
      {editing && <TagEditorModal tag={editing} onSave={onUpdateTag} onClose={() => setEditing(null)} />}
    </div>
  );
};
