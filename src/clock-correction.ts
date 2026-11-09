import { clockFace, clockTime, type ClockQuestion } from './clock-games';
import { sprite } from './themes';

function answerLabel(answer: ClockQuestion['correct']): string {
  return typeof answer === 'number' ? clockTime(answer, true) : answer;
}

function correctionFigure(question: ClockQuestion): string {
  const visual = question.correction;
  switch (visual.kind) {
    case 'face':
      return `<figure class="clock-lesson-figure clock-lesson-face">${clockFace(visual.time)}<figcaption><span>Petite aiguille · heures</span><span>Grande aiguille · minutes</span></figcaption></figure>`;
    case 'order':
      return `<figure class="clock-lesson-figure"><figcaption>Du plus tôt au plus tard</figcaption><ol class="clock-lesson-line">${visual.times.map(time =>
        `<li${time === question.correct ? ' class="clock-lesson-highlight"' : ''}>${time}</li>`).join('')}</ol></figure>`;
    case 'compare': {
      const longest = Math.max(...visual.lengths);
      return `<figure class="clock-lesson-figure"><figcaption>Les durées côte à côte</figcaption><ul class="clock-lesson-bars">${visual.labels.map((label, index) =>
        `<li><span>${index === 0 ? '①' : '②'} ${label}</span><i aria-hidden="true" style="--clock-duration:${visual.lengths[index] / longest * 100}%"></i></li>`).join('')}</ul></figure>`;
    }
    case 'journey':
      return `<figure class="clock-lesson-figure"><figcaption>Le trajet du lapin</figcaption><div class="clock-lesson-line clock-lesson-journey"><span>Départ<br><strong>${visual.start}</strong></span><span class="clock-lesson-highlight">+ ${visual.duration}<br><span aria-hidden="true">⟶</span></span><span>Arrivée<br><strong>${visual.end}</strong></span></div></figure>`;
  }
}

export function clockCorrectionMarkup(question: ClockQuestion, selected: ClockQuestion['correct'], seconds: number): string {
  return `<article class="clock-lesson" data-lesson-kind="${question.correction.kind}">
    <header class="clock-lesson-header">${sprite('kitten', 0, 'clock-kitten-sticker')}<div><span class="clock-kicker">CHRONO EN PAUSE · ${seconds} S RESTANTES</span><h2 id="clock-heading" tabindex="-1">Regardons ensemble</h2></div></header>
    <div class="clock-lesson-body"><div class="clock-lesson-text"><p class="clock-lesson-question">${question.prompt}</p>
    <p>Tu avais choisi <strong>${answerLabel(selected)}</strong>.</p><p class="clock-lesson-answer"><span>LA BONNE RÉPONSE</span><strong>${answerLabel(question.correct)}</strong></p><p>${question.explanation}</p></div>
    ${correctionFigure(question)}</div>
    <footer class="clock-lesson-footer"><p>Prends le temps de regarder la fiche.</p><button class="play-button" type="button" data-clock-action="continue-lesson">J’ai compris, on continue</button></footer>
  </article>`;
}
