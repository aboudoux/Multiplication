import {it,expect} from 'vitest';
import {Game} from '../../src/game';
import {defaults} from '../../src/storage';
import {rational,studyCalculation,type Answer} from '../../src/questions';

function start(answer:Answer,options={automatic:true,timed:false}) {
 const evidence:any[]=[];
 const q=studyCalculation({kind:'arithmetic',skillId:'decimal-add',patternId:'decimal-add',prompt:'Calcul',spoken:'Calcul',hint:'Indice',answer},'q');
 const g=new Game({...defaults(),duration:10,lives:5},()=>.5,()=>true,{questions:[q],explicitAnswers:true,autoIntegers:options.automatic,untimed:!options.timed,unlimitedLives:!options.timed,onAnswer:(_q,e)=>evidence.push(e)});
 g.start(0);g.tick(4001);return {g,evidence};
}
it.each([
 {kind:'decimal',n:1,d:2,raw:'0,5'},
 {kind:'decimal',n:1,d:2,raw:'0.50'},
 {kind:'decimal',n:1,d:2,raw:'2/4'},
 {kind:'decimal',n:-1,d:4,raw:'−0,25'},
 {kind:'fraction',n:1,d:6,raw:'2/12'},
 {kind:'fraction',n:0,d:1,raw:'0'},
 {kind:'fraction',n:2,d:1,raw:'2'},
])('$kind : $raw est accepté sans double crédit',({kind,n,d,raw})=>{
 const {g,evidence}=start({kind:kind as 'decimal'|'fraction',value:rational(n,d)});
 g.setAnswer(raw,4100);expect(g.solved).toBe(1);expect(g.phase).toBe('victory');
 g.submitAnswer(raw,4101);g.setAnswer(raw,4102);expect(evidence).toHaveLength(1);expect(g.solved).toBe(1);expect(g.mistakes).toBe(0);
});
it('la saisie incomplète ou fausse reste éditable, Valider soumet une erreur',()=>{
 const {g,evidence}=start({kind:'fraction',value:rational(1,6)});
 for(const raw of ['','−','1/','1/0','1/5']){g.setAnswer(raw,4100);expect(g.phase).toBe('question');expect(g.mistakes).toBe(0);expect(evidence).toHaveLength(0);}
 g.submitAnswer('1/5',4200);expect(g.mistakes).toBe(1);expect(evidence).toHaveLength(1);
 g.tick(6201);g.setAnswer('2/12',6300);expect(g.solved).toBe(1);expect(evidence).toHaveLength(1);
});
it('un séparateur final attend la suite, la forme irréductible reste exigée',()=>{
 const {g}=start({kind:'decimal',value:rational(1,2)});
 for(const raw of ['0','0,','0.','0,4']){g.setAnswer(raw,4100);expect(g.phase).toBe('question');}
 g.setAnswer('0,5',4200);expect(g.solved).toBe(1);
 const reduced=start({kind:'fraction',value:rational(1,6),irreducible:true}).g;
 reduced.setAnswer('2/12',4100);expect(reduced.phase).toBe('question');
 reduced.setAnswer('1/6',4200);expect(reduced.solved).toBe(1);
});
it('une réponse arrivée après le délai ne contourne pas le chrono',()=>{
 const {g,evidence}=start({kind:'decimal',value:rational(1,2)},{automatic:true,timed:true});
 g.setAnswer('0,5',14002);g.submitAnswer('0,5',14003);g.tick(14003);
 expect(g.solved).toBe(0);expect(g.lives).toBe(4);expect(evidence).toHaveLength(1);
});
it('les exercices sans validation automatique conservent leur mode explicite',()=>{
 const {g}=start({kind:'decimal',value:rational(1,2)},{automatic:false,timed:false});
 g.setAnswer('0,5',4100);expect(g.phase).toBe('question');g.submitAnswer('0,5',4200);expect(g.solved).toBe(1);
});
