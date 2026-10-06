export const voiceProfiles = {
  ant: { label: "Fourmi malicieuse", rate: 1.1, tremolo: 0 },
  classic: { label: "Classique", rate: 1, tremolo: 0 },
  witch: { label: "Sorcière", rate: 1.14, tremolo: 0 },
  monster: { label: "Monstre", rate: .84, tremolo: 0 },
  santa: { label: "Père Noël", rate: .9, tremolo: 0 },
  elf: { label: "Lutin malicieux", rate: 1.18, tremolo: 0 },
  wizard: { label: "Petit sorcier", rate: .96, tremolo: 0 },
  enchanted: { label: "Voix enchantée", rate: 1.08, tremolo: 5 },
  fairy: { label: "Fée pétillante", rate: 1.16, tremolo: 0 },
  unicorn: { label: "Licorne magique", rate: 1.07, tremolo: 4 },
  dragon: { label: "Grand dragon", rate: .8, tremolo: 0 },
  babyDragon: { label: "Bébé dragon", rate: 1.12, tremolo: 0 },
  alien: { label: "Extraterrestre", rate: 1.2, tremolo: 18 },
  robot: { label: "Petit robot", rate: .94, tremolo: 30 },
  kitten: { label: "Chaton espiègle", rate: 1.15, tremolo: 0 },
  purr: { label: "Chat câlin", rate: 1.02, tremolo: 24 },
} as const;
export type VoiceStyle = keyof typeof voiceProfiles;
export const voiceRates = Object.fromEntries(Object.entries(voiceProfiles).map(([id, profile]) => [id, profile.rate])) as Record<VoiceStyle, number>;
