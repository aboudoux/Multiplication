"""Rebuild the original 30-second birthday soundtrack from local French syllables.

Run generate-birthday-voice.ps1 first. Requires numpy and ffmpeg.
The voices are synthetic; no recordings or remote services are used.
"""
from pathlib import Path
import subprocess
import wave
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'artifacts' / 'birthday-audio'
OUTPUT = ROOT / 'public' / 'audio'
OUTPUT.mkdir(parents=True, exist_ok=True)
RATE = 22050
rng = np.random.default_rng(20261001)
mix = np.zeros((30 * RATE, 2), dtype=np.float64)


def add(samples, at, volume=1, pan=0):
    start = round(at * RATE)
    end = min(len(mix), start + len(samples))
    if end <= start:
        return
    weights = np.array([np.sqrt((1-pan)/2), np.sqrt((1+pan)/2)])
    mix[start:end] += samples[:end-start, None] * weights * volume


def bell(frequency, duration, soft=False):
    t = np.arange(round(duration * RATE)) / RATE
    envelope = (1-np.exp(-t*90)) * np.exp(-t*(5 if soft else 3.5))
    return (np.sin(2*np.pi*frequency*t) + .28*np.sin(2*np.pi*frequency*2*t)*np.exp(-t*4)
            + .12*np.sin(2*np.pi*frequency*3*t)*np.exp(-t*9)) * envelope


def read_token(name):
    with wave.open(str(WORK / f'{name}.wav'), 'rb') as source:
        assert source.getframerate() == RATE
        samples = np.frombuffer(source.readframes(source.getnframes()), '<i2').astype(float) / 32768
    audible = np.flatnonzero(np.abs(samples) > .007)
    samples = samples[max(0, audible[0]-300):min(len(samples), audible[-1]+250)]
    return samples / max(.01, np.max(np.abs(samples)))


def sung(token, frequency, duration, formant=1):
    """Pitch-synchronous overlap/add keeps the French vowel's formants intact."""
    n = round(duration*RATE)
    output = np.zeros(n)
    weight = np.zeros(n)
    segment_size = round(.055*RATE)
    pitch = []
    for start in range(0, max(1, len(token)-segment_size), segment_size//2):
        frame = token[start:start+segment_size]
        frame = frame - frame.mean()
        ac = np.correlate(frame, frame, mode='full')[len(frame)-1:]
        low, high = round(RATE/390), round(RATE/95)
        candidates = ac[low:high]
        peaks = np.flatnonzero((candidates[1:-1]>candidates[:-2]) & (candidates[1:-1]>candidates[2:]))+1
        period = low + (peaks[np.argmax(ac[low:high][peaks])] if len(peaks) else np.argmax(ac[low:high]))
        pitch.append((start+len(frame)/2, period))
    if not pitch:
        pitch = [(0, RATE/210)]
    positions, periods = np.array(pitch).T
    # Small pitch vibrato gives the three slightly different cartoon voices life.
    cursor = 0.0
    while cursor < n:
        progress = cursor/max(1,n-1)
        source_pos = progress*(len(token)-1)
        period = max(35, round(np.interp(source_pos, positions, periods)))
        lo, hi = max(0,round(source_pos-period/2)), min(len(token),round(source_pos+period/2))
        center = lo+int(np.argmax(token[lo:hi])) if hi>lo else round(source_pos)
        half = max(25, round(period/formant))
        indices = center + np.linspace(-period,period,2*half+1)
        grain = np.interp(indices,np.arange(len(token)),token,left=0,right=0)*np.hanning(len(indices))
        target = round(cursor)
        left, right = max(0,target-half), min(n,target+half+1)
        window = np.hanning(len(grain))[left-target+half:right-target+half]
        output[left:right] += grain[left-target+half:right-target+half]
        weight[left:right] += window
        cursor += RATE/(frequency*(1+.007*np.sin(2*np.pi*5.1*cursor/RATE)))
    output /= np.maximum(.5,weight)
    edge = min(round(.018*RATE), n//4)
    output[:edge] *= np.linspace(0,1,edge)
    output[-edge:] *= np.linspace(1,0,edge)
    return output


tokens = {name:read_token(name) for name in ['jo','yeux','a','ni','ver','saire','cha','ton']}
# Music-box introduction while Ziggy walks in with the cake.
for i, note in enumerate([523.25,659.25,783.99,1046.5,783.99,659.25,587.33,783.99,1046.5,1174.66]):
    add(bell(note,.9), .3+i*.46, .09, np.sin(i)*.25)

# The traditional birthday melody, sung by a small synthetic French choir.
lines = [
    (5.85,[392,392,440,392,523.25,493.88],['jo','yeux','a','ni','ver','saire'],[.24,.24,.48,.48,.48,.84]),
    (8.92,[392,392,440,392,587.33,523.25],['jo','yeux','a','ni','ver','saire'],[.24,.24,.48,.48,.48,.84]),
    (11.99,[392,392,783.99,659.25,523.25,493.88,440,440],['jo','yeux','a','ni','ver','saire','cha','ton'],[.22,.22,.43,.43,.43,.43,.29,.48]),
    (15.15,[698.46,698.46,659.25,523.25,587.33,523.25],['jo','yeux','a','ni','ver','saire'],[.24,.24,.48,.48,.48,.84]),
]
for line_i, (start,notes,syllables,lengths) in enumerate(lines):
    at = start
    for i, (note, syllable, length) in enumerate(zip(notes,syllables,lengths)):
        for voice, (pitch_shift,formant,pan) in enumerate([(1,1,-.22),(.5,.84,.25),(1.003,1.17,.05)]):
            add(sung(tokens[syllable],note*pitch_shift,length*.96,formant),at+voice*.008,.13 if voice==0 else .065,pan)
        add(bell(note,length+.25),at,.055)
        if i%2==0:
            add(bell([130.81,146.83,174.61,130.81][line_i],.7,True),at,.07)
        at += length

# A gentle cartoon puff, then a crowd of handclaps with no sharp transients.
puff = rng.normal(0,1,round(.65*RATE))
puff = np.convolve(puff,np.ones(20)/20,mode='same') * np.sin(np.linspace(0,np.pi,len(puff)))
add(puff,18.25,.26)
for i in range(95):
    at = 20.05+i*.071+rng.uniform(0,.035)
    clap = rng.normal(0,1,round(.085*RATE))
    clap = np.convolve(clap,[.22,.56,.22],mode='same')*np.exp(-np.arange(len(clap))/RATE*65)
    clap[:50] *= np.linspace(0,1,50)
    add(clap,at,.10*rng.uniform(.5,1),rng.uniform(-.8,.8))

# Presents sparkle out of Santa's bag; the last chord resolves at 29 seconds.
for i in range(24):
    note = [523.25,659.25,783.99,1046.5,1174.66,1318.5][i%6]
    add(bell(note,.75),21.1+i*.23,.055,np.sin(i)*.5)
for i in range(14):
    add(bell([523.25,659.25,783.99,1046.5,783.99,659.25,587.33][i%7],.7),23+i*.4,.055)
for note in [261.63,523.25,659.25,783.99]:
    add(bell(note,1.5),28.4,.045)

# Light room reflections and a clean, quiet fade, with deterministic peak level.
for delay, strength in [(round(.07*RATE),.13),(round(.13*RATE),.07)]:
    mix[delay:] += mix[:-delay].copy()*strength
mix = np.tanh(mix*1.4)
mix *= .77/max(.01,np.max(np.abs(mix)))
mix[-round(.6*RATE):] *= np.linspace(1,0,round(.6*RATE))[:,None]
destination = WORK / 'birthday-party.wav'
with wave.open(str(destination),'wb') as target:
    target.setnchannels(2);target.setsampwidth(2);target.setframerate(RATE)
    target.writeframes((mix*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(destination),
                '-codec:a','libmp3lame','-b:a','112k',str(OUTPUT / 'birthday-party.mp3')],check=True)
print(f'30-second birthday soundtrack: {OUTPUT / "birthday-party.mp3"}')
