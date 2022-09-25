import * as Tone from 'tone';
import { toSentenceCase } from './utils';

const intervals = {
  'minor 2nd': 1,
  'major 2nd': 2,
  'minor 3rd': 3,
  'major 3rd': 4,
  'perfect 4th': 5,
  tritone: 6,
  'perfect 5th': 7,
  'minor 6th': 8,
  'major 6th': 9,
  'minor 7th': 10,
  'major 7th': 11,
};

export class View {
  #publishGameStartEvent;
  #publishNewAnswerEvent;
  #currentSelectedIntervalSemitones;

  constructor(musicApp, publishGameStartEvent, publishNewAnswerEvent) {
    this.appContainer = musicApp;
    this.isPlayTonesButtonClicked = false;
    this.#publishGameStartEvent = publishGameStartEvent;
    this.#publishNewAnswerEvent = publishNewAnswerEvent;
    this.now = Tone.now();
    this.sampler = new Tone.Sampler({
      urls: {
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
      },
      release: 2,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
    }).toDestination();
  }

  #createButton(buttonText) {
    return this.#createElement('button', toSentenceCase(buttonText));
  }

  #createElement(elementType, elementText = '') {
    const element = document.createElement(elementType);
    element.textContent = elementText;
    return element;
  }

  renderStartPage() {
    if (this.appContainer.hasChildNodes()) this.appContainer.replaceChildren();

    const gameTitle = this.#createElement('h1', 'Cool name for music app');
    const gameRuleParagraph = this.#createElement(
      'p',
      'Guess the interval between the 2 tones.'
    );
    const gameStartButton = this.#createButton('Start');

    this.appContainer.append(gameTitle, gameRuleParagraph, gameStartButton);
    gameStartButton.addEventListener('click', this.#publishGameStartEvent);
  }

  renderQuestionPage() {
    this.appContainer.replaceChildren();

    const currentQuestionNumberDisplay = this.#createElement(
      'div',
      'Question: '
    );
    const currentQuestionNumberSpan = this.#createElement('span');
    currentQuestionNumberSpan.id = 'questionNumber';
    currentQuestionNumberDisplay.append(currentQuestionNumberSpan);

    const playTonesButton = this.#createButton('Play tones');
    playTonesButton.id = 'play-tone-btn';
    const gameRuleParagraph = this.#createElement(
      'p',
      'Guess the interval between the 2 tones.'
    );

    const buttonsGridContainer = this.#createElement('div');

    const submitAndMoveToNextQuestionButton =
      this.#createButton('Move to next');
    submitAndMoveToNextQuestionButton.disabled = true;
    const skipQuestionButton = this.#createButton('Skip');

    const currentScoreDisplay = this.#createElement('div', 'Score: ');
    const currentScoreSpan = this.#createElement('span');
    currentScoreSpan.id = 'currentScore';
    currentScoreDisplay.append(currentScoreSpan);

    this.appContainer.append(
      currentQuestionNumberDisplay,
      playTonesButton,
      gameRuleParagraph,
      buttonsGridContainer,
      skipQuestionButton,
      submitAndMoveToNextQuestionButton,
      currentScoreDisplay
    );

    const intervalButtons = Object.entries(intervals).map(
      ([intervalName, semitones]) => {
        const button = this.#createButton(intervalName);
        button.addEventListener('click', () => {
          this.#currentSelectedIntervalSemitones = semitones;
          submitAndMoveToNextQuestionButton.disabled = false;
        });
        return button;
      }
    );

    buttonsGridContainer.append(...intervalButtons);

    playTonesButton.addEventListener('click', () => {
      // playTonesButton clicked event
      this.isPlayTonesButtonClicked = true;
      this.#changePlayTonesButtonText();
    });

    skipQuestionButton.addEventListener('click', () => {
      this.#publishNewAnswerEvent(undefined);
    });

    submitAndMoveToNextQuestionButton.addEventListener('click', () => {
      this.#publishNewAnswerEvent(this.#currentSelectedIntervalSemitones);
      submitAndMoveToNextQuestionButton.disabled = true;
    });
  }

  updateQuestionPage(questionData) {
    this.isPlayTonesButtonClicked = false;
    const playTonesButton = document.getElementById('play-tone-btn');

    playTonesButton.addEventListener('click', () => {
      this.sampler.triggerAttackRelease(
        [questionData.note1, questionData.note2],
        this.now + 0.5
      );
      this.isPlayTonesButtonClicked = true;
      this.#changePlayTonesButtonText(playTonesButton);
    });

    this.#currentSelectedIntervalSemitones = undefined;
    const currentQuestionNumberSpan = document.getElementById('questionNumber');
    currentQuestionNumberSpan.textContent = questionData.questionNumber;
    const currentScoreSpan = document.getElementById('currentScore');
    currentScoreSpan.textContent = questionData.score;
  }

  #changePlayTonesButtonText(playTonesButton) {
    if (this.isPlayTonesButtonClicked) {
      playTonesButton.textContent = 'Replay tones';
    }
  }

  renderResults(userScore) {
    this.appContainer.replaceChildren();

    const finalUserScoreDisplay = this.#createElement('div');
    const finalUserScore = this.#createElement('span');
    finalUserScore.textContent = userScore;
    finalUserScoreDisplay.append(finalUserScore);

    const playGameAgainButton = this.#createButton('Play again!');

    this.appContainer.append(finalUserScoreDisplay, playGameAgainButton);

    playGameAgainButton.addEventListener(
      'click'
      // playGameAgainButton clicked event.
    );
  }
}
