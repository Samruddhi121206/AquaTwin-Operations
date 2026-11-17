/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePlant } from '../../context/PlantContext';
import type { ModuleType } from '../../types/plant';
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

type PlantTab = 'process' | 'simulation' | 'equipment' | 'maintenance' | 'alarms';

interface SubTabNavProps {
  plantTab: PlantTab;
  setPlantTab: (tab: PlantTab) => void;
  unackCount: number;
}

const SubTabNav: React.FC<SubTabNavProps> = ({ plantTab, setPlantTab, unackCount }) => {
  const tabs: { key: PlantTab; icon: typeof Workflow; label: string }[] = [
    { key: 'process', icon: Workflow, label: 'Skid Elevation' },
    { key: 'simulation', icon: Cpu, label: 'Tank & Twin Physics' },
    { key: 'equipment', icon: Layers, label: 'Equipment Assets' },
    { key: 'maintenance', icon: Wrench, label: 'Maintenance' },
    { key: 'alarms', icon: AlertTriangle, label: `Alarms (${unackCount})` },
  ];

  return (
    <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
      {tabs.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setPlantTab(key)}
          className={`btn relative px-3 py-1.5 font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
            plantTab === key
              ? 'text-cyan-700 dark:text-cyan-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {plantTab === key && (
            <motion.span
              layoutId="plant-tab-indicator"
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0 rounded-lg bg-cyan-500/15 border border-cyan-500/30"
            />
          )}
          <Icon className="relative w-3.5 h-3.5" />
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  );
};

const plantTabForModule = (m: ModuleType): PlantTab => {
  switch (m) {
    case 'alarms':
      return 'alarms';
    case 'equipment':
      return 'equipment';
    case 'maintenance':
      return 'maintenance';
    case 'twin':
      return 'simulation';
    default:
      return 'process';
  }
};

export const PlantView: React.FC = () => {
  const { alarms, activeModule } = usePlant();
  const [plantTab, setPlantTab] = useState<PlantTab>(() => plantTabForModule(activeModule));

  useEffect(() => {
    setPlantTab(plantTabForModule(activeModule));
  }, [activeModule]);
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
            <div className="flex-1 min-w-0 [&>div]:border-b-0 [&>div]:pb-0">
              <SubTabNav plantTab={plantTab} setPlantTab={setPlantTab} unackCount={unackAlarms.length} />
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
