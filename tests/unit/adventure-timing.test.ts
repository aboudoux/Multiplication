import { expect, test } from 'vitest';
import { adventureDurations, adventureQuestions, stages } from '../../src/adventure';
import { Game } from '../../src/game';
import { defaults } from '../../src/storage';

test('all worlds have the agreed progressive deadlines',()=>{
 expect(adventureDurations).toEqual(expect.objectContaining({kitten:null,unicorn:30,alien:30,christmas:15,halloween:15,wizard:10,dragon:10,star:10}));
});
for(const duration of [10,15,30] as const)test(`timed practice ${duration}s: expiry, race, retry and pause preserve unlimited attempts`,()=>{
 const deck=adventureQuestions(stages[0]).slice(0,2);
 let ready=false;
 const game=new Game({...defaults(),duration},Math.random,()=>ready,{questions:deck,untimed:false,unlimitedLives:true});
 game.start(0);game.tick(4000);game.tick(20000);expect(game.phase).toBe('preparing');
 ready=true;game.tick(21000);expect(game.timeLeft(21000)).toBe(duration*1000);
 game.pause(23000);game.resume(123000);game.tick(127000);
 expect(game.timeLeft(127000)).toBe(duration*1000-2000);
 const deadline=127000+duration*1000-2000;
 game.digit(String(deck[0].result)[0],deadline);game.tick(deadline);
 expect(game.mistakes).toBe(1);expect(game.lives).toBe(3);expect(game.feedback?.timeout).toBe(true);
 game.tick(deadline+1999);expect(game.phase).toBe('feedback');game.tick(deadline+2000);
 expect(game.current?.id).toBe(deck[1].id);
 for(const digit of String(game.current!.result))game.digit(digit,deadline+2100);
 game.tick(deadline+2750);expect(game.current?.id).toBe(deck[0].id);
 for(let i=0;i<4;i++){game.tick(deadline+2750+(i+1)*duration*1000+i*2000);game.tick(deadline+2750+(i+1)*(duration*1000+2000));}
 expect(game.lives).toBe(3);expect(game.phase).toBe('question');expect(game.solved).toBe(1);
});
