import React, { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTags } from '../../context/TagRegistryContext';

/** Trend of values actually recorded this session from the shared tag registry (no generated data). */
export const RecordedTrend: React.FC = () => {
  const { tags, history, source } = useTags();
  const options = tags.filter((t) => (history[t.id]?.length ?? 0) > 0);
  const [id, setId] = useState('TK101_LEVEL');
  const tag = tags.find((t) => t.id === id);
  const data = (history[id] ?? []).map((s) => ({ ...s, time: new Date(s.t).toLocaleTimeString() }));
  const vals = data.map((d) => d.v);
  const stat = vals.length ? { min: Math.min(...vals), max: Math.max(...vals), avg: vals.reduce((a, b) => a + b, 0) / vals.length } : null;
  const last = data[data.length - 1];
  const csv = () => {
    const blob = new Blob([['time,value,quality,source', ...data.map((d) => `${new Date(d.t).toISOString()},${d.v},${d.quality},${d.source}`)].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${id}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
        <h2 className="text-sm font-bold">Recorded Tag Trend (this session)</h2>
        <span className={`rounded px-2 py-0.5 font-bold ${source === 'VIRTUAL' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>{source === 'VIRTUAL' ? 'SIMULATED' : 'REAL PLC'}</span>
        <select value={id} onChange={(e) => setId(e.target.value)} className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800">
          {options.map((t) => <option key={t.id} value={t.id}>{t.id}</option>)}
        </select>
        <button onClick={csv} disabled={!data.length} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40">Export CSV</button>
        {stat && <span className="ml-auto font-mono text-slate-600 dark:text-slate-300">n={data.length} · min {stat.min.toFixed(2)} · max {stat.max.toFixed(2)} · avg {stat.avg.toFixed(2)} {tag?.scaling.unit} · last quality {last.quality}</span>}
      </div>
      {data.length < 2 ? <p className="py-8 text-center text-xs text-slate-500">Collecting samples (one every 2 s). History is kept in memory only and resets on reload.</p> : (
        <div style={{ height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={data}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="time" tick={{ fontSize: 10 }} minTickGap={40} /><YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} /><Tooltip /><Line dataKey="v" name={tag?.scaling.unit} dot={false} stroke="#2563eb" isAnimationActive={false} /></LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
