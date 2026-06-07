/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  Check, 
  Trophy, 
  Sparkles, 
  X,
  UserPlus
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { FixturesView } from './components/FixturesView';
import { BonusView } from './components/BonusView';
import { LeaderboardView } from './components/LeaderboardView';
import { ActiveTab, Match, Competitor } from './types';
import { INITIAL_MATCHES, GLOBAL_LEADERBOARD, FRIENDS_LEADERBOARD } from './data';
import { 
  createLeague, 
  joinLeague, 
  getMyLeagues, 
  subscribeLeagueMembers, 
  syncMyScoreInLeagues, 
  getOrGenerateMemberId,
  LeagueInfo,
  LeagueMember 
} from './lib/leagueService';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Custom User details
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('goalmaster_username') || 'Tournament Pro';
  });

  const userMemberId = getOrGenerateMemberId();

  // Core interactive statistics backed by localStorage persistence
  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem('goalmaster_user_points');
    return saved ? parseInt(saved, 10) : 65;
  });

  const [userRank, setUserRank] = useState<number>(() => {
    const saved = localStorage.getItem('goalmaster_user_rank');
    return saved ? parseInt(saved, 10) : 4;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('goalmaster_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [bonusChamp, setBonusChamp] = useState<string>(() => {
    return localStorage.getItem('goalmaster_bonus_champ') || 'France';
  });

  const [bonusBoot, setBonusBoot] = useState<string>(() => {
    return localStorage.getItem('goalmaster_bonus_boot') || 'Kylian Mbappé (France)';
  });

  // Custom leagues state
  const [myLeagues, setMyLeagues] = useState<{ id: string; name: string }[]>(() => getMyLeagues());
  const [currentLeagueId, setCurrentLeagueId] = useState<string | null>(null);
  const [currentLeague, setCurrentLeague] = useState<LeagueInfo | null>(null);
  const [currentLeagueMembers, setCurrentLeagueMembers] = useState<LeagueMember[]>([]);

  // Invite modal logic states
  const [joinInviteLeague, setJoinInviteLeague] = useState<LeagueInfo | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Computed deadlines
  const isSecondRoundStarted = matches.some(m => 
    (m.matchNumber >= 5 || m.stage !== 'group') && 
    (m.status === 'live' || m.status === 'finished')
  );

  const isGroupStageEnded = matches.some(m => m.stage !== 'group' && (m.status === 'live' || m.status === 'finished')) || 
    matches.filter(m => m.stage === 'group').every(m => m.status === 'finished');

  // Global Competitors & Friends list to sync points live!
  const [globalStandings, setGlobalStandings] = useState<Competitor[]>(GLOBAL_LEADERBOARD);
  const [friendsStandings, setFriendsStandings] = useState<Competitor[]>(FRIENDS_LEADERBOARD);

  // Modal displays
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  
  // Custom toast notification states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('info');

  // Trigger custom notification alerts
  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // On Mount: Detect if there is a leagueId parameter in query-string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLeagueId = params.get('leagueId');
    if (urlLeagueId) {
      import('./lib/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ doc, getDoc }) => {
          getDoc(doc(db, 'leagues', urlLeagueId)).then((snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setJoinInviteLeague({
                id: urlLeagueId,
                name: data.name,
                creatorName: data.creatorName
              });
              setInviteModalOpen(true);
            } else {
              showToast("The invite link expired or is invalid.", "info");
              // Clear invalid query params
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }).catch((err) => {
            console.error('Error fetching league details of invite link:', err);
          });
        });
      });
    }
  }, []);

  // Sync general selections to local storage
  useEffect(() => {
    localStorage.setItem('goalmaster_user_points', userPoints.toString());
    localStorage.setItem('goalmaster_user_rank', userRank.toString());
    localStorage.setItem('goalmaster_matches', JSON.stringify(matches));
    localStorage.setItem('goalmaster_bonus_champ', bonusChamp);
    localStorage.setItem('goalmaster_bonus_boot', bonusBoot);
  }, [userPoints, userRank, matches, bonusChamp, bonusBoot]);

  // Sync leaderboards depending on user score!
  useEffect(() => {
    setFriendsStandings((prev) => {
      const updated = prev.map((competitor) => {
        if (competitor.isUser || competitor.name.includes('(You)')) {
          return { ...competitor, name: `${username} (You)`, points: userPoints };
        }
        return competitor;
      }).sort((a, b) => b.points - a.points);

      const userIndex = updated.findIndex(c => c.isUser || c.name.includes('(You)'));
      if (userIndex !== -1) {
        setUserRank(userIndex + 1);
      }

      return updated;
    });
  }, [userPoints, username]);

  // Handle live score syncing of ourselves to all joined private leagues
  useEffect(() => {
    const exactScores = matches.filter(m => m.status === 'finished' && m.exactScoreWon).length;
    const correctOutcomes = matches.filter(m => m.status === 'finished' && m.outcomeOnlyWon).length;
    
    const preds: Record<string, { home: number; away: number }> = {};
    matches.forEach((m) => {
      if (m.predHome !== undefined && m.predAway !== undefined) {
        preds[m.id] = { home: m.predHome, away: m.predAway };
      }
    });

    syncMyScoreInLeagues(username, userPoints, exactScores, correctOutcomes, preds);
  }, [userPoints, matches, username]);

  // Subscribe to real-time custom league scoreboard changes
  useEffect(() => {
    if (!currentLeagueId) {
      setCurrentLeague(null);
      setCurrentLeagueMembers([]);
      return;
    }

    import('./lib/firebase').then(({ db }) => {
      import('firebase/firestore').then(({ doc, getDoc }) => {
        getDoc(doc(db, 'leagues', currentLeagueId)).then((snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setCurrentLeague({
              id: currentLeagueId,
              name: data.name,
              creatorName: data.creatorName
            });
          }
        });
      });
    });

    const unsubscribe = subscribeLeagueMembers(currentLeagueId, (members) => {
      setCurrentLeagueMembers(members);
    });

    return () => unsubscribe();
  }, [currentLeagueId]);

  // Custom League Handlers
  const handleCreateLeague = async (leagueName: string, creatorName: string): Promise<string> => {
    const exactScores = matches.filter(m => m.status === 'finished' && m.exactScoreWon).length;
    const correctOutcomes = matches.filter(m => m.status === 'finished' && m.outcomeOnlyWon).length;
    
    const preds: Record<string, { home: number; away: number }> = {};
    matches.forEach((m) => {
      if (m.predHome !== undefined && m.predAway !== undefined) {
        preds[m.id] = { home: m.predHome, away: m.predAway };
      }
    });

    const generatedId = await createLeague(leagueName, creatorName, userPoints, exactScores, correctOutcomes, preds);
    setMyLeagues(getMyLeagues());
    setCurrentLeagueId(generatedId);
    showToast(`League "${leagueName}" registered on Firebase Firestore!`, 'success');
    return generatedId;
  };

  const handleJoinLeague = async (leagueId: string, participantName: string): Promise<void> => {
    const exactScores = matches.filter(m => m.status === 'finished' && m.exactScoreWon).length;
    const correctOutcomes = matches.filter(m => m.status === 'finished' && m.outcomeOnlyWon).length;
    
    const preds: Record<string, { home: number; away: number }> = {};
    matches.forEach((m) => {
      if (m.predHome !== undefined && m.predAway !== undefined) {
        preds[m.id] = { home: m.predHome, away: m.predAway };
      }
    });

    await joinLeague(leagueId, participantName, userPoints, exactScores, correctOutcomes, preds);
    setMyLeagues(getMyLeagues());
    setCurrentLeagueId(leagueId);
    showToast(`Joined Sync League successfully!`, 'success');
  };

  // Handle saving score prediction values on Fixtures view
  const handleSavePrediction = (matchId: string, homeScore: number, awayScore: number) => {
    setMatches((prevMatches) => {
      const updated = prevMatches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            predHome: homeScore,
            predAway: awayScore,
          };
        }
        return m;
      });
      return updated;
    });
    showToast(`Prediction score (${homeScore} - ${awayScore}) saved successfully!`, 'success');
  };

  // Live match simulator! Completes predictions/awards points in real-time
  const handleSimulateMatchLiveState = (matchId: string) => {
    setMatches((prevMatches) => {
      const updated = prevMatches.map((m) => {
        if (m.id === matchId) {
          if (m.status === 'upcoming') {
            return {
              ...m,
              status: 'live',
              timeLabel: 'Live • 64\'',
              liveMinute: 64,
              homeRealScore: Math.floor(Math.random() * 3),
              awayRealScore: Math.floor(Math.random() * 3),
            };
          } else if (m.status === 'live') {
            const realHome = m.homeRealScore ?? Math.floor(Math.random() * 3);
            const realAway = m.awayRealScore ?? Math.floor(Math.random() * 3);
            
            const predHome = m.predHome ?? 0;
            const predAway = m.predAway ?? 0;

            let exactMatch = false;
            let outcomeOnly = false;
            let pointsAwarded = 0;

            if (predHome === realHome && predAway === realAway) {
              exactMatch = true;
              pointsAwarded = 3;
            } else if (
              (predHome > predAway && realHome > realAway) ||
              (predHome < predAway && realHome < realAway) ||
              (predHome === predAway && realHome === realAway)
            ) {
              outcomeOnly = true;
              pointsAwarded = 1;
            }

            if (pointsAwarded > 0) {
              setUserPoints((prev) => prev + pointsAwarded);
              setTimeout(() => {
                showToast(`Incredible! You earned +${pointsAwarded} PTS for match prediction!`, 'success');
              }, 400);
            } else {
              setTimeout(() => {
                showToast(`Match ended and finalized with score ${realHome} - ${realAway}. Better luck next prediction!`, 'info');
              }, 400);
            }

            return {
              ...m,
              status: 'finished',
              timeLabel: 'Finished • Yesterday',
              homeRealScore: realHome,
              awayRealScore: realAway,
              pointsWon: pointsAwarded,
              exactScoreWon: exactMatch,
              outcomeOnlyWon: outcomeOnly,
            };
          }
        }
        return m;
      });
      return updated;
    });
  };

  // Quick predict form submissions
  const handleQuickPredictSubmit = (homeScore: number, awayScore: number) => {
    let found = false;
    setMatches((prevMatches) => {
      const updated = prevMatches.map((m) => {
        if (!found && m.status === 'upcoming') {
          found = true;
          return {
            ...m,
            predHome: homeScore,
            predAway: awayScore,
          };
        }
        return m;
      });
      return updated;
    });

    if (found) {
      showToast(`Quick prediction (${homeScore} - ${awayScore}) saved for upcoming spotlight game!`, 'success');
    } else {
      showToast(`Prediction values saved successfully!`, 'success');
    }
  };

  const handleSaveChampion = (champion: string) => {
    setBonusChamp(champion);
    showToast(`Champion prediction set to ${champion}!`, 'success');
  };

  const handleSaveGoldenBoot = (goldenBoot: string) => {
    setBonusBoot(goldenBoot);
    showToast(`Golden Boot prediction set to ${goldenBoot}!`, 'success');
  };

  const recentResultsList = [
    {
      teams: 'MEX 2 - 1 ECU',
      stage: 'Group Stage',
      flags: [
        'https://flagcdn.com/w160/mx.png',
        'https://flagcdn.com/w160/ec.png'
      ],
      points: '+3 PTS',
      badge: 'Exact Score!',
    },
    {
      teams: 'CAN 1 - 2 CRO',
      stage: 'Group Stage',
      flags: [
        'https://flagcdn.com/w160/ca.png',
        'https://flagcdn.com/w160/hr.png'
      ],
      points: '0 PTS',
      badge: 'Incorrect',
    }
  ];

  const spotlightMatch = matches.find(m => m.status === 'upcoming') || matches[0];

  return (
    <div className="bg-background-app text-on-surface font-sans min-h-screen relative flex flex-col pt-16">
      
      {/* Ambient glass blur nodes */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden select-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0f172a]/40 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00b954]/10 blur-[110px] rounded-full"></div>
      </div>

      {/* Top Application Header Bar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface-lowest border-b border-outline-variant/60 shadow-md">
        <div className="flex items-center gap-3">
          <span 
            onClick={() => setActiveTab('dashboard')}
            className="font-display text-lg md:text-xl font-extrabold text-brand-secondary cursor-pointer hover:opacity-90 transition-opacity tracking-tighter"
          >
            GOALMASTER
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Notification Button */}
          <button 
            id="header-notification-btn"
            onClick={() => {
              setShowNotificationPanel(!showNotificationPanel);
              setShowSettingsPanel(false);
            }}
            className="p-2 text-primary-accent hover:bg-surface-high transition-colors rounded-full relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-on-surface-variant hover:text-on-surface" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-secondary rounded-full border-2 border-surface-lowest"></span>
          </button>

          {/* Settings Button */}
          <button 
            id="header-settings-btn"
            onClick={() => {
              setShowSettingsPanel(!showSettingsPanel);
              setShowNotificationPanel(false);
            }}
            className="p-2 text-primary-accent hover:bg-surface-high transition-colors rounded-full"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-on-surface-variant hover:text-on-surface" />
          </button>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#45464d] flex-shrink-0">
            <img 
              alt="Tournament User profile info" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk5yfZoAtSrtymFMtFA5c8CPTFjfScMxLwMm0lr78ZFi7Zd8KrYQevp_A7AbXDX4yt20o_nwWGHfaTYn0hh4tRPxHNQ3LqdZfPjVynO_OmevYrSuvxgrYuUnlAvgDPqqUKI-HZj1C_HR43UNQ-dgKOInxGOPJ0JIQKTIy-kJgTcDkSQKp0dd7aEEyUnFjhMPt-kZNilkCwNomDbrohxW0ecN1zbC0ubHUFTwwloCMf4Zq-TrdeuCX-ywiSeH_GoJANGqdnaOrJr84" 
            />
          </div>
        </div>
      </header>

      {/* Main Core Flex Layout Grid */}
      <div className="flex flex-1">
        
        {/* Sidebar Left Component */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setShowNotificationPanel(false);
            setShowSettingsPanel(false);
          }}
          userRank={userRank}
          userPoints={userPoints}
        />

        {/* Floating Settings Panel */}
        {showSettingsPanel && (
          <div className="absolute right-margin-mobile md:right-margin-desktop top-18 bg-surface-high rounded-xl p-5 border border-outline-variant shadow-2xl w-72 z-50 animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-display text-sm font-bold text-on-surface">Settings Panel</h4>
              <button onClick={() => setShowSettingsPanel(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 text-xs text-on-surface-variant">
              <div>
                <label className="block text-on-surface font-semibold mb-1">Display Profile Name (Nickname)</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => {
                    const val = e.target.value.substring(0, 30);
                    setUsername(val);
                    localStorage.setItem('goalmaster_username', val);
                  }}
                  className="w-full bg-surface-lowest text-on-surface border border-outline-variant rounded p-2 focus:border-brand-secondary focus:ring-0"
                />
              </div>
              <div>
                <label className="block text-on-surface font-semibold mb-1">Live Database Simulation</label>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    setUserPoints(65);
                    setUserRank(4);
                    setMatches(INITIAL_MATCHES);
                    setBonusBoot('Kylian Mbappé (France)');
                    setBonusChamp('France');
                    setUsername('Tournament Pro');
                    setShowSettingsPanel(false);
                    showToast('Data reset to default values!', 'success');
                  }}
                  className="w-full bg-[#93000a] text-[#ffdad6] p-2 rounded-lg font-bold hover:brightness-115 text-center mt-1 cursor-pointer"
                >
                  Reset App Data LocalStorage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Notification Panel */}
        {showNotificationPanel && (
          <div className="absolute right-margin-mobile md:right-margin-desktop top-18 bg-surface-high rounded-xl p-5 border border-outline-variant shadow-2xl w-80 z-50 animate-fadeIn">
            <div className="flex justify-between items-center mb-3 border-b border-outline-variant/20 pb-2">
              <h4 className="font-display text-sm font-bold text-on-surface flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-secondary fill-brand-secondary/15" /> Notification Feeds
              </h4>
              <button onClick={() => setShowNotificationPanel(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs leading-normal font-sans">
              <div className="p-2 rounded bg-surface-low border-l-2 border-brand-secondary">
                <p className="font-semibold text-on-surface">Prediction Double Points</p>
                <p className="text-on-surface-variant mt-0.5 text-[11px]">Group stage scores score 2x multipliers this weekend only. Finalise predictions now!</p>
              </div>
              <div className="p-2 rounded bg-surface-low border-l-2 border-amber-500">
                <p className="font-semibold text-on-surface">Trophy Bonus Multiplier</p>
                <p className="text-on-surface-variant mt-0.5 text-[11px]">Unlock your Tournament Winner and Golden Boot picks to claim visual badges!</p>
              </div>
            </div>
          </div>
        )}

        {/* Core Workspace Panel Content */}
        <main className="flex-1 min-w-0 md:pl-72 py-8 px-margin-mobile md:pr-margin-desktop pb-24 md:pb-12 text-on-surface">
          
          {/* Main workspace displays depending on chosen sidebar routes */}
          {activeTab === 'dashboard' && (
            <DashboardView 
              userPoints={userPoints}
              userRank={userRank}
              nextMatch={spotlightMatch}
              recentResults={recentResultsList}
              quickPredict={{
                home: 'PORTUGAL',
                away: 'NETHERLANDS',
                homeFlag: 'https://flagcdn.com/w160/pt.png',
                awayFlag: 'https://flagcdn.com/w160/nl.png'
              }}
              globalCompetitors={globalStandings}
              friendsCompetitors={friendsStandings}
              setActiveTab={setActiveTab}
              onQuickPredictSubmit={handleQuickPredictSubmit}
            />
          )}

          {activeTab === 'fixtures' && (
            <FixturesView 
              matches={matches}
              userRank={userRank}
              sidebarLeaderboard={globalStandings}
              setActiveTab={setActiveTab}
              onSavePrediction={handleSavePrediction}
              onSimulateMatchLiveState={handleSimulateMatchLiveState}
            />
          )}

          {activeTab === 'bonus' && (
            <BonusView 
              initialChampion={bonusChamp}
              initialGoldenBoot={bonusBoot}
              isSecondRoundStarted={isSecondRoundStarted}
              isGroupStageEnded={isGroupStageEnded}
              onSaveChampion={handleSaveChampion}
              onSaveGoldenBoot={handleSaveGoldenBoot}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView 
              userPoints={userPoints}
              userRank={userRank}
              globalCompetitors={globalStandings}
              friendsCompetitors={friendsStandings}
              myLeagues={myLeagues}
              currentLeagueId={currentLeagueId}
              currentLeague={currentLeague}
              currentLeagueMembers={currentLeagueMembers}
              onCreateLeague={handleCreateLeague}
              onJoinLeague={handleJoinLeague}
              onSelectLeague={setCurrentLeagueId}
              userMemberId={userMemberId}
            />
          )}

          {activeTab === 'results' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col gap-1 mb-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Match Results</h1>
                <p className="text-on-surface-variant text-sm md:text-base max-w-xl">
                  Overview of historically finalized fixtures and scored metrics.
                </p>
              </div>

              {/* Filtering results tab matching matches schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.filter(m => m.status === 'finished').map((m) => (
                  <div key={m.id} className="p-5 rounded-2xl bg-surface-base border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <img alt="Flag A" className="w-8 h-8 rounded-full border-2 border-surface-lowest object-cover" src={m.homeFlag} />
                        <img alt="Flag B" className="w-8 h-8 rounded-full border-2 border-surface-lowest object-cover" src={m.awayFlag} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#e0e3e5]">{m.homeTeam} {m.homeRealScore} - {m.awayRealScore} {m.awayTeam}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mt-0.5 font-display">{m.stage} Stage</p>
                      </div>
                    </div>
                    {m.pointsWon !== undefined && m.pointsWon > 0 ? (
                      <span className="text-brand-secondary font-bold text-xs bg-brand-secondary/10 border border-brand-secondary/20 px-2.5 py-1 rounded-full">
                        +{m.pointsWon} PTS
                      </span>
                    ) : (
                      <span className="text-on-surface-variant font-bold text-xs bg-surface-high px-2.5 py-1 rounded-full">
                        0 PTS
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Dynamic Invitation Overlay Modal */}
      {inviteModalOpen && joinInviteLeague && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-base border border-outline-variant/60 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setInviteModalOpen(false)} 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#00b954]/10 border border-[#00b954]/30 flex items-center justify-center text-[#00b954]">
                <UserPlus className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-tertiary font-display">
                  Multiplayer Invitation
                </span>
                <h3 className="font-display font-black text-xl text-on-surface mt-1">
                  Join &quot;{joinInviteLeague.name}&quot;
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-normal font-sans">
                  You have been invited by <strong className="text-brand-secondary">{joinInviteLeague.creatorName}</strong> to join their live prediction league for World Cup 2026!
                </p>
              </div>

              <div className="w-full space-y-3 font-sans text-xs text-left">
                <div>
                  <label className="block text-on-surface-variant font-bold mb-1">Set Your Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => {
                      const val = e.target.value.substring(0, 30);
                      setUsername(val);
                      localStorage.setItem('goalmaster_username', val);
                    }}
                    placeholder="e.g. PredictionKing" 
                    className="w-full bg-surface-lowest text-on-surface border border-outline-variant rounded-lg p-2.5 focus:border-brand-secondary focus:ring-0"
                  />
                </div>

                <button 
                  onClick={async () => {
                    if (!username.trim()) {
                      alert('Please input a valid username!');
                      return;
                    }
                    try {
                      await handleJoinLeague(joinInviteLeague.id, username);
                      setInviteModalOpen(false);
                      setActiveTab('leaderboard');
                      window.history.replaceState({}, document.title, window.location.pathname);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Error joining custom league.');
                    }
                  }}
                  className="w-full bg-brand-secondary text-brand-on-secondary hover:brightness-110 p-3 rounded-lg font-bold font-display uppercase tracking-wider text-xs flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> ACCEPT INVITATION & ENTER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticking Toast Feedback banner */}
      {toastMessage && (
        <div className={`fixed bottom-20 md:bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-2.5 animate-bounce ${
          toastType === 'success' 
            ? 'bg-[#003915] border-[#00b954]/50 text-brand-secondary' 
            : 'bg-primary-container-app border-brand-secondary/30 text-primary-accent'
        }`}>
          <Sparkles className="w-5 h-5 flex-shrink-0 animate-spin" />
          <p className="text-xs font-bold leading-normal font-sans pr-4">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
