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
const quizChoices = [...document.querySelectorAll('.quiz-choice')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileLayout = window.matchMedia('(max-width: 760px)');

const stepConfig = {
  0: {
    label: 'Intro',
    orbit: '0deg 90deg auto',
    target: '0m 0m 0m',
    fov: '28deg',
    focusTarget: '0m 0.1m 0m',
    focusFov: '20deg',
    compareEyebrow: 'Before vs after editing',
    compareCopy: 'Use the controls to rotate the model, step through the edit, and compare the original site with the edited result.',
  },
  1: {
    label: 'Step 1 / Gene Region',
    orbit: '-6deg 88deg auto',
    target: '0m 0.06m 0m',
    fov: '25deg',
    focusTarget: '0m 0.1m 0m',
    focusFov: '18deg',
    compareEyebrow: 'Step 1 / Gene Region',
    compareCopy: 'A gene is one region of DNA. CRISPR is aimed at a chosen site inside that region, not the whole strand.',
  },
  2: {
    label: 'Step 2 / Target DNA',
    orbit: '-8deg 86deg auto',
    target: '0m 0.16m 0m',
    fov: '24deg',
    focusTarget: '0m 0.19m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Step 2 / Target DNA',
    compareCopy: 'The brackets mark the target DNA sequence scientists want the CRISPR system to find.',
  },
  3: {
    label: 'Step 3 / Guide RNA',
    orbit: '14deg 79deg auto',
    target: '0m 0.24m 0m',
    fov: '23deg',
    focusTarget: '0m 0.23m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Step 3 / Guide RNA',
    compareCopy: 'The guide RNA matches the target sequence and helps bring Cas9 to the right DNA location.',
  },
  4: {
    label: 'Step 4 / Cas9 Arrives',
    orbit: '1deg 80deg auto',
    target: '0m 0.06m 0m',
    fov: '22deg',
    focusTarget: '0m 0.06m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Step 4 / Cas9 Arrives',
    compareCopy: 'Cas9 is the enzyme in the system. The guide RNA positions it near the target before the cut.',
  },
  5: {
    label: 'Step 5 / Cas9 Cut',
    orbit: '2deg 77deg auto',
    target: '0m 0m 0m',
    fov: '21deg',
    focusTarget: '0m 0m 0m',
    focusFov: '16deg',
    compareEyebrow: 'Step 5 / Cas9 Cut',
    compareCopy: 'Cas9 cuts both DNA strands at the target site. The split model shows the break starting the edit.',
  },
  6: {
    label: 'Step 6 / DNA Repair',
    orbit: '-10deg 89deg auto',
    target: '0m -0.08m 0m',
    fov: '24deg',
    focusTarget: '0m -0.05m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Step 6 / DNA Repair',
    compareCopy: 'After the cut, the cell repairs the DNA. Repair can rejoin, disrupt, or change the sequence.',
  },
  7: {
    label: 'Step 7 / Edited DNA',
    orbit: '-12deg 91deg auto',
    target: '0m -0.14m 0m',
    fov: '23deg',
    focusTarget: '0m -0.11m 0m',
    focusFov: '17deg',
    compareEyebrow: 'Step 7 / Edited DNA',
    compareCopy: 'The edited site can end up different from the original version after repair.',
  },
  8: {
    label: 'Check Understanding',
    orbit: '-12deg 91deg auto',
    target: '0m -0.14m 0m',
    fov: '23deg',
    focusTarget: '0m -0.11m 0m',
    focusFov: '18deg',
    compareEyebrow: 'Quick Check',
    compareCopy: 'Answer the questions at the end to confirm the main CRISPR steps.',
  },
};

const hotspotInfo = {
  dna: {
    eyebrow: 'DNA',
    copy: 'DNA stores the sequence being edited. CRISPR targets only a selected region of that DNA.',
  },
  rna: {
    eyebrow: 'Guide RNA',
    copy: 'Guide RNA is the matching piece that helps direct Cas9 to the chosen target sequence.',
  },
  cas9: {
    eyebrow: 'Cas9',
    copy: 'Cas9 is the cutting enzyme. It makes the double-strand break at the target site.',
  },
  repair: {
    eyebrow: 'Repair',
    copy: 'The cell repairs the break. That repair step is what can disrupt or change the DNA sequence.',
  },
};

const viewState = {
  activeStep: 0,
  mutationMode: false,
  focusMode: false,
  activeHotspot: null,
  playing: false,
};

let playbackTimer = null;
let rewindTimer = null;
let rewindRunning = false;
let syncingCamera = false;

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
  const showSiteLabel = viewState.mutationMode || viewState.activeStep >= 7;
  mutationAnnotation.classList.toggle('is-visible', showSiteLabel);

  if (viewState.mutationMode) {
    mutationAnnotation.textContent = 'Mutation site';
    return;
  }

  mutationAnnotation.textContent = 'Edited sequence';
}

function syncHotspot() {
  sceneWrap.dataset.hotspot = viewState.activeHotspot || 'none';

  legendButtons.forEach((button) => {
    const isActive = button.dataset.focusPart === viewState.activeHotspot;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function syncCompareCard() {
  if (viewState.mutationMode) {
    compareEyebrow.textContent = 'Before editing';
    compareCopy.textContent = 'This view marks the same target site before editing, with the mutation still present.';
    return;
  }

  if (viewState.activeHotspot && hotspotInfo[viewState.activeHotspot]) {
    compareEyebrow.textContent = hotspotInfo[viewState.activeHotspot].eyebrow;
    compareCopy.textContent = hotspotInfo[viewState.activeHotspot].copy;
    return;
  }

  const step = getStep();
  compareEyebrow.textContent = step.compareEyebrow;
  compareCopy.textContent = step.compareCopy;
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
        ? compactLabel ? 'Edited' : 'Show edited result'
        : compactLabel ? 'Compare' : 'Compare mutation';
    }
  });

  mutationToggle.textContent = viewState.mutationMode ? 'Show edited result' : 'Show mutation vs edited';
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

function setStep(step, options = {}) {
  const nextStep = clampStep(step);
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
  sceneWrap.dataset.step = String(viewState.activeStep);
  sceneWrap.dataset.mode = viewState.mutationMode ? 'mutation' : 'fixed';
  sceneWrap.dataset.focus = viewState.focusMode ? 'target' : 'none';
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
  syncCompareCard();
  syncControls();
}

function updateVisiblePanels() {
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

    setStep(viewState.activeStep + 1, { scroll: true });
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

  if (viewState.mutationMode) {
    viewState.activeHotspot = null;
  }

  sceneWrap.dataset.mode = viewState.mutationMode ? 'mutation' : 'fixed';
  syncSiteAnnotation();
  syncHotspot();
  syncCompareCard();
  syncControls();
}

function handleAction(action) {
  if (action !== 'play') {
    stopPlayback();
  }

  if (action === 'prev') {
    setStep(viewState.activeStep - 1, { scroll: true });
  }

  if (action === 'next') {
    setStep(viewState.activeStep + 1, { scroll: true });
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

legendButtons.forEach((button) => {
  button.addEventListener('click', () => {
    stopPlayback();
    const part = button.dataset.focusPart;
    const turningOn = viewState.activeHotspot !== part;
    viewState.mutationMode = false;
    viewState.activeHotspot = turningOn ? part : null;

    if (turningOn && part === 'rna' && viewState.activeStep < 3) {
      setStep(3, { scroll: true });
    } else if (turningOn && part === 'cas9' && viewState.activeStep < 4) {
      setStep(4, { scroll: true });
    } else if (turningOn && part === 'repair' && viewState.activeStep < 6) {
      setStep(6, { scroll: true });
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
