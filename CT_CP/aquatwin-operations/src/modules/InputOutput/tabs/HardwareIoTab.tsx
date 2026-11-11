/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExtendedPlcTag, PlcHardwareModule } from '../types';
import { TagEditorModal } from '../components/TagEditorModal';
import { PlcRackVisualizer } from '../components/PlcRackVisualizer';
import { SimulatedBadge } from '../../../components/shared/SimulatedBadge';
import { QualityIcon } from '../../../components/shared/QualityIcon';
import {
  Layers,
  Cpu,
  Download,
  Upload,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  SlidersHorizontal,
  Monitor,
  LayoutGrid,
} from 'lucide-react';

interface HardwareIoTabProps {
  modules: PlcHardwareModule[];
  tags: ExtendedPlcTag[];
  onUpdateTag: (updated: ExtendedPlcTag) => void;
}

export const HardwareIoTab: React.FC<HardwareIoTabProps> = ({ modules, tags, onUpdateTag }) => {
  const [selectedSlot, setSelectedSlot] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTag, setEditingTag] = useState<ExtendedPlcTag | null>(null);
  const [viewMode, setViewMode] = useState<'VISUAL_RACK' | 'BACKPLANE_CARDS'>('VISUAL_RACK');

  // Mapping of 8 switches on P1-08SIM to Digital Input tags
  const SIM_SWITCH_TAG_MAP: Record<number, string> = {
    1: 'P101_RUN_FB',
    2: 'P101_TRIP',
    3: 'P201_RUN_FB',
    4: 'XV101_OPEN_FB',
    5: 'XV101_CLOSE_FB',
    6: 'TK101_LSH',
    7: 'TK101_LSL',
  };

  const handleToggleSimulatorSwitch = (channel: number, value: boolean) => {
    const targetTagId = SIM_SWITCH_TAG_MAP[channel];
    if (targetTagId) {
      const targetTag = tags.find((t) => t.id === targetTagId);
      if (targetTag) {
        onUpdateTag({
          ...targetTag,
          currentValue: value,
          quality: 'SIMULATED',
          lastUpdate: 'Just now',
        });
      }
    }
  };

  const handleRackSelectSlot = (slot: number | string) => {
    if (slot === 'PWR' || slot === 'CPU') {
      setSelectedSlot(0); // Slot 0 CPU
    } else if (slot === 1) {
      setSelectedSlot(4); // Slot 4 DO Relay
    } else if (slot === 2) {
      setSelectedSlot(2); // Slot 2 DI
    } else if (slot === 3) {
      setSelectedSlot(2); // Slot 2 DI (Simulator)
    } else if (slot === 4) {
      setSelectedSlot(1); // Slot 1 AI
    } else if (typeof slot === 'number') {
      setSelectedSlot(slot);
    }
  };

  const filteredTags = tags.filter((t) => {
    if (selectedSlot !== 'ALL') {
      const parentModule = modules.find((m) => m.slot === selectedSlot);
      if (!parentModule || t.moduleId !== parentModule.id) return false;
    }
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

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Tag ID', 'Type', 'Address', 'Terminal', 'Signal', 'Description', 'RawMin', 'RawMax', 'EngMin', 'EngMax', 'Unit', 'Status'];
    const rows = tags.map((t) => [
      t.id,
      t.type,
      t.address,
      t.terminal,
      t.signal,
      `"${t.description}"`,
      t.scaling.rawMin,
      t.scaling.rawMax,
      t.scaling.engMin,
      t.scaling.engMax,
      t.scaling.unit,
      t.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AquaTwin_PLC_Tag_Mapping_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Visualizer Mode Header Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
            PLC Hardware Configuration & I/O Rack
          </span>
          <SimulatedBadge verified={false} text="CHASSIS BACKPLANE" />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('VISUAL_RACK')}
            className={`px-3 py-1 text-xs rounded-md font-mono font-medium flex items-center gap-1.5 transition ${
              viewMode === 'VISUAL_RACK'
                ? 'bg-cyan-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Interactive PLC Rack</span>
          </button>
          <button
            onClick={() => setViewMode('BACKPLANE_CARDS')}
            className={`px-3 py-1 text-xs rounded-md font-mono font-medium flex items-center gap-1.5 transition ${
              viewMode === 'BACKPLANE_CARDS'
                ? 'bg-cyan-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Chassis Slot Cards</span>
          </button>
        </div>
      </div>

      {/* 1. Interactive PLC Rack Visualizer (Productivity1000 Reference) */}
      {viewMode === 'VISUAL_RACK' && (
        <PlcRackVisualizer
          tags={tags}
          onToggleSimulatorSwitch={handleToggleSimulatorSwitch}
          onSelectSlot={handleRackSelectSlot}
          onSelectTagForEdit={(tagId) => {
            const found = tags.find((t) => t.id === tagId);
            if (found) setEditingTag(found);
          }}
        />
      )}

      {/* 2. Alternative Chassis Slot Architecture Grid */}
      {viewMode === 'BACKPLANE_CARDS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  PLC Hardware Rack & Expansion Slots (Rack 0)
                </h3>
                <SimulatedBadge verified={false} text="CHASSIS BACKPLANE" />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Click a module slot to filter associated hardware I/O channels below
              </p>
            </div>

            <button
              onClick={() => setSelectedSlot('ALL')}
              className={`px-3 py-1 text-xs rounded-lg font-mono font-medium transition ${
                selectedSlot === 'ALL'
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Show All Slots ({modules.length})
            </button>
          </div>

          {/* Rack Slots Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
            {modules.map((m) => {
              const isSelected = selectedSlot === m.slot;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedSlot(m.slot)}
                  className={`cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-md scale-102'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>SLOT {m.slot}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
                      {m.model}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{m.type}</span>
                    <span>{m.channelsCount} Ch</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Channel Mapping Table & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tag ID, address, or terminal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs w-60"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredTags.length} Channels Mapped
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-mono flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-[10px] uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Tag Identifier</th>
                <th className="py-3 px-3">Module Slot</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-3">PLC Address</th>
                <th className="py-3 px-3">Signal</th>
                <th className="py-3 px-3">Terminal</th>
                <th className="py-3 px-4">Scaling / Range</th>
                <th className="py-3 px-3 text-right">Live Value</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">
                      {tag.id}
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans truncate max-w-xs">
                      {tag.description}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {tag.moduleId} (Ch {tag.channelIndex})
                  </td>

                  <td className="py-3 px-2">
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

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {tag.signal}
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {tag.terminal}
                  </td>

                  <td className="py-3 px-4 text-slate-500">
                    {tag.scaling.mode === 'LINEAR'
                      ? `${tag.scaling.engMin}..${tag.scaling.engMax} ${tag.scaling.unit} (0..${tag.scaling.rawMax})`
                      : 'Discrete 0/1'}
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                    {typeof tag.currentValue === 'boolean'
                      ? tag.currentValue
                        ? 'TRUE (1)'
                        : 'FALSE (0)'
                      : `${Number(tag.currentValue).toFixed(1)} ${tag.scaling.unit || ''}`}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tag.status === 'VERIFIED'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : tag.status === 'CONFIGURED'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {tag.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setEditingTag(tag)}
                      className="p-1 rounded text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
                      title="Edit tag calibration"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tag Editor Modal */}
      {editingTag && (
        <TagEditorModal
          tag={editingTag}
          onSave={onUpdateTag}
          onClose={() => setEditingTag(null)}
        />
      )}
    </div>
  );
};

