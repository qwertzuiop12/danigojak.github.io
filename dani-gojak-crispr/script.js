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
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const stepConfig = {
  0: {
    label: 'Intro',
    orbit: '0deg 90deg auto',
    target: '0m 0m 0m',
    fov: '28deg',
    compareEyebrow: 'Before vs after editing',
    compareCopy: 'Use the button to compare the same DNA site before editing and after repair, so the mutation and edited version can be compared directly.',
  },
  1: {
    label: 'Step 1 / Gene Region',
    orbit: '-6deg 88deg auto',
    target: '0m 0.06m 0m',
    fov: '25deg',
    compareEyebrow: 'Step 1 / Gene Region',
    compareCopy: 'This larger label marks the gene region that contains the target DNA site.',
  },
  2: {
    label: 'Step 2 / Target DNA',
    orbit: '-8deg 86deg auto',
    target: '0m 0.16m 0m',
    fov: '24deg',
    compareEyebrow: 'Step 2 / Target DNA',
    compareCopy: 'The brackets mark the exact DNA site selected for editing within the gene region, showing where the CRISPR system will act.',
  },
  3: {
    label: 'Step 3 / Guide RNA',
    orbit: '14deg 79deg auto',
    target: '0m 0.24m 0m',
    fov: '23deg',
    compareEyebrow: 'Step 3 / Guide RNA',
    compareCopy: 'The guide RNA matches the target DNA sequence and guides Cas9 to that same site, acting like a molecular address label.',
  },
  4: {
    label: 'Step 4 / Cas9 Arrives',
    orbit: '1deg 80deg auto',
    target: '0m 0.06m 0m',
    fov: '22deg',
    compareEyebrow: 'Step 4 / Cas9 Arrives',
    compareCopy: 'Cas9 is brought to the same DNA site by the guide RNA before the cut is made.',
  },
  5: {
    label: 'Step 5 / Cas9 Cut',
    orbit: '2deg 77deg auto',
    target: '0m 0m 0m',
    fov: '21deg',
    compareEyebrow: 'Step 5 / Cas9 Cut',
    compareCopy: 'Cas9 is the cutting enzyme. It makes a break in both DNA strands at the target site to start the editing process.',
  },
  6: {
    label: 'Step 6 / DNA Repair',
    orbit: '-10deg 89deg auto',
    target: '0m -0.08m 0m',
    fov: '24deg',
    compareEyebrow: 'Step 6 / DNA Repair',
    compareCopy: 'After the cut, the cell repairs the DNA. That repair can rejoin, disrupt, or change the edited site depending on how the break is fixed.',
  },
  7: {
    label: 'Step 7 / Edited DNA',
    orbit: '-12deg 91deg auto',
    target: '0m -0.14m 0m',
    fov: '23deg',
    compareEyebrow: 'Step 7 / Edited DNA',
    compareCopy: 'This final state shows the DNA after repair, where the edited site can differ from the original version.',
  },
  8: {
    label: 'Replay',
    orbit: '-12deg 91deg auto',
    target: '0m -0.14m 0m',
    fov: '23deg',
    compareEyebrow: 'Replay Sequence',
    compareCopy: 'Scroll to the end to replay the full CRISPR sequence from the top.',
  },
};

const viewState = {
  activeStep: 0,
  mutationMode: false,
};

let rewindTimer = null;
let rewindRunning = false;

function syncViewerMotion() {
  dnaViewer.autoRotate = !reduceMotion.matches && viewState.activeStep === 0;
  dnaViewer.rotationPerSecond = reduceMotion.matches ? '0deg' : '7deg';

  [dnaViewerTop, dnaViewerBottom].forEach((viewer) => {
    if (!viewer) {
      return;
    }

    viewer.autoRotate = false;
    viewer.rotationPerSecond = '0deg';
  });
}

function syncDnaViewerFraming(step) {
  const viewers = [dnaViewer, dnaViewerTop, dnaViewerBottom];

  viewers.forEach((viewer) => {
    if (!viewer) {
      return;
    }

    viewer.cameraOrbit = step.orbit;
    viewer.cameraTarget = step.target;
    viewer.fieldOfView = step.fov;
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

function scheduleRewindIfNeeded() {
  if (viewState.activeStep !== 8 || rewindRunning || rewindTimer) {
    return;
  }

  rewindTimer = window.setTimeout(() => {
    rewindTimer = null;

    if (viewState.activeStep !== 8) {
      return;
    }

    rewindRunning = true;
    document.body.classList.add('is-rewinding');
    rewindOverlay?.setAttribute('aria-hidden', 'false');

    window.scrollTo({
      top: 0,
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
    });

    window.setTimeout(finishRewind, reduceMotion.matches ? 160 : 1800);
  }, 1100);
}

function syncMutationMode() {
  sceneWrap.dataset.mode = viewState.mutationMode ? 'mutation' : 'fixed';

  if (viewState.mutationMode) {
    compareEyebrow.textContent = 'Before editing';
    compareCopy.textContent = 'This preview shows the same target site before editing, with the mutation still present.';
  } else {
    const step = stepConfig[viewState.activeStep];
    compareEyebrow.textContent = step.compareEyebrow;
    compareCopy.textContent = step.compareCopy;
  }

  syncSiteAnnotation();
}

function updateSceneStep() {
  const step = stepConfig[viewState.activeStep];
  sceneWrap.dataset.step = String(viewState.activeStep);
  stepReadout.textContent = step.label;
  syncDnaViewerFraming(step);

  jumpChips.forEach((chip) => {
    chip.classList.toggle('is-active', Number(chip.dataset.jumpStep) === viewState.activeStep);
  });

  if (!viewState.mutationMode) {
    compareEyebrow.textContent = step.compareEyebrow;
    compareCopy.textContent = step.compareCopy;
  }

  if (viewState.activeStep === 8) {
    scheduleRewindIfNeeded();
  } else {
    clearRewindTimer();
    if (!rewindRunning) {
      finishRewind();
    }
  }

  syncViewerMotion();
  syncSiteAnnotation();
}

function updateVisiblePanels() {
  const viewportMiddle = window.innerHeight * 0.5;
  let bestStep = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  panels.forEach((panel) => {
    const rect = panel.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const distance = Math.abs(viewportMiddle - midpoint);

    if (rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.12) {
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

mutationToggle.addEventListener('click', () => {
  viewState.mutationMode = !viewState.mutationMode;
  syncMutationMode();
});

jumpChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const step = Number(chip.dataset.jumpStep);
    document.querySelector(`#panel-${step}`)?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });
});

reduceMotion.addEventListener('change', () => {
  syncViewerMotion();
});

window.addEventListener('scroll', queuePanelUpdate, { passive: true });
window.addEventListener('resize', updateVisiblePanels);

dnaViewer.addEventListener('load', () => {
  updateSceneStep();
  syncViewerMotion();
});

[dnaViewerTop, dnaViewerBottom].forEach((viewer) => {
  viewer?.addEventListener('load', () => {
    const step = stepConfig[viewState.activeStep];
    syncDnaViewerFraming(step);
  });
});

cas9Viewer?.addEventListener('load', () => {
  cas9Viewer.orientation = '0deg 0deg 90deg';
  cas9Viewer.cameraOrbit = '0deg 90deg 120%';
  cas9Viewer.fieldOfView = '20deg';
  cas9Viewer.jumpCameraToGoal();
});

updateVisiblePanels();
updateSceneStep();
syncMutationMode();
