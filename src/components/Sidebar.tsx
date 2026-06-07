/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Award, 
  Trophy, 
  History, 
  PlusCircle,
  Bell,
  Settings
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRank: number;
  userPoints: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  userRank, 
  userPoints 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'bonus', label: 'Bonus', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'results', label: 'Results', icon: History }
  ] as const;

  return (
    <>
      {/* Desktop Sidebar App Header inside Sidebar */}
      <aside className="hidden md:flex flex-col h-[calc(100vh-64px)] py-lg px-md bg-surface-base border-r border-[#45464d] fixed left-0 top-16 w-64 z-40 transition-all">
        <div className="mb-8 px-sm">
          <h3 className="font-display text-lg font-bold text-on-surface tracking-tight">Tournament Pro</h3>
          <p className="text-on-surface-variant text-sm mt-0.5">Rank: #{userRank}</p>
          <p className="text-brand-secondary text-xs uppercase tracking-widest font-bold mt-1">{userPoints.toLocaleString()} PTS</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 text-left ${
                  isActive 
                    ? 'bg-brand-secondary text-brand-on-secondary' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-high'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-8 mt-auto border-t border-[#45464d]/40">
          <button 
            id="make-predictions-btn"
            onClick={() => setActiveTab('fixtures')}
            className="w-full bg-brand-secondary text-brand-on-secondary hover:bg-brand-secondary-container transition-all active:scale-95 duration-150 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Make Predictions</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-2 md:hidden bg-surface-lowest border-t border-[#45464d] shadow-2xl rounded-t-xl px-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-secondary/15 text-brand-secondary' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-wider mt-1 uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
