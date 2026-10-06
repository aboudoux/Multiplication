import {createServer} from 'vite';
import {writeFileSync} from 'node:fs';

// Run from the project root, then generate-number-voice.ps1. No preview server is opened.
const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
try {
 const {mentalFacts}=await server.ssrLoadModule('/src/mental-generator.ts');
 const {mentalPatterns}=await server.ssrLoadModule('/src/mental-patterns.ts');
 const {grades}=await server.ssrLoadModule('/src/curriculum.ts');
 const numbers=new Set(['1250','2500','10000','100000','1000000','0.075']);
 for(const grade of grades)for(const pattern of mentalPatterns)for(let level=0;level<=pattern.maxLevel;level++)
  for(const q of mentalFacts(pattern.id,grade,level))for(const raw of q.prompt.match(/\d+(?:[.,]\d+)?/g)??[])numbers.add(raw.replace(',','.'));
 const entries=[...numbers].filter(n=>n.includes('.')||Number(n)>100).sort((a,b)=>Number(a)-Number(b));
 const catalog=Object.fromEntries(entries.map(n=>[n.replace('.','d'),n.replace('.',',')]));
 writeFileSync('src/voice-numbers.json',JSON.stringify(catalog,null,2)+'\n');
 console.log(`${entries.length} nombres complets à enregistrer.`);
} finally {await server.close();}
