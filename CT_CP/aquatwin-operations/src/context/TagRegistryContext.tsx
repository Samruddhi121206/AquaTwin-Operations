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
}

const TagRegistry = createContext<Ctx | undefined>(undefined);
export const useTags = () => {
  const c = useContext(TagRegistry);
  if (!c) throw new Error('useTags must be used within TagRegistryProvider');
  return c;
};

const HISTORY_MAX = 900;
const now = () => new Date().toLocaleTimeString();

export const TagRegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { telemetry } = usePlant();
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
    };
    const bool: Record<string, boolean> = {
      P101_RUN_FB: t.p101_running, P101_RUN_CMD: t.p101_running,
      P201_RUN_FB: t.p201_running, P201_RUN_CMD: t.p201_running,
      XV101_OPEN_FB: (t.xv101_openingPercent ?? 100) > 10, XV101_OPEN_CMD: (t.xv101_openingPercent ?? 100) > 10,
    };
    setTags((prev) => prev.map((tag) => {
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
        const m = packet.readings.find((r) => r.tagId === tag.id || r.address === tag.address);
        return m ? { ...tag, currentValue: m.value, rawCounts: m.rawCounts ?? tag.rawCounts, quality: m.quality as any, lastUpdate: m.timestamp } : tag;
      }));
    });
  }, [source]);

  // Session history sampler (one timer for the whole app).
  const latest = useRef(tags);
  latest.current = tags;
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
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

  return <TagRegistry.Provider value={{ tags, setTags, history, source }}>{children}</TagRegistry.Provider>;
};
