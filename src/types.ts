/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MatchStatus = 'upcoming' | 'live' | 'finished';
export type MatchStage = 'group' | 'r16' | 'quarter' | 'semi';

export interface Match {
  id: string;
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  homeCode: string; // e.g., 'FRA'
  awayCode: string; // e.g., 'GER'
  homeFlag: string;
  awayFlag: string;
  homeRealScore?: number; // if live or finished
  awayRealScore?: number; // if live or finished
  predHome?: number; // user prediction
  predAway?: number; // user prediction
  status: MatchStatus;
  stage: MatchStage;
  timeLabel: string; // e.g., 'Upcoming • Tonight 21:00'
  liveMinute?: number; // e.g., 64
  pointsPotential: number;
  pointsWon?: number;
  exactScoreWon?: boolean;
  outcomeOnlyWon?: boolean;
}

export interface Competitor {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  exactScores: number;
  correctOutcomes: number;
  winRate: string;
  isUser?: boolean;
}

export interface BonusPredictions {
  champion: string;
  goldenBoot: string;
  locked: boolean;
  lockDeadline: string;
}

export type ActiveTab = 'dashboard' | 'fixtures' | 'bonus' | 'leaderboard' | 'results';
