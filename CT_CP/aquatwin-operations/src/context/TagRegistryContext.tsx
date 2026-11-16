/**
 * Single shared tag registry (spec 8.3). One tag list, fed by the Virtual PLC (plant simulation)
 * or by backend packets, read by Input/Output, Control Panel and Analysis.
 */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePlant } from './PlantContext';
import { useRuntimeMode } from './RuntimeModeContext';
import { plcBackend } from '../services/plcBackendService';
import { INITIAL_EXTENDED_TAGS } from '../modules/InputOutput/ioData';
import { ExtendedPlcTag } from '../modules/InputOutput/types';

export interface TagSample { t: number; v: number; quality: string; source: 'VIRTUAL' | 'REAL' }

interface Ctx {
  tags: ExtendedPlcTag[];
  setTags: React.Dispatch<React.SetStateAction<ExtendedPlcTag[]>>;
  /** Numeric tag history for this browser session (not persisted). */
  history: Record<string, TagSample[]>;
  source: 'VIRTUAL' | 'REAL';
  /** Command a DO/AO tag. Virtual PLC only; drives the plant simulation. */
  writeTag: (id: string, value: number | boolean) => WriteResult;
  /** Force (override) a DI/AI value for simulation, or release it with null. */
  forceTag: (id: string, value: number | boolean | null) => WriteResult;
}
export interface WriteResult { ok: boolean; message: string }

const TagRegistry = createContext<Ctx | undefined>(undefined);
export const useTags = () => {
  const c = useContext(TagRegistry);
  if (!c) throw new Error('useTags must be used within TagRegistryProvider');
  return c;
};

const HISTORY_MAX = 900;
const now = () => new Date().toLocaleTimeString();

export const TagRegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { telemetry, togglePump, setXv101Opening, setPumpSpeed } = usePlant();
  const { plcHealth } = useRuntimeMode();
  const source = plcHealth.mode;
  const [tags, setTags] = useState<ExtendedPlcTag[]>(INITIAL_EXTENDED_TAGS);
  const [history, setHistory] = useState<Record<string, TagSample[]>>({});

  // Virtual PLC: plant simulation -> tags. ponytail: raw-count full scales (32000) are sample values, not module specs.
  useEffect(() => {
    if (source !== 'VIRTUAL') return;
    const t = telemetry;
    const num: Record<string, [number | undefined, number, number]> = {
      TK101_LEVEL: [t.tk101?.currentLevelPercent, 100, 1],
      FT101_FLOW: [t.p101_flowM3h, 25, 1],
      PT101_PRESSURE: [t.p101_pressureBar, 6, 2],
      RO_FEED_PRESS: [t.p202_pressureBar, 25, 1],
      FCV101_POS_CMD: [t.xv101_openingPercent, 100, 1],
      P201_VFD_SPEED: [t.p201_speedPercent === undefined ? undefined : t.p201_speedPercent * 0.6, 60, 1],
    };
    const bool: Record<string, boolean> = {
      P101_RUN_FB: t.p101_running, P101_RUN_CMD: t.p101_running,
      P201_RUN_FB: t.p201_running, P201_RUN_CMD: t.p201_running,
      XV101_OPEN_FB: (t.xv101_openingPercent ?? 100) > 10, XV101_OPEN_CMD: (t.xv101_openingPercent ?? 100) > 10,
    };
    setTags((prev) => prev.map((tag) => {
      if (tag.forced || tag.fault) return tag; // forced / faulted values are held by the user
      const n = num[tag.id];
      if (n && n[0] !== undefined)
        return { ...tag, currentValue: Number(n[0].toFixed(n[2])), rawCounts: Math.round((n[0] / n[1]) * 32000), lastUpdate: now() };
      if (tag.id in bool && bool[tag.id] !== undefined) return { ...tag, currentValue: bool[tag.id], lastUpdate: now() };
      return tag;
    }));
  }, [telemetry, source]);

  // Backend gateway packets -> tags (REAL mode only; never mixed silently with simulation).
  useEffect(() => {
    plcBackend.connect();
    return plcBackend.subscribe((packet) => {
      if (source !== 'REAL' || !packet.readings?.length) return;
      setTags((prev) => prev.map((tag) => {
        const m = packet.readings.find((r) => r.tagId === tag.id);
        if (!m) return tag;
        realSeen.current.set(tag.id, Date.now());
        return { ...tag, currentValue: m.value, rawCounts: m.rawCounts ?? tag.rawCounts, quality: m.quality as any, lastUpdate: new Date(m.timestamp).toLocaleTimeString() };
      }));
    });
  }, [source]);

  /** Real PLC: last time each tag got a backend reading. Tags never read (or older than the timeout) are STALE. */
  const realSeen = useRef(new Map<string, number>());
  const STALE_MS = 5000;
  useEffect(() => {
    if (source !== 'REAL') return;
    realSeen.current.clear();
    setTags((prev) => prev.map((t) => ({ ...t, quality: 'STALE' as const })));
  }, [source]);

  const setValue = (id: string, value: number | boolean | string, extra: Partial<ExtendedPlcTag> = {}) =>
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, currentValue: value, lastUpdate: now(), ...extra } : t)));

  const writeTag = (id: string, value: number | boolean): WriteResult => {
    const tag = tags.find((t) => t.id === id);
    if (!tag) return { ok: false, message: `Unknown tag ${id}` };
    if (source !== 'VIRTUAL') return { ok: false, message: 'Real PLC is read-only: write refused. Nothing was sent.' };
    if (tag.type !== 'DO' && tag.type !== 'AO') return { ok: false, message: `${id} is an input; use Force to simulate it.` };
    if (tag.fault) return { ok: false, message: `${id} has an active fault.` };
    const on = value === true || (typeof value === 'number' && value > 0);
    // ponytail: tag -> plant mapping is a sample table; extend when the real I/O list exists.
    switch (id) {
      case 'P101_RUN_CMD': if (telemetry.p101_running !== on) togglePump('P-101'); break;
      case 'P201_RUN_CMD': if (telemetry.p201_running !== on) togglePump('P-201'); break;
      case 'XV101_OPEN_CMD': setXv101Opening(on ? 100 : 0); break;
      case 'FCV101_POS_CMD': setXv101Opening(Number(value)); break;
      case 'P201_VFD_SPEED': setPumpSpeed('P-201', (Number(value) / 60) * 100); break;
      case 'ALARM_HORN_CMD': setValue(id, on); return { ok: true, message: `${id} = ${on ? 'ON' : 'OFF'} (no plant equipment mapped).` };
      default: return { ok: false, message: `${id} has no plant equipment mapped.` };
    }
    setValue(id, typeof value === 'boolean' ? value : Number(value));
    return { ok: true, message: `${id} = ${String(value)} written to Virtual PLC (SIMULATED). Check the matching feedback tag for the actual state.` };
  };

  const forceTag = (id: string, value: number | boolean | null): WriteResult => {
    const tag = tags.find((t) => t.id === id);
    if (!tag) return { ok: false, message: `Unknown tag ${id}` };
    if (source !== 'VIRTUAL') return { ok: false, message: 'Forcing is only available on the Virtual PLC.' };
    if (tag.type !== 'DI' && tag.type !== 'AI') return { ok: false, message: 'Only inputs can be forced; command outputs with Write.' };
    if (value === null) { setValue(id, tag.currentValue, { forced: false }); return { ok: true, message: `${id} released; following the plant again.` }; }
    setValue(id, value, { forced: true });
    return { ok: true, message: `${id} forced to ${String(value)} (SIMULATED input; the plant model does not see it).` };
  };

  // Session history sampler (one timer for the whole app).
  const latest = useRef(tags);
  latest.current = tags;
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      if (source === 'REAL')
        setTags((prev) => prev.map((x) => (x.quality !== 'STALE' && t - (realSeen.current.get(x.id) ?? 0) > STALE_MS ? { ...x, quality: 'STALE' as const } : x)));
      setHistory((h) => {
        const next = { ...h };
        for (const tag of latest.current)
          if (typeof tag.currentValue === 'number')
            next[tag.id] = [...(h[tag.id] ?? []).slice(-(HISTORY_MAX - 1)), { t, v: tag.currentValue, quality: tag.quality, source }];
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [source]);

  return <TagRegistry.Provider value={{ tags, setTags, history, source, writeTag, forceTag }}>{children}</TagRegistry.Provider>;
};
