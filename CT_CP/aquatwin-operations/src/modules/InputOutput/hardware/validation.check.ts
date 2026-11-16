// Run: npx tsx src/modules/InputOutput/hardware/validation.check.ts
import { SAMPLE_RACK, makeRack } from './hardware';
import { validate } from './validation';

const ok = (c: boolean, what: string) => { if (!c) throw new Error('FAILED: ' + what); };
ok(validate(SAMPLE_RACK)[0].level === 'ok', 'sample rack valid');
ok(validate(makeRack('R38B')).some((m) => m.text.includes('No CPU')), 'missing CPU flagged');
ok(validate({ ...SAMPLE_RACK, slots: SAMPLE_RACK.slots.map((s, i) => (i === 2 ? 'R08CPU' : s)) }).some((m) => m.level === 'error'), 'CPU in IO slot rejected');
const full = makeRack('R312B');
ok(validate({ ...full, slots: full.slots.map((_, i) => (i === 0 ? 'R61P' : i === 1 ? 'R08CPU' : 'RJ71EN71')) }).some((m) => m.text.includes('Power budget exceeded')), 'power budget');
console.log('validation ok');
