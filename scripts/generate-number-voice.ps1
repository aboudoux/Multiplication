param([string]$VoiceName='Microsoft Julie')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$numberVoiceDirectory=Join-Path $PSScriptRoot '..\public\voice\fr\tokens'
$numberCatalog=Get-Content (Join-Path $PSScriptRoot '..\src\voice-numbers.json') -Raw | ConvertFrom-Json -AsHashtable
$numberSpeaker=New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
 $numberSpeaker.SelectVoice($VoiceName);$numberSpeaker.Rate=1;$numberSpeaker.Volume=100
 $numberFormat=New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050,[System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,[System.Speech.AudioFormat.AudioChannel]::Mono)
 foreach($entry in $numberCatalog.GetEnumerator()){
  if($entry.Key -notmatch '^\d{1,9}(d\d{1,9})?$'){throw 'Identifiant vocal invalide'}
  $numberDestination=Join-Path $numberVoiceDirectory "$($entry.Key).wav"
  if(Test-Path -LiteralPath $numberDestination){continue}
  $numberSpeaker.SetOutputToWaveFile($numberDestination,$numberFormat)
  # Speak each complete number in one synthesis call: no joins inside 500 or 0,25.
  $numberSpeaker.Speak([string]$entry.Value);$numberSpeaker.SetOutputToNull()
 }
} finally {$numberSpeaker.Dispose()}
python (Join-Path $PSScriptRoot 'trim-voice-tokens.py') $numberVoiceDirectory
if($LASTEXITCODE -ne 0){throw 'Ajustement des silences impossible'}
Write-Output "$($numberCatalog.Count) nombres français complets prêts."
