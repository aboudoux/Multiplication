import {it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
it('ships non-silent local French tokens without long edge padding and with a common PCM format',()=>{
 const files=readdirSync('public/voice/fr/tokens').filter(f=>f.endsWith('.wav'));
 for(const token of [...Array.from({length:101},(_,i)=>String(i)),'add','subtract','multiply'])expect(files).toContain(`${token}.wav`);
 for(const file of files) {
  const bytes=readFileSync(`public/voice/fr/tokens/${file}`);
  expect(bytes.toString('ascii',0,4)).toBe('RIFF');
  let offset=12,rate=0,data:Buffer|undefined;
  while(offset+8<=bytes.length){const id=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4);
   if(id==='fmt '){expect(bytes.readUInt16LE(offset+8)).toBe(1);expect(bytes.readUInt16LE(offset+10)).toBe(1);rate=bytes.readUInt32LE(offset+12);expect(bytes.readUInt16LE(offset+22)).toBe(16);}
   if(id==='data')data=bytes.subarray(offset+8,offset+8+size);offset+=8+size+(size%2);
  }
  expect(rate).toBe(22050);expect(data).toBeDefined();
  let first=-1,last=-1;for(let i=0;i<data!.length/2;i++)if(Math.abs(data!.readInt16LE(i*2))>180){if(first===-1)first=i;last=i;}
  expect(first).toBeGreaterThanOrEqual(0);expect(first/rate,file).toBeLessThan(.03);
  expect((data!.length/2-last-1)/rate,file).toBeLessThan(.03);
 }
});
