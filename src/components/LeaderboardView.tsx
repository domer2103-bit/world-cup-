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
  Trophy,
  ArrowDown,
  Plus,
  ArrowLeft,
  Flame,
  UserPlus,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Competitor } from '../types';
import { LeagueInfo, LeagueMember } from '../lib/leagueService';

interface LeaderboardViewProps {
  userPoints: number;
  userRank: number;
  globalCompetitors: Competitor[];
  friendsCompetitors: Competitor[];
  
  // Custom Sync Leagues Props
  myLeagues: { id: string; name: string }[];
  currentLeagueId: string | null;
  currentLeague: LeagueInfo | null;
  currentLeagueMembers: LeagueMember[];
  onCreateLeague: (leagueName: string, creatorName: string) => Promise<string>;
  onJoinLeague: (leagueId: string, participantName: string) => Promise<void>;
  onSelectLeague: (leagueId: string | null) => void;
  userMemberId: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  userPoints,
  userRank,
  globalCompetitors,
  friendsCompetitors,
  myLeagues,
  currentLeagueId,
  currentLeague,
  currentLeagueMembers,
  onCreateLeague,
  onJoinLeague,
  onSelectLeague,
  userMemberId,
}) => {
  const [boardType, setBoardType] = useState<'global' | 'friends' | 'custom'>(() => {
    return currentLeagueId ? 'custom' : 'global';
  });
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  React.useEffect(() => {
    if (currentLeagueId) {
      setBoardType('custom');
    }
  }, [currentLeagueId]);

  // Form Fields for Custom Leagues
  const [newLeagueName, setNewLeagueName] = useState('');
  const [creatorName, setCreatorName] = useState('Tournament Pro');
  const [manualJoinId, setManualJoinId] = useState('');
  const [joinerName, setJoinerName] = useState('Tournament Pro');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const inviteCode = "GMASTER-2026";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const handleCopyLeagueLink = (leagueId: string) => {
    const link = `${window.location.origin}${window.location.pathname}?leagueId=${leagueId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(leagueId);
    setTimeout(() => {
      setCopiedLink(null);
    }, 3000);
  };

  const executeCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeagueName.trim()) {
      setErrorText('Please enter a league name.');
      return;
    }
    if (!creatorName.trim()) {
      setErrorText('Please enter your participant name.');
      return;
    }
    setErrorText(null);
    setSuccessText(null);
    setIsSubmitting(true);
    
    try {
      const createdId = await onCreateLeague(newLeagueName, creatorName);
      setNewLeagueName('');
      setSuccessText(`League created successfully! ID: ${createdId}`);
      onSelectLeague(createdId);
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'An error occurred during league creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeManualJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualJoinId.trim()) {
      setErrorText('Please enter a valid League ID.');
      return;
    }
    if (!joinerName.trim()) {
      setErrorText('Please enter your participant name.');
      return;
    }
    setErrorText(null);
    setSuccessText(null);
    setIsSubmitting(true);

    try {
      await onJoinLeague(manualJoinId, joinerName);
      setManualJoinId('');
      setSuccessText('Joined custom league successfully!');
      onSelectLeague(manualJoinId);
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Failed to join league. Verify the Code is correct.');
    } finally {
      setIsSubmitting(false);
    }
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
              World Cup 2026 Championship
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold text-on-surface tracking-tight">
            League Center
          </h2>
          <p className="text-on-surface-variant text-sm md:text-base max-w-xl mt-1 leading-normal font-sans">
            Participate in global competitions or create private live leagues to sync and challenge friends in real time.
          </p>
        </div>

        {/* Friends Invitation Box */}
        {boardType !== 'custom' && (
          <div className="flex flex-col gap-1.5 self-start md:self-end">
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider font-display">
              Invite friends to tournament
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
                onClick={() => alert(`Invite friends to GOALMASTER with league code: ${inviteCode}`)}
                className="bg-brand-secondary text-brand-on-secondary hover:brightness-115 p-3 rounded-lg flex items-center justify-center transition-all active:scale-95"
                title="Share Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Standings Selector tabs */}
      <div className="flex justify-end mb-2">
        <div className="flex bg-surface-base p-1 rounded-full border border-outline-variant/60">
          <button 
            id="board-toggle-global-btn"
            onClick={() => {
              setBoardType('global');
              onSelectLeague(null);
            }}
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
            onClick={() => {
              setBoardType('friends');
              onSelectLeague(null);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              boardType === 'friends' 
                ? 'bg-brand-secondary text-brand-on-secondary shadow-md' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Friends League
          </button>

          <button 
            id="board-toggle-custom-btn"
            onClick={() => setBoardType('custom')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              boardType === 'custom' 
                ? 'bg-brand-secondary text-brand-on-secondary shadow-md' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Custom Sync Leagues
          </button>
        </div>
      </div>

      {/* Main Board Content rendering conditionally */}
      {boardType !== 'custom' ? (
        <>
          {/* Top 3 Podium Cards */}
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

          {/* Leaderboards Table Grid */}
          <div className="bg-surface-base rounded-2xl border border-outline-variant overflow-hidden shadow-lg">
            <div className="overflow-x-auto font-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-high border-b border-outline-variant">
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-display">Rank</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-display">Player</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-display text-center">Exact Scores</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-display text-center">Correct Outcomes</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-secondary uppercase tracking-wider font-display text-right">Total Points</th>
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
                        <td className="px-6 py-4.5 font-display text-brand-secondary font-black">#{player.rank}</td>
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
                              <div className="text-[11px] text-on-surface-variant">Win rate: {player.winRate}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-center font-display font-medium text-on-surface-variant">{player.exactScores}</td>
                        <td className="px-6 py-4.5 text-center font-display font-medium text-on-surface-variant">{player.correctOutcomes}</td>
                        <td className="px-6 py-4.5 text-right font-display font-bold text-brand-secondary">{player.points.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Expand standings toggle */}
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
        </>
      ) : (
        // CUSTOM SYNC LEAGUES TAB
        <div className="space-y-6">
          
          {errorText && (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-xs text-red-200">
              {errorText}
            </div>
          )}

          {successText && (
            <div className="p-4 bg-green-900/30 border border-[#00b954]/50 rounded-xl text-xs text-green-200">
              {successText}
            </div>
          )}

          {/* VIEW ACTIVE LEAGUE OR DEFAULT LEAGUE SELECTION HUB */}
          {currentLeague ? (
            <div className="space-y-6 bg-surface-base border border-outline-variant/60 p-6 rounded-2xl animate-fadeIn">
              
              {/* Active League Title Hub */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-4">
                <div>
                  <button 
                    onClick={() => onSelectLeague(null)}
                    className="flex items-center gap-1.5 text-brand-secondary text-xs font-bold hover:underline mb-2 font-display uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Leagues Hub
                  </button>
                  <h3 className="font-display font-extrabold text-2xl text-on-surface">
                    {currentLeague.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-sans mt-0.5">
                    Organizer Name: <span className="text-brand-tertiary font-bold">{currentLeague.creatorName}</span>
                  </p>
                </div>

                {/* Shareable Code Invite Block */}
                <div className="flex flex-col gap-1.5 self-start md:self-end">
                  <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider font-display">
                    League Invite Code (Send to friends)
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="bg-surface-highest px-3 py-1.5 rounded-lg border border-outline-variant flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-on-surface tracking-wider">
                        {currentLeague.id}
                      </span>
                      <button 
                        onClick={() => handleCopyLeagueLink(currentLeague.id)}
                        className="text-brand-secondary hover:opacity-85 transition-opacity"
                        title="Copy League Link"
                      >
                        {copiedLink === currentLeague.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button 
                      onClick={() => handleCopyLeagueLink(currentLeague.id)}
                      className="bg-brand-secondary text-brand-on-secondary hover:brightness-110 px-3 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" /> 
                      {copiedLink === currentLeague.id ? 'Copied Link!' : 'Invite Friends'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Members Live Standings List */}
              <div className="space-y-4">
                <h4 className="font-display text-xs font-bold text-[#c6c6cd] uppercase tracking-wider">
                  Live Member Leaderboard ({currentLeagueMembers.length})
                </h4>

                <div className="border border-outline-variant/40 rounded-xl overflow-hidden shadow-inner">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="bg-surface-high border-b border-outline-variant/60">
                        <th className="px-4 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Rank</th>
                        <th className="px-4 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Participant</th>
                        <th className="px-4 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-center">Exact Scores</th>
                        <th className="px-4 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-center">Correct Outcomes</th>
                        <th className="px-4 py-3.5 text-[10px] font-bold text-[#00b954] uppercase tracking-wider text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-sm">
                      {currentLeagueMembers.map((member, i) => {
                        const isYou = member.id === userMemberId;
                        return (
                          <tr 
                            key={member.id}
                            className={`transition-colors ${
                              isYou 
                                ? 'bg-[#00b954]/10 border-l-4 border-l-[#00b954]' 
                                : 'hover:bg-surface-high/30'
                            }`}
                          >
                            <td className="px-4 py-3 font-display font-black text-[#00b954]">
                              #{i + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <span className={`font-bold ${isYou ? 'text-[#00b954]' : 'text-on-surface'}`}>
                                  {member.name}
                                </span>
                                {isYou && <span className="ml-1 text-[10px] bg-[#00b954]/20 text-[#00b954] px-1.5 py-0.5 rounded font-bold uppercase">YOU</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">{member.exactScores}</td>
                            <td className="px-4 py-3 text-center">{member.correctOutcomes}</td>
                            <td className="px-4 py-3 text-right font-display font-bold text-[#00b954]">
                              {member.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            // REGULAR HUB SELECTOR: JOIN AND CREATE PANELS
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Creator Forms (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* My Joined Leagues Registry */}
                <div className="bg-surface-base border border-outline-variant/40 p-6 rounded-2xl shadow-md">
                  <h3 className="font-display font-bold text-sm uppercase text-on-surface mb-4 tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-brand-secondary" /> My Registered Leagues
                  </h3>
                  
                  {myLeagues.length === 0 ? (
                    <div className="p-6 text-center text-xs text-on-surface-variant font-sans bg-surface-lowest rounded-xl border border-dashed border-outline-variant">
                      You are not in any custom multiplayer leagues yet. Create one or join using an invite code below!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {myLeagues.map((lg) => (
                        <div 
                          key={lg.id}
                          className="flex items-center justify-between p-3.5 bg-surface-lowest border border-outline-variant hover:border-brand-secondary rounded-xl transition-all cursor-pointer group"
                          onClick={() => onSelectLeague(lg.id)}
                        >
                          <div>
                            <p className="font-bold text-sm text-on-surface group-hover:text-brand-secondary transition-colors">
                              {lg.name}
                            </p>
                            <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">
                              ID: {lg.id}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLeagueLink(lg.id);
                              }}
                              className="text-on-surface-variant hover:text-brand-secondary p-1.5 transition-colors"
                              title="Copy URL Share Link"
                            >
                              {copiedLink === lg.id ? (
                                <span className="text-[10px] text-[#00b954] font-bold">Copied!</span>
                              ) : (
                                <Share2 className="w-4 h-4" />
                              )}
                            </button>
                            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create A League Frame Form */}
                <div className="bg-surface-base border border-outline-variant/40 p-6 rounded-2xl shadow-md">
                  <h3 className="font-display font-bold text-sm uppercase text-on-surface mb-3 tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4.5 h-4.5 text-[#00b954]" /> Create New Sync League
                  </h3>
                  <p className="text-xs text-on-surface-variant font-sans leading-normal mb-5">
                    Spin up your custom group. This instantly registers a unique cloud-hosted Firestore room that lists you and your friends under live-ranking leaderboards.
                  </p>

                  <form onSubmit={executeCreate} className="space-y-4 font-sans text-xs">
                    <div>
                      <label className="block text-on-surface-variant font-bold mb-1.5">League Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Domer's World Cup Crew" 
                        value={newLeagueName}
                        onChange={(e) => setNewLeagueName(e.target.value)}
                        className="w-full bg-surface-lowest text-on-surface border border-outline-variant rounded-lg p-2.5 focus:border-[#00b954] focus:ring-0"
                      />
                    </div>
                    <div>
                      <label className="block text-on-surface-variant font-bold mb-1.5">Organizer Name (Your Username)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Tournament Pro" 
                        value={creatorName}
                        onChange={(e) => setCreatorName(e.target.value)}
                        className="w-full bg-surface-lowest text-on-surface border border-outline-variant rounded-lg p-2.5 focus:border-[#00b954] focus:ring-0"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#00b954] text-white hover:brightness-110 p-3 rounded-lg font-bold font-display uppercase tracking-wider text-xs flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Registering Room...</span>
                      ) : (
                        <>
                          <Plus className="w-4.5 h-4.5" />
                          CREATE & ACQUIRE LINK
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </div>

              {/* Join Existing Forms (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-surface-base border border-outline-variant/40 p-6 rounded-2xl shadow-md">
                  <h3 className="font-display font-bold text-sm uppercase text-on-surface mb-3 tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4.5 h-4.5 text-brand-secondary" /> Join Friends League Room
                  </h3>
                  <p className="text-xs text-on-surface-variant font-sans leading-normal mb-5">
                    Have an invitation code? Paste the League ID code below to insert your stats into their custom synced scoreboard!
                  </p>

                  <form onSubmit={executeManualJoin} className="space-y-4 font-sans text-xs">
                    <div>
                      <label className="block text-on-surface-variant font-bold mb-1.5">Paste League ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. nG2m8vXyzPq" 
                        value={manualJoinId}
                        onChange={(e) => setManualJoinId(e.target.value)}
                        className="w-full bg-surface-lowest text-on-surface border border-outline-variant rounded-lg p-2.5 focus:border-brand-secondary focus:ring-0 font-mono text-sm uppercase tracking-wider"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-on-surface-variant font-bold mb-1.5">Your Username</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Tournament Pro" 
                        value={joinerName}
                        onChange={(e) => setJoinerName(e.target.value)}
                        className="w-full bg-surface-lowest text-on-surface border border-outline-variant rounded-lg p-2.5 focus:border-brand-secondary focus:ring-0"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-secondary text-brand-on-secondary hover:brightness-110 p-3 rounded-lg font-bold font-display uppercase tracking-wider text-xs flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Checking Code...</span>
                      ) : (
                        <>
                          <ChevronRight className="w-5 h-5" />
                          JOIN SYNCOBJECT
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Helpful Tip */}
                <div className="p-5 bg-surface-high/50 border border-outline-variant/30 rounded-xl leading-relaxed text-xs text-on-surface-variant font-sans">
                  <p className="font-bold text-on-surface mb-1 text-[11px] uppercase tracking-wider">How Synced Leagues Work:</p>
                  Any points or predictions earned from your <strong className="text-brand-secondary">Match Center</strong> will update automatically inside Firestore, providing live synced scores next to your friends&apos; names. Invite links bypass login auth protocols completely!
                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
