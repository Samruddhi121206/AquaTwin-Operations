import React from 'react';
import { CatalogueModule, FACE_IMAGE } from './hardware';

/** Module front face. Known models use the illustrative crop; others get a generic CSS face labelled by model. */
export const ModuleFace: React.FC<{ m: CatalogueModule; h: number }> = ({ m, h }) => {
  const img = FACE_IMAGE[m.model];
  const isPsu = m.category === 'Power Supply';
  const w = isPsu ? (h * 93) / 227 : (h * 69) / 227;
  if (img) return <img src={img} alt={m.model} draggable={false} style={{ width: w, height: h }} className="block select-none" />;
  const dots = m.category === 'Communication' ? 0 : Math.min(Math.max(m.channels, 4), 16);
  return (
    <div style={{ width: w, height: h }} className="flex flex-col items-center rounded-[3px] border border-black bg-gradient-to-b from-zinc-700 to-zinc-900 px-1 pt-1.5 shadow-inner">
      <span className="font-mono font-bold text-white" style={{ fontSize: Math.max(6, h / 30) }}>{m.model}</span>
      {m.category === 'CPU' && <span className="mt-1 flex gap-0.5">{[0, 1, 2].map((i) => <i key={i} className="h-1 w-1 rounded-full bg-emerald-500" />)}</span>}
      {m.category === 'Communication' && Array.from({ length: Math.min(m.channels, 3) }).map((_, i) => (
        <span key={i} className="mt-2 h-5 w-7 rounded-[2px] border border-zinc-500 bg-zinc-950" />
      ))}
      <div className="mt-2 flex flex-1 flex-col items-center justify-around pb-2">
        {Array.from({ length: dots }).map((_, i) => (
          <span key={i} className="h-[6%] max-h-2 w-5 rounded-[1px] border border-zinc-500 bg-gradient-to-r from-zinc-300 to-zinc-500" />
        ))}
      </div>
      {isPsu && <div className="h-1/3 w-full bg-red-700" />}
    </div>
  );
};

export const ModuleThumb: React.FC<{ m: CatalogueModule; h?: number }> = ({ m, h = 40 }) => <ModuleFace m={m} h={h} />;
