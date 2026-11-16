/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ExtendedPlcTag } from '../types';
import { QualityIcon } from '../../../components/shared/QualityIcon';
import { SimulatedBadge } from '../../../components/shared/SimulatedBadge';
import {
  Activity,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Sliders,
  Filter,
  Search,
  Radio,
  SlidersHorizontal,
  RefreshCw,
  Power,
} from 'lucide-react';

interface LiveMonitorTabProps {
  tags: ExtendedPlcTag[];
  onToggleFault: (tagId: string) => void;
  onWrite: (tagId: string, value: number | boolean) => { ok: boolean; message: string };
  onForce: (tagId: string, value: number | boolean | null) => { ok: boolean; message: string };
  simulation: boolean;
}

export const LiveMonitorTab: React.FC<LiveMonitorTabProps> = ({
  tags,
  onToggleFault,
  onWrite,
  onForce,
  simulation,
}) => {
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const run = (r: { ok: boolean; message: string }) => setNotice(r);
  const small = 'rounded border border-slate-300 px-2 py-0.5 text-[10px] enabled:hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:enabled:hover:bg-slate-800';
  const [activeTab, setActiveTab] = useState<'DI' | 'DO' | 'AI' | 'AO'>('DI');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState<number>(1000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('12:34:56 PM');

  // Live ticking timestamp when Auto Refresh is on
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString());
    }, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalMs]);

  const filteredTags = tags.filter((t) => {
    if (t.type !== activeTab) return false;
    if (
      searchQuery &&
      !t.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(t.deviceName && t.deviceName.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Top Header Bar matching user screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
        {/* Left Sub-tabs: DI | DO | AI | AO matching screenshot */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('DI')}
            className={`px-3 py-1 text-xs rounded-md font-mono font-medium transition ${
              activeTab === 'DI'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Digital Inputs (DI)
          </button>
          <button
            onClick={() => setActiveTab('DO')}
            className={`px-3 py-1 text-xs rounded-md font-mono font-medium transition ${
              activeTab === 'DO'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Digital Outputs (DO)
          </button>
          <button
            onClick={() => setActiveTab('AI')}
            className={`px-3 py-1 text-xs rounded-md font-mono font-medium transition ${
              activeTab === 'AI'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Analog Inputs (AI)
          </button>
          <button
            onClick={() => setActiveTab('AO')}
            className={`px-3 py-1 text-xs rounded-md font-mono font-medium transition ${
              activeTab === 'AO'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Analog Outputs (AO)
          </button>
        </div>

        {/* Right Controls: Auto Refresh toggle + Interval selector matching screenshot */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tag, channel or device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono w-52"
            />
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400">Auto Refresh:</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                autoRefresh ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  autoRefresh ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Interval Pill */}
          <select
            value={refreshIntervalMs}
            onChange={(e) => setRefreshIntervalMs(Number(e.target.value))}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300"
          >
            <option value={500}>500ms</option>
            <option value={1000}>1s</option>
            <option value={2000}>2s</option>
          </select>
        </div>
      </div>

      {/* Main Table matching exact columns in user screenshot:
          Channel | Tag Name | Device | Value | Status | Last Update */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {notice && <div role="status" className={`border-b px-4 py-1.5 text-xs ${notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{notice.message}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Tag Name</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Update</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTags.map((tag) => {
                const isBool = tag.type === 'DI' || tag.type === 'DO';
                const isNormal = tag.fault === null;
                const isTripped = tag.id.includes('TRIP') && tag.currentValue === true;

                return (
                  <tr
                    key={tag.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    {/* 1. Channel */}
                    <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                      {tag.address}
                    </td>

                    {/* 2. Tag Name */}
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {tag.name}
                      <span className="block text-[10px] text-slate-400 font-normal truncate max-w-xs">
                        {tag.description}
                      </span>
                    </td>

                    {/* 3. Device */}
                    <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                        {tag.deviceName || tag.id.split('_')[0]}
                      </span>
                    </td>

                    {/* 4. Value matching screenshot */}
                    <td className="py-3 px-4">
                      {isBool ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                            tag.currentValue === true
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {tag.currentValue === true ? 'ON' : 'OFF'}
                        </span>
                      ) : (
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {typeof tag.currentValue === 'number'
                              ? tag.currentValue.toFixed(1)
                              : tag.currentValue}
                          </span>
                          <span className="ml-1 text-[11px] text-slate-400">
                            {tag.scaling.unit}
                          </span>
                          {tag.rawCounts !== undefined && (
                            <span className="block text-[9.5px] text-slate-400">
                              Counts: {tag.rawCounts}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 5. Status with green dot matching screenshot */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isTripped
                              ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)] animate-pulse'
                              : isNormal
                              ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            isTripped
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : isNormal
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isTripped ? 'Tripped' : isNormal ? 'Normal' : 'Warning'}
                        </span>
                      </span>
                    </td>

                    {/* 6. Last Update */}
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {currentTimeStr}
                    </td>

                    {/* Actions: Fault injection / Override */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onToggleFault(tag.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition border ${
                            tag.fault !== null
                              ? 'bg-rose-500 text-white border-rose-600 font-bold'
                              : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-800'
                          }`}
                          title="Inject simulated wire break / fault"
                        >
                          {tag.fault !== null ? 'Fault Active' : 'Fault'}
                        </button>

                        {(tag.type === 'DO' || tag.type === 'AO') && (
                          <>
                            {tag.type === 'DO' ? (
                              <button disabled={!simulation} title={simulation ? 'Command this output' : 'Real PLC is read-only'} className={small}
                                onClick={() => run(onWrite(tag.id, tag.currentValue !== true))}>
                                {tag.currentValue === true ? 'Write OFF' : 'Write ON'}
                              </button>
                            ) : (
                              <>
                                <input type="number" disabled={!simulation} value={draft[tag.id] ?? ''} placeholder={String(tag.currentValue)}
                                  onChange={(e) => setDraft((d) => ({ ...d, [tag.id]: e.target.value }))}
                                  className="w-16 rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px] dark:border-slate-600 dark:bg-slate-800" />
                                <button disabled={!simulation || draft[tag.id] === undefined || draft[tag.id] === ''} className={small}
                                  onClick={() => run(onWrite(tag.id, Number(draft[tag.id])))}>Write</button>
                              </>
                            )}
                          </>
                        )}
                        {(tag.type === 'DI' || tag.type === 'AI') && (
                          <>
                            {tag.forced && tag.type === 'DI' && (
                              <button disabled={!simulation} className={small} onClick={() => run(onForce(tag.id, tag.currentValue !== true))}>
                                Set {tag.currentValue === true ? 'OFF' : 'ON'}
                              </button>
                            )}
                            {tag.forced && tag.type === 'AI' && (
                              <input type="number" step="any" defaultValue={String(tag.currentValue)} disabled={!simulation}
                                onBlur={(e) => e.target.value !== '' && run(onForce(tag.id, Number(e.target.value)))}
                                className="w-16 rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px] dark:border-slate-600 dark:bg-slate-800" />
                            )}
                            <button disabled={!simulation} title={simulation ? 'Force / release this simulated input' : 'Real PLC is read-only'}
                              className={`${small} ${tag.forced ? '!border-amber-600 !bg-amber-500 font-bold !text-black' : ''}`}
                              onClick={() => run(onForce(tag.id, tag.forced ? null : typeof tag.currentValue === 'boolean' ? tag.currentValue : Number(tag.currentValue)))}>
                              {tag.forced ? 'Forced' : 'Force'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Displaying {filteredTags.length} active {activeTab} channels</span>
          <span>Sampling Rate: {refreshIntervalMs} ms via SLMP Telemetry Gateway</span>
        </div>
      </div>
    </div>
  );
};
