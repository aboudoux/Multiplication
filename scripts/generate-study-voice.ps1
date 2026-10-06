param([string]$VoiceName = 'Microsoft Julie')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$studyVoiceDirectory=Join-Path $PSScriptRoot '..\public\voice\fr\tokens'
$studyTokens=@{compare='Quelle fraction est la plus grande ?';or='ou';divide='divisé par';over='sur';point='virgule';hundred='cent';thousand='mille';million='million';power='puissance';square='au carré';cube='au cube';root='racine carrée de';equals='égale';unknown='nombre mystère';x='x';open='ouvrir la parenthèse';close='fermer la parenthèse';of='de';percent='pour cent';half='la moitié de';double='le double de';picture='Quelle fraction est colorée ?';all='Trouve toutes les solutions';reduce='Simplifie la fraction';less='inférieur ou égal à';greater='supérieur ou égal à';lessStrict='strictement inférieur à';greaterStrict='strictement supérieur à';function='Calcule la valeur de la fonction pour';program='Programme de calcul :';then='puis';addTo='ajouter';times='multiplier par';price='Prix de';objects='objets';euros='euros';howMany='Quel prix pour';change='Après une variation de';successive='puis une variation de';identity='Calcule ce carré en utilisant une identité remarquable';collectionAdd="Combien d'objets en tout ?";collectionSubtract="Combien d'objets restent ?"}
$studySpeaker=New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
 $studySpeaker.SelectVoice($VoiceName);$studySpeaker.Rate=1;$studySpeaker.Volume=100
 $studyFormat=New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050,[System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,[System.Speech.AudioFormat.AudioChannel]::Mono)
 foreach($studyToken in $studyTokens.GetEnumerator()){
  $studyDestination=Join-Path $studyVoiceDirectory "$($studyToken.Key).wav"
  if(Test-Path -LiteralPath $studyDestination){continue}
  $studySpeaker.SetOutputToWaveFile($studyDestination,$studyFormat);$studySpeaker.Speak($studyToken.Value);$studySpeaker.SetOutputToNull()
 }
} finally {$studySpeaker.Dispose()}
Write-Output 'Voix locales des nouveaux exercices générées.'
