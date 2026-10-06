import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
it('ships 104 non-silent local French tokens with short onset and a common PCM format',()=>{
 for(const token of [...Array.from({length:101},(_,i)=>String(i)),'add','subtract','multiply']) {
  const bytes=readFileSync(`public/voice/fr/tokens/${token}.wav`);
  expect(bytes.toString('ascii',0,4)).toBe('RIFF');
  let offset=12,rate=0,data:Buffer|undefined;
  while(offset+8<=bytes.length){const id=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4);
   if(id==='fmt '){expect(bytes.readUInt16LE(offset+8)).toBe(1);expect(bytes.readUInt16LE(offset+10)).toBe(1);rate=bytes.readUInt32LE(offset+12);expect(bytes.readUInt16LE(offset+22)).toBe(16);}
   if(id==='data')data=bytes.subarray(offset+8,offset+8+size);offset+=8+size+(size%2);
  }
  expect(rate).toBe(22050);expect(data).toBeDefined();
  let first=-1;for(let i=0;i<data!.length/2;i++)if(Math.abs(data!.readInt16LE(i*2))>180){first=i;break;}
  expect(first).toBeGreaterThanOrEqual(0);expect(first/rate).toBeLessThan(.1);
 }
});
