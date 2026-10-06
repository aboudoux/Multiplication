"""Remove synthesis padding at token edges; keep pauses inside the spoken number."""
import array
import pathlib
import sys
import wave

changed = 0
for path in pathlib.Path(sys.argv[1]).glob('*.wav'):
    with wave.open(str(path), 'rb') as source:
        params = source.getparams()
        if (params.nchannels, params.sampwidth, params.framerate) != (1, 2, 22050):
            raise RuntimeError(f'Unexpected voice format: {path}')
        samples = array.array('h', source.readframes(source.getnframes()))
    audible = [i for i, sample in enumerate(samples) if abs(sample) > 180]
    if not audible:
        raise RuntimeError(f'Silent token: {path}')
    pad = round(params.framerate * .025)
    start, end = max(0, audible[0] - pad), min(len(samples), audible[-1] + pad + 1)
    if start or end != len(samples):
        with wave.open(str(path), 'wb') as target:
            target.setparams(params)
            target.writeframes(samples[start:end].tobytes())
        changed += 1
print(f'{changed} fragments sans silence superflu.')
