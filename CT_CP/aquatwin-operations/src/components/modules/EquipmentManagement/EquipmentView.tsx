/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import { EquipmentSpec } from '../../../types/plant';
import {
  Search,
  Filter,
  Layers,
  Wrench,
  Power,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  X,
  Gauge,
  Calendar,
  Building2,
} from 'lucide-react';

export const EquipmentView: React.FC = () => {
  const { equipmentList, updateEquipmentStatus, createWorkOrder, setActiveModule } = usePlant();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEquip, setSelectedEquip] = useState<EquipmentSpec | null>(null);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState<boolean>(false);
  const [woTitle, setWoTitle] = useState('');
  const [woPriority, setWoPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [woDescription, setWoDescription] = useState('');

  // Filtered equipment list
  const filtered = equipmentList.filter((eq) => {
    const matchesSearch =
      eq.tag.toLowerCase().includes(search.toLowerCase()) ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || eq.stage === stageFilter;
    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
    return matchesSearch && matchesStage && matchesStatus;
  });

  const handleOpenWorkOrder = (eq: EquipmentSpec) => {
    setSelectedEquip(eq);
    setWoTitle(`Preventive Service: ${eq.tag} (${eq.name})`);
    setWoDescription(`Routine scheduled mechanical and electrical check for ${eq.tag}. Review runtime hours (${eq.runtimeHours} hrs) and vibration levels.`);
    setShowWorkOrderModal(true);
  };

  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquip) return;

    createWorkOrder({
      title: woTitle,
      equipmentTag: selectedEquip.tag,
      priority: woPriority,
      status: 'open',
      assignedTo: 'Field Technician',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      type: 'preventive',
      description: woDescription,
      estimatedHours: 2.5,
    });

    setShowWorkOrderModal(false);
    setActiveModule('maintenance');
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search equipment by tag (P-101), name or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Filter selects */}
        <div className="flex items-center gap-3 w-full md:w-auto text-xs">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Process Stages</option>
            <option value="Pre-treatment">Pre-treatment</option>
            <option value="Filtration">Filtration</option>
            <option value="High Pressure RO">High Pressure RO</option>
            <option value="Storage & Distribution">Storage & Distribution</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="running">Running Active</option>
            <option value="standby">Standby</option>
            <option value="maintenance">Maintenance</option>
            <option value="tripped">Tripped</option>
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4">Equipment Name</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Health</th>
                <th className="py-3 px-4 text-right">Runtime</th>
                <th className="py-3 px-4">Thermal / Vib</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((eq) => (
                <tr
                  key={eq.tag}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    {eq.tag}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                    <div>{eq.name}</div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      {eq.manufacturer} · {eq.model}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {eq.stage}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        eq.status === 'running'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : eq.status === 'standby'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          : eq.status === 'maintenance'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          eq.status === 'running'
                            ? 'bg-emerald-500'
                            : eq.status === 'standby'
                            ? 'bg-slate-400'
                            : eq.status === 'maintenance'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="capitalize">{eq.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${eq.healthScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {eq.healthScore}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {eq.runtimeHours.toLocaleString()} hrs
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                    {eq.tempC ? `${eq.tempC}°C / ${eq.vibrationMms} mm/s` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedEquip(eq)}
                        className="px-2.5 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                      >
                        Specs
                      </button>
                      <button
                        onClick={() => handleOpenWorkOrder(eq)}
                        className="px-2.5 py-1 text-xs rounded bg-cyan-50 dark:bg-cyan-950/30 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 transition flex items-center gap-1"
                        title="Create Work Order"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Work Order</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment Specs Modal */}
      {selectedEquip && !showWorkOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm px-2.5 py-1 rounded bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                  {selectedEquip.tag}
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {selectedEquip.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEquip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {selectedEquip.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Manufacturer</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEquip.manufacturer}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Model</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEquip.model}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Commissioned Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEquip.commissionedDate}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Runtime Total</span>
                <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                  {selectedEquip.runtimeHours.toLocaleString()} Operating Hours
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Technical Specifications
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedEquip.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1">
                    <span className="text-slate-500">{k}:</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  updateEquipmentStatus(
                    selectedEquip.tag,
                    selectedEquip.status === 'running' ? 'standby' : 'running'
                  );
                  setSelectedEquip(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition"
              >
                Toggle Standby / Running
              </button>
              <button
                onClick={() => handleOpenWorkOrder(selectedEquip)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Create Maintenance Work Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Work Order Modal */}
      {showWorkOrderModal && selectedEquip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateWorkOrder}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Generate Maintenance Work Order — {selectedEquip.tag}
              </h3>
              <button
                type="button"
                onClick={() => setShowWorkOrderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Work Order Title
              </label>
              <input
                type="text"
                required
                value={woTitle}
                onChange={(e) => setWoTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Priority
                </label>
                <select
                  value={woPriority}
                  onChange={(e) => setWoPriority(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical (Immediate)</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Target Tag
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedEquip.tag}
                  className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Detailed Scope of Work & Procedures
              </label>
              <textarea
                rows={3}
                required
                value={woDescription}
                onChange={(e) => setWoDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowWorkOrderModal(false)}
                className="px-4 py-2 font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Issue Work Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
