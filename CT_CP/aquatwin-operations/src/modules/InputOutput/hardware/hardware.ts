/** Types + catalogue data for the Hardware Configuration screen. SAMPLE / UNVERIFIED data. */
import { MITSUBISHI_CATALOGUE } from '../ioData';
import { CatalogueModuleItem } from '../types';

export type Category = CatalogueModuleItem['category'];

/** Catalogue categories in display order (labels match the target design). */
export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'Power Supply', label: 'Power Supply' },
  { key: 'CPU', label: 'CPU' },
  { key: 'Digital Input', label: 'Discrete Input' },
  { key: 'Digital Output', label: 'Discrete Output' },
  { key: 'Analog Input', label: 'Analog Input' },
  { key: 'Analog Output', label: 'Analog Output' },
  { key: 'Communication', label: 'Communication' },
  { key: 'Temperature', label: 'Temperature' },
];

const A = '/assets/mitsubishi/';
/**
 * Face images. These are crops of an AI-generated reference render, NOT Mitsubishi photographs.
 * Only models that appear in that render get one; everything else uses the generic CSS face.
 */
export const FACE_IMAGE: Record<string, string> = {
  R61P: A + 'crop_r61p.png',
  R08CPU: A + 'crop_r08cpu.png',
  RX40C7: A + 'crop_rx40c7.png',
  RY40NT5P: A + 'crop_ry40nt5p.png',
  R60AD8: A + 'crop_r60ad8.png',
  R60DA8: A + 'crop_r60da8.png',
};
export const BLANK_IMAGE = A + 'crop_blank.png';

export interface CatalogueModule extends CatalogueModuleItem {
  /** 5 V draw (A); for power supplies 0 */
  draw5V: number;
  /** 5 V supply capacity (A) – power supplies only */
  supply5V: number;
  /** Not in source data → shown as "not specified", never invented. */
  resolution?: string;
}

const PSU_CAPACITY: Record<string, number> = { R61P: 6.5, R63P: 6.5 }; // from existing sample catalogue text

export const CATALOGUE: CatalogueModule[] = MITSUBISHI_CATALOGUE.map((m) => ({
  ...m,
  draw5V: m.category === 'Power Supply' ? 0 : parseFloat(m.currentConsumption5V) || 0,
  supply5V: PSU_CAPACITY[m.model] ?? 0,
}));

export const getModule = (model: string | null) =>
  model ? CATALOGUE.find((m) => m.model === model) ?? null : null;

/** Sample base units (slot counts are SAMPLE, confirm against the real rack). */
export const BASE_UNITS = [
  { model: 'R35B', slots: 5 },
  { model: 'R38B', slots: 8 },
  { model: 'R312B', slots: 12 },
];

/** Rack layout: index 0 = power supply, index 1 = CPU slot, 2.. = I/O slots. */
export interface RackConfig {
  baseUnit: string;
  slots: (string | null)[];
}

export const makeRack = (baseUnit: string, fill: Record<number, string> = {}): RackConfig => {
  const n = BASE_UNITS.find((b) => b.model === baseUnit)!.slots;
  return { baseUnit, slots: Array.from({ length: n + 1 }, (_, i) => fill[i] ?? null) };
};

/** SAMPLE profile mirroring the target design (unverified). */
export const SAMPLE_RACK = makeRack('R38B', {
  0: 'R61P', 1: 'R08CPU', 2: 'RX40C7', 3: 'RY40NT5P', 4: 'R60AD8', 5: 'R60DA8',
});

export const slotRole = (i: number): 'PSU' | 'CPU' | 'IO' => (i === 0 ? 'PSU' : i === 1 ? 'CPU' : 'IO');
export const slotLabel = (i: number) => (i === 0 ? 'PS' : String(i - 1));

export const RACK_STORAGE_KEY = 'aquatwin.hwconfig.v1';
/** Saved rack from this browser, or null if the engineer has not saved a configuration yet. */
export const loadSavedRack = (): RackConfig | null => {
  try {
    const c = JSON.parse(localStorage.getItem(RACK_STORAGE_KEY) ?? 'null');
    const b = BASE_UNITS.find((x) => x.model === c?.baseUnit);
    return b && Array.isArray(c.slots) && c.slots.length === b.slots + 1 ? c : null;
  } catch { return null; }
};
