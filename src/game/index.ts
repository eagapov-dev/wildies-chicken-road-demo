import { asset, el, formatCredits, img } from '../util/dom';
import { ChickenRoadEngine } from './engine';
import { RoadScene } from './scene';
import { openBonusModal } from './bonusModal';
import {
  BET_STEP,
  BONUS_DELAY_MS,
  CREDIT_LABEL,
  DIFFICULTIES,
  MAX_BET,
  MIN_BET,
  QUICK_BETS,
  ROUNDS_FOR_BONUS,
  SETTLE_DELAY_MS,
  getDifficulty,
} from './config';

/**
 * Builds the whole "try before you register" demo block:
 * stage + control panel + disclosure strip, wired to the engine.
 */
export function createGameDemo(): HTMLElement {
  const engine = new ChickenRoadEngine('easy');

  // ------------------------------------------------------------------ stage
  // The canvas is decorative for assistive tech: every meaningful value is
  // mirrored as text in the panel and announced through `liveRegion`.
  const canvas = el('canvas', { class: 'stage__canvas', 'aria-hidden': 'true' });

  const liveRegion = el('p', {
    class: 'sr-only',
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });

  const multiplierPill = hudPill('Multiplier', '1.00x', 'hud-pill--mult');
  const winPill = hudPill('Cash out', `0.00 ${CREDIT_LABEL}`, 'hud-pill--win');

  const coverStart = el('button', {
    class: 'btn btn--primary',
    type: 'button',
    text: 'Start the demo',
  });

  const cover = el('div', { class: 'stage__cover' }, [
    el('h3', { text: 'Chicken Road 2 – free demo' }),
    el('p', {
      text:
        'Cross the lanes one at a time. Every step raises your multiplier – cash out whenever you like. ' +
        'Demo credits only: this simulation is configured to show winning outcomes and pays nothing real.',
    }),
    coverStart,
  ]);

  const stage = el('div', { class: 'stage' }, [
    canvas,
    el('div', { class: 'stage__watermark', text: 'DEMO', 'aria-hidden': 'true' }),
    el('div', { class: 'stage__hud' }, [multiplierPill.root, winPill.root]),
    liveRegion,
    cover,
  ]);

  let toast: HTMLElement | null = null;
  const showToast = (text: string): void => {
    toast?.remove();
    toast = el('div', { class: 'stage__toast', 'aria-hidden': 'true', text });
    stage.append(toast);
  };
  const clearToast = (): void => {
    toast?.remove();
    toast = null;
  };

  // ------------------------------------------------------------------ panel
  const balanceValue = el('b', { text: '0.00' });
  const balance = el('div', { class: 'balance' }, [
    balanceValue,
    el('em', { text: `${CREDIT_LABEL} · DEMO` }),
  ]);

  const betInput = el('input', {
    type: 'number',
    min: MIN_BET,
    max: MAX_BET,
    step: BET_STEP,
    value: '10',
    'aria-label': 'Bet (demo credits), 1 to 100',
  });
  const betMinus = el('button', { type: 'button', 'aria-label': 'Decrease bet', text: '−' });
  const betPlus = el('button', { type: 'button', 'aria-label': 'Increase bet', text: '+' });
  const stepper = el('div', { class: 'stepper' }, [betMinus, betInput, betPlus]);

  const quickBetButtons = QUICK_BETS.map((value) =>
    el('button', {
      type: 'button',
      text: String(value),
      'data-bet': value,
      'aria-label': `Bet ${value} demo credits`,
    }),
  );
  const quickBets = el(
    'div',
    { class: 'quick-bets', role: 'group', 'aria-label': 'Quick bet' },
    quickBetButtons,
  );

  const difficultyButtons = DIFFICULTIES.map((d) =>
    el('button', {
      type: 'button',
      text: d.label,
      'data-difficulty': d.id,
      'aria-pressed': 'false',
    }),
  );
  const difficulty = el('div', { class: 'difficulty', role: 'group', 'aria-label': 'Difficulty' }, difficultyButtons);

  const primary = el('button', { class: 'btn btn--primary btn--block panel__cta', type: 'button' });
  const cashOut = el('button', {
    class: 'btn btn--block panel__cta panel__cta--cashout',
    type: 'button',
  });

  const statMultiplier = stat('This round', '1.00x');
  const statWin = stat('Last win', `0.00`);
  const roundsDots = el(
    'div',
    { class: 'rounds-dots' },
    Array.from({ length: ROUNDS_FOR_BONUS }, () => el('i', {})),
  );
  const roundsValue = el('b', { text: '0' });
  const statRounds = el('div', { class: 'stat' }, [
    el('span', { text: `Rounds · bonus at ${ROUNDS_FOR_BONUS}` }),
    roundsValue,
    roundsDots,
  ]);

  const panel = el('div', { class: 'panel' }, [
    el('div', { class: 'panel__block' }, [
      el('span', { class: 'panel__label', text: 'Demo balance' }),
      balance,
    ]),
    el('div', { class: 'panel__block' }, [
      el('span', { class: 'panel__label', text: 'Bet (demo credits)' }),
      stepper,
      quickBets,
    ]),
    el('div', { class: 'panel__block' }, [
      el('span', { class: 'panel__label', text: 'Difficulty' }),
      difficulty,
    ]),
    primary,
    cashOut,
    el('div', { class: 'panel__stats' }, [statMultiplier.root, statWin.root]),
    statRounds,
    el('p', { class: 'panel__notice' }, [
      el('strong', { text: 'Simulated outcomes. ' }),
      document.createTextNode(
        'For this assessment the demo is pre-set so the chicken always crosses safely. ' +
          'Balances are play money and nothing can be deposited, won or withdrawn.',
      ),
    ]),
  ]);

  // ------------------------------------------------------------------ shell
  const shell = el('div', { class: 'demo__shell' }, [
    el('div', { class: 'demo__bar' }, [
      el('div', { class: 'demo__bar-title' }, [
        img(asset('games/INOUT/ChickenRoad2.webp'), '', { width: 28, height: 28 }),
        el('div', {}, [
          el('div', { text: 'Chicken Road 2' }),
          el('div', { class: 'demo__bar-provider', text: 'InOut · Demo recreation' }),
        ]),
      ]),
      el('div', { class: 'demo__bar-spacer' }),
      el('span', { class: 'tag tag--demo', text: 'Demo · play money' }),
      el('span', { class: 'tag tag--sim', text: 'Simulated outcomes' }),
    ]),
    el('div', { class: 'demo__body' }, [stage, panel]),
    el('p', { class: 'demo__legal' }, [
      el('span', {}, [
        el('strong', { text: 'Test environment. ' }),
        document.createTextNode(
          'This is a demonstration built for a technical assessment, not the licensed InOut game and not a real-money product. ' +
            'Results are simulated and deliberately favourable, so they do not represent real gameplay or real odds. ' +
            'No registration, deposit, withdrawal or prize of any kind is available here.',
        ),
      ]),
    ]),
  ]);

  const section = el('section', { class: 'section demo', id: 'chicken-road-2-demo' }, [
    el('div', { class: 'section__head' }, [
      img(asset('games/INOUT/ChickenRoad2.webp'), '', {
        class: 'section__icon section__icon--thumb',
        width: 26,
        height: 26,
      }),
      el('h2', { class: 'section__title', text: 'Try before you register' }),
    ]),
    shell,
  ]);

  // ------------------------------------------------------------------- logic
  const scene = new RoadScene(canvas);
  let busy = false;
  /** Deferred board cleanup after a round settles - cancelled if a new round starts. */
  let settleTimer = 0;
  let bonusTimer = 0;

  /** Blocks a control without the focus loss the `disabled` attribute causes. */
  const setBlocked = (button: HTMLButtonElement, blocked: boolean): void => {
    button.setAttribute('aria-disabled', blocked ? 'true' : 'false');
    button.classList.toggle('is-blocked', blocked);
  };
  const isBlocked = (button: HTMLButtonElement): boolean =>
    button.getAttribute('aria-disabled') === 'true';

  const announce = (message: string): void => {
    liveRegion.textContent = message;
  };

  scene.onHopEnd = () => {
    busy = false;
    render();
  };

  const syncTrack = (): void => {
    scene.setTrack(engine.multipliers, getDifficulty(engine.getState().difficulty).traffic);
  };

  function render(): void {
    const s = engine.getState();

    balanceValue.textContent = formatCredits(s.balance);
    if (document.activeElement !== betInput) betInput.value = String(s.bet);

    multiplierPill.value.textContent = `${s.multiplier.toFixed(2)}x`;
    winPill.value.textContent = `${formatCredits(s.phase === 'crossing' ? s.cashOutValue : s.lastWin)} ${CREDIT_LABEL}`;
    statMultiplier.value.textContent = `${s.multiplier.toFixed(2)}x`;
    statWin.value.textContent = formatCredits(s.lastWin);

    roundsValue.textContent = String(s.roundsCompleted);
    roundsDots.querySelectorAll('i').forEach((dot, index) => {
      dot.classList.toggle('is-on', index < Math.min(s.roundsCompleted, ROUNDS_FOR_BONUS));
    });

    difficultyButtons.forEach((button) => {
      const active = button.dataset.difficulty === s.difficulty;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.disabled = s.phase === 'crossing';
    });

    const locked = s.phase === 'crossing';
    betInput.disabled = locked;
    betMinus.disabled = locked || s.bet <= MIN_BET;
    betPlus.disabled = locked || s.bet >= MAX_BET || s.bet >= s.balance;
    quickBetButtons.forEach((b) => {
      b.disabled = locked;
    });

    // `aria-disabled` rather than the `disabled` attribute: the browser blurs a
    // disabled element, which would drop keyboard focus on every single step.
    if (s.phase === 'crossing') {
      primary.className = 'btn btn--purple btn--block panel__cta';
      primary.textContent = s.lane === 0 ? 'Go – first lane' : `Go – lane ${s.lane + 1} of ${s.lanes}`;
      setBlocked(primary, busy);
      if (cashOut.hidden) cashOut.hidden = false;
      setBlocked(cashOut, busy || s.lane === 0);
      cashOut.textContent =
        s.lane === 0
          ? 'Cash out – cross a lane first'
          : `Cash out ${formatCredits(s.cashOutValue)} ${CREDIT_LABEL}`;
    } else {
      primary.className = 'btn btn--primary btn--block panel__cta';
      primary.textContent =
        s.balance < s.bet
          ? 'Not enough demo credits'
          : s.roundsCompleted === 0
            ? `Play – ${formatCredits(s.bet)} ${CREDIT_LABEL}`
            : `Play again – ${formatCredits(s.bet)} ${CREDIT_LABEL}`;
      setBlocked(primary, busy || s.balance < s.bet);
      if (!cashOut.hidden) {
        // Never hide a focused control out from under the keyboard.
        if (document.activeElement === cashOut) primary.focus();
        cashOut.hidden = true;
      }
    }

    cover.hidden = !(s.phase === 'idle' && s.roundsCompleted === 0);
  }

  engine.subscribe((event, s) => {
    if (event.type === 'step') {
      busy = true;
      scene.goToLane(event.lane);
      announce(
        `Lane ${event.lane} of ${s.lanes} crossed. Multiplier ${event.multiplier.toFixed(2)}. ` +
          `Cash out ${formatCredits(s.cashOutValue)} ${CREDIT_LABEL}.`,
      );
    }

    if (event.type === 'round-complete') {
      // Burst at the lane the chicken is arriving at, not the one it left.
      scene.celebrate(event.reachedEnd, s.lane);
      announce(
        `${event.reachedEnd ? 'Crossed every lane.' : 'Cashed out.'} Simulated win ` +
          `${formatCredits(event.win)} ${CREDIT_LABEL} at ${event.multiplier.toFixed(2)}. ` +
          `Demo balance ${formatCredits(s.balance)} ${CREDIT_LABEL}.`,
      );
      showToast(
        event.reachedEnd
          ? `\u{1F3C1} Crossed every lane! Simulated win ${formatCredits(event.win)} ${CREDIT_LABEL} at ${event.multiplier.toFixed(2)}x`
          : `✅ Cashed out at ${event.multiplier.toFixed(2)}x – simulated win ${formatCredits(event.win)} ${CREDIT_LABEL}`,
      );
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        // A new round may already be underway - never clear a live board.
        if (engine.getState().phase !== 'settled') return;
        engine.resetBoard();
        scene.reset();
      }, SETTLE_DELAY_MS);
    }

    if (event.type === 'bonus-due') {
      window.clearTimeout(bonusTimer);
      bonusTimer = window.setTimeout(() => {
        openBonusModal({
          rounds: s.roundsCompleted,
          onClaim: () => engine.claimBonus(),
        });
      }, BONUS_DELAY_MS);
    }

    render();
  });

  // ----------------------------------------------------------------- wiring
  const start = (): void => {
    if (!engine.canStart()) return;
    // Drop any pending cleanup from the previous round before rebuilding the board.
    window.clearTimeout(settleTimer);
    clearToast();
    scene.reset();
    engine.startRound();
    announce(
      `Round started. Bet ${formatCredits(engine.getState().bet)} ${CREDIT_LABEL}. ` +
        'Press Go to cross the first lane.',
    );
  };

  primary.addEventListener('click', () => {
    if (isBlocked(primary)) return;
    const s = engine.getState();
    if (s.phase === 'crossing') engine.step();
    else start();
  });

  coverStart.addEventListener('click', start);
  cashOut.addEventListener('click', () => {
    if (isBlocked(cashOut)) return;
    engine.cashOut();
  });

  betMinus.addEventListener('click', () => engine.setBet(engine.getState().bet - BET_STEP));
  betPlus.addEventListener('click', () => engine.setBet(engine.getState().bet + BET_STEP));
  betInput.addEventListener('change', () => engine.setBet(Number(betInput.value) || MIN_BET));

  quickBets.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-bet]');
    if (target) engine.setBet(Number(target.dataset.bet));
  });

  difficulty.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-difficulty]');
    if (!target) return;
    const next = DIFFICULTIES.find((d) => d.id === target.dataset.difficulty);
    // Re-clicking the active chip must not tear down a board mid-settle.
    if (!next || next.id === engine.getState().difficulty) return;
    window.clearTimeout(settleTimer);
    clearToast();
    engine.setDifficulty(next.id);
    syncTrack();
  });

  // Tapping the stage advances a lane - matches how the real game plays.
  stage.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('button')) return;
    const s = engine.getState();
    if (s.phase === 'crossing' && !busy) engine.step();
  });

  // Keyboard: space / arrow-right steps, C cashes out.
  section.addEventListener('keydown', (event) => {
    if ((event.target as HTMLElement).tagName === 'INPUT') return;
    const s = engine.getState();
    if ((event.key === ' ' || event.key === 'ArrowRight') && s.phase === 'crossing' && !busy) {
      event.preventDefault();
      engine.step();
    } else if ((event.key === 'c' || event.key === 'C') && s.phase === 'crossing' && s.lane > 0 && !busy) {
      event.preventDefault();
      engine.cashOut();
    }
  });

  // --------------------------------------------------------------- bootstrap
  syncTrack();
  render();

  const resizeObserver = new ResizeObserver(() => scene.resize());
  resizeObserver.observe(stage);

  // Only animate while the demo is on screen.
  const visibility = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) scene.start();
        else scene.stop();
      }
    },
    { threshold: 0.05 },
  );
  visibility.observe(stage);

  requestAnimationFrame(() => scene.resize());

  /** Releases every global resource this block acquired. */
  const destroy = (): void => {
    window.clearTimeout(settleTimer);
    window.clearTimeout(bonusTimer);
    resizeObserver.disconnect();
    visibility.disconnect();
    scene.destroy();
  };
  window.addEventListener('pagehide', destroy, { once: true });

  if (import.meta.env.DEV) {
    // Handy for manual QA in the browser console.
    (window as unknown as Record<string, unknown>).__chickenRoad = { engine, scene };
  }

  return section;
}

// -------------------------------------------------------------------- bits

function hudPill(label: string, value: string, modifier = ''): { root: HTMLElement; value: HTMLElement } {
  const valueNode = el('b', { text: value });
  return {
    root: el('div', { class: `hud-pill ${modifier}`.trim() }, [
      el('span', { text: label }),
      valueNode,
    ]),
    value: valueNode,
  };
}

function stat(label: string, value: string): { root: HTMLElement; value: HTMLElement } {
  const valueNode = el('b', { text: value });
  return {
    root: el('div', { class: 'stat' }, [el('span', { text: label }), valueNode]),
    value: valueNode,
  };
}
