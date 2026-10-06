import {describe,it,expect,vi} from 'vitest';
import {GameAudio} from '../../src/audio';
import {createDeck} from '../../src/calculations';

describe('game audio narration completion',()=>{
  const question=createDeck()[0];
  it('reports missing, muted or suspended audio without waiting',()=>{
    const audio=new GameAudio(),completed=vi.fn();
    audio.speakQuestion(question,false,completed);
    expect(completed).toHaveBeenLastCalledWith('unavailable');
    const voice={speak:vi.fn(),speakPrepared:vi.fn(),stop:vi.fn()};
    Object.assign(audio,{voice,context:{state:'suspended'}});
    audio.speakQuestion(question,false,completed);
    Object.assign(audio,{context:{state:'running'},muted:true});
    audio.speakQuestion(question,false,completed);
    expect(completed).toHaveBeenCalledTimes(3);
    expect(voice.speak).not.toHaveBeenCalled();expect(voice.speakPrepared).not.toHaveBeenCalled();
  });
  it('forwards the optional completion callback for initial speech and a retry',()=>{
    const audio=new GameAudio(),completed=vi.fn();
    const voice={speak:vi.fn().mockResolvedValue(undefined),speakPrepared:vi.fn()};
    Object.assign(audio,{voice,context:{state:'running'}});
    audio.voiceStyle='dragon';
    audio.speakQuestion(question,false,completed);
    expect(voice.speakPrepared).toHaveBeenCalledExactlyOnceWith(question,'dragon',completed);
    audio.speakQuestion(question,true,completed);
    expect(voice.speak).toHaveBeenCalledExactlyOnceWith(question,'dragon',completed);
  });
});
