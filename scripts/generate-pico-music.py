"""Regenerate the original 30-second maritime finale using only Python's standard library."""
import array
import math
from pathlib import Path
import random
import wave

RATE = 22050
DURATION = 30
PHRASE = [0, 4, 7, 0, 9, 7, 4, -1, 2, 5, 9, 7, 4, 2, 0, -1]
rng = random.Random(20261001)
samples = array.array('h')
for i in range(RATE * DURATION):
    t = i / RATE
    step = int(t / .27)
    age = t - step * .27
    note = PHRASE[step % len(PHRASE)]
    frequency = 261.63 * 2 ** (note / 12)
    envelope = math.sin(math.pi * min(1, age / .25)) ** 2 * math.exp(-age * 5)
    melody = 0 if note < 0 else (math.sin(2 * math.pi * frequency * t) + .18 * math.sin(2 * math.pi * frequency * 2 * t)) * envelope * .25
    bass = 130.815 * 2 ** ([0, 5, 7, 0][(step // 4) % 4] / 12)
    low = math.sin(2 * math.pi * bass * t) * .1 * math.exp(-(t % 1.08) * 2)
    chime = math.sin(2 * math.pi * 1046.52 * t) * .08 * math.exp(-(t - 17) * 2) if 17 <= t < 20 else 0
    clap = 0
    if t >= 22:
        clap_age = (t - 22) % .33
        clap = rng.uniform(-1, 1) * .22 * math.exp(-clap_age * 38) * (1 if clap_age < .1 else 0)
    sample = (melody + low + chime + clap) * min(1, t / 1.5, (DURATION - t) / 1.5)
    samples.append(round(max(-1, min(1, sample)) * 32767))

output = Path(__file__).resolve().parents[1] / 'public/audio/pico-finale.wav'
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), 'wb') as audio:
    audio.setnchannels(1)
    audio.setsampwidth(2)
    audio.setframerate(RATE)
    audio.writeframes(samples.tobytes())
print(output)
