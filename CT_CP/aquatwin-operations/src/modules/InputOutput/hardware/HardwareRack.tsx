import React, { useLayoutEffect, useRef, useState } from 'react';
import { BASE_UNITS, BLANK_IMAGE, getModule, RackConfig, slotLabel } from './hardware';
import { canPlace } from './validation';
import { ModuleFace } from './PLCModule';

const H = 310;
const SLOT_W = (H * 69) / 227;
const PSU_W = (H * 93) / 227;
export type ViewMode = 'FRONT' | '3D' | 'REAL';

interface Props {
  config: RackConfig;
  selected: number;
  onSelect: (i: number) => void;
  onDrop: (i: number, model: string) => void;
  dragModel: string | null;
  view: ViewMode;
  zoom: number;
  fitSignal: number;
  onZoom: (z: number) => void;
  angle: number;
}

export const HardwareRack: React.FC<Props> = ({ config, selected, onSelect, onDrop, dragModel, view, zoom, fitSignal, onZoom, angle }) => {
  const box = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState<number | null>(null);
  const n = config.slots.length;
  const natW = PSU_W + (n - 1) * SLOT_W + 90; // + brackets/padding
  const natH = H + 100;

  // Fit to screen: on mount, base-unit change and Fit button.
  useLayoutEffect(() => {
    const w = box.current?.clientWidth;
    if (w) onZoom(Math.min(1.3, Math.max(0.4, (w - 8) / natW)));
  }, [fitSignal, n, view]); // eslint-disable-line react-hooks/exhaustive-deps

  if (view === 'REAL')
    return (
      <div ref={box} className="flex flex-1 flex-col items-center justify-center gap-2 overflow-auto bg-slate-100 p-3 dark:bg-slate-950">
        <img src="/assets/mitsubishi/melsec_iq_r_rack_real.png" alt="Static MELSEC iQ-R rack reference" className="max-w-full border border-slate-300" style={{ width: 665 * Math.min(zoom, 1.3) }} />
        <p className="text-[11px] text-slate-500">Static illustrative render. Not a photograph of your hardware; it does not reflect configuration edits.</p>
      </div>
    );

  const dropOk = (i: number) => (dragModel ? canPlace(getModule(dragModel)!, i) === null : null);

  return (
    <div ref={box} className="flex flex-1 items-start justify-center overflow-auto bg-gradient-to-b from-slate-100 to-slate-200 py-3 dark:from-slate-900 dark:to-slate-950" style={{ perspective: 1600 }}>
      <div style={{ width: natW * zoom, height: natH * zoom }}>
        <div style={{ width: natW, height: natH, transform: `scale(${zoom}) rotateY(${view === '3D' ? angle : 0}deg)`, transformOrigin: 'top left', transformStyle: 'preserve-3d' }} className="relative">
          {/* DIN rail / metal backplane */}
          <div className="absolute left-0 right-0 rounded-sm border-y border-slate-400 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 shadow" style={{ top: 62, height: H + 16 }} />
          {[0, 1].map((s) => (
            <div key={s} className="absolute rounded-sm border border-slate-500 bg-gradient-to-r from-slate-300 to-slate-400 shadow" style={{ [s ? 'right' : 'left']: 0, top: 130, width: 40, height: 160 }}>
              <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-500 bg-slate-100 shadow-inner" />
            </div>
          ))}
          <div className="absolute flex items-start shadow-[0_8px_14px_rgba(0,0,0,0.35)]" style={{ left: 45, top: 70 }}>
            {config.slots.map((id, i) => {
              const m = getModule(id);
              const w = i === 0 ? PSU_W : SLOT_W;
              const ok = over === i ? dropOk(i) : null;
              const ring = ok === true ? 'outline-emerald-500' : ok === false ? 'outline-red-500' : selected === i ? 'outline-blue-500' : '';
              return (
                <div key={i} style={{ width: w }} className="relative">
                  <div className="absolute -top-8 left-0 right-0 text-center">
                    <span className={`inline-block min-w-6 rounded-sm border px-1 text-[11px] font-semibold ${selected === i ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{slotLabel(i)}</span>
                  </div>
                  <button
                    onClick={() => onSelect(i)}
                    onDragOver={(e) => { e.preventDefault(); setOver(i); }}
                    onDragLeave={() => setOver(null)}
                    onDrop={(e) => { e.preventDefault(); setOver(null); onDrop(i, e.dataTransfer.getData('text/plain')); }}
                    aria-label={`Slot ${slotLabel(i)} ${m?.model ?? 'empty'}`}
                    style={{ width: w, height: H }}
                    className={`block p-0 ${ring ? `outline outline-[3px] -outline-offset-1 ${ring}` : ''}`}>
                    {m ? <ModuleFace m={m} h={H} /> : (
                      <div style={{ width: w, height: H }} className="relative">
                        <img src={BLANK_IMAGE} alt="" draggable={false} style={{ width: w, height: H }} className="block" />
                        {dragModel && dropOk(i) && <span className="absolute inset-0 bg-emerald-400/20" />}
                      </div>
                    )}
                  </button>
                  <div className="mt-1 text-center text-[11px] font-semibold text-slate-700">{m?.model ?? '-'}</div>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-0 left-12 text-[10px] text-slate-500">Base unit {config.baseUnit} · {BASE_UNITS.find((b) => b.model === config.baseUnit)?.slots} slots (sample)</div>
        </div>
      </div>
    </div>
  );
};
