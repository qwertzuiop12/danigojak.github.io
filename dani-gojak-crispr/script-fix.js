(function () {
  const simulator = document.querySelector('#repairSimulator');

  if (!simulator) {
    return;
  }

  const rounds = [
    {
      title: 'Keep the DNA message the same',
      prompt: 'This cell needs the DNA message to stay the same. Which repair result fits?',
      expected: 'correct',
      correctFeedback: 'Correct. The DNA message stays the same, so hemoglobin should still work normally.',
      wrongFeedback: 'Not quite. A mistake would change the DNA message instead of keeping it the same.',
    },
    {
      title: 'Show a mutation',
      prompt: 'A mutation remains in the HBB gene instruction. Which result shows that DNA changed?',
      expected: 'mistake',
      correctFeedback: 'Correct. A small DNA change is a mutation, and HBB mutations can affect hemoglobin.',
      wrongFeedback: 'Not quite. A correct repair would put the DNA back without leaving the mutation.',
    },
    {
      title: 'Predict the blood cell shape',
      prompt: 'For normal hemoglobin and round red blood cells, which repair result should happen?',
      expected: 'correct',
      correctFeedback: 'Correct. Normal hemoglobin helps red blood cells keep their usual round shape.',
      wrongFeedback: 'Not quite. A mutation in HBB can affect hemoglobin and may lead to sickled red blood cells.',
    },
  ];

  const state = {
    round: 0,
    score: 0,
    answered: false,
  };

  const get = (selector) => document.querySelector(selector);
  const choices = [...document.querySelectorAll('[data-sim-choice]')];
  const actions = [...document.querySelectorAll('[data-sim-action]')];

  function setText(selector, text) {
    const element = get(selector);

    if (element) {
      element.textContent = text;
    }
  }

  function setResult(choice) {
    simulator.dataset.simResult = choice || 'waiting';

    if (choice === 'correct') {
      setText('#simDnaResult', 'DNA repaired normally');
      setText('#simProteinResult', 'Hemoglobin instructions stay normal');
      setText('#simBloodLabel', 'Round red blood cell: oxygen carrying should stay normal.');
      return;
    }

    if (choice === 'mistake') {
      setText('#simDnaResult', 'DNA changed a little');
      setText('#simProteinResult', 'Hemoglobin instructions may change');
      setText('#simBloodLabel', 'Sickled red blood cell: shape can affect oxygen carrying.');
      return;
    }

    setText('#simDnaResult', 'Choose a repair button');
    setText('#simProteinResult', 'Updates after your choice');
    setText('#simBloodLabel', 'The red blood cell shape appears after you choose.');
  }

  function render() {
    const round = rounds[state.round];
    const roundNumber = state.round + 1;
    state.answered = false;

    setText('#simRoundLabel', `Patient cell ${roundNumber} of ${rounds.length}`);
    setText('#simScoreLabel', `Score: ${state.score} / ${rounds.length}`);
    setText('#simPromptLabel', `Round ${roundNumber}`);
    setText('#simPromptTitle', round.title);
    setText('#simPromptText', round.prompt);
    setText('#simFeedback', 'Choose an outcome to run this cell.');
    setResult(null);

    const summary = get('#simSummary');

    if (summary) {
      summary.hidden = true;
    }

    choices.forEach((button) => {
      button.disabled = false;
      button.classList.remove('is-selected', 'is-answer-wrong');
      button.setAttribute('aria-pressed', 'false');
    });

    actions.forEach((button) => {
      if (button.dataset.simAction === 'next') {
        button.disabled = true;
        button.textContent = state.round === rounds.length - 1 ? 'Show summary' : 'Next cell';
      }
    });
  }

  function finish() {
    const message = state.score === rounds.length
      ? 'You matched all three repair outcomes.'
      : `You matched ${state.score} of ${rounds.length} repair outcomes.`;

    setText('#simFeedback', `${message} The main idea is DNA change -> protein change -> cell shape change -> trait or health effect.`);

    const summary = get('#simSummary');

    if (summary) {
      summary.hidden = false;
    }

    choices.forEach((button) => {
      button.disabled = true;
    });

    actions.forEach((button) => {
      if (button.dataset.simAction === 'next') {
        button.disabled = true;
        button.textContent = 'Summary shown';
      }
    });
  }

  function choose(choice) {
    if (state.answered) {
      return;
    }

    const round = rounds[state.round];
    const isCorrect = choice === round.expected;
    state.answered = true;

    if (isCorrect) {
      state.score += 1;
    }

    setResult(choice);
    setText('#simScoreLabel', `Score: ${state.score} / ${rounds.length}`);
    setText('#simFeedback', isCorrect ? round.correctFeedback : round.wrongFeedback);

    choices.forEach((button) => {
      const selected = button.dataset.simChoice === choice;
      button.classList.toggle('is-selected', selected);
      button.classList.toggle('is-answer-wrong', selected && !isCorrect);
      button.setAttribute('aria-pressed', String(selected));
    });

    actions.forEach((button) => {
      if (button.dataset.simAction === 'next') {
        button.disabled = false;
      }
    });
  }

  function next() {
    if (!state.answered) {
      return;
    }

    if (state.round >= rounds.length - 1) {
      finish();
      return;
    }

    state.round += 1;
    render();
  }

  function restart() {
    state.round = 0;
    state.score = 0;
    render();
  }

  window.chooseSimulatorResult = choose;
  window.advanceSimulator = next;
  window.restartSimulator = restart;

  choices.forEach((button) => {
    button.addEventListener('click', () => choose(button.dataset.simChoice));
  });

  actions.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.simAction === 'next') {
        next();
      }

      if (button.dataset.simAction === 'restart') {
        restart();
      }
    });
  });

  render();
})();
