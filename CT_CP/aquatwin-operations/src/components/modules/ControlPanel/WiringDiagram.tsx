/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SAMPLE_SIGNAL_PATHS } from './panelData';
import { SignalPath, SignalPathNode } from '../../../types/io';
import { SimulatedBadge } from '../../shared/SimulatedBadge';
import {
  Workflow,
  Radio,
  Layers,
  Cpu,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const WiringDiagram: React.FC = () => {
  const [selectedPathId, setSelectedPathId] = useState<string>('PATH-LT101');
  const [activeNode, setActiveNode] = useState<SignalPathNode | null>(null);

  const currentPath: SignalPath =
    SAMPLE_SIGNAL_PATHS.find((p) => p.id === selectedPathId) || SAMPLE_SIGNAL_PATHS[0];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Workflow className="w-4 h-4 text-cyan-500" />
              Electrical Wiring Schematic & Signal-Path Tracer
            </h2>
            <SimulatedBadge verified={false} text="SCHEMATIC SIMULATED" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            End-to-end signal flow from field sensors through cables, cabinet terminals, PLC I/O cards, process tags, to SCADA
          </p>
        </div>

        {/* Path Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {SAMPLE_SIGNAL_PATHS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPathId(p.id);
                setActiveNode(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap border ${
                selectedPathId === p.id
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900'
              }`}
            >
              {p.equipmentId} ({p.signalType})
            </button>
          ))}
        </div>
      </div>

      {/* Main Schematic Diagram Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden">
        {/* Schematic Metadata */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Active Loop: {currentPath.name}
            </span>
            <span className="ml-2 font-mono text-[11px] text-slate-500">
              [{currentPath.description}]
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-[11px] border border-cyan-500/20">
            Signal Standard: {currentPath.signalType}
          </span>
        </div>

        {/* Signal Flow Chain Visualization */}
        <div className="my-auto py-8 overflow-x-auto">
          <div className="flex items-center justify-start min-w-[1000px] gap-2 px-4">
            {currentPath.nodes.map((node, index) => {
              const isSelected = activeNode?.refId === node.refId;
              const hasSelection = activeNode !== null;
              const isDimmed = hasSelection && !isSelected;

              const kindColors: Record<string, string> = {
                FIELD_DEVICE: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                FIELD_CABLE: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300',
                TERMINAL: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                IO_CHANNEL: 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300',
                PLC_TAG: 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
                GATEWAY: 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
                UI_OBJECT: 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300',
                RELAY: 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
                CONTACTOR: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300',
                ACTUATOR: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
              };

              const colorClass = kindColors[node.kind] || 'border-slate-500 bg-slate-500/10 text-slate-700';

              return (
                <React.Fragment key={node.refId}>
                  {/* Node Card */}
                  <div
                    onClick={() => setActiveNode(node)}
                    className={`cursor-pointer w-48 p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 shadow-sm flex flex-col justify-between ${
                      isSelected
                        ? 'ring-4 ring-cyan-500/40 shadow-lg scale-105 ' + colorClass
                        : isDimmed
                        ? 'opacity-40 border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60'
                        : colorClass
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider mb-1 font-mono">
                        <span>{node.kind.replace('_', ' ')}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {node.label}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {node.subtext}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">Live Val:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {node.value || 'OK'}
                      </span>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  {index < currentPath.nodes.length - 1 && (
                    <div className="flex items-center justify-center px-1">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" />
                        <ArrowRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400 -mt-2.5 ml-3" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Node Inspector Drawer */}
        <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-3">
          {activeNode ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {activeNode.label}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-[10px] border border-cyan-500/20">
                    Ref: {activeNode.refId}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeNode.subtext}
                </p>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">CURRENT VALUE</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">
                    {activeNode.value}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">INTEGRITY</span>
                  <span className="font-bold text-emerald-500">GOOD (VERIFIED OK)</span>
                </div>
                <button
                  onClick={() => setActiveNode(null)}
                  className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-sans"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-1 font-mono">
              <span>💡 Click any node along the circuit path above to inspect wire gauge, voltage drop, and live signals.</span>
              <span>Total Loop Latency: 12 ms</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

