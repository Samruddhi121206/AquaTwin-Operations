/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../context/PlantContext';
import { PidDiagram } from '../../components/modules/LiveOperations/PidDiagram';
import { LiveBottomTabs } from '../../components/modules/LiveOperations/LiveBottomTabs';
import { DigitalTwinView } from '../../components/modules/DigitalTwin/DigitalTwinView';
import { EquipmentView } from '../../components/modules/EquipmentManagement/EquipmentView';
import { AlarmsView } from '../../components/modules/AlarmsEvents/AlarmsView';
import { MaintenanceView } from '../../components/modules/Maintenance/MaintenanceView';
import {
  Workflow,
  Cpu,
  Layers,
  AlertTriangle,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SubTabNavProps {
  plantTab: 'process' | 'simulation' | 'equipment' | 'maintenance' | 'alarms';
  setPlantTab: (tab: 'process' | 'simulation' | 'equipment' | 'maintenance' | 'alarms') => void;
  unackCount: number;
}

const SubTabNav: React.FC<SubTabNavProps> = ({ plantTab, setPlantTab, unackCount }) => (
  <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
    <button
      onClick={() => setPlantTab('process')}
      className={`px-3 py-1.5 font-medium rounded-lg transition flex items-center gap-1.5 ${
        plantTab === 'process'
          ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
      }`}
    >
      <Workflow className="w-3.5 h-3.5" />
      <span>Skid Elevation</span>
    </button>
    <button
      onClick={() => setPlantTab('simulation')}
      className={`px-3 py-1.5 font-medium rounded-lg transition flex items-center gap-1.5 ${
        plantTab === 'simulation'
          ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
      }`}
    >
      <Cpu className="w-3.5 h-3.5" />
      <span>Dynamic Tank & Twin Physics</span>
    </button>
    <button
      onClick={() => setPlantTab('equipment')}
      className={`px-3 py-1.5 font-medium rounded-lg transition flex items-center gap-1.5 ${
        plantTab === 'equipment'
          ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
      }`}
    >
      <Layers className="w-3.5 h-3.5" />
      <span>Equipment Assets</span>
    </button>
    <button
      onClick={() => setPlantTab('maintenance')}
      className={`px-3 py-1.5 font-medium rounded-lg transition flex items-center gap-1.5 ${
        plantTab === 'maintenance'
          ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
      }`}
    >
      <Wrench className="w-3.5 h-3.5" />
      <span>Maintenance & Work Orders</span>
    </button>
    <button
      onClick={() => setPlantTab('alarms')}
      className={`px-3 py-1.5 font-medium rounded-lg transition flex items-center gap-1.5 ${
        plantTab === 'alarms'
          ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
      }`}
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      <span>Active Alarms ({unackCount})</span>
    </button>
  </div>
);

export const PlantView: React.FC = () => {
  const { alarms } = usePlant();
  const [plantTab, setPlantTab] = useState<'process' | 'simulation' | 'equipment' | 'maintenance' | 'alarms'>('process');
  const [showBottomDiagnostics, setShowBottomDiagnostics] = useState<boolean>(false);

  const unackAlarms = alarms.filter((a) => !a.acknowledged);

  return (
    <div className="space-y-3">
      {/* Main Operational View */}
      {plantTab === 'process' && (
        <div className="space-y-3">
          {/* Main Front Elevation Digital Twin Card (matches user screenshot) */}
          <PidDiagram />

          {/* Secondary Diagnostics Drawer & Module Tabs */}
          <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setPlantTab('process')}
                className="px-3 py-1 font-semibold rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5"
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Skid Elevation</span>
              </button>

              <button
                onClick={() => setPlantTab('simulation')}
                className="px-3 py-1 font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 transition"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Tank & Twin Physics</span>
              </button>

              <button
                onClick={() => setPlantTab('equipment')}
                className="px-3 py-1 font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 transition"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Equipment Assets</span>
              </button>

              <button
                onClick={() => setPlantTab('maintenance')}
                className="px-3 py-1 font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 transition"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Maintenance</span>
              </button>

              <button
                onClick={() => setPlantTab('alarms')}
                className="px-3 py-1 font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Alarms ({unackAlarms.length})</span>
              </button>
            </div>

            <button
              onClick={() => setShowBottomDiagnostics(!showBottomDiagnostics)}
              className="flex items-center gap-1 px-3 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition text-[11px] font-medium cursor-pointer"
            >
              <span>{showBottomDiagnostics ? 'Hide Telemetry Drawer' : 'Show Telemetry Drawer'}</span>
              {showBottomDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showBottomDiagnostics && <LiveBottomTabs />}
        </div>
      )}

      {/* Dynamic Tank Physics & What-If Scenarios */}
      {plantTab === 'simulation' && (
        <div className="space-y-3">
          <SubTabNav plantTab={plantTab} setPlantTab={setPlantTab} unackCount={unackAlarms.length} />
          <DigitalTwinView />
        </div>
      )}

      {/* Equipment Registry */}
      {plantTab === 'equipment' && (
        <div className="space-y-3">
          <SubTabNav plantTab={plantTab} setPlantTab={setPlantTab} unackCount={unackAlarms.length} />
          <EquipmentView />
        </div>
      )}

      {/* Maintenance & Work Orders */}
      {plantTab === 'maintenance' && (
        <div className="space-y-3">
          <SubTabNav plantTab={plantTab} setPlantTab={setPlantTab} unackCount={unackAlarms.length} />
          <MaintenanceView />
        </div>
      )}

      {/* Alarms & Events Management */}
      {plantTab === 'alarms' && (
        <div className="space-y-3">
          <SubTabNav plantTab={plantTab} setPlantTab={setPlantTab} unackCount={unackAlarms.length} />
          <AlarmsView />
        </div>
      )}
    </div>
  );
};

