/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
} from 'lucide-react';

interface LiveMonitorTabProps {
  tags: ExtendedPlcTag[];
  onToggleFault: (tagId: string) => void;
  onToggleForce: (tagId: string) => void;
}

export const LiveMonitorTab: React.FC<LiveMonitorTabProps> = ({
  tags,
  onToggleFault,
  onToggleForce,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'DI_DO' | 'AI_AO'>('ALL');
  const [filterFaultedOnly, setFilterFaultedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTags = tags.filter((t) => {
    if (filterType === 'DI_DO' && t.type !== 'DI' && t.type !== 'DO') return false;
    if (filterType === 'AI_AO' && t.type !== 'AI' && t.type !== 'AO') return false;
    if (filterFaultedOnly && t.fault === null) return false;
    if (
      searchQuery &&
      !t.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search monitor tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs w-56 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 font-mono">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded font-medium transition ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setFilterType('DI_DO')}
              className={`px-3 py-1 rounded font-medium transition ${
                filterType === 'DI_DO'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Digital (DI / DO)
            </button>
            <button
              onClick={() => setFilterType('AI_AO')}
              className={`px-3 py-1 rounded font-medium transition ${
                filterType === 'AI_AO'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Analog (AI / AO)
            </button>
          </div>

          <button
            onClick={() => setFilterFaultedOnly(!filterFaultedOnly)}
            className={`px-3 py-1.5 rounded-lg border transition font-mono flex items-center gap-1.5 ${
              filterFaultedOnly
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400 font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Faulted Only</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <SimulatedBadge verified={false} text="LIVE SCAN: 500MS" />
          <span className="text-slate-500">{filteredTags.length} Channels Monitored</span>
        </div>
      </div>

      {/* Monitoring Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-[10px] uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">PLC Tag</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Address</th>
                <th className="py-3 px-3">Terminal</th>
                <th className="py-3 px-3 text-right">Raw Signal</th>
                <th className="py-3 px-3 text-right">Scaled Value</th>
                <th className="py-3 px-4">Command vs Feedback</th>
                <th className="py-3 px-3 text-center">Quality</th>
                <th className="py-3 px-4 text-center">Fault Simulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTags.map((tag) => {
                const isAnalog = tag.type === 'AI' || tag.type === 'AO';
                const isFaulted = tag.fault !== null;

                // Feedback matching calculation for DO/DI
                let feedbackText = '—';
                if (tag.id === 'P101_RUN_CMD') {
                  feedbackText = 'Mapped to P101_RUN_FB (Feedback: MATCH)';
                } else if (tag.id === 'P201_RUN_CMD') {
                  feedbackText = 'Mapped to P201_RUN_FB (Feedback: MATCH)';
                } else if (tag.id === 'XV101_CMD') {
                  feedbackText = 'Limit Switch: OPEN_FB Active';
                }

                return (
                  <tr
                    key={tag.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                      isFaulted ? 'bg-rose-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        {tag.id}
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans truncate max-w-xs">
                        {tag.description}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          tag.type === 'AI'
                            ? 'bg-amber-500/10 text-amber-600'
                            : tag.type === 'DI'
                            ? 'bg-cyan-500/10 text-cyan-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {tag.type}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-cyan-600 dark:text-cyan-400">
                      {tag.address}
                    </td>

                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                      {tag.terminal}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-500">
                      {isAnalog
                        ? `${tag.rawCounts?.toLocaleString()} cts (${(4.0 + ((tag.rawCounts || 0) / 32000) * 16.0).toFixed(2)} mA)`
                        : tag.currentValue
                        ? '24V DC HIGH'
                        : '0V DC LOW'}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {typeof tag.currentValue === 'boolean'
                        ? tag.currentValue
                          ? 'TRUE (1)'
                          : 'FALSE (0)'
                        : `${Number(tag.currentValue).toFixed(1)} ${tag.scaling.unit || ''}`}
                    </td>

                    <td className="py-3 px-4 text-[10px] text-slate-500 font-sans">
                      {feedbackText}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <QualityIcon quality={tag.quality} showText={true} />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onToggleFault(tag.id)}
                          className={`px-2 py-1 text-[10px] rounded font-semibold transition border ${
                            isFaulted
                              ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isFaulted ? 'WIRE BREAK ACTIVE' : 'Inject Break'}
                        </button>
                        <button
                          onClick={() => onToggleForce(tag.id)}
                          className={`px-2 py-1 text-[10px] rounded font-semibold transition border ${
                            tag.forced
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {tag.forced ? 'FORCED' : 'Force'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
