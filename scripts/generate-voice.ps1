param([string]$VoiceName = 'Microsoft Julie')

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$outputDirectory = Join-Path $PSScriptRoot '..\public\voice\fr'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $speaker.SelectVoice($VoiceName)
    $speaker.Rate = 1
    $speaker.Volume = 100
    $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
        22050,
        [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
        [System.Speech.AudioFormat.AudioChannel]::Mono
    )
    $numbers = @('', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix')
    for ($a = 1; $a -le 10; $a++) {
        for ($b = 1; $b -le 10; $b++) {
            $destination = Join-Path $outputDirectory "$a-$b.wav"
            $speaker.SetOutputToWaveFile($destination, $format)
            $speaker.Speak("$($numbers[$a]) fois $($numbers[$b]) ?")
            $speaker.SetOutputToNull()
        }
    }
    Write-Output 'Generated 100 French question prompts (22.05 kHz, mono PCM).'
} finally {
    $speaker.Dispose()
}
