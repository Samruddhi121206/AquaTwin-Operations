/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlcHardwareModule, ExtendedPlcTag, CatalogueModuleItem } from '../types';
import { MITSUBISHI_CATALOGUE } from '../ioData';
import { MitsubishiRackVisualizer } from '../components/MitsubishiRackVisualizer';
import { TagEditorModal } from '../components/TagEditorModal';
import {
  Layers,
  Cpu,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Search,
  Filter,
  Sliders,
  Info,
  SlidersHorizontal,
  ChevronRight,
  Download,
  AlertCircle,
} from 'lucide-react';

interface HardwareConfigTabProps {
  modules: PlcHardwareModule[];
  tags: ExtendedPlcTag[];
  onUpdateModules: (updated: PlcHardwareModule[]) => void;
  onUpdateTag: (updated: ExtendedPlcTag) => void;
}

export const HardwareConfigTab: React.FC<HardwareConfigTabProps> = ({
  modules,
  tags,
  onUpdateModules,
  onUpdateTag,
}) => {
  const [activeSubNav, setActiveSubNav] = useState<'MODULES' | 'IO_MAPPING' | 'COMMUNICATION'>('MODULES');
  const [selectedSlot, setSelectedSlot] = useState<number | 'POW' | null>(3); // Default to Analog Input R60AD8 as in screenshot
  const [showCatalogue, setShowCatalogue] = useState<boolean>(false);
  const [catalogueSearch, setCatalogueSearch] = useState<string>('');
  const [catalogueCategory, setCatalogueCategory] = useState<string>('ALL');
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<ExtendedPlcTag | null>(null);

  // Selected module lookup
  const selectedModule =
    selectedSlot === 'POW'
      ? {
          id: 'SLOT-POW',
          slot: -1,
          name: 'Power Supply Module',
          model: 'R61P',
          type: 'POW' as const,
          channelsCount: 0,
          signalTypes: ['100-240VAC', '5VDC'],
          status: 'HEALTHY' as const,
          addressRange: 'Internal Power Bus',
          specs: {
            'Input Voltage': '100 - 240V AC (50/60 Hz)',
            'Output Voltage': '5V DC',
            'Output Current': '6.5 A (Maximum internal logic bus supply)',
            'Alarm Contact': 'Form-A dry contact (24VDC 0.5A)',
            'Signature': 'Vibrant red lower bezel swing-down door',
          },
        }
      : modules.find((m) => m.slot === selectedSlot) || modules[3];

  const handleSaveConfig = () => {
    setSaveBanner('Configuration saved successfully to plant controller configuration database.');
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handleAddModuleFromCatalogue = (catItem: CatalogueModuleItem) => {
    // Find first empty slot among slots 1 to 7
    const usedSlots = modules.map((m) => m.slot);
    let targetSlot = 5;
    for (let s = 1; s <= 7; s++) {
      if (!usedSlots.includes(s)) {
        targetSlot = s;
        break;
      }
    }

    const newModule: PlcHardwareModule = {
      id: `SLOT-${targetSlot}-${catItem.category.substring(0, 2).toUpperCase()}`,
      slot: targetSlot,
      name: catItem.name,
      model: catItem.model,
      type:
        catItem.category === 'Digital Input'
          ? 'DI'
          : catItem.category === 'Digital Output'
          ? 'DO'
          : catItem.category === 'Analog Input'
          ? 'AI'
          : catItem.category === 'Analog Output'
          ? 'AO'
          : 'COMM',
      channelsCount: catItem.channels,
      signalTypes: [catItem.signalType],
      status: 'HEALTHY',
      addressRange: `Slot ${targetSlot} Reserved`,
      specs: {
        'Category': catItem.category,
        'Terminal': catItem.terminalType,
        'Current 5V': catItem.currentConsumption5V,
        'Description': catItem.description,
      },
    };

    onUpdateModules([...modules, newModule]);
    setSelectedSlot(targetSlot);
    setShowCatalogue(false);
  };

  const filteredCatalogue = MITSUBISHI_CATALOGUE.filter((item) => {
    if (catalogueCategory !== 'ALL' && item.category !== catalogueCategory) return false;
    if (
      catalogueSearch &&
      !item.model.toLowerCase().includes(catalogueSearch.toLowerCase()) &&
      !item.name.toLowerCase().includes(catalogueSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Sub-Navigation Header matching user screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
        {/* Left Sub-nav pills: Modules | I/O Mapping | Communication */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubNav('MODULES')}
            className={`px-3 py-1 text-xs rounded-md font-mono font-medium transition ${
              activeSubNav === 'MODULES'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Modules
          </button>
          <button
            onClick={() => setActiveSubNav('IO_MAPPING')}
            className={`px-3 py-1 text-xs rounded-md font-mono font-medium transition ${
              activeSubNav === 'IO_MAPPING'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            I/O Mapping
          </button>
          <button
            onClick={() => setActiveSubNav('COMMUNICATION')}
            className={`px-3 py-1 text-xs rounded-md font-mono font-medium transition ${
              activeSubNav === 'COMMUNICATION'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Communication
          </button>
        </div>

        {/* Save Configuration Blue Button matching screenshot */}
        <div className="flex items-center gap-2">
          {saveBanner && (
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 animate-fadeIn">
              {saveBanner}
            </span>
          )}
          <button
            onClick={handleSaveConfig}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Workspace Layout matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (3 Cols): Configured Modules List */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono">
                Rack Modules
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {modules.length} Assigned
              </span>
            </div>

            {/* List of Module Items matching screenshot */}
            <div className="mt-3 space-y-2">
              {/* Power Supply Module */}
              <div
                onClick={() => setSelectedSlot('POW')}
                className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  selectedSlot === 'POW'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Power Supply
                  </div>
                  <div className="text-[10px] text-red-600 dark:text-red-400 font-mono">
                    R61P (100-240VAC)
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>

              {/* Configured Slots */}
              {modules.map((m) => {
                const isSelected = selectedSlot === m.slot;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedSlot(m.slot)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {m.name}
                      </div>
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                        {m.model}
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                        ✓
                      </div>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Module from Catalogue Button */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowCatalogue(true)}
              className="w-full py-2 rounded-lg border border-dashed border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add From Catalogue</span>
            </button>
          </div>
        </div>

        {/* Center Column (6 Cols): Interactive Mitsubishi Rack Visualizer */}
        <div className="lg:col-span-6 space-y-3">
          <MitsubishiRackVisualizer
            modules={modules}
            tags={tags}
            selectedSlot={selectedSlot}
            onSelectSlot={(slot) => setSelectedSlot(slot)}
            onOpenCatalogue={() => setShowCatalogue(true)}
          />

          {/* Slot Channel Summary Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Active Channel Mapping:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {tags.filter((t) => t.moduleId === `SLOT-${selectedSlot}-AI` || t.moduleId === `SLOT-${selectedSlot}-DI` || t.moduleId === `SLOT-${selectedSlot}-DO`).length} tags mapped to Slot {selectedSlot}
            </span>
          </div>
        </div>

        {/* Right Column (3 Cols): Module Details Card matching user screenshot */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono">
                Module Details
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-500/20">
                {selectedModule?.type || 'AI'}
              </span>
            </div>

            {/* Technical Parameters Table matching screenshot */}
            <div className="mt-3 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Module Type</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedModule?.name}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Model</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedModule?.model}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Channels</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedModule?.channelsCount}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Signal Type</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {selectedModule?.signalTypes?.join(', ') || '4-20 mA'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Range</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {selectedModule?.specs?.['Input Range'] || selectedModule?.specs?.['Output Voltage'] || '0-20 mA / 4-20 mA'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Addressing</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                  {selectedModule?.addressRange || 'D100 - D107'}
                </span>
              </div>
            </div>

            {/* Extra Specs */}
            {selectedModule?.specs && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Hardware Specs
                </span>
                {Object.entries(selectedModule.specs).map(([k, v]) => (
                  <div key={k} className="text-[11px] font-mono flex justify-between">
                    <span className="text-slate-500">{k}:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px] text-right">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                const matchingTag = tags.find((t) => t.moduleId === selectedModule?.id);
                if (matchingTag) setEditingTag(matchingTag);
              }}
              className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 transition"
            >
              Configure Calibration / Scaling
            </button>
          </div>
        </div>
      </div>

      {/* Module Catalogue Modal / Drawer */}
      {showCatalogue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-5 shadow-2xl max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Mitsubishi MELSEC Module Catalogue
                  </h3>
                </div>
                <button
                  onClick={() => setShowCatalogue(false)}
                  className="text-slate-400 hover:text-slate-200 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Filters */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search model number (e.g. RX40, R60AD)..."
                    value={catalogueSearch}
                    onChange={(e) => setCatalogueSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>

                <select
                  value={catalogueCategory}
                  onChange={(e) => setCatalogueCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300"
                >
                  <option value="ALL">All Categories</option>
                  <option value="CPU">CPU</option>
                  <option value="Digital Input">Digital Input</option>
                  <option value="Digital Output">Digital Output</option>
                  <option value="Analog Input">Analog Input</option>
                  <option value="Analog Output">Analog Output</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Communication">Communication</option>
                </select>
              </div>

              {/* Catalogue Cards Grid */}
              <div className="mt-3 space-y-2 overflow-y-auto max-h-[50vh] pr-1">
                {filteredCatalogue.map((catItem) => (
                  <div
                    key={catItem.model}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-cyan-500 bg-slate-50 dark:bg-slate-850 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {catItem.model}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-semibold">
                          {catItem.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {catItem.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {catItem.channels > 0 ? `${catItem.channels} Channels • ` : ''}
                        {catItem.signalType} • {catItem.terminalType}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddModuleFromCatalogue(catItem)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold shrink-0 transition"
                    >
                      Assign Slot
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowCatalogue(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calibration Editor Modal */}
      {editingTag && (
        <TagEditorModal
          tag={editingTag}
          onSave={(updated) => {
            onUpdateTag(updated);
            setEditingTag(null);
          }}
          onClose={() => setEditingTag(null)}
        />
      )}
    </div>
  );
};
