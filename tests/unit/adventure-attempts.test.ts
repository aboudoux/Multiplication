import {describe,it,expect} from 'vitest';
import {AdventureAttemptTracker,readAdventureAttempts,saveAdventureAttempt,ADVENTURE_ATTEMPTS_KEY} from '../../src/adventure-attempts';
describe('bilans locaux des aventures',()=>{
  const context={adventure:'chaton',stage:'kitten-1',grade:'CP' as const,difficulty:'normal' as const,discovery:false,outcome:'won' as const,total:8,solved:8,mistakes:2,activeMs:42000};
  it('distingue première réponse, aide et timeout, conserve les vingt dernières tentatives',()=>{
    let raw:string|null=null;const disk={getItem:()=>raw,setItem:(_:string,v:string)=>{raw=v;}};
    const tracker=new AdventureAttemptTracker();tracker.observe({first:true,helped:false,timeMs:1000});tracker.observe({first:false,helped:true,timeMs:3000});tracker.timeout();
    const attempt=tracker.finish(context);expect(attempt).toMatchObject({firstAnswers:2,firstCorrect:1,helped:1,timeouts:1});
    for(let i=0;i<25;i++)expect(saveAdventureAttempt(disk,{...attempt,stage:`mission-${i}`})).toBe(true);
    const saved=readAdventureAttempts(disk);expect(saved).toHaveLength(20);expect(saved[0].stage).toBe('mission-5');expect(saved[19].stage).toBe('mission-24');
  });
  it('tolère ancien format, corruption et stockage bloqué',()=>{
    for(const raw of ['{','null',JSON.stringify({version:1,attempts:[{...context,at:'bad'}]})])expect(readAdventureAttempts({getItem:()=>raw})).toEqual([]);
    expect(readAdventureAttempts({getItem:()=>{throw Error('blocked');}})).toEqual([]);
    expect(saveAdventureAttempt({getItem:()=>null,setItem:()=>{throw Error('blocked');}},new AdventureAttemptTracker().finish(context))).toBe(false);
    expect(ADVENTURE_ATTEMPTS_KEY).toContain('adventure-attempts');
  });
});
