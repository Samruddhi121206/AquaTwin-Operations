/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExtendedPlcTag, LadderProgram, LadderRung } from '../types';
import { SEED_LADDER_PROGRAMS } from '../ioData';
import {
  Folder,
  FileCode,
  Play,
  Square,
  Download,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface LadderLogicTabProps {
  tags: ExtendedPlcTag[];
  onToggleTagValue?: (tagId: string) => void;
}

export const LadderLogicTab: React.FC<LadderLogicTabProps> = ({ tags, onToggleTagValue }) => {
  const [programs] = useState<LadderProgram[]>(SEED_LADDER_PROGRAMS);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('main');
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [plcRunState, setPlcRunState] = useState<'RUN' | 'STOP'>('RUN');
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);

  // Tree expansion state
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({
    programs: true,
    mainProg: true,
    functionBlocks: true,
    data: true,
  });

  const activeProgram = programs.find((p) => p.id === selectedProgramId) || programs[0];

  // Helper to determine contact energization based on live tags
  const isContactEnergized = (address: string, defaultState = false): boolean => {
    if (!isMonitoring || plcRunState === 'STOP') return false;

    if (address === 'M0.0') return true; // Master auto run enabled
    if (address === 'I0.0' || address === 'X0.0') {
      const tag = tags.find((t) => t.id === 'P101_RUN_FB');
      return tag ? tag.currentValue === true : defaultState;
    }
    if (address === 'I0.1' || address === 'X0.1') {
      const tag = tags.find((t) => t.id === 'P101_TRIP');
      return tag ? tag.currentValue === true : defaultState;
    }
    if (address === 'X0.2') {
      const tag = tags.find((t) => t.id === 'TK101_LSH');
      return tag ? tag.currentValue === true : defaultState;
    }
    if (address === 'T0') return false; // Timer not tripped

    return defaultState;
  };

  const isCoilEnergized = (rung: LadderRung): boolean => {
    if (!isMonitoring || plcRunState === 'STOP') return false;
    // Evaluates if all series contacts in rung are closed/conductive
    return rung.contacts.every((contact) => {
      const energized = isContactEnergized(contact.address, contact.energized ?? false);
      return contact.type === 'NC' ? !energized : energized;
    });
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Top Action Bar matching user reference screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
        {/* Left: Program dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">Program:</span>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
            >
              <option value="main">Main (M0_Main)</option>
              <option value="pumps">Pumps (M1_Pumps)</option>
              <option value="valves">Valves (M2_Valves)</option>
            </select>
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
            • LD Cycle: 10 ms • R08CPU Sequence Engine
          </span>
        </div>

        {/* Right buttons: Download | Monitor | Stop matching screenshot */}
        <div className="flex items-center gap-2">
          {/* Download Button */}
          <button
            onClick={() => setDownloadModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {/* Monitor Active Button (Blue in screenshot) */}
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-xs ${
              isMonitoring
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isMonitoring ? 'animate-pulse' : ''}`} />
            <span>{isMonitoring ? 'Monitoring' : 'Monitor'}</span>
          </button>

          {/* Stop / Run Toggle */}
          <button
            onClick={() => setPlcRunState(plcRunState === 'RUN' ? 'STOP' : 'RUN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition border ${
              plcRunState === 'RUN'
                ? 'border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                : 'border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50'
            }`}
          >
            {plcRunState === 'RUN' ? (
              <>
                <Square className="w-3 h-3 fill-rose-600" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-emerald-600" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Programming View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (3 Cols): Project Tree matching GX Works3 layout */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm text-xs font-mono">
          <div className="pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Project Navigation
            </span>
            <span className="text-[10px] text-slate-400">R08CPU</span>
          </div>

          <div className="space-y-3">
            {/* Category 1: Programs */}
            <div>
              <div
                onClick={() =>
                  setTreeExpanded((prev) => ({ ...prev, programs: !prev.programs }))
                }
                className="cursor-pointer flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 py-0.5 hover:text-cyan-600"
              >
                {treeExpanded.programs ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <Folder className="w-3.5 h-3.5 text-amber-500" />
                <span>Programs</span>
              </div>

              {treeExpanded.programs && (
                <div className="pl-4 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-2">
                  <div className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                    <span>Main Program</span>
                  </div>

                  <div className="pl-4 space-y-1">
                    <div
                      onClick={() => setSelectedProgramId('main')}
                      className={`cursor-pointer px-2 py-1 rounded flex items-center gap-1.5 ${
                        selectedProgramId === 'main'
                          ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-500/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>M0_Main</span>
                    </div>

                    <div
                      onClick={() => setSelectedProgramId('pumps')}
                      className={`cursor-pointer px-2 py-1 rounded flex items-center gap-1.5 ${
                        selectedProgramId === 'pumps'
                          ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-500/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>M1_Pumps</span>
                    </div>

                    <div
                      onClick={() => setSelectedProgramId('valves')}
                      className={`cursor-pointer px-2 py-1 rounded flex items-center gap-1.5 ${
                        selectedProgramId === 'valves'
                          ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-500/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>M2_Valves</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category 2: Function Blocks */}
            <div>
              <div
                onClick={() =>
                  setTreeExpanded((prev) => ({ ...prev, functionBlocks: !prev.functionBlocks }))
                }
                className="cursor-pointer flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 py-0.5 hover:text-cyan-600"
              >
                {treeExpanded.functionBlocks ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <Folder className="w-3.5 h-3.5 text-cyan-500" />
                <span>Function Blocks</span>
              </div>

              {treeExpanded.functionBlocks && (
                <div className="pl-5 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-2">
                  <div className="text-slate-600 dark:text-slate-400 px-2 py-0.5">
                    FB_TankControl
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 px-2 py-0.5">
                    FB_Alarm
                  </div>
                </div>
              )}
            </div>

            {/* Category 3: Data / Registers */}
            <div>
              <div
                onClick={() =>
                  setTreeExpanded((prev) => ({ ...prev, data: !prev.data }))
                }
                className="cursor-pointer flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 py-0.5 hover:text-cyan-600"
              >
                {treeExpanded.data ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <Folder className="w-3.5 h-3.5 text-purple-500" />
                <span>Data</span>
              </div>

              {treeExpanded.data && (
                <div className="pl-5 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-2">
                  <div className="text-slate-600 dark:text-slate-400 px-2 py-0.5 flex justify-between">
                    <span>D0</span>
                    <span className="text-[10px] text-slate-400">Level SP</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 px-2 py-0.5 flex justify-between">
                    <span>D1</span>
                    <span className="text-[10px] text-slate-400">Booster Hz</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 px-2 py-0.5 flex justify-between">
                    <span>D2</span>
                    <span className="text-[10px] text-slate-400">Pressure SP</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (9 Cols): Interactive Ladder Logic Canvas matching screenshot */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm overflow-x-auto">
          {/* Canvas Subtitle */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {activeProgram.name} • {activeProgram.rungs.length} Rungs Active
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE LOGIC MONITOR
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 text-[11px]">
                {plcRunState === 'RUN' ? 'PLC IN RUN MODE' : 'PLC STOPPED'}
              </span>
            </div>
          </div>

          {/* Ladder Diagram Grid */}
          <div className="min-w-[650px] relative border-l-4 border-r-4 border-slate-400 dark:border-slate-600 px-6 py-4 space-y-7 bg-slate-50/50 dark:bg-slate-950/40 rounded">
            {activeProgram.rungs.map((rung) => {
              const coilEnergized = isCoilEnergized(rung);

              return (
                <div key={rung.rungNumber} className="relative group">
                  {/* Rung Number on Left */}
                  <div className="absolute -left-6 top-3 text-[11px] font-mono font-bold text-slate-400">
                    {rung.rungNumber}
                  </div>

                  {/* Comment Bar */}
                  {rung.comment && (
                    <div className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 mb-1 pl-4">
                      ; {rung.comment}
                    </div>
                  )}

                  {/* Rung Horizontal Power Line */}
                  <div className="relative flex items-center justify-between py-2">
                    {/* Background Rung Line */}
                    <div
                      className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 transition-colors duration-300 ${
                        coilEnergized
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />

                    {/* Series Contacts on Left Side */}
                    <div className="relative z-10 flex items-center gap-6 bg-slate-50 dark:bg-slate-900 px-2">
                      {rung.contacts.map((contact) => {
                        const contactActive = isContactEnergized(
                          contact.address,
                          contact.energized ?? false
                        );
                        const isConducting =
                          contact.type === 'NC' ? !contactActive : contactActive;

                        return (
                          <div
                            key={contact.id}
                            className="flex flex-col items-center select-none"
                            title={`Contact ${contact.address}: ${contact.label} (${
                              contactActive ? 'Active' : 'Inactive'
                            })`}
                          >
                            {/* Contact Tag Name */}
                            <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                              {contact.address}
                            </span>

                            {/* Contact Symbol — GX Works Style */}
                            <div
                              className={`my-0.5 px-1 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                                isConducting
                                  ? 'text-emerald-500 scale-105 drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]'
                                  : 'text-slate-500'
                              }`}
                            >
                              {contact.type === 'NC' ? (
                                <span>--[/]--</span>
                              ) : (
                                <span>--[ ]--</span>
                              )}
                            </div>

                            {/* Contact Label */}
                            <span className="text-[8.5px] font-mono text-slate-500 max-w-[90px] truncate text-center">
                              {contact.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Output Coils on Right Side */}
                    <div className="relative z-10 flex items-center gap-6 bg-slate-50 dark:bg-slate-900 px-2">
                      {rung.coils.map((coil) => (
                        <div
                          key={coil.id}
                          className="flex flex-col items-center select-none"
                          title={`Output Coil ${coil.address}: ${coil.label}`}
                        >
                          <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                            {coil.address}
                          </span>

                          {/* Output Coil Symbol — GX Works Style */}
                          <div
                            className={`my-0.5 px-2 py-0.5 rounded text-xs font-mono font-black transition-all ${
                              coilEnergized
                                ? 'text-emerald-500 scale-105 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]'
                                : 'text-slate-500'
                            }`}
                          >
                            <span>--( )--</span>
                          </div>

                          <span className="text-[8.5px] font-mono text-slate-500 max-w-[100px] truncate text-center">
                            {coil.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Ladder Engine: Mitsubishi IEC 61131-3 LD Grammar</span>
            <span>Energized contacts highlighted in emerald green</span>
          </div>
        </div>
      </div>

      {/* Safety Download Warning Modal */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold">Industrial Safety Restriction</h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              Direct physical downloading of compiled ladder logic to the Mitsubishi R08CPU requires certified manufacturer engineering authentication via MELSOFT GX Works3.
            </p>

            <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 space-y-1 mb-4">
              <div>• Physical PLC Connection: Read-Only Telemetry Mode</div>
              <div>• Safety Interlocks: Hardwired SIL-2 / E-Stop Active</div>
              <div>• To compile changes: Export logic file and open in GX Works3</div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-mono">
              <button
                onClick={() => setDownloadModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
