/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  HelpCircle, 
  Trophy, 
  Check, 
  CheckCircle2, 
  Tv, 
  Zap, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { Match, MatchStage, Competitor, ActiveTab } from '../types';

interface FixturesViewProps {
  matches: Match[];
  userRank: number;
  sidebarLeaderboard: Competitor[];
  setActiveTab: (tab: ActiveTab) => void;
  onSavePrediction: (matchId: string, homeScore: number, awayScore: number) => void;
  onSimulateMatchLiveState: (matchId: string) => void;
}

export const FixturesView: React.FC<FixturesViewProps> = ({
  matches,
  userRank,
  sidebarLeaderboard,
  setActiveTab,
  onSavePrediction,
  onSimulateMatchLiveState,
}) => {
  const [selectedStage, setSelectedStage] = useState<MatchStage>('group');
  
  // Track input states for score entries
  const [inputScores, setInputScores] = useState<Record<string, { home: string; away: string }>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  const stages = [
    { id: 'group', label: 'Group Stage' },
    { id: 'r16', label: 'Round of 16' },
    { id: 'quarter', label: 'Quarter Finals' },
    { id: 'semi', label: 'Semi Finals' },
  ] as const;

  const filteredMatches = matches.filter(m => m.stage === selectedStage);

  const handleInputChange = (matchId: string, side: 'home' | 'away', value: string) => {
    // Sanitise input to positive integer or empty string
    const cleanVal = value.replace(/[^0-9]/g, '');
    setInputScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        home: side === 'home' ? cleanVal : prev[matchId]?.home || '',
        away: side === 'away' ? cleanVal : prev[matchId]?.away || '',
      }
    }));
    // Clear saved badge if user edits again
    if (savedStatus[matchId]) {
      setSavedStatus((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  const executeSave = (matchId: string) => {
    const scores = inputScores[matchId];
    if (!scores || scores.home === '' || scores.away === '') {
      alert('Please fill out both home and away score inputs before saving.');
      return;
    }
    const homeInt = parseInt(scores.home, 10);
    const awayInt = parseInt(scores.away, 10);
    
    onSavePrediction(matchId, homeInt, awayInt);
    
    // Set feedback animation status
    setSavedStatus((prev) => ({ ...prev, [matchId]: true }));
    setTimeout(() => {
      setSavedStatus((prev) => ({ ...prev, [matchId]: false }));
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fadeIn">
      
      {/* Left Column: Match schedule and inputs (8 cols) */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Match Center</h1>
          <p className="text-on-surface-variant text-sm md:text-base max-w-2xl leading-normal">
            Predict scores to climb the global leaderboard. Group stage points count for double this weekend.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar border-b border-[#45464d]/30">
          {stages.map((stage) => {
            const isActive = selectedStage === stage.id;
            return (
              <button
                key={stage.id}
                id={`stage-tab-${stage.id}`}
                onClick={() => setSelectedStage(stage.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive 
                    ? 'bg-brand-secondary text-brand-on-secondary shadow-md' 
                    : 'border border-[#45464d] text-on-surface-variant hover:bg-surface-high hover:text-on-surface'
                }`}
              >
                {stage.label}
              </button>
            );
          })}
        </div>

        {/* Matches lists */}
        <div className="space-y-6">
          {filteredMatches.length === 0 ? (
            <div className="p-8 text-center bg-surface-base rounded-2xl border border-outline-variant text-[#c6c6cd]">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-on-surface-variant opacity-70" />
              <p className="font-display font-bold">No registered fixtures yet</p>
              <p className="text-xs text-on-surface-variant mt-1">Predictions for this stage open closer to kickoff.</p>
            </div>
          ) : (
            filteredMatches.map((match) => {
              const isUpcoming = match.status === 'upcoming';
              const isLive = match.status === 'live';
              const isFinished = match.status === 'finished';

              // Get current inputs or fallbacks
              const homeEntered = inputScores[match.id]?.home ?? (match.predHome?.toString() || '');
              const awayEntered = inputScores[match.id]?.away ?? (match.predAway?.toString() || '');
              const isSaved = savedStatus[match.id];

              return (
                <div 
                  key={match.id}
                  id={`fixture-card-${match.id}`}
                  className={`bg-surface-base border rounded-xl overflow-hidden p-6 transition-all duration-300 relative ${
                    isFinished && match.pointsWon && match.pointsWon > 0
                      ? 'border-brand-secondary' 
                      : 'border-outline-variant/40 hover:border-brand-secondary/40'
                  }`}
                >
                  {/* Decorative faint spotlight background for LIVE */}
                  {isLive && (
                    <div className="absolute inset-0 bg-primary-container-app/10 backdrop-grayscale-[0.05] pointer-events-none z-0"></div>
                  )}

                  {/* Top Bar inside card */}
                  <div className="relative z-10 flex justify-between items-center mb-5 border-b border-outline-variant/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        isLive ? 'bg-brand-secondary animate-pulse' : isUpcoming ? 'bg-brand-tertiary' : 'bg-on-surface-variant'
                      }`}></span>
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${
                        isLive ? 'text-brand-secondary font-semibold' : isUpcoming ? 'text-brand-tertiary' : 'text-on-surface-variant'
                      }`}>
                        {match.timeLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-on-surface-variant text-[10px] font-bold tracking-wider font-display uppercase">
                      {isUpcoming && `Match ${match.matchNumber}`}
                      
                      {isLive && (
                        <span className="flex items-center gap-1 text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded border border-brand-secondary/20">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}

                      {isFinished && (
                        match.pointsWon && match.pointsWon > 0 ? (
                          <span className="text-brand-secondary font-bold flex items-center gap-1 py-1 rounded">
                            <Sparkles className="w-3.5 h-3.5" /> +{match.pointsWon} POINTS
                          </span>
                        ) : (
                          <span className="text-on-surface-variant font-bold">0 POINTS</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Main Grid: Team FRA [input/score] Team ESP */}
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    
                    {/* Team Home */}
                    <div className="flex-1 flex flex-col items-center gap-2 text-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#323537] overflow-hidden shadow-md bg-surface-lowest">
                        <img 
                          alt={`${match.homeTeam} Flag`} 
                          className="w-full h-full rounded-full object-cover" 
                          src={match.homeFlag} 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="font-display font-semibold text-xs md:text-sm text-on-surface tracking-wide mt-1">
                        {match.homeTeam}
                      </h3>
                    </div>

                    {/* Scores / Inputs Column */}
                    <div className="flex flex-col items-center justify-center">
                      {isUpcoming ? (
                        <div className="flex items-center gap-2">
                          <input 
                            id={`input-${match.id}-home`}
                            type="text"
                            maxLength={2}
                            placeholder="-"
                            value={homeEntered}
                            onChange={(e) => handleInputChange(match.id, 'home', e.target.value)}
                            className="w-12 h-14 md:w-16 md:h-20 bg-primary-container-app border-2 border-outline-variant rounded-xl text-center text-stats-num font-display text-[#abb2bf] focus:border-brand-secondary focus:ring-0 transition-all font-extrabold"
                          />
                          <span className="text-on-surface-variant font-display text-2xl font-bold">:</span>
                          <input 
                            id={`input-${match.id}-away`}
                            type="text"
                            maxLength={2}
                            placeholder="-"
                            value={awayEntered}
                            onChange={(e) => handleInputChange(match.id, 'away', e.target.value)}
                            className="w-12 h-14 md:w-16 md:h-20 bg-primary-container-app border-2 border-outline-variant rounded-xl text-center text-stats-num font-display text-[#abb2bf] focus:border-brand-secondary focus:ring-0 transition-all font-extrabold"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 z-10">
                          {/* Display Real Live or Finished Results */}
                          <div className="flex items-center gap-2">
                            <span className="text-3xl md:text-5xl font-display font-extrabold text-on-surface tracking-tighter">
                              {match.homeRealScore}
                            </span>
                            <span className="text-on-surface-variant font-display text-xl md:text-2xl font-bold">-</span>
                            <span className="text-3xl md:text-5xl font-display font-extrabold text-[#e0e3e5] tracking-tighter">
                              {match.awayRealScore}
                            </span>
                          </div>

                          {/* Render user's prediction comparison badge */}
                          {isLive && (
                            <div className="bg-surface-highest px-3 py-1 rounded-full border border-outline-variant mt-2 text-[10px] font-bold text-on-surface-variant font-display">
                              YOUR PRED: <span className="text-brand-secondary">{match.predHome ?? 0} - {match.predAway ?? 0}</span>
                            </div>
                          )}

                          {isFinished && (
                            match.exactScoreWon ? (
                              <div className="bg-brand-secondary/15 px-3 py-1 rounded-full border border-brand-secondary/35 mt-2 text-[10px] font-bold text-brand-secondary tracking-widest font-display text-center uppercase">
                                EXACT SCORE! {match.predHome} - {match.predAway}
                              </div>
                            ) : (
                              <div className="bg-surface-highest px-3 py-1 rounded-full border border-outline-variant mt-2 text-[10px] font-bold text-on-surface-variant font-display text-center">
                                PRED: <span className="text-brand-secondary">{match.predHome ?? 0} - {match.predAway ?? 0}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Team Away */}
                    <div className="flex-1 flex flex-col items-center gap-2 text-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#323537] overflow-hidden shadow-md bg-surface-lowest">
                        <img 
                          alt={`${match.awayTeam} Flag`} 
                          className="w-full h-full rounded-full object-cover" 
                          src={match.awayFlag} 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="font-display font-semibold text-xs md:text-sm text-on-surface tracking-wide mt-1">
                        {match.awayTeam}
                      </h3>
                    </div>

                  </div>

                  {/* Card Action / Feedback Row at the bottom */}
                  {isUpcoming && (
                    <div className="relative z-10 mt-5 pt-3 border-t border-outline-variant/10 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-display">
                        POINTS POTENTIAL: {match.pointsPotential}pts
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {isLive ? (
                          <div className="flex items-center gap-1.5 text-xs text-brand-secondary font-bold">
                            <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-ping"></span>
                            Live matches can&apos;t be edited
                          </div>
                        ) : isSaved ? (
                          <span className="text-xs bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                            <Check className="w-4 h-4" /> Locked In!
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            {/* A friendly helper to simulate live results right in the dashboard preview! */}
                            <button
                              onClick={() => {
                                // First ensure prediction has data so it is saved
                                if (homeEntered === '' || awayEntered === '') {
                                  alert('Input home and away scores first to simulate!');
                                  return;
                                }
                                onSavePrediction(match.id, parseInt(homeEntered), parseInt(awayEntered));
                                onSimulateMatchLiveState(match.id);
                              }}
                              className="bg-brand-tertiary-container/40 text-brand-tertiary border border-brand-tertiary/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-brand-tertiary-container transition-colors"
                              title="Go live & simulate this match outcome!"
                            >
                              Go Live
                            </button>

                            <button 
                              id={`save-prediction-btn-${match.id}`}
                              onClick={() => executeSave(match.id)}
                              className="bg-[#00b954] text-white hover:bg-[#00b954]/90 px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase font-display"
                            >
                              SAVE PREDICTION
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Small simulation tip for Live games */}
                  {isLive && (
                    <div className="relative z-10 mt-5 pt-3 border-t border-brand-secondary/10 flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant font-medium">Currently playing second half</span>
                      <button
                        onClick={() => onSimulateMatchLiveState(match.id)}
                        className="text-brand-secondary border border-brand-secondary/20 hover:bg-brand-secondary/5 px-2.5 py-1.5 rounded-lg ml-auto text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        Finish & Score!
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Global prediction leaderboards sidebar representation (4 cols) */}
      <div id="leaderboard-right-sidebar" className="xl:col-span-4 space-y-6">
        <aside className="bg-surface-base p-6 rounded-2xl border border-outline-variant/60 shadow-lg select-none">
          <h3 className="font-display text-base font-bold text-on-surface mb-5 tracking-tight uppercase">
            Global Leaderboard
          </h3>

          <div className="space-y-4">
            {sidebarLeaderboard.slice(0, 3).map((player, index) => {
              const isFirst = index === 0;
              return (
                <div 
                  key={player.name}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-high/30 transition-colors border border-outline-variant/10"
                >
                  <span className={`font-display text-sm font-bold w-5 text-center ${
                    isFirst ? 'text-brand-tertiary' : 'text-on-surface-variant'
                  }`}>
                    {index === 0 ? '01' : index === 1 ? '02' : '03'}
                  </span>

                  <div className={`w-10 h-10 rounded-full bg-surface-lowest overflow-hidden border p-0.5 flex-shrink-0 ${
                    isFirst ? 'border-brand-tertiary shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-outline-variant'
                  }`}>
                    <img 
                      alt={player.name} 
                      className="w-full h-full rounded-full object-cover" 
                      src={player.avatar}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate leading-tight">
                      {player.name}
                    </p>
                    <p className="text-[10px] font-bold text-brand-tertiary mt-1 uppercase tracking-widest font-display">
                      {player.points.toLocaleString()} PTS
                    </p>
                  </div>
                </div>
              );
            })}

            {/* User status representation */}
            <div className="pt-4 border-t border-white/5 py-1 text-center bg-surface-lowest rounded-xl p-3 border border-outline-variant/30 mt-4">
              <p className="text-[10px] font-extrabold text-on-surface-variant tracking-widest uppercase font-display">
                ... YOU ARE RANKED #{userRank} ...
              </p>
            </div>
          </div>

          <button 
            id="view-full-standings-side-btn"
            onClick={() => setActiveTab('leaderboard')}
            className="mt-6 w-full border border-brand-tertiary text-brand-tertiary font-bold py-3 rounded-lg hover:bg-brand-tertiary/10 active:scale-95 transition-all text-xs uppercase tracking-wider font-display"
          >
            FULL STANDINGS
          </button>
        </aside>
      </div>

    </div>
  );
};
