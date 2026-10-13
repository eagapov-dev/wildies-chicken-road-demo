import {
  BONUS_CREDITS,
  MAX_BET,
  MIN_BET,
  ROUNDS_FOR_BONUS,
  STARTING_BALANCE,
  getDifficulty,
  type DifficultyId,
} from './config';

export type Phase =
  /** No round in progress - the visitor can change bet and difficulty. */
  | 'idle'
  /** Bet placed, chicken is on the kerb or between lanes. */
  | 'crossing'
  /** Round finished (cashed out or reached the far kerb). */
  | 'settled';

export interface GameState {
  phase: Phase;
  difficulty: DifficultyId;
  bet: number;
  balance: number;
  /** Lanes crossed so far in the current round (0 = still on the kerb). */
  lane: number;
  lanes: number;
  multiplier: number;
  /** Payout if the visitor cashes out right now. */
  cashOutValue: number;
  roundsCompleted: number;
  lastWin: number;
  totalWon: number;
  bonusClaimed: boolean;
  bonusOffered: boolean;
}

export type EngineEvent =
  | { type: 'state' }
  | { type: 'step'; lane: number; multiplier: number }
  | { type: 'round-complete'; win: number; multiplier: number; rounds: number; reachedEnd: boolean }
  | { type: 'bonus-due' };

type Listener = (event: EngineEvent, state: GameState) => void;

/**
 * Chicken Road 2 demo engine.
 *
 * IMPORTANT - this is a *simulation* built for a technical assessment:
 * outcomes are pre-set to winning ones, there is no RNG deciding a loss,
 * no collision is ever resolved against the player, and the balance is
 * play-money ("demo credits"). Nothing here touches real money.
 */
export class ChickenRoadEngine {
  private state: GameState;
  private listeners = new Set<Listener>();

  constructor(difficulty: DifficultyId = 'easy') {
    this.state = {
      phase: 'idle',
      difficulty,
      bet: 10,
      balance: STARTING_BALANCE,
      lane: 0,
      lanes: getDifficulty(difficulty).multipliers.length,
      multiplier: 1,
      cashOutValue: 0,
      roundsCompleted: 0,
      lastWin: 0,
      totalWon: 0,
      bonusClaimed: false,
      bonusOffered: false,
    };
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: EngineEvent): void {
    for (const listener of this.listeners) listener(event, this.state);
  }

  /** Multiplier the chicken reaches after crossing `lane` lanes. */
  multiplierAt(lane: number): number {
    if (lane <= 0) return 1;
    const table = getDifficulty(this.state.difficulty).multipliers;
    return table[Math.min(lane, table.length) - 1];
  }

  get multipliers(): number[] {
    return getDifficulty(this.state.difficulty).multipliers;
  }

  setDifficulty(difficulty: DifficultyId): void {
    if (this.state.phase === 'crossing' || this.state.difficulty === difficulty) return;
    this.state.difficulty = difficulty;
    this.state.lanes = getDifficulty(difficulty).multipliers.length;
    this.state.lane = 0;
    this.state.multiplier = 1;
    this.state.cashOutValue = 0;
    this.state.phase = 'idle';
    this.emit({ type: 'state' });
  }

  setBet(bet: number): void {
    if (this.state.phase === 'crossing') return;
    const clamped = Math.min(MAX_BET, Math.max(MIN_BET, Math.round(bet)));
    this.state.bet = Math.min(clamped, Math.max(MIN_BET, Math.floor(this.state.balance)));
    this.emit({ type: 'state' });
  }

  canStart(): boolean {
    return this.state.phase !== 'crossing' && this.state.balance >= this.state.bet;
  }

  startRound(): void {
    if (!this.canStart()) return;
    this.state.balance -= this.state.bet;
    this.state.phase = 'crossing';
    this.state.lane = 0;
    this.state.multiplier = 1;
    this.state.cashOutValue = this.state.bet;
    this.state.lastWin = 0;
    this.emit({ type: 'state' });
  }

  /**
   * Advance one lane. Always survives - the demo is configured to show
   * winning outcomes only, as required by the assessment brief.
   */
  step(): void {
    const s = this.state;
    if (s.phase !== 'crossing' || s.lane >= s.lanes) return;

    s.lane += 1;
    s.multiplier = this.multiplierAt(s.lane);
    s.cashOutValue = round2(s.bet * s.multiplier);
    this.emit({ type: 'step', lane: s.lane, multiplier: s.multiplier });

    // Reaching the far kerb auto-settles at the top multiplier.
    if (s.lane === s.lanes) this.settle(true);
  }

  cashOut(): void {
    if (this.state.phase !== 'crossing' || this.state.lane === 0) return;
    this.settle(false);
  }

  private settle(reachedEnd: boolean): void {
    const s = this.state;
    const win = round2(s.bet * s.multiplier);

    s.balance = round2(s.balance + win);
    s.lastWin = win;
    s.totalWon = round2(s.totalWon + win);
    s.phase = 'settled';
    s.roundsCompleted += 1;

    this.emit({
      type: 'round-complete',
      win,
      multiplier: s.multiplier,
      rounds: s.roundsCompleted,
      reachedEnd,
    });

    if (!s.bonusOffered && s.roundsCompleted >= ROUNDS_FOR_BONUS) {
      s.bonusOffered = true;
      this.emit({ type: 'bonus-due' });
    }
  }

  /** Clears the board so the next round can start from the kerb. */
  resetBoard(): void {
    if (this.state.phase !== 'settled') return;
    this.state.phase = 'idle';
    this.state.lane = 0;
    this.state.multiplier = 1;
    this.state.cashOutValue = 0;
    this.emit({ type: 'state' });
  }

  /** Credits the simulated bonus to the play-money balance. */
  claimBonus(): void {
    if (this.state.bonusClaimed) return;
    this.state.bonusClaimed = true;
    this.state.balance = round2(this.state.balance + BONUS_CREDITS);
    this.emit({ type: 'state' });
  }
}

const round2 = (value: number): number => Math.round(value * 100) / 100;
