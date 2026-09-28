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
    $numbers = @('zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt')
    for ($a = 1; $a -le 10; $a++) {
        for ($b = 1; $b -le 10; $b++) {
            $destination = Join-Path $outputDirectory "$a-$b.wav"
            if (Test-Path -LiteralPath $destination) { continue }
            $speaker.SetOutputToWaveFile($destination, $format)
            $speaker.Speak("$($numbers[$a]) fois $($numbers[$b]) ?")
            $speaker.SetOutputToNull()
        }
    }
    foreach ($operation in @('add', 'subtract')) {
        $folder = Join-Path $outputDirectory $operation
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        $word = if ($operation -eq 'add') { 'plus' } else { 'moins' }
        for ($a = 0; $a -le 20; $a++) {
            for ($b = 0; $b -le 20; $b++) {
                $result = if ($operation -eq 'add') { $a + $b } else { $a - $b }
                if ($result -lt 0 -or $result -gt 20) { continue }
                $destination = Join-Path $folder "$a-$b.wav"
                if (Test-Path -LiteralPath $destination) { continue }
                $speaker.SetOutputToWaveFile($destination, $format)
                $speaker.Speak("$($numbers[$a]) $word $($numbers[$b]) ?")
                $speaker.SetOutputToNull()
            }
        }
    }
    Write-Output '562 French question prompts ready (22.05 kHz, mono PCM). Existing files preserved.'
} finally {
    $speaker.Dispose()
}
