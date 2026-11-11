/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import { WorkOrderItem } from '../../../types/plant';
import {
  Wrench,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Filter,
  User,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const { workOrders, createWorkOrder, updateWorkOrderStatus, equipmentList } = usePlant();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState<boolean>(false);

  // New Work Order Form State
  const [title, setTitle] = useState('');
  const [equipmentTag, setEquipmentTag] = useState('RO-201');
  const [priority, setPriority] = useState<WorkOrderItem['priority']>('medium');
  const [assignedTo, setAssignedTo] = useState('M. Chen (Mechanical Lead)');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [type, setType] = useState<WorkOrderItem['type']>('preventive');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(3.0);

  const filteredOrders = workOrders.filter((w) =>
    statusFilter === 'all' ? true : w.status === statusFilter
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createWorkOrder({
      title,
      equipmentTag,
      priority,
      status: 'open',
      assignedTo,
      dueDate,
      type,
      description,
      estimatedHours,
    });
    setShowModal(false);
    setTitle('');
    setDescription('');
  };

  // Preventive Maintenance Schedules (PM)
  const pmSchedules = [
    {
      id: 'PM-101',
      title: 'F-201 & F-202 Cartridge Replacement',
      tag: 'F-201',
      frequency: 'Every 1,000 Operating Hours',
      remainingHours: 150,
      dueDate: '2026-11-20',
      criticality: 'High',
    },
    {
      id: 'PM-102',
      title: 'P-202 Axial Piston Pump Seal Flush & Oil Analysis',
      tag: 'P-202',
      frequency: 'Quarterly (2,000 Hours)',
      remainingHours: 390,
      dueDate: '2026-12-05',
      criticality: 'Critical',
    },
    {
      id: 'PM-103',
      title: 'RO-201 Clean-In-Place (CIP) Chemical Descaling Wash',
      tag: 'RO-201',
      frequency: 'Every 90 Days or when DP > 1.2 bar',
      remainingHours: 620,
      dueDate: '2026-12-18',
      criticality: 'Medium',
    },
    {
      id: 'PM-104',
      title: 'pH & Conductivity Transmitters 2-Point Calibration',
      tag: 'Water Quality',
      frequency: 'Monthly Routine',
      remainingHours: 85,
      dueDate: '2026-11-18',
      criticality: 'High',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Preventive Maintenance (PM) Status Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Preventive Maintenance (PM) Schedule & Equipment Overhaul Clock
            </h3>
          </div>
          <span className="text-xs text-slate-500">Asset Life Extension Matrix</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
          {pmSchedules.map((pm) => (
            <div
              key={pm.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{pm.tag}</span>
                  <span
                    className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                      pm.criticality === 'Critical'
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600'
                        : pm.criticality === 'High'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {pm.criticality}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{pm.title}</h4>
                <p className="text-[11px] text-slate-500">{pm.frequency}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-500" />
                  {pm.remainingHours} hrs remaining
                </span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  Due: {pm.dueDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Orders Management Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Work Orders & Maintenance Tickets
          </h3>
          <span className="text-xs text-slate-400 font-mono">({filteredOrders.length})</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Work Orders</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Work Order</span>
          </button>
        </div>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((wo) => (
          <div
            key={wo.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{wo.id}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono font-medium text-slate-600 dark:text-slate-300">
                    {wo.equipmentTag}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    wo.priority === 'critical'
                      ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600'
                      : wo.priority === 'high'
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {wo.priority}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                {wo.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                {wo.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {wo.assignedTo}
                </span>
                <span>Due: {wo.dueDate}</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Status:</span>
                <select
                  value={wo.status}
                  onChange={(e) => updateWorkOrderStatus(wo.id, e.target.value as any)}
                  className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Work Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Create Preventive / Corrective Work Order
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
                placeholder="e.g. Replace Cartridge Filter Elements..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Target Equipment
                </label>
                <select
                  value={equipmentTag}
                  onChange={(e) => setEquipmentTag(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {equipmentList.map((eq) => (
                    <option key={eq.tag} value={eq.tag}>
                      {eq.tag} — {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Lead
                </label>
                <input
                  type="text"
                  required
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Detailed Scope of Maintenance
              </label>
              <textarea
                rows={3}
                required
                placeholder="Step by step isolation procedure, part numbers, and torque requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Create Work Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
