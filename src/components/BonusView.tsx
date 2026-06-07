/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Info, 
  Lock, 
  Search, 
  User, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  Award,
  Clock
} from 'lucide-react';
import { COUNTRIES, PLAYERS } from '../data';

interface BonusViewProps {
  initialChampion: string;
  initialGoldenBoot: string;
  isSecondRoundStarted: boolean;
  isGroupStageEnded: boolean;
  onSaveChampion: (champion: string) => void;
  onSaveGoldenBoot: (goldenBoot: string) => void;
}

export const BonusView: React.FC<BonusViewProps> = ({
  initialChampion,
  initialGoldenBoot,
  isSecondRoundStarted,
  isGroupStageEnded,
  onSaveChampion,
  onSaveGoldenBoot,
}) => {
  // Selections
  const [selectedChamp, setSelectedChamp] = useState<string>(initialChampion || 'France');
  const [selectedBoot, setSelectedBoot] = useState<string>(initialGoldenBoot || 'Kylian Mbappé (France)');
  
  const [countryQuery, setCountryQuery] = useState('');
  const [playerQuery, setPlayerQuery] = useState('');
  
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [playerDropdownOpen, setPlayerDropdownOpen] = useState(false);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countryQuery.toLowerCase())
  );

  const filteredPlayers = PLAYERS.filter((p) =>
    p.toLowerCase().includes(playerQuery.toLowerCase())
  );

  const handleSaveChampionClick = () => {
    if (!selectedChamp) return;
    onSaveChampion(selectedChamp);
  };

  const handleSaveGoldenBootClick = () => {
    if (!selectedBoot) return;
    onSaveGoldenBoot(selectedBoot);
  };

  const currentChampCountry = COUNTRIES.find(c => c.name.toLowerCase() === selectedChamp.toLowerCase()) || COUNTRIES[0];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Top Banner / Deadline status alerts */}
      <section className="bg-surface-lowest p-6 rounded-2xl border border-outline-variant/60 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-3">
          <div className="p-3 bg-brand-secondary/15 rounded-xl h-fit">
            <Trophy className="w-6 h-6 text-brand-secondary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">Tournament Bonus Predictions</h2>
            <p className="text-xs text-on-surface-variant font-medium mt-1">
              Select your forecast for the Cup Winner and Golden Boot. Deadlines lock automatically based on match progress!
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 justify-center text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isGroupStageEnded ? 'bg-[#ffdad6]' : 'bg-brand-secondary animate-pulse'}`}></span>
            <span className="font-semibold text-on-surface">
              Cup Winner: {isGroupStageEnded ? '🔒 Locked (Group Stage Ended)' : '🟢 Open (Till Group Stage End)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isSecondRoundStarted ? 'bg-[#ffdad6]' : 'bg-brand-secondary animate-pulse'}`}></span>
            <span className="font-semibold text-on-surface">
              Golden Boot: {isSecondRoundStarted ? '🔒 Locked (Round 2 Started)' : '🟢 Open (Till Round 2 begins)'}
            </span>
          </div>
        </div>
      </section>

      {/* Selection grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Tournament Winner Card */}
        <div className="bg-gradient-to-br from-surface-base/80 to-surface-low p-6 rounded-2xl border border-outline-variant/60 shadow-xl flex flex-col space-y-5 relative">
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-brand-secondary" />
                <h3 className="font-display text-lg font-bold text-brand-secondary">Cup Winner</h3>
              </div>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Locks at the end of the Group Stage.</p>
            </div>
            {isGroupStageEnded ? (
              <span className="bg-[#410002] text-[#ffdad6] px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wide font-display flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Locked
              </span>
            ) : (
              <span className="bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wide font-display">
                Active
              </span>
            )}
          </div>

          {!isGroupStageEnded ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-on-surface-variant" />
              </div>
              <input 
                type="text"
                placeholder="Search eligible countries..."
                value={countryQuery}
                onChange={(e) => {
                  setCountryQuery(e.target.value);
                  setCountryDropdownOpen(true);
                }}
                onFocus={() => setCountryDropdownOpen(true)}
                className="w-full bg-surface-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-sm text-on-surface focus:border-brand-secondary outline-none transition-all"
              />
              
              {countryDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full max-h-52 overflow-y-auto bg-surface-highest border border-outline-variant rounded-lg shadow-xl z-50">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.name}
                      id={`country-option-${c.name}`}
                      onClick={() => {
                        setSelectedChamp(c.name);
                        setCountryQuery('');
                        setCountryDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-surface-base text-sm text-on-surface font-semibold flex items-center gap-2"
                    >
                      <img alt={c.name} className="w-5 h-5 rounded-full object-cover" src={c.flag} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-surface-low rounded-xl border border-outline-variant/40 flex items-center gap-2.5 text-xs text-on-surface-variant">
              <Lock className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
              <span>Predictions locked. Current selection is stored securely.</span>
            </div>
          )}

          {/* Current Selection Area */}
          <div className="flex-1 flex flex-col justify-end pt-3">
            <div className="p-4 rounded-xl bg-surface-dim border border-brand-secondary/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-secondary bg-surface-lowest flex-shrink-0">
                <img 
                  alt={selectedChamp} 
                  className="w-full h-full object-cover" 
                  src={currentChampCountry.flag} 
                />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-brand-secondary uppercase tracking-widest font-display">
                  Current Champion Pick
                </p>
                <p className="font-display text-base font-bold text-on-surface">
                  {selectedChamp}
                </p>
              </div>
              <CheckCircle className="ml-auto w-6 h-6 text-brand-secondary fill-brand-secondary/15" />
            </div>
          </div>

          {!isGroupStageEnded && (
            <button
              onClick={handleSaveChampionClick}
              className="w-full py-2.5 mt-2 bg-brand-secondary text-brand-on-secondary font-bold rounded-lg text-xs hover:brightness-110 active:scale-95 transition-all text-center uppercase tracking-wider"
            >
              Save Cup Winner Prediction
            </button>
          )}
        </div>

        {/* Golden Boot Winner Card */}
        <div className="bg-gradient-to-br from-surface-base/80 to-surface-low p-6 rounded-2xl border border-outline-variant/60 shadow-xl flex flex-col space-y-5 relative">
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-secondary" />
                <h3 className="font-display text-lg font-bold text-brand-secondary">Golden Boot</h3>
              </div>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Locks when the 2nd Round of matches begins.</p>
            </div>
            {isSecondRoundStarted ? (
              <span className="bg-[#410002] text-[#ffdad6] px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wide font-display flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Locked
              </span>
            ) : (
              <span className="bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wide font-display">
                Active
              </span>
            )}
          </div>

          {!isSecondRoundStarted ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-on-surface-variant" />
              </div>
              <input 
                type="text"
                placeholder="Search top scorers..."
                value={playerQuery}
                onChange={(e) => {
                  setPlayerQuery(e.target.value);
                  setPlayerDropdownOpen(true);
                }}
                onFocus={() => setPlayerDropdownOpen(true)}
                className="w-full bg-surface-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-sm text-on-surface focus:border-brand-secondary outline-none transition-all"
              />
              
              {playerDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full max-h-52 overflow-y-auto bg-surface-highest border border-outline-variant rounded-lg shadow-xl z-50">
                  {filteredPlayers.map((p) => (
                    <button
                      key={p}
                      id={`player-option-${p}`}
                      onClick={() => {
                        setSelectedBoot(p);
                        setPlayerQuery('');
                        setPlayerDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-surface-base text-sm text-on-surface font-semibold flex items-center gap-2"
                    >
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-surface-low rounded-xl border border-outline-variant/40 flex items-center gap-2.5 text-xs text-on-surface-variant">
              <Lock className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
              <span>Predictions locked. Current selection is stored securely.</span>
            </div>
          )}

          {/* Current Selection Area */}
          <div className="flex-1 flex flex-col justify-end pt-3">
            {selectedBoot ? (
              <div className="p-4 rounded-xl bg-surface-dim border border-brand-secondary/40 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-secondary bg-surface-highest flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-brand-secondary" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-brand-secondary uppercase tracking-widest font-display">
                    Current Golden Boot Pick
                  </p>
                  <p className="font-display text-base font-bold text-on-surface">
                    {selectedBoot}
                  </p>
                </div>
                <CheckCircle className="ml-auto w-6 h-6 text-brand-secondary fill-brand-secondary/15" />
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-dim border border-dashed border-[#45464d] flex items-center gap-4 hover:border-brand-secondary cursor-pointer transition-all">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant bg-surface-container flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-on-surface-variant opacity-75" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest font-display">
                    Not Selected
                  </p>
                  <p className="font-display text-base font-bold text-on-surface-variant/80">
                    Choose a Player
                  </p>
                </div>
                <HelpCircle className="ml-auto w-6 h-6 text-on-surface-variant" />
              </div>
            )}
          </div>

          {!isSecondRoundStarted && (
            <button
              onClick={handleSaveGoldenBootClick}
              className="w-full py-2.5 mt-2 bg-brand-secondary text-brand-on-secondary font-bold rounded-lg text-xs hover:brightness-110 active:scale-95 transition-all text-center uppercase tracking-wider"
            >
              Save Golden Boot Prediction
            </button>
          )}
        </div>

      </div>

      {/* Rules & Info section */}
      <section className="bg-surface-base rounded-2xl p-6 border-l-4 border-l-brand-secondary relative shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-6 h-6 text-brand-secondary" />
          <h4 className="font-display text-base font-bold text-on-surface">Official Scoring Rules & Settling Guidelines</h4>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div className="space-y-3">
            <div>
              <span className="text-brand-secondary font-bold text-sm block">
                🎯 Core Prediction Scoring
              </span>
              <p className="text-on-surface-variant mt-1">
                You will be awarded <strong className="text-on-surface">3 points for an exact score match</strong> and <strong className="text-on-surface">1 point for a correct outcome</strong> (win / draw / loss) prediction.
              </p>
            </div>

            <div>
              <span className="text-[#ffb95f] font-bold text-sm block">
                ⏱️ Extra Time Counts Also!
              </span>
              <p className="text-on-surface-variant mt-1 text-[#ffb95f]/90 bg-[#251400]/40 p-2.5 rounded-lg border border-[#ffb95f]/10 mt-1">
                Match predictions are settled based on the <strong>correct scores after extra time</strong> (including injury time + standard extra time, but excluding any penalty shootout results). Consider this when predicting knockouts!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-brand-secondary font-bold text-xs block uppercase tracking-wider font-display">
                📆 Cup Winner Predictions Cutoff
              </span>
              <p className="text-on-surface-variant mt-1">
                Cup Winner predictions can be adjusted and saved and remain active <strong className="text-on-surface">until the end of the Tournament Group Stage</strong>. Once the group stage is set, picks are locked.
              </p>
            </div>

            <div>
              <span className="text-brand-secondary font-bold text-xs block uppercase tracking-wider font-display">
                📆 Top Scorer Predictions Cutoff
              </span>
              <p className="text-on-surface-variant mt-1">
                Golden Boot Top Scorer predictions can be adjusted and saved anytime <strong className="text-on-surface">until the Second Round of matches starts</strong>. Once round 2 kicks off, choices are permanently frozen.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-t border-[#45464d]/30 pt-4 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-brand-secondary" />
          <span>Status: Verified & Synced Live to Dev Server</span>
        </p>
      </section>

    </div>
  );
};
