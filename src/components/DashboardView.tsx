/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  Trophy, 
  History, 
  CheckCircle,
  HelpCircle,
  Stars,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { Match, Competitor, ActiveTab } from '../types';

interface DashboardViewProps {
  userPoints: number;
  userRank: number;
  nextMatch: Match;
  recentResults: Array<{
    teams: string;
    stage: string;
    flags: string[];
    points: string;
    badge: string;
  }>;
  quickPredict: {
    home: string;
    away: string;
    homeFlag: string;
    awayFlag: string;
  };
  globalCompetitors: Competitor[];
  friendsCompetitors: Competitor[];
  setActiveTab: (tab: ActiveTab) => void;
  onQuickPredictSubmit: (homeScore: number, awayScore: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userPoints,
  userRank,
  nextMatch,
  recentResults,
  quickPredict,
  globalCompetitors,
  friendsCompetitors,
  setActiveTab,
  onQuickPredictSubmit,
}) => {
  // Competitors list toggle state
  const [competitorTab, setCompetitorTab] = useState<'global' | 'friends'>('friends');

  // Countdown clock state
  const [timeLeft, setTimeLeft] = useState(15129); // 04:12:09 expressed in seconds
  
  // Quick predict form score states
  const [quickHomeScore, setQuickHomeScore] = useState<string>('0');
  const [quickAwayScore, setQuickAwayScore] = useState<string>('0');
  const [quickSubmitted, setQuickSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 15129; // cycle countdown
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find Rank #3 in friends table dynamically, otherwise default to points gap of 28
  const thirdRankCompetitor = friendsCompetitors ? friendsCompetitors.find(c => c.rank === 3) : null;
  const targetPoints = thirdRankCompetitor ? thirdRankCompetitor.points : 93;
  const pointsToNextRank = Math.max(0, targetPoints - userPoints);
  const goalPoints = targetPoints > userPoints ? targetPoints : userPoints + 10;
  const progressPercent = Math.min(100, Math.round((userPoints / goalPoints) * 100));

  const competitorsToDisplay = competitorTab === 'global' ? globalCompetitors.slice(0, 3) : friendsCompetitors.slice(0, 3);

  const handleQuickPredictSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const home = parseInt(quickHomeScore) || 0;
    const away = parseInt(quickAwayScore) || 0;
    onQuickPredictSubmit(home, away);
    setQuickSubmitted(true);
    setTimeout(() => {
      setQuickSubmitted(false);
    }, 4500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Stats Row (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Global Status Card */}
        <div id="stat-card-global-status" className="bg-surface-base p-6 rounded-2xl border border-outline-variant relative overflow-hidden group hover:border-brand-secondary/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-secondary/10 transition-all"></div>
          <div className="relative z-10">
            <span className="text-[10px] font-bold tracking-widest text-on-surface-variant mb-2 block uppercase font-display">Global Status</span>
            <h2 className="font-display text-4xl font-extrabold text-brand-secondary mb-1">#4</h2>
            <p className="text-sm font-semibold text-on-surface">Out of 12 friends</p>
            <div className="mt-4 flex items-center gap-2 text-brand-secondary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold">+2 spots since yesterday</span>
            </div>
          </div>
        </div>

        {/* Points Card */}
        <div id="stat-card-total-points" className="bg-surface-base p-6 rounded-2xl border border-outline-variant relative overflow-hidden group hover:border-[#ffb95f]/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-tertiary/5 rounded-full blur-2xl pointer-events-none"></div>
          <span className="text-[10px] font-bold tracking-widest text-on-surface-variant mb-2 block uppercase font-display">Total Points</span>
          <h2 className="font-display text-4xl font-extrabold text-on-surface mb-1">{userPoints.toLocaleString()}</h2>
          <p className="text-sm text-on-surface-variant">Top 5% of all users</p>
          <div className="mt-5 h-2 w-full bg-surface-highest rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-secondary rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-on-surface-variant transition-all font-semibold">
            {pointsToNextRank} PTS to reach Rank #3
          </p>
        </div>

        {/* Live Spotlight / Next Match */}
        <div id="stat-card-next-match" className="bg-primary-container-app p-6 rounded-2xl border border-brand-secondary/30 relative overflow-hidden shadow-lg group">
          {/* Spotlight tag with pulse */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-brand-secondary/10 border border-brand-secondary/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse"></span>
            <span className="text-brand-secondary text-[10px] font-bold uppercase tracking-wider font-display">Spotlight</span>
          </div>

          <span className="text-[10px] font-bold tracking-widest text-on-primary-container-app mb-3 block uppercase font-display">Next Match</span>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-center w-1/3">
              <div className="w-12 h-12 rounded-full bg-surface-base border border-outline-variant/40 p-1 mx-auto mb-2 flex items-center justify-center">
                <img 
                  alt={`${nextMatch?.homeTeam} Flag`} 
                  className="w-full h-full rounded-full object-cover" 
                  src={nextMatch?.homeFlag} 
                />
              </div>
              <span className="text-xs font-bold text-on-surface font-display">{nextMatch?.homeCode}</span>
            </div>

            <div className="text-center w-1/3">
              <div className="font-display text-lg font-bold text-brand-secondary mb-0.5 tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <span className="text-[9px] text-on-primary-container-app uppercase block tracking-wider font-bold">Kickoff in</span>
            </div>

            <div className="text-center w-1/3">
              <div className="w-12 h-12 rounded-full bg-surface-base border border-outline-variant/40 p-1 mx-auto mb-2 flex items-center justify-center">
                <img 
                  alt={`${nextMatch?.awayTeam} Flag`} 
                  className="w-full h-full rounded-full object-cover" 
                  src={nextMatch?.awayFlag} 
                />
              </div>
              <span className="text-xs font-bold text-on-surface font-display">{nextMatch?.awayCode}</span>
            </div>
          </div>

          <button 
            id="predict-now-spotlight-btn"
            onClick={() => setActiveTab('fixtures')}
            className="w-full mt-5 bg-brand-secondary text-brand-on-secondary hover:brightness-110 active:scale-95 transition-all text-xs font-bold py-2.5 rounded-lg uppercase tracking-widest font-display"
          >
            Predict Now
          </button>
        </div>

      </div>

      {/* Row 2: Recent Results & Quick Predict */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Results Container */}
        <div id="recent-results-dashboard-panel" className="lg:col-span-2 bg-gradient-to-br from-surface-base to-surface-low p-6 rounded-2xl border border-outline-variant/40 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display text-lg font-bold text-on-surface">Recent Results</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Your prediction performance from the latest outings</p>
            </div>
            <button 
              id="view-all-results-btn"
              onClick={() => setActiveTab('results')}
              className="text-brand-secondary font-semibold text-xs uppercase tracking-wider hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentResults.map((result, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-4 bg-surface-low rounded-xl border border-outline-variant/30 hover:border-brand-secondary/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex -space-x-2">
                    <img 
                      alt="Flag A" 
                      className="w-8 h-8 rounded-full border-2 border-surface-lowest object-cover" 
                      src={result.flags[0]} 
                      referrerPolicy="no-referrer"
                    />
                    <img 
                      alt="Flag B" 
                      className="w-8 h-8 rounded-full border-2 border-surface-lowest object-cover" 
                      src={result.flags[1]} 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface group-hover:text-brand-secondary transition-colors truncate">
                      {result.teams}
                    </p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">
                      {result.stage}
                    </p>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    !result.points.includes('0') 
                      ? 'bg-brand-secondary/15 text-brand-secondary' 
                      : 'bg-on-primary-container-app/15 text-primary-accent'
                  }`}>
                    {result.points}
                  </span>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-1 font-sans">
                    {result.badge}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Predict Sidebar Container */}
        <div className="flex flex-col gap-6">
          <div id="quick-predict-form-container" className="bg-surface-base p-6 rounded-2xl border border-outline-variant">
            <h3 className="font-display text-lg font-bold text-on-surface mb-1">Quick Predict</h3>
            <p className="text-xs text-on-surface-variant mb-6">Upcoming: {quickPredict.home} vs {quickPredict.away} (Tomorrow 20:00)</p>

            <form onSubmit={handleQuickPredictSubmit} className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                
                {/* Team Home */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-on-surface-variant text-center max-w-[80px] truncate">{quickPredict.home}</span>
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/30 p-0.5 mb-1 bg-surface-lowest">
                    <img alt="Home Flag" className="w-full h-full rounded-full object-cover" src={quickPredict.homeFlag} />
                  </div>
                  <input 
                    id="quick-home-input"
                    type="number"
                    min="0"
                    max="15"
                    value={quickHomeScore}
                    onChange={(e) => setQuickHomeScore(e.target.value)}
                    disabled={quickSubmitted}
                    className="w-16 h-12 bg-surface-highest border border-outline-variant text-center rounded-lg font-display text-stats-num text-brand-secondary focus:ring-brand-secondary focus:border-brand-secondary"
                  />
                </div>

                <span className="text-on-surface-variant font-bold text-xl self-end mb-3">-</span>

                {/* Team Away */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-on-surface-variant text-center max-w-[80px] truncate">{quickPredict.away}</span>
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/30 p-0.5 mb-1 bg-surface-lowest">
                    <img alt="Away Flag" className="w-full h-full rounded-full object-cover" src={quickPredict.awayFlag} />
                  </div>
                  <input 
                    id="quick-away-input"
                    type="number"
                    min="0"
                    max="15"
                    value={quickAwayScore}
                    onChange={(e) => setQuickAwayScore(e.target.value)}
                    disabled={quickSubmitted}
                    className="w-16 h-12 bg-surface-highest border border-outline-variant text-center rounded-lg font-display text-stats-num text-brand-secondary focus:ring-brand-secondary focus:border-brand-secondary"
                  />
                </div>

              </div>

              {quickSubmitted ? (
                <div className="p-3 bg-brand-secondary/10 border border-brand-secondary/20 rounded-xl text-center text-xs font-bold text-brand-secondary animate-fadeIn">
                  <CheckCircle className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Prediction submitted & locked!
                </div>
              ) : (
                <button 
                  id="submit-quick-score-btn"
                  type="submit"
                  className="w-full bg-[#00b954] hover:bg-[#00b954]/90 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-display"
                >
                  <Zap className="w-4 h-4 text-white fill-white" />
                  Submit Score
                </button>
              )}
            </form>
          </div>

          {/* Small Promotional Card */}
          <button 
            id="bonus-multiplier-card-btn"
            onClick={() => setActiveTab('bonus')}
            className="bg-brand-tertiary-container/30 hover:bg-brand-tertiary-container/50 border border-brand-tertiary/20 p-4 rounded-2xl flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all text-left text-brand-tertiary"
          >
            <div className="bg-[#ffb95f]/15 p-3 rounded-full">
              <Stars className="w-5 h-5 text-[#ffb95f]" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-tertiary flex items-center gap-1.5">
                Bonus Multiplier
                <ArrowRight className="w-3.5 h-3.5" />
              </p>
              <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">Predict 3 games today for 2x pts</p>
            </div>
          </button>
        </div>

      </div>

      {/* Global Leaderboard Preview / Top Competitors */}
      <div id="top-competitors-dashboard-panel" className="bg-gradient-to-r from-surface-base to-surface-low p-6 rounded-2xl border border-outline-variant/40 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-on-surface">Top Competitors</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Live tracking of frontrunners this matchday</p>
          </div>
          <div className="flex gap-1.5 bg-surface-highest p-1 rounded-full border border-outline-variant/60">
            <button 
              id="competitors-filter-global-btn"
              onClick={() => setCompetitorTab('global')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                competitorTab === 'global' 
                  ? 'bg-brand-secondary text-brand-on-secondary shadow-md' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Global
            </button>
            <button 
              id="competitors-filter-friends-btn"
              onClick={() => setCompetitorTab('friends')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                competitorTab === 'friends' 
                  ? 'bg-brand-secondary text-brand-on-secondary shadow-md' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Friends
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {competitorsToDisplay.map((competitor, idx) => {
            const isRank1 = competitor.rank === 1;
            const isRank2 = competitor.rank === 2;
            const isRank3 = competitor.rank === 3;
            
            let decorativeBorderClass = 'border-l-4 border-l-slate-500';
            let rankColor = 'text-slate-400';
            if (isRank1) {
              decorativeBorderClass = 'border-l-4 border-l-amber-500 bg-brand-tertiary-container/10';
              rankColor = 'text-amber-500';
            } else if (isRank3) {
              decorativeBorderClass = 'border-l-4 border-l-amber-700';
              rankColor = 'text-amber-700';
            }

            return (
              <div 
                key={idx}
                className={`flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/20 hover:scale-[1.01] transition-transform ${decorativeBorderClass}`}
              >
                <span className={`font-display font-extrabold text-xl ml-1 ${rankColor}`}>
                  {competitor.rank}
                </span>
                <img 
                  alt={competitor.name} 
                  className={`w-10 h-10 rounded-full object-cover border ${
                    competitor.isUser ? 'border-brand-secondary border-2' : 'border-outline-variant'
                  }`} 
                  src={competitor.avatar}
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">
                    {competitor.name} {competitor.isUser && '(You)'}
                  </p>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                    {competitor.points.toLocaleString()} Points
                  </p>
                </div>

                {/* Achievement Badge if first */}
                {isRank1 && (
                  <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/20 ml-auto flex-shrink-0 animate-bounce" />
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
