import { shuffle } from './calculations';

export const clockLevels = [
  { name: 'Découverte', seconds: 90, icon: '🌱' },
  { name: 'Exploration', seconds: 75, icon: '🥕' },
  { name: 'Défi', seconds: 60, icon: '⭐' },
] as const;

type Level = 0 | 1 | 2;
export const clockGameIds = ['read', 'match', 'order', 'compare', 'elapsed', 'next'] as const;
export type ClockGame = (typeof clockGameIds)[number];
export const roundLength = 5;

export const clockGames = {
  read: { name: 'Lis l’horloge', icon: '🕰️', description: 'Regarde les aiguilles et trouve l’heure.', skills: ['Heures pile', 'Heures et demies', 'Quarts d’heure'] },
  match: { name: 'Trouve le cadran', icon: '🎯', description: 'Choisis l’horloge qui montre la bonne heure.', skills: ['Heures pile', 'Heures et demies', 'Minutes par 5'] },
  order: { name: 'Range la journée', icon: '🌤️', description: 'Trouve ce qui vient en premier, au milieu ou en dernier.', skills: ['Heures bien espacées', 'Heures et demies', 'Horaires rapprochés'] },
  compare: { name: 'Plus long ou plus court ?', icon: '⏳', description: 'Compare deux durées, comme avec deux sabliers.', skills: ['Minutes', 'Minutes et secondes', 'Heures et minutes'] },
  elapsed: { name: 'Combien de temps ?', icon: '🐾', description: 'Compte le temps entre le début et la fin.', skills: ['Heures entières', 'Par pas de 30 minutes', 'Par pas de 15 minutes'] },
  next: { name: 'Rendez-vous du lapin', icon: '🥕', description: 'Trouve l’heure à laquelle le lapin doit arriver.', skills: ['Ajoute une ou deux heures', 'Ajoute des demi-heures', 'Ajoute des minutes'] },
} satisfies Record<ClockGame, { name: string; icon: string; description: string; skills: [string, string, string] }>;

type Option = string | number;
export type ClockQuestion = {
  prompt: string;
  detail: string;
  face?: number;
  options: Option[];
  correct: Option;
  explanation: string;
};

const range = (count: number) => Array.from({ length: count }, (_, index) => index);
const minutesOnFace = (minutes: number) => minutes % 720;
export function clockTime(minutes: number, twelveHour = false): string {
  const hours = Math.floor(minutes / 60);
  const hour = twelveHour ? hours % 12 || 12 : hours;
  const minute = minutes % 60;
  return minute ? `${hour} h ${String(minute).padStart(2, '0')}` : `${hour} h`;
}

function durationText(minutes: number): string {
  return minutes < 60 ? `${minutes} min` : clockTime(minutes);
}

function faceQuestion(time: number, game: 'read' | 'match', level: Level): ClockQuestion {
  const alternatives = level === 0 ? [60, 120] : level === 1 ? [30, 60] : [15, 60];
  const faces = [time, ...alternatives.map(delta => minutesOnFace(time + delta))];
  const label = clockTime(time, true);
  const explanation = `La petite aiguille indique l’heure. La grande montre les minutes. Il est ${label}.`;
  return game === 'read'
    ? { prompt: 'Quelle heure est-il ?', detail: '', face: time, options: faces.map(value => clockTime(value, true)), correct: label, explanation }
    : { prompt: `Quelle horloge indique ${label} ?`, detail: '', options: faces, correct: time, explanation };
}

function orderQuestion(index: number, level: Level): ClockQuestion {
  const first = (7 + index % 6) * 60;
  const step = [120, 30, 15][level];
  const times = [first, first + step, first + step * (2 + index % 2)].map(value => clockTime(value));
  const position = Math.floor(index / 6);
  const labels = ['le plus tôt', 'entre les deux autres', 'le plus tard'];
  return { prompt: `Quelle heure vient ${labels[position]} ?`, detail: 'Imagine que ces trois heures sont le même jour.', options: times, correct: times[position], explanation: `Dans l’ordre : ${times.join(' → ')}.` };
}

function compareQuestion(index: number, level: Level): ClockQuestion {
  const amount = index + 2;
  const difference = [1, 0, -1][index % 3];
  const target = amount + difference;
  const first = [`${amount} min`, `${amount} min`, `${amount} h`][level];
  const second = [`${target} min`, `${target * 60} s`, `${target * 60} min`][level];
  const left = 'La première', right = 'La deuxième', equal = 'Même durée';
  const longer = Math.floor(index / 3) % 2 === 0;
  const correct = difference === 0 ? equal : (difference > 0) === longer ? right : left;
  const conversion = level === 0 ? '' : `${first} = ${amount * 60} ${level === 1 ? 's' : 'min'}. `;
  const comparison = difference === 0 ? 'Les deux durées sont égales.' : `${correct} dure ${longer ? 'plus' : 'moins'} longtemps.`;
  return { prompt: `Quelle durée est la plus ${longer ? 'longue' : 'courte'} ?`, detail: `① ${first}　·　② ${second}`, options: [left, right, equal], correct, explanation: conversion + comparison };
}

function travelQuestion(index: number, game: 'elapsed' | 'next', level: Level): ClockQuestion {
  const step = [60, 30, 15][level];
  const start = (7 + index % 7) * 60 + (index % 2) * (level === 2 ? 45 : level === 1 ? 30 : 0);
  const duration = step * (1 + Math.floor(index / 7) % (level === 0 ? 2 : 3));
  const end = start + duration;
  const explanation = `De ${clockTime(start)} à ${clockTime(end)}, il s’écoule ${durationText(duration)}.`;
  if (game === 'elapsed') return {
    prompt: 'Combien de temps dure la balade ?', detail: `Départ à ${clockTime(start)} · Retour à ${clockTime(end)}`,
    options: [duration, duration + step, duration + step * 2].map(durationText), correct: durationText(duration), explanation,
  };
  return {
    prompt: 'À quelle heure arrive le lapin ?', detail: `Il part à ${clockTime(start)}. Son trajet dure ${durationText(duration)}.`,
    options: [end, end + step, end - step].map(value => clockTime(value)), correct: clockTime(end), explanation,
  };
}

export function clockRound(game: ClockGame, level: Level, random = Math.random): ClockQuestion[] {
  let questions: ClockQuestion[];
  switch (game) {
    case 'read':
    case 'match': {
      const step = level === 2 && game === 'match' ? 5 : [60, 30, 15][level];
      questions = range(720 / step).map(index => faceQuestion(index * step, game, level));
      break;
    }
    case 'order': questions = range(18).map(index => orderQuestion(index, level)); break;
    case 'compare': questions = range(12).map(index => compareQuestion(index, level)); break;
    case 'elapsed':
    case 'next': questions = range(level === 0 ? 14 : 21).map(index => travelQuestion(index, game, level)); break;
  }
  return shuffle(questions, random).slice(0, roundLength).map(question => ({ ...question, options: shuffle(question.options, random) }));
}

export function clockFace(time: number): string {
  const hour = Math.floor(time / 60) || 12;
  const minute = time % 60;
  const hourPosition = minute ? `entre ${hour} et ${hour % 12 + 1}` : `sur le ${hour}`;
  const minutePosition = minute ? minute / 5 : 12;
  return `<svg class="clock-face" viewBox="0 0 140 140" role="img" aria-label="Petite aiguille ${hourPosition}, grande aiguille sur le ${minutePosition}">
    <circle cx="70" cy="70" r="66" fill="#fff9e7" stroke="#9e5977" stroke-width="5"/>
    ${range(12).map(index => `<text x="70" y="21" transform="rotate(${index * 30} 70 70) rotate(${-index * 30} 70 21)">${index || 12}</text>`).join('')}
    <path d="M70 70V43" stroke="#49335e" stroke-width="7" stroke-linecap="round" transform="rotate(${time / 2} 70 70)"/>
    <path d="M70 70V29" stroke="#ab4169" stroke-width="4" stroke-linecap="round" transform="rotate(${minute * 6} 70 70)"/>
    <circle cx="70" cy="70" r="4" fill="#49335e"/>
  </svg>`;
}
