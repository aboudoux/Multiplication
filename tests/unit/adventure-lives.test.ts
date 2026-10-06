import {expect,test} from 'vitest';
import {adventureLives,adventureQuestions,stages} from '../../src/adventure';
import {Game} from '../../src/game';
import {defaults} from '../../src/storage';
test('adventure life budgets',()=>expect(adventureLives).toEqual(expect.objectContaining({kitten:null,unicorn:7,alien:7,christmas:5,halloween:5,wizard:3,dragon:3,star:3})));
for(const lives of [3,5,7])test(`${lives} lives: errors and timeouts lose once, failed attempt cannot win`,()=>{
 const game=new Game({...defaults(),lives,duration:10},()=>.5,()=>true,{questions:adventureQuestions(stages[0]),untimed:false,unlimitedLives:false});
 let now=4000;game.start(0);game.tick(now);
 for(let i=0;i<lives;i++){
  if(i%2===0)game.digit('9',++now);else game.tick(now+=10000);
  game.digit('9',now);expect(game.lives).toBe(lives-i-1);expect(game.mistakes).toBe(i+1);
  game.tick(now+=2000);
 }
 expect(game.phase).toBe('defeat');expect(game.solved).toBe(0);
 game.tick(now+=6000);expect(game.phase).toBe('finished');
});
