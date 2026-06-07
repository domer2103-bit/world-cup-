/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Share2, 
  TrendingUp, 
  Users, 
  Globe, 
  HelpCircle,
  Trophy,
  ArrowDown
} from 'lucide-react';
import { Competitor } from '../types';

interface LeaderboardViewProps {
  userPoints: number;
  userRank: number;
  globalCompetitors: Competitor[];
  friendsCompetitors: Competitor[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  userPoints,
  userRank,
  globalCompetitors,
  friendsCompetitors,
}) => {
  const [boardType, setBoardType] = useState<'global' | 'friends'>('global');
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const inviteCode = "GMASTER-2024";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const competitors = boardType === 'global' ? globalCompetitors : friendsCompetitors;
  
  // Highlighted podium positions
  const podium1st = competitors.find(c => c.rank === 1) || competitors[0];
  const podium2nd = competitors.find(c => c.rank === 2) || competitors[1];
  const podium3rd = competitors.find(c => c.rank === 3) || competitors[2];

  // Table lists (index offset 3 onwards or customized)
  const listCompetitors = showMore ? competitors : competitors.slice(3, 8);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Header & Share Code */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-brand-secondary rounded-full animate-pulse"></span>
            <span className="text-brand-secondary font-bold text-[10px] uppercase tracking-widest font-display">
              Global Championship League
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold text-on-surface tracking-tight">
            League Leaderboard
          </h2>
          <p className="text-on-surface-variant text-sm md:text-base max-w-xl mt-1 leading-normal font-sans">
            Compete with world-class predictors. Precision is the key to climbing the ranks.
          </p>
        </div>

        {/* Friends Invitation Box */}
        <div className="flex flex-col gap-1.5 self-start md:self-end">
          <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider font-display">
            Invite your friends
          </span>
          <div className="flex items-center gap-1.5">
            <div className="bg-surface-highest px-4 py-2.5 rounded-lg border border-outline-variant flex items-center gap-4">
              <span className="font-display text-sm font-bold text-on-surface tracking-wider">
                {inviteCode}
              </span>
              <button 
                id="copy-invite-code-btn"
                onClick={handleCopyCode}
                className="text-brand-secondary hover:opacity-75 transition-opacity"
                title="Copy Code to Clipboard"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <button 
              id="share-invite-btn"
              onClick={() => alert(`Invite your friends to GOALMASTER with league code: ${inviteCode}`)}
              className="bg-brand-secondary text-brand-on-secondary hover:brightness-115 p-3 rounded-lg flex items-center justify-center transition-all active:scale-95"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Global & Friends Selector and Overview */}
      <div className="flex justify-end mb-2">
        <div className="flex bg-surface-base p-1 rounded-full border border-outline-variant/60">
          <button 
            id="board-toggle-global-btn"
            onClick={() => setBoardType('global')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              boardType === 'global' 
                ? 'bg-brand-secondary text-brand-on-secondary shadow-md' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Global Standings
          </button>
          <button 
            id="board-toggle-friends-btn"
            onClick={() => setBoardType('friends')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              boardType === 'friends' 
                ? 'bg-brand-secondary text-brand-on-secondary shadow-md' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Friends League
          </button>
        </div>
      </div>

      {/* Top 3 Podium visual cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        
        {/* SECOND PLACE */}
        <div className="order-2 md:order-1 bg-gradient-to-t from-surface-low to-surface-base rounded-2xl p-6 flex flex-col items-center justify-center border border-outline-variant/20 relative overflow-hidden group hover:border-[#909097]/40 transition-all shadow-md">
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-zinc-700/5 blur-xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4 relative">
              <img 
                alt="Silver Winner" 
                className="w-16 h-16 rounded-full border-4 border-[#909097] p-0.5 group-hover:scale-105 transition-transform object-cover" 
                src={podium2nd?.avatar}
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 bg-zinc-400 text-surface-lowest font-black px-2.5 py-0.5 rounded-full text-xs font-display">
                2nd
              </span>
            </div>
            
            <h3 className="font-display font-semibold text-sm text-[#e0e3e5] text-center">
              {podium2nd?.name}
            </h3>
            <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider mt-1 font-display">
              {podium2nd?.points.toLocaleString()} PTS
            </p>
          </div>
        </div>

        {/* FIRST PLACE */}
        <div className="order-1 md:order-2 bg-gradient-to-t from-surface-base to-[#1d2022] rounded-2xl p-8 flex flex-col items-center justify-center border border-brand-tertiary/30 relative overflow-hidden group scale-100 md:scale-105 z-10 shadow-xl shadow-brand-tertiary-container/10">
          <div className="absolute inset-0 bg-brand-tertiary/5 blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 relative">
              <img 
                alt="Gold Winner" 
                className="w-20 h-20 rounded-full border-4 border-brand-tertiary p-0.5 group-hover:scale-105 transition-transform object-cover" 
                src={podium1st?.avatar}
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 right-2/4 translate-x-2/4 bg-brand-tertiary text-brand-on-tertiary-container font-black px-3.5 py-0.5 rounded-full text-xs font-display shadow-lg">
                1st
              </div>
            </div>

            <h3 className="font-display font-bold text-lg text-brand-tertiary">
              {podium1st?.name}
            </h3>
            <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest mt-1 font-display">
              {podium1st?.points.toLocaleString()} PTS
            </p>

            <div className="mt-3 bg-brand-tertiary/10 border border-brand-tertiary/20 px-3 py-1 rounded-full text-brand-tertiary text-[10px] font-extrabold flex items-center gap-1.5 uppercase font-display leading-none">
              <TrendingUp className="w-3.5 h-3.5" />
              CHAMPION FORM
            </div>
          </div>
        </div>

        {/* THIRD PLACE */}
        <div className="order-3 bg-gradient-to-t from-surface-low to-surface-base rounded-2xl p-6 flex flex-col items-center justify-center border border-outline-variant/20 relative overflow-hidden group hover:border-[#b47300]/40 transition-all shadow-md">
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#b47300]/5 blur-xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4 relative">
              <img 
                alt="Bronze Winner" 
                className="w-16 h-16 rounded-full border-4 border-[#b47300] p-0.5 group-hover:scale-105 transition-transform object-cover" 
                src={podium3rd?.avatar}
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 bg-[#b47300] text-on-surface font-black px-2.5 py-0.5 rounded-full text-xs font-display">
                3rd
              </span>
            </div>

            <h3 className="font-display font-semibold text-sm text-[#e0e3e5] text-center">
              {podium3rd?.name}
            </h3>
            <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider mt-1 font-display">
              {podium3rd?.points.toLocaleString()} PTS
            </p>
          </div>
        </div>

      </section>

      {/* High-Fidelity Table Grid */}
      <div className="bg-surface-base rounded-2xl border border-outline-variant overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-high border-b border-outline-variant">
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-display">
                  Rank
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-display">
                  Player
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-display text-center">
                  Exact Scores
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-display text-center">
                  Correct Outcomes
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#ffb95f] uppercase tracking-wider font-display text-right">
                  Total Points
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-sm">
              {listCompetitors.map((player) => {
                const isYou = player.isUser || player.name.includes('(You)');
                const isHighlightRow = isYou || player.rank === userRank;

                return (
                  <tr 
                    key={player.name}
                    className={`transition-colors text-on-surface ${
                      isHighlightRow 
                        ? 'bg-primary-container-app/40 border-l-4 border-l-brand-secondary' 
                        : 'hover:bg-surface-high/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4.5 font-display text-brand-secondary font-black">
                      #{player.rank}
                    </td>

                    {/* Player Info */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <img 
                          alt={player.name} 
                          className={`w-9 h-9 rounded-full object-cover border-2 ${
                            isHighlightRow ? 'border-brand-secondary' : 'border-outline-variant/50'
                          }`} 
                          src={player.avatar}
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className={`font-bold ${isHighlightRow ? 'text-brand-secondary' : 'text-on-surface'}`}>
                            {player.name}
                          </div>
                          <div className="text-[11px] text-on-surface-variant">
                            Win rate: {player.winRate}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Exact Score */}
                    <td className="px-6 py-4.5 text-center font-display font-medium text-on-surface-variant">
                      {player.exactScores}
                    </td>

                    {/* Correct Outcomes */}
                    <td className="px-6 py-4.5 text-center font-display font-medium text-on-surface-variant">
                      {player.correctOutcomes}
                    </td>

                    {/* Total Points */}
                    <td className="px-6 py-4.5 text-right font-display font-bold text-brand-secondary">
                      {player.points.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expand/Collapse footer action */}
        <div className="p-4 bg-surface-low flex justify-center border-t border-outline-variant/60">
          <button 
            id="toggle-rows-expand-btn"
            onClick={() => setShowMore(!showMore)}
            className="text-brand-secondary font-bold text-xs uppercase tracking-wider hover:underline flex items-center gap-1.5"
          >
            {showMore ? (
              <>
                Collapse Standings
                <ArrowDown className="w-3.5 h-3.5 rotate-180" />
              </>
            ) : (
              <>
                View Full Standings ({boardType === 'global' ? '500+' : '12'})
                <ArrowDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
