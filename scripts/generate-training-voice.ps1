param([string]$VoiceName = 'Microsoft Julie')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$trainingVoiceDirectory = Join-Path $PSScriptRoot '..\public\voice\fr\tokens'
New-Item -ItemType Directory -Force -Path $trainingVoiceDirectory | Out-Null
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $speaker.SelectVoice($VoiceName)
    $speaker.Rate = 1
    $speaker.Volume = 100
    $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
    $tokens = @{}
    0..100 | ForEach-Object { $tokens[[string]$_] = [string]$_ }
    $tokens['add'] = 'plus'; $tokens['subtract'] = 'moins'; $tokens['multiply'] = 'fois'
    foreach ($token in $tokens.GetEnumerator()) {
        $destination = Join-Path $trainingVoiceDirectory "$($token.Key).wav"
        if (Test-Path -LiteralPath $destination) { continue }
        $speaker.SetOutputToWaveFile($destination, $format)
        $speaker.Speak($token.Value)
        $speaker.SetOutputToNull()
    }
} finally { $speaker.Dispose() }
# Trim synthesis padding; the browser adds consistent gaps between words.
@'
import array, pathlib, wave
for path in pathlib.Path(r"TRAINING_TOKEN_PATH").glob('*.wav'):
    with wave.open(str(path), 'rb') as source:
        params = source.getparams()
        samples = array.array('h', source.readframes(source.getnframes()))
    audible = [i for i,s in enumerate(samples) if abs(s)>180]
    if not audible: raise RuntimeError(f'Silent token: {path}')
    pad = int(params.framerate * .025)
    samples = samples[max(0,audible[0]-pad):min(len(samples),audible[-1]+pad+1)]
    with wave.open(str(path), 'wb') as target:
        target.setparams(params)
        target.writeframes(samples.tobytes())
'@.Replace('TRAINING_TOKEN_PATH', (Resolve-Path -LiteralPath $trainingVoiceDirectory).Path) | python
if ($LASTEXITCODE -ne 0) { throw 'Voice trimming failed' }
Write-Output '104 local French training tokens ready.'
