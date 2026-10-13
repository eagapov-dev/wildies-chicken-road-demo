export type DifficultyId = 'easy' | 'medium' | 'hard' | 'hardcore';

export interface Difficulty {
  id: DifficultyId;
  label: string;
  /** Cumulative payout multiplier after crossing lane n (1-indexed). */
  multipliers: readonly number[];
  /** Cars per lane - cosmetic only, the demo never resolves a collision. */
  traffic: number;
}

/** Also the fallback, so `getDifficulty` can return a definite value. */
export const EASY: Difficulty = {
  id: 'easy',
  label: 'Easy',
  multipliers: [1.09, 1.21, 1.35, 1.52, 1.72, 1.97, 2.28, 2.68, 3.2],
  traffic: 1,
};

export const DIFFICULTIES: readonly Difficulty[] = [
  EASY,
  {
    id: 'medium',
    label: 'Medium',
    multipliers: [1.18, 1.46, 1.85, 2.4, 3.2, 4.4, 6.3],
    traffic: 2,
  },
  {
    id: 'hard',
    label: 'Hard',
    multipliers: [1.35, 1.95, 2.95, 4.6, 7.5, 12.8],
    traffic: 2,
  },
  {
    id: 'hardcore',
    label: 'Hardcore',
    multipliers: [1.65, 3.0, 5.8, 12.0, 27.5],
    traffic: 3,
  },
];

export const getDifficulty = (id: DifficultyId): Difficulty =>
  DIFFICULTIES.find((d) => d.id === id) ?? EASY;

/** Play-money starting balance. These are demo credits, never currency. */
export const STARTING_BALANCE = 1000;
export const CREDIT_LABEL = 'FUN';
export const MIN_BET = 1;
export const MAX_BET = 100;
export const BET_STEP = 1;
export const QUICK_BETS = [1, 5, 10, 25];

/** Rounds the visitor must finish before the simulated bonus is offered. */
export const ROUNDS_FOR_BONUS = 2;

/** Face value of the simulated bonus, in demo credits. */
export const BONUS_CREDITS = 500;

/** How long the finished board stays on screen before it is cleared. */
export const SETTLE_DELAY_MS = 1500;

/** Bonus pop-up delay. Must exceed SETTLE_DELAY_MS so the board settles first. */
export const BONUS_DELAY_MS = 1900;
