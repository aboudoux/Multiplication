import {describe,it,expect} from 'vitest';
import {mathTokens,tokensText} from '../../src/study-speech';

describe('lecture courte sans parenthèses',()=>{
 it.each([
  ['(5) × (-9)',['5','multiply','subtract','9'],'5 fois moins 9'],
  ['(-5) ÷ (-9)',['subtract','5','divide','subtract','9'],'moins 5 divisé par moins 9'],
  ['3 − (-2)',['3','subtract','subtract','2'],'3 moins moins 2'],
  ['(3 + 2) × 4',['3','add','2','multiply','4'],'3 plus 2 fois 4'],
  ['(2 + (3 × 4))',['2','add','3','multiply','4'],'2 plus 3 fois 4'],
 ])('%s : conserve nombres, signes et opérateurs', (prompt,tokens,spoken)=>{
  expect(mathTokens(prompt as string)).toEqual(tokens);
  expect(tokensText(mathTokens(prompt as string))).toBe(spoken);
 });
});
