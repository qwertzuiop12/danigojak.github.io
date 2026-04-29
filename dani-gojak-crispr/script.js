const dnaViewer = document.querySelector('#dnaViewer');
const dnaViewerTop = document.querySelector('#dnaViewerTop');
const dnaViewerBottom = document.querySelector('#dnaViewerBottom');
const cas9Viewer = document.querySelector('#cas9Viewer');
const sceneWrap = document.querySelector('#sceneWrap');
const stepReadout = document.querySelector('#stepReadout');
const compareEyebrow = document.querySelector('#compareEyebrow');
const compareCopy = document.querySelector('#compareCopy');
const mutationToggle = document.querySelector('#mutationToggle');
const mutationAnnotation = document.querySelector('#mutationAnnotation');
const rewindOverlay = document.querySelector('#rewindOverlay');
const jumpChips = [...document.querySelectorAll('.jump-chip')];
const panels = [...document.querySelectorAll('.step-panel')];
const actionButtons = [...document.querySelectorAll('[data-action]')];
const legendButtons = [...document.querySelectorAll('[data-focus-part]')];
const branchButtons = [...document.querySelectorAll('[data-branch]')];
const quizChoices = [...document.querySelectorAll('.quiz-choice')];
const simulator = document.querySelector('#repairSimulator');
const simRoundLabel = document.querySelector('#simRoundLabel');
const simScoreLabel = document.querySelector('#simScoreLabel');
const simPromptLabel = document.querySelector('#simPromptLabel');
const simPromptTitle = document.querySelector('#simPromptTitle');
const simPromptText = document.querySelector('#simPromptText');
const simDnaResult = document.querySelector('#simDnaResult');
const simProteinResult = document.querySelector('#simProteinResult');
const simBloodLabel = document.querySelector('#simBloodLabel');
const simFeedback = document.querySelector('#simFeedback');
const simSummary = document.querySelector('#simSummary');
const simChoiceButtons = [...document.querySelectorAll('[data-sim-choice]')];
const simActionButtons = [...document.querySelectorAll('[data-sim-action]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileLayout = window.matchMedia('(max-width: 760px)');

const stepConfig = {
  0: {
    label: 'Intro',
    visualStep: 0,
    orbit: '0deg 90deg auto',
    target: '0m 0m 0m',
    fov: '28deg',
    focusTarget: '0m 0.1m 0m',
    focusFov: '20deg',
    compareEyebrow: 'DNA repair',
    compareCopy: 'Use the buttons to see what can happen after DNA gets cut.',
  },
  1: {
    label: 'Step 1 / DNA Cut',
    visualStep: 5,
    orbit: '2deg 77deg auto',
    target: '0m 0m 0m',
    fov: '21deg',
    focusTarget: '0m 0m 0m',
    focusFov: '16deg',
    compareEyebrow: 'Step 1 / DNA Cut',
    compareCopy: 'The DNA breaks at one spot. This cut starts the repair story.',
  },
  2: {
    label: 'Step 2 / Cell Notices',
    visualStep: 6,
    orbit: '-10deg 89deg auto',
    target: '0m -0.08m 0m',
    fov: '24deg',
    focusTarget: '0m -0.05m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Step 2 / Cell Notices',
    compareCopy: 'The cell detects the break and starts repair.',
  },
  3: {
    label: 'Step 3 / Cell Repair',
    visualStep: 6,
    orbit: '-10deg 89deg auto',
    target: '0m -0.08m 0m',
    fov: '24deg',
    focusTarget: '0m -0.05m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Step 3 / Cell Repair',
    compareCopy: 'The cell tries to join the broken DNA ends back together.',
  },
  4: {
    label: 'Step 4 / Choose Repair',
    visualStep: 6,
    orbit: '-10deg 89deg auto',
    target: '0m -0.08m 0m',
    fov: '24deg',
    focusTarget: '0m -0.05m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Step 4 / Choose Repair',
    compareCopy: 'Choose whether the cell fixes the DNA correctly or leaves a small mistake.',
  },
  5: {
    label: 'Step 5A / Correct Fix',
    visualStep: 7,
    orbit: '-12deg 91deg auto',
    target: '0m -0.14m 0m',
    fov: '23deg',
    focusTarget: '0m -0.11m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Step 5A / Correct Fix',
    compareCopy: 'The DNA goes back to normal, so the instructions stay the same.',
  },
  6: {
    label: 'Step 5B / Mistake Fix',
    visualStep: 7,
    orbit: '-12deg 91deg auto',
    target: '0m -0.14m 0m',
    fov: '23deg',
    focusTarget: '0m -0.11m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Step 5B / Mistake Fix',
    compareCopy: 'The DNA changes a little. That small DNA change is a mutation.',
  },
  7: {
    label: 'Final Step / Traits',
    visualStep: 7,
    orbit: '-12deg 91deg auto',
    target: '0m -0.14m 0m',
    fov: '23deg',
    focusTarget: '0m -0.11m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Final Step / Traits',
    compareCopy: 'If DNA instructions change, a trait can sometimes change too.',
  },
  8: {
    label: 'Check Understanding',
    visualStep: 7,
    orbit: '-12deg 91deg auto',
    target: '0m -0.14m 0m',
    fov: '23deg',
    focusTarget: '0m -0.11m 0m',
    focusFov: '18deg',
    compareEyebrow: 'Quick Check',
    compareCopy: 'Answer the questions at the end to check the basic repair idea.',
  },
};

const hotspotInfo = {
  dna: {
    eyebrow: 'DNA',
    copy: 'DNA stores instructions for cells. A cut can change those instructions if repair makes a mistake.',
  },
  rna: {
    eyebrow: 'Guide',
    copy: 'The guide helps the cutting tool find one spot in the DNA.',
  },
  cas9: {
    eyebrow: 'Cutter',
    copy: 'Cas9 is the cutting tool in this model. It makes the break in the DNA.',
  },
  repair: {
    eyebrow: 'Repair',
    copy: 'The cell tries to repair the break. The repair can be correct or can leave a small mistake.',
  },
};

const viewState = {
  activeStep: 0,
  mutationMode: false,
  repairChoice: 'correct',
  focusMode: false,
  activeHotspot: null,
  playing: false,
};

const simRounds = [
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

const simState = {
  round: 0,
  score: 0,
  answered: false,
  choices: [],
};

let playbackTimer = null;
let rewindTimer = null;
let rewindRunning = false;
let syncingCamera = false;
let scrollLockStep = null;
let scrollLockTimer = null;

function clampStep(step) {
  return Math.max(0, Math.min(Number(step), panels.length - 1));
}

function getStep() {
  return stepConfig[viewState.activeStep] || stepConfig[0];
}

function getPanelTop(step) {
  const panel = document.querySelector(`#panel-${step}`);
  if (!panel) {
    return 0;
  }

  const stickyOffset = mobileLayout.matches ? document.querySelector('.stage-column')?.getBoundingClientRect().height || 0 : 0;
  return Math.max(0, panel.getBoundingClientRect().top + window.scrollY - stickyOffset - 12);
}

function scrollToStep(step) {
  scrollLockStep = clampStep(step);

  if (scrollLockTimer) {
    window.clearTimeout(scrollLockTimer);
  }

  scrollLockTimer = window.setTimeout(() => {
    scrollLockStep = null;
    scrollLockTimer = null;
  }, reduceMotion.matches ? 120 : 1000);

  window.scrollTo({
    top: getPanelTop(step),
    behavior: reduceMotion.matches ? 'auto' : 'smooth',
  });
}

function syncViewerMotion() {
  dnaViewer.autoRotate = !reduceMotion.matches && viewState.activeStep === 0 && !viewState.playing;
  dnaViewer.rotationPerSecond = reduceMotion.matches ? '0deg' : '7deg';

  [dnaViewerTop, dnaViewerBottom].forEach((viewer) => {
    if (!viewer) {
      return;
    }

    viewer.autoRotate = false;
    viewer.rotationPerSecond = '0deg';
  });
}

function syncSplitViewersFromMain() {
  if (syncingCamera) {
    return;
  }

  [dnaViewerTop, dnaViewerBottom].forEach((viewer) => {
    if (!viewer) {
      return;
    }

    viewer.cameraOrbit = dnaViewer.cameraOrbit;
    viewer.cameraTarget = dnaViewer.cameraTarget;
    viewer.fieldOfView = dnaViewer.fieldOfView;
  });
}

function syncDnaViewerFraming(step, jump = false) {
  const orbit = step.orbit;
  const target = viewState.focusMode ? step.focusTarget : step.target;
  const fov = viewState.focusMode ? step.focusFov : step.fov;
  syncingCamera = true;

  [dnaViewer, dnaViewerTop, dnaViewerBottom].forEach((viewer) => {
    if (!viewer) {
      return;
    }

    viewer.cameraOrbit = orbit;
    viewer.cameraTarget = target;
    viewer.fieldOfView = fov;

    if (jump && typeof viewer.jumpCameraToGoal === 'function') {
      viewer.jumpCameraToGoal();
    }
  });

  window.requestAnimationFrame(() => {
    syncingCamera = false;
  });
}

function syncSiteAnnotation() {
  const showSiteLabel = viewState.mutationMode || viewState.activeStep >= 5;
  mutationAnnotation.classList.toggle('is-visible', showSiteLabel);

  if (viewState.mutationMode) {
    mutationAnnotation.textContent = 'DNA changed';
    return;
  }

  mutationAnnotation.textContent = 'Normal DNA';
}

function syncHotspot() {
  sceneWrap.dataset.hotspot = viewState.activeHotspot || 'none';

  legendButtons.forEach((button) => {
    const isActive = button.dataset.focusPart === viewState.activeHotspot;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function syncBranchChoice() {
  branchButtons.forEach((button) => {
    const isActive = button.dataset.branch === viewState.repairChoice;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function syncCompareCard() {
  if (viewState.mutationMode) {
    compareEyebrow.textContent = 'Fix with mistake';
    compareCopy.textContent = 'The DNA changes a little. That small change is a mutation.';
    return;
  }

  if (viewState.activeHotspot && hotspotInfo[viewState.activeHotspot]) {
    compareEyebrow.textContent = hotspotInfo[viewState.activeHotspot].eyebrow;
    compareCopy.textContent = hotspotInfo[viewState.activeHotspot].copy;
    return;
  }

  const step = getStep();
  compareEyebrow.textContent = step.compareEyebrow;
  compareCopy.textContent = viewState.activeStep === 7 && viewState.repairChoice === 'correct'
    ? 'A correct repair keeps the DNA instructions the same, so the trait should stay the same.'
    : step.compareCopy;
}

function syncControls() {
  const isFirst = viewState.activeStep === 0;
  const isLast = viewState.activeStep === panels.length - 1;

  actionButtons.forEach((button) => {
    const action = button.dataset.action;

    if (action === 'prev') {
      button.disabled = isFirst;
    }

    if (action === 'next') {
      button.disabled = isLast;
    }

    if (action === 'play') {
      button.textContent = viewState.playing ? 'Pause' : 'Play';
      button.setAttribute('aria-pressed', String(viewState.playing));
    }

    if (action === 'focus') {
      button.classList.toggle('is-active', viewState.focusMode);
      button.setAttribute('aria-pressed', String(viewState.focusMode));
    }

    if (action === 'compare') {
      const compactLabel = button.closest('.mobile-dock');
      button.classList.toggle('is-active', viewState.mutationMode);
      button.setAttribute('aria-pressed', String(viewState.mutationMode));
      button.textContent = viewState.mutationMode
        ? compactLabel ? 'Normal' : 'Show normal result'
        : compactLabel ? 'Compare' : 'Compare repair result';
    }
  });

  mutationToggle.textContent = viewState.mutationMode ? 'Show normal result' : 'Compare repair result';
}

function clearRewindTimer() {
  if (rewindTimer) {
    window.clearTimeout(rewindTimer);
    rewindTimer = null;
  }
}

function finishRewind() {
  document.body.classList.remove('is-rewinding');
  rewindOverlay?.setAttribute('aria-hidden', 'true');
  rewindRunning = false;
}

function stopPlayback() {
  viewState.playing = false;

  if (playbackTimer) {
    window.clearTimeout(playbackTimer);
    playbackTimer = null;
  }

  syncViewerMotion();
  syncControls();
}

function applyStepOutcome(step) {
  if (step <= 4) {
    viewState.mutationMode = false;
    return;
  }

  if (step === 5) {
    viewState.repairChoice = 'correct';
    viewState.mutationMode = false;
    return;
  }

  if (step === 6) {
    viewState.repairChoice = 'mistake';
    viewState.mutationMode = true;
    return;
  }

  viewState.mutationMode = viewState.repairChoice === 'mistake';
}

function setStep(step, options = {}) {
  const nextStep = clampStep(step);
  applyStepOutcome(nextStep);
  viewState.activeStep = nextStep;

  panels.forEach((panel) => {
    const isActive = Number(panel.dataset.step) === nextStep;
    panel.classList.toggle('is-active', isActive);

    if (isActive) {
      panel.classList.add('is-visible');
    }
  });

  updateSceneStep(options.jumpCamera);

  if (options.scroll) {
    scrollToStep(nextStep);
  }
}

function updateSceneStep(jumpCamera = false) {
  const step = getStep();
  sceneWrap.dataset.step = String(step.visualStep ?? viewState.activeStep);
  sceneWrap.dataset.mode = viewState.mutationMode ? 'mutation' : 'fixed';
  sceneWrap.dataset.focus = viewState.focusMode ? 'target' : 'none';
  sceneWrap.dataset.choice = viewState.repairChoice;
  stepReadout.textContent = step.label;
  syncDnaViewerFraming(step, jumpCamera);

  jumpChips.forEach((chip) => {
    chip.classList.toggle('is-active', Number(chip.dataset.jumpStep) === viewState.activeStep);
  });

  if (viewState.activeStep !== 8) {
    clearRewindTimer();
    if (!rewindRunning) {
      finishRewind();
    }
  }

  syncViewerMotion();
  syncSiteAnnotation();
  syncHotspot();
  syncBranchChoice();
  syncCompareCard();
  syncControls();
}

function updateVisiblePanels() {
  if (scrollLockStep !== null) {
    panels.forEach((panel) => {
      panel.classList.toggle('is-active', Number(panel.dataset.step) === scrollLockStep);
    });
    return;
  }

  const viewportAnchor = mobileLayout.matches ? window.innerHeight * 0.82 : window.innerHeight * 0.5;
  let bestStep = viewState.activeStep;
  let bestDistance = Number.POSITIVE_INFINITY;

  panels.forEach((panel) => {
    const rect = panel.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const distance = Math.abs(viewportAnchor - midpoint);

    if (rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08) {
      panel.classList.add('is-visible');
    }

    if (distance < bestDistance) {
      bestDistance = distance;
      bestStep = Number(panel.dataset.step);
    }
  });

  if (bestStep !== viewState.activeStep) {
    applyStepOutcome(bestStep);
    viewState.activeStep = bestStep;
    panels.forEach((panel) => {
      panel.classList.toggle('is-active', Number(panel.dataset.step) === bestStep);
    });
    updateSceneStep();
  }
}

let scrollTicking = false;
function queuePanelUpdate() {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;
  window.requestAnimationFrame(() => {
    updateVisiblePanels();
    scrollTicking = false;
  });
}

function replaySequence() {
  stopPlayback();
  rewindRunning = true;
  document.body.classList.add('is-rewinding');
  rewindOverlay?.setAttribute('aria-hidden', 'false');
  viewState.mutationMode = false;
  viewState.repairChoice = 'correct';
  viewState.focusMode = false;
  viewState.activeHotspot = null;
  setStep(0, { jumpCamera: true });

  window.scrollTo({
    top: 0,
    behavior: reduceMotion.matches ? 'auto' : 'smooth',
  });

  window.setTimeout(finishRewind, reduceMotion.matches ? 160 : 900);
}

function schedulePlaybackAdvance() {
  if (!viewState.playing) {
    return;
  }

  playbackTimer = window.setTimeout(() => {
    if (!viewState.playing) {
      return;
    }

    if (viewState.activeStep >= panels.length - 1) {
      stopPlayback();
      return;
    }

    setStep(getNextStep(), { scroll: true });
    schedulePlaybackAdvance();
  }, reduceMotion.matches ? 1500 : 2800);
}

function startPlayback() {
  if (viewState.playing) {
    stopPlayback();
    return;
  }

  viewState.playing = true;
  syncControls();
  syncViewerMotion();

  if (viewState.activeStep >= panels.length - 1) {
    setStep(0, { scroll: true, jumpCamera: true });
  }

  schedulePlaybackAdvance();
}

function resetView() {
  viewState.focusMode = false;
  viewState.activeHotspot = null;
  updateSceneStep(true);
}

function toggleCompare() {
  viewState.mutationMode = !viewState.mutationMode;
  viewState.repairChoice = viewState.mutationMode ? 'mistake' : 'correct';

  if (viewState.mutationMode) {
    viewState.activeHotspot = null;
  }

  sceneWrap.dataset.mode = viewState.mutationMode ? 'mutation' : 'fixed';
  syncSiteAnnotation();
  syncHotspot();
  syncCompareCard();
  syncControls();
}

function getNextStep() {
  if (viewState.activeStep === 4) {
    return viewState.repairChoice === 'mistake' ? 6 : 5;
  }

  if (viewState.activeStep === 5 || viewState.activeStep === 6) {
    return 7;
  }

  return viewState.activeStep + 1;
}

function getPreviousStep() {
  if (viewState.activeStep === 7) {
    return viewState.repairChoice === 'mistake' ? 6 : 5;
  }

  if (viewState.activeStep === 5 || viewState.activeStep === 6) {
    return 4;
  }

  return viewState.activeStep - 1;
}

function chooseRepair(choice) {
  viewState.repairChoice = choice;
  viewState.activeHotspot = null;
  setStep(choice === 'mistake' ? 6 : 5, { scroll: true, jumpCamera: true });
}

function handleAction(action) {
  if (action !== 'play') {
    stopPlayback();
  }

  if (action === 'prev') {
    setStep(getPreviousStep(), { scroll: true });
  }

  if (action === 'next') {
    setStep(getNextStep(), { scroll: true });
  }

  if (action === 'play') {
    startPlayback();
  }

  if (action === 'focus') {
    viewState.focusMode = !viewState.focusMode;
    updateSceneStep(true);
  }

  if (action === 'reset') {
    resetView();
  }

  if (action === 'replay') {
    replaySequence();
  }

  if (action === 'compare') {
    toggleCompare();
  }
}

function setSimulatorResult(choice) {
  if (!simulator) {
    return;
  }

  simulator.dataset.simResult = choice || 'waiting';

  if (choice === 'correct') {
    simDnaResult.textContent = 'DNA repaired normally';
    simProteinResult.textContent = 'Hemoglobin instructions stay normal';
    simBloodLabel.textContent = 'Round red blood cell: oxygen carrying should stay normal.';
    return;
  }

  if (choice === 'mistake') {
    simDnaResult.textContent = 'DNA changed a little';
    simProteinResult.textContent = 'Hemoglobin instructions may change';
    simBloodLabel.textContent = 'Sickled red blood cell: shape can affect oxygen carrying.';
    return;
  }

  simDnaResult.textContent = 'Waiting for choice';
  simProteinResult.textContent = 'Hemoglobin not shown yet';
  simBloodLabel.textContent = 'Choose a repair result to see the red blood cell.';
}

function renderSimulator() {
  if (!simulator) {
    return;
  }

  const round = simRounds[simState.round];
  const roundNumber = simState.round + 1;
  simRoundLabel.textContent = `Patient cell ${roundNumber} of ${simRounds.length}`;
  simScoreLabel.textContent = `Score: ${simState.score} / ${simRounds.length}`;
  simPromptLabel.textContent = `Round ${roundNumber}`;
  simPromptTitle.textContent = round.title;
  simPromptText.textContent = round.prompt;
  simFeedback.textContent = 'Choose an outcome to run this cell.';
  simSummary.hidden = true;

  setSimulatorResult(null);

  simChoiceButtons.forEach((button) => {
    button.disabled = false;
    button.classList.remove('is-selected', 'is-answer-wrong');
    button.setAttribute('aria-pressed', 'false');
  });

  simActionButtons.forEach((button) => {
    if (button.dataset.simAction === 'next') {
      button.disabled = true;
      button.textContent = simState.round === simRounds.length - 1 ? 'Show summary' : 'Next cell';
    }
  });
}

function finishSimulator() {
  const message = simState.score === simRounds.length
    ? 'You matched all three repair outcomes.'
    : `You matched ${simState.score} of ${simRounds.length} repair outcomes.`;

  simFeedback.textContent = `${message} The main idea is DNA change -> protein change -> cell shape change -> trait or health effect.`;
  simSummary.hidden = false;

  simChoiceButtons.forEach((button) => {
    button.disabled = true;
  });

  simActionButtons.forEach((button) => {
    if (button.dataset.simAction === 'next') {
      button.disabled = true;
      button.textContent = 'Summary shown';
    }
  });
}

function chooseSimulatorResult(choice) {
  if (!simulator || simState.answered) {
    return;
  }

  const round = simRounds[simState.round];
  const isCorrect = choice === round.expected;
  simState.answered = true;
  simState.choices[simState.round] = choice;

  if (isCorrect) {
    simState.score += 1;
  }

  setSimulatorResult(choice);
  simScoreLabel.textContent = `Score: ${simState.score} / ${simRounds.length}`;
  simFeedback.textContent = isCorrect ? round.correctFeedback : round.wrongFeedback;

  simChoiceButtons.forEach((button) => {
    const isSelected = button.dataset.simChoice === choice;
    button.classList.toggle('is-selected', isSelected);
    button.classList.toggle('is-answer-wrong', isSelected && !isCorrect);
    button.setAttribute('aria-pressed', String(isSelected));
  });

  simActionButtons.forEach((button) => {
    if (button.dataset.simAction === 'next') {
      button.disabled = false;
    }
  });
}

function advanceSimulator() {
  if (!simState.answered) {
    return;
  }

  if (simState.round >= simRounds.length - 1) {
    finishSimulator();
    return;
  }

  simState.round += 1;
  simState.answered = false;
  renderSimulator();
}

function restartSimulator() {
  simState.round = 0;
  simState.score = 0;
  simState.answered = false;
  simState.choices = [];
  renderSimulator();
}

actionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    handleAction(button.dataset.action);
  });
});

jumpChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    stopPlayback();
    setStep(Number(chip.dataset.jumpStep), { scroll: true });
  });
});

branchButtons.forEach((button) => {
  button.addEventListener('click', () => {
    stopPlayback();
    chooseRepair(button.dataset.branch);
  });
});

legendButtons.forEach((button) => {
  button.addEventListener('click', () => {
    stopPlayback();
    const part = button.dataset.focusPart;
    const turningOn = viewState.activeHotspot !== part;
    viewState.mutationMode = false;
    viewState.activeHotspot = turningOn ? part : null;

    if (turningOn && part === 'rna' && viewState.activeStep < 1) {
      setStep(1, { scroll: true });
    } else if (turningOn && part === 'cas9' && viewState.activeStep < 1) {
      setStep(1, { scroll: true });
    } else if (turningOn && part === 'repair' && viewState.activeStep < 3) {
      setStep(3, { scroll: true });
    } else {
      updateSceneStep();
    }
  });
});

quizChoices.forEach((choice) => {
  choice.addEventListener('click', () => {
    const question = choice.closest('.quiz-question');
    const choices = [...question.querySelectorAll('.quiz-choice')];
    const feedback = question.querySelector('.quiz-feedback');
    const correct = choice.dataset.correct === 'true';

    choices.forEach((button) => {
      button.classList.remove('is-selected', 'is-correct', 'is-wrong');
      button.setAttribute('aria-pressed', 'false');
    });

    choice.classList.add('is-selected', correct ? 'is-correct' : 'is-wrong');
    choice.setAttribute('aria-pressed', 'true');
    question.dataset.answered = correct ? 'correct' : 'wrong';
    feedback.textContent = correct ? 'Correct.' : 'Not quite. Try the answer that matches the step shown in the model.';
  });
});

simChoiceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    chooseSimulatorResult(button.dataset.simChoice);
  });
});

simActionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.simAction === 'next') {
      advanceSimulator();
    }

    if (button.dataset.simAction === 'restart') {
      restartSimulator();
    }
  });
});

reduceMotion.addEventListener('change', () => {
  syncViewerMotion();
});

mobileLayout.addEventListener('change', () => {
  updateVisiblePanels();
});

window.addEventListener('scroll', queuePanelUpdate, { passive: true });
window.addEventListener('resize', updateVisiblePanels);

dnaViewer.addEventListener('load', () => {
  updateSceneStep(true);
  syncViewerMotion();
});

dnaViewer.addEventListener('camera-change', syncSplitViewersFromMain);

[dnaViewerTop, dnaViewerBottom].forEach((viewer) => {
  viewer?.addEventListener('load', () => {
    const step = getStep();
    syncDnaViewerFraming(step);
  });
});

cas9Viewer?.addEventListener('load', () => {
  cas9Viewer.orientation = '0deg 0deg 90deg';
  cas9Viewer.cameraOrbit = '0deg 90deg 120%';
  cas9Viewer.fieldOfView = '20deg';
  cas9Viewer.jumpCameraToGoal();
});

setStep(0, { jumpCamera: true });
syncViewerMotion();
renderSimulator();
