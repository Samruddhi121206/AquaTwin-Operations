/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  BellOff,
  CheckCheck,
  Filter,
  Search,
  Sparkles,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { AlarmSeverity } from '../../../types/plant';

export const AlarmsView: React.FC = () => {
  const {
    alarms,
    acknowledgeAlarm,
    silenceAlarm,
    clearResolvedAlarms,
    auditLogs,
    addAuditLog,
  } = usePlant();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const unackCount = alarms.filter((a) => !a.acknowledged).length;
  const criticalCount = alarms.filter((a) => a.severity === 'critical').length;
  const warningCount = alarms.filter((a) => a.severity === 'warning').length;

  const filteredAlarms = alarms.filter((a) => {
    const matchesSev = severityFilter === 'all' || a.severity === severityFilter;
    const matchesSearch =
      a.tag.toLowerCase().includes(search.toLowerCase()) ||
      a.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const handleAcknowledgeAll = () => {
    alarms.forEach((a) => {
      if (!a.acknowledged) acknowledgeAlarm(a.id);
    });
  };

  return (
    <div className="space-y-4">
      {/* Alarms Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Total Active Events</span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {alarms.length}
            </span>
          </div>
          <AlertTriangle className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Unacknowledged</span>
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {unackCount}
            </span>
          </div>
          <ShieldAlert className="w-6 h-6 text-rose-500" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Critical Alarms</span>
            <span className="text-2xl font-bold font-mono text-rose-600">
              {criticalCount}
            </span>
          </div>
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Warnings</span>
            <span className="text-2xl font-bold font-mono text-amber-500">
              {warningCount}
            </span>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      {/* Filter and Bulk Actions Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs shadow-sm">
        <div className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter alarms by tag, message or equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="advisory">Advisory Only</option>
          </select>

          {unackCount > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1.5 transition"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Ack All ({unackCount})</span>
            </button>
          )}

          <button
            onClick={clearResolvedAlarms}
            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
          >
            Clear Acknowledged
          </button>
        </div>
      </div>

      {/* Alarms Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4">Equipment & Alarm Description</th>
                <th className="py-3 px-4">Current Value</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAlarms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No active alarm conditions matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAlarms.map((a) => (
                  <tr
                    key={a.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      !a.acknowledged ? 'bg-slate-50/30 dark:bg-slate-800/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          a.severity === 'critical'
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : a.severity === 'warning'
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {a.tag}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{a.message}</div>
                      <div className="text-[11px] text-slate-400">{a.equipmentName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {a.value}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {a.threshold}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {a.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      {a.acknowledged ? (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          <span className="font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ack'd
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                            {a.acknowledgedBy}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" /> Unack
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!a.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlarm(a.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-white transition"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => silenceAlarm(a.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          title="Silence / Archive"
                        >
                          <BellOff className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ISA-18.2 Alarm Philosophy Reference Box */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
            ISA-18.2 Alarm Lifecycle Management
          </h4>
          <p className="leading-relaxed">
            All active alarms are categorized by operational criticality. Unacknowledged alarms pulse until verified by a licensed operator. Operator actions, setpoint changes, and alarm acknowledgements are stored with immutable audit timestamps.
          </p>
        </div>
      </div>
    </div>
  );
};
