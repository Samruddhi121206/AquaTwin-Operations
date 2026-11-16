import React from 'react';
import { PanelComponent } from '../../../types/io';
import { usePlant } from '../../../context/PlantContext';
import { SimulatedBadge } from '../../shared/SimulatedBadge';
import { Info, Power, ToggleLeft, ToggleRight } from 'lucide-react';

interface InfoPanelProps {
  selectedCallout: PanelComponent | null;
  onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ selectedCallout, onClose }) => {
  const { togglePump, telemetry } = usePlant();

  if (!selectedCallout) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
        <Info className="w-8 h-8 mb-2 opacity-50" />
        <span>Click any component or numbered callout to inspect technical specifications</span>
      </div>
    );
  }

  const renderVirtualControls = () => {
    if (selectedCallout.kind === 'CONTACTOR' || selectedCallout.kind === 'DRIVE') {
        const isRunning = selectedCallout.linkedEquipment.some(tag => {
            const prop = `${tag.toLowerCase().replace('-', '')}_running` as keyof typeof telemetry;
            return telemetry[prop];
        });
        return (
            <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-700">
                <span className="text-xs font-semibold text-slate-200 block mb-2">Virtual Controls</span>
                <button
                  onClick={() => selectedCallout.linkedEquipment.forEach(tag => togglePump(tag as any))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${isRunning ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
                >
                    {isRunning ? <ToggleRight className="w-4 h-4"/> : <ToggleLeft className="w-4 h-4"/>}
                    {isRunning ? 'Stop Equipment' : 'Start Equipment'}
                </button>
            </div>
        )
    }
    return null;
  };

  return (
    <div className="mt-4 space-y-4 text-xs overflow-y-auto flex-1">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {selectedCallout.name}
          </span>
          <SimulatedBadge verified={selectedCallout.verified} />
        </div>
        <p className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
          {selectedCallout.manufacturer} · {selectedCallout.model}
        </p>
      </div>

      {renderVirtualControls()}

      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Electrical Specifications:
        </span>
        <div className="grid grid-cols-1 gap-1 font-mono text-[11px]">
          {Object.entries(selectedCallout.specs).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-slate-200 dark:border-slate-700/40 pb-0.5">
              <span className="text-slate-500">{k}:</span>
              <span className="text-slate-900 dark:text-slate-200 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Connected I/O Channels:
        </span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {selectedCallout.linkedChannels.length > 0 ? (
            selectedCallout.linkedChannels.map((ch) => (
              <span
                key={ch}
                className="px-2 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded font-mono text-[10px]"
              >
                {ch}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-400">None (Power / Safety Hardware)</span>
          )}
        </div>
      </div>

      <div>
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Linked Process Equipment:
        </span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {selectedCallout.linkedEquipment.map((eq) => (
            <span
              key={eq}
              className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px]"
            >
              {eq}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20 text-[11px] text-slate-600 dark:text-slate-400">
        <span className="font-semibold text-cyan-700 dark:text-cyan-300">
          Engineering Trace Note:
        </span>
        <p className="mt-1">
          Linked to the unified Virtual PLC I/O mapping model. Clicking this component in Wiring View reveals the physical wire path and terminal terminations.
        </p>
      </div>
    </div>
  );
};
