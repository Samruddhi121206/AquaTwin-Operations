/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../context/PlantContext';
import { useRuntimeMode } from '../../context/RuntimeModeContext';
import { ModeBanner } from '../../components/shared/ModeBanner';
import { SimulatedBadge } from '../../components/shared/SimulatedBadge';
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
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Activity,
  Droplets,
  RotateCcw,
  Play,
  Pause,
} from 'lucide-react';

export const PlantView: React.FC = () => {
  const {
    telemetry,
    isSimulating,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    resetSimulation,
    alarms,
  } = usePlant();
  const { plcHealth } = useRuntimeMode();

  const [plantTab, setPlantTab] = useState<'process' | 'simulation' | 'equipment' | 'maintenance' | 'alarms'>('process');

  const unackAlarms = alarms.filter((a) => !a.acknowledged);

  return (
    <div className="space-y-4">
      {/* Top Operating Mode Banner */}
      <ModeBanner />

      {/* Main Plant Navigation & Operating Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Plant Module — Process Operations & Tank Simulation
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PRIMARY OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive process flow from Raw Water Equalization Tank through Micro-filtration, High-Pressure RO & Permeate Buffer
            </p>
          </div>
        </div>

        {/* Plant Simulation Quick Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 border ${
              isSimulating
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause Engine' : 'Resume Engine'}</span>
          </button>

          <select
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(Number(e.target.value))}
            className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono"
          >
            <option value={0.5}>0.5x Speed</option>
            <option value={1}>1.0x Realtime</option>
            <option value={2}>2.0x Fast</option>
            <option value={5}>5.0x Accelerated</option>
          </select>

          <button
            onClick={resetSimulation}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Reset to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-Feature Tabs inside Plant Module */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 text-xs overflow-x-auto">
        <button
          onClick={() => setPlantTab('process')}
          className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-1.5 ${
            plantTab === 'process'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>Live Process & Tank Mimic</span>
        </button>

        <button
          onClick={() => setPlantTab('simulation')}
          className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-1.5 ${
            plantTab === 'simulation'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Dynamic Tank & Twin Physics</span>
        </button>

        <button
          onClick={() => setPlantTab('equipment')}
          className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-1.5 ${
            plantTab === 'equipment'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Equipment Assets</span>
        </button>

        <button
          onClick={() => setPlantTab('maintenance')}
          className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-1.5 ${
            plantTab === 'maintenance'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Maintenance & Work Orders</span>
        </button>

        <button
          onClick={() => setPlantTab('alarms')}
          className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-1.5 ${
            plantTab === 'alarms'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Active Plant Alarms ({unackAlarms.length})</span>
        </button>
      </div>

      {/* Main Operational View */}
      {plantTab === 'process' && (
        <div className="space-y-4">
          {/* Main Process Mimic & Live P&ID Diagram */}
          <PidDiagram />

          {/* Bottom Tabs: Trends, Equipment, Sensor 4-20mA Diagnostics, Alarms, Command History */}
          <LiveBottomTabs />
        </div>
      )}

      {/* Dynamic Tank Physics & What-If Scenarios */}
      {plantTab === 'simulation' && <DigitalTwinView />}

      {/* Equipment Registry */}
      {plantTab === 'equipment' && <EquipmentView />}

      {/* Maintenance & Work Orders */}
      {plantTab === 'maintenance' && <MaintenanceView />}

      {/* Alarms & Events Management */}
      {plantTab === 'alarms' && <AlarmsView />}
    </div>
  );
};
