import { CatalogueModule, getModule, RackConfig, slotLabel, slotRole } from './hardware';

export interface Msg { level: 'ok' | 'warn' | 'error' | 'info'; text: string }

/** Can `m` go into slot `i`? Pure; used by add/replace/drag-drop and by validate(). */
export function canPlace(m: CatalogueModule, i: number): string | null {
  const role = slotRole(i);
  if (role === 'PSU') return m.category === 'Power Supply' ? null : 'Only a power supply fits the power supply slot';
  if (role === 'CPU') return m.category === 'CPU' ? null : 'Only a CPU fits the CPU slot';
  return m.category === 'Power Supply' || m.category === 'CPU' ? `${m.category} modules cannot go in an I/O slot` : null;
}

export const powerBudget = (c: RackConfig) => {
  const mods = c.slots.map(getModule);
  const supply = mods[0]?.supply5V ?? 0;
  const draw = mods.reduce((s, m) => s + (m?.draw5V ?? 0), 0);
  return { supply, draw };
};

export function validate(c: RackConfig): Msg[] {
  const out: Msg[] = [];
  c.slots.forEach((id, i) => {
    const m = getModule(id);
    if (id && !m) out.push({ level: 'error', text: `Slot ${slotLabel(i)}: unknown module "${id}"` });
    else if (m) {
      const why = canPlace(m, i);
      if (why) out.push({ level: 'error', text: `Incompatible module detected in slot ${slotLabel(i)} (${m.model}): ${why}` });
    }
  });
  if (!c.slots[0]) out.push({ level: 'error', text: 'No power supply assigned' });
  if (!c.slots[1]) out.push({ level: 'error', text: 'No CPU assigned' });
  const { supply, draw } = powerBudget(c);
  if (supply && draw > supply)
    out.push({ level: 'error', text: `Power budget exceeded: ${draw.toFixed(2)} A drawn, ${supply.toFixed(1)} A available (5 V)` });
  else if (supply && draw > supply * 0.8)
    out.push({ level: 'warn', text: `Power budget above 80%: ${draw.toFixed(2)} A of ${supply.toFixed(1)} A` });
  if (c.slots.slice(2).every((s) => !s)) out.push({ level: 'warn', text: 'No I/O modules assigned' });
  if (!out.some((m) => m.level === 'error'))
    out.unshift({ level: 'ok', text: 'Hardware configuration is valid (sample profile – not verified against real hardware).' });
  return out;
}
