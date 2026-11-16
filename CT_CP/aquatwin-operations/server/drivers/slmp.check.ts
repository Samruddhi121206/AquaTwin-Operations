// Run: npx tsx server/drivers/slmp.check.ts
// Lifecycle check of MitsubishiSLMPDriver against a fake SLMP 3E server on localhost.
import net from 'net';
import { MitsubishiSLMPDriver } from './MitsubishiSLMPDriver';

const ok = (c: boolean, what: string) => {
  if (!c) throw new Error('FAILED: ' + what);
  console.log('PASS', what);
};

// Fake PLC: answers word reads with 1234 and bit reads with "ON" (high nibble), unless `silent`.
let silent = false;
const srv = net.createServer((s) => {
  s.on('data', (req) => {
    if (silent) return;
    const isBit = req.readUInt16LE(13) === 1;
    const data = isBit ? Buffer.from([0x10]) : Buffer.alloc(2);
    if (!isBit) data.writeInt16LE(1234);
    const head = Buffer.alloc(11);
    head.writeUInt8(0xd0, 0);
    head.writeUInt16LE(2 + data.length, 7);
    s.write(Buffer.concat([head, data]));
  });
});
await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r));
const port = (srv.address() as net.AddressInfo).port;

const d = new MitsubishiSLMPDriver({ host: '127.0.0.1', port, family: 'iQ-R', cpuModel: 'TEST', timeoutMs: 300 });
ok((await d.connect()) === true, 'TCP connect succeeds');
ok(d.getStatus().tcpOpen === true && d.getStatus().connected === false, 'TCP open is NOT reported as connected');
ok(d.getStatus().cpuMode === 'UNKNOWN', 'CPU mode is never assumed RUN');

const word = await d.readTag('T', 'D100');
ok(word.quality === 'GOOD' && word.value === 1234, 'word read decoded');
ok(d.getStatus().connected === true, 'connected only after a valid protocol read');
const bit = await d.readTag('B', 'M0');
ok(bit.value === true, 'bit read uses high nibble (ON)');

const batch = await d.readBatch([{ tagId: 'a', address: 'D1' }, { tagId: 'b', address: 'D2' }, { tagId: 'c', address: 'M1' }]);
ok(batch.length === 3 && batch.every((r) => r.quality === 'GOOD'), 'serialised batch reads match their requests');

silent = true;
const t0 = Date.now();
const lost = await d.readTag('T', 'D100');
ok(lost.quality === 'BAD' && Date.now() - t0 < 1500, 'silent PLC -> BAD quality after timeout (no hang)');
ok(d.getStatus().connected === false && d.getStatus().timeouts === 1, 'timeout drops verified state and is counted');

const w = await d.writeTag('P101_RUN_CMD', 'Y0', true);
ok(w.success === false && /BLOCKED/.test(w.message), 'physical write is blocked');

await d.disconnect();
ok((await new MitsubishiSLMPDriver({ host: '127.0.0.1', port: 1, timeoutMs: 300 }).ping()).success === false, 'ping to a closed port fails honestly');
srv.close();
console.log('slmp check ok');
