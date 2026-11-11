/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { INITIAL_IO_CHANNELS } from './panelData';
import { IOChannel, IOChannelType } from '../../../types/io';
import { QualityIcon } from '../../shared/QualityIcon';
import { SimulatedBadge } from '../../shared/SimulatedBadge';
import {
  Layers,
  Filter,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Search,
  ShieldAlert,
} from 'lucide-react';

export const IoMonitoring: React.FC = () => {
  const [channels, setChannels] = useState<IOChannel[]>(INITIAL_IO_CHANNELS);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [faultOnly, setFaultOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleFault = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === id) {
          const hasFault = ch.fault !== null;
          return {
            ...ch,
            fault: hasFault ? null : 'WIRE_BREAK',
            quality: hasFault ? 'SIMULATED' : 'BAD',
            rawCount: hasFault ? 16500 : 0,
            scaledValue: hasFault ? (typeof ch.scaledValue === 'boolean' ? true : 18.0) : (typeof ch.scaledValue === 'boolean' ? false : 0),
          };
        }
        return ch;
      })
    );
  };

  const toggleForce = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, forced: !ch.forced } : ch))
    );
  };

  const filteredChannels = channels.filter((ch) => {
    if (selectedType !== 'ALL' && ch.type !== selectedType) return false;
    if (selectedModule !== 'ALL' && ch.moduleId !== selectedModule) return false;
    if (faultOnly && ch.fault === null) return false;
    if (
      searchQuery &&
      !ch.tagId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ch.tagDescription.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ch.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tag, address, or terminal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500 w-56 text-xs"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
            {['ALL', 'AI', 'DI', 'AO', 'DO'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  selectedType === t
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Modules</option>
            <option value="A3">A3 (AI 8x13Bit)</option>
            <option value="A4">A4 (DI 16x24V)</option>
            <option value="A5">A5 (AO 4x13Bit)</option>
            <option value="A6">A6 (DO 16x24V)</option>
          </select>

          {/* Faulted Only Toggle */}
          <button
            onClick={() => setFaultOnly(!faultOnly)}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
              faultOnly
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400 font-semibold'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Faulted Only</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <SimulatedBadge verified={false} text="I/O DRIVER: VIRTUAL PLC" />
          <span className="font-mono text-slate-500 text-[11px]">
            {filteredChannels.length} Channels Loaded
          </span>
        </div>
      </div>

      {/* Main I/O Channels Data Grid */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Channel / Module</th>
                <th className="py-3 px-3">Address</th>
                <th className="py-3 px-3">Signal Type</th>
                <th className="py-3 px-3">Terminal</th>
                <th className="py-3 px-4">Process Tag</th>
                <th className="py-3 px-3 text-right">Raw Counts</th>
                <th className="py-3 px-3 text-right">Scaled Value</th>
                <th className="py-3 px-3 text-center">Quality</th>
                <th className="py-3 px-4 text-center">Diagnostics & Simulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredChannels.map((ch) => {
                const isFaulted = ch.fault !== null;
                return (
                  <tr
                    key={ch.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                      isFaulted ? 'bg-rose-500/5' : ''
                    }`}
                  >
                    {/* Channel / Module */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {ch.id}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {ch.moduleName}
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-bold">
                      {ch.address}
                    </td>

                    {/* Signal Type */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {ch.signal}
                      </span>
                    </td>

                    {/* Terminal */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                      {ch.terminalId}
                    </td>

                    {/* Process Tag */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        {ch.tagId}
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans truncate max-w-[240px]">
                        {ch.tagDescription}
                      </div>
                    </td>

                    {/* Raw Counts */}
                    <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-300">
                      {ch.rawCount !== undefined ? `${ch.rawCount.toLocaleString()} / 27648` : '—'}
                    </td>

                    {/* Scaled Value */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {typeof ch.scaledValue === 'boolean'
                        ? ch.scaledValue
                          ? 'HIGH (1)'
                          : 'LOW (0)'
                        : `${ch.scaledValue.toFixed(1)} ${ch.engUnit || ''}`}
                    </td>

                    {/* Quality */}
                    <td className="py-3 px-3 text-center">
                      <QualityIcon quality={ch.quality} showText={true} />
                    </td>

                    {/* Diagnostics & Fault Injection */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => toggleFault(ch.id)}
                          className={`px-2 py-1 text-[10px] rounded font-semibold transition border ${
                            isFaulted
                              ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                          title="Simulate hardware wire-break / open-loop fault"
                        >
                          {isFaulted ? 'WIRE BREAK ACTIVE' : 'Inject Break'}
                        </button>

                        <button
                          onClick={() => toggleForce(ch.id)}
                          className={`px-2 py-1 text-[10px] rounded font-semibold transition border ${
                            ch.forced
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                          title="Force channel override"
                        >
                          {ch.forced ? 'FORCED' : 'Force'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>Siemens S7 Analog Scaling: 4-20mA = 0 to 27648 raw counts (IEC 61131-3)</span>
          <span>Scan Cycle Period: 120ms</span>
        </div>
      </div>
    </div>
  );
};

