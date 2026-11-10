import clips from './clock-voice-clips.json';

export type ClockVoiceToken = keyof typeof clips;

export function composeClockVoice(context: AudioContext, bank: AudioBuffer, tokens: readonly ClockVoiceToken[]): AudioBuffer {
  const rate = bank.sampleRate;
  const samples = bank.getChannelData(0);
  const parts = tokens.map(token => {
    const [start, end] = clips[token];
    return samples.subarray(Math.round(start * rate), Math.round(end * rate));
  });
  const gap = Math.round(.055 * rate);
  const length = parts.reduce((sum, part) => sum + part.length, 0) + gap * (parts.length - 1);
  const voice = context.createBuffer(1, length, rate);
  const output = voice.getChannelData(0);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length + gap;
  }
  return voice;
}
