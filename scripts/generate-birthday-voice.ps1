param([string]$VoiceName = '')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$birthdayTokens = Join-Path $PSScriptRoot '..\artifacts\birthday-audio'
New-Item -ItemType Directory -Force -Path $birthdayTokens | Out-Null
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    if (!$VoiceName) {
        $VoiceName = ($speaker.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -eq 'fr-FR' } | Select-Object -First 1).VoiceInfo.Name
    }
    if (!$VoiceName) { throw 'A French System.Speech voice is required to rebuild the soundtrack.' }
    $speaker.SelectVoice($VoiceName)
    $speaker.Rate = -2
    $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
    $syllables = @{ jo='jo'; yeux='yeux'; a='ah'; ni='ni'; ver='ver'; saire='serre'; cha='cha'; ton='ton' }
    foreach ($syllable in $syllables.GetEnumerator()) {
        $speaker.SetOutputToWaveFile((Join-Path $birthdayTokens "$($syllable.Key).wav"), $format)
        $speaker.Speak($syllable.Value)
        $speaker.SetOutputToNull()
    }
} finally { $speaker.Dispose() }
python (Join-Path $PSScriptRoot 'generate-birthday-soundtrack.py')
if ($LASTEXITCODE -ne 0) { throw 'Birthday soundtrack generation failed' }
