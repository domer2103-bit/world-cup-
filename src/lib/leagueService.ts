/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

export interface LeagueInfo {
  id: string;
  name: string;
  creatorName: string;
  createdAt?: string;
}

export interface LeagueMember {
  id: string;
  name: string;
  points: number;
  exactScores: number;
  correctOutcomes: number;
  predictions?: Record<string, { home: number; away: number }>;
  updatedAt?: string;
}

// Ensure user has a persistent random memberId so they can identify their rows in joined leagues
export const getOrGenerateMemberId = (): string => {
  let id = localStorage.getItem('goalmaster_member_id');
  if (!id) {
    id = 'mbr_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('goalmaster_member_id', id);
  }
  return id;
};

// Create a new league in Firestore
export const createLeague = async (
  leagueName: string,
  creatorName: string,
  userPoints: number,
  exactScores: number,
  correctOutcomes: number,
  predictions: Record<string, { home: number; away: number }> = {}
): Promise<string> => {
  try {
    const leaguesRef = collection(db, 'leagues');
    const newLeagueDoc = doc(leaguesRef); // Generate unique ID
    const leagueId = newLeagueDoc.id;

    const leagueData = {
      name: leagueName,
      creatorName: creatorName,
      createdAt: new Date().toISOString()
    };

    // 1. Create outer league information
    await setDoc(newLeagueDoc, leagueData);

    // 2. Register creator as the primary participant
    const memberId = getOrGenerateMemberId();
    const memberDocRef = doc(db, 'leagues', leagueId, 'members', memberId);
    
    await setDoc(memberDocRef, {
      name: creatorName,
      points: userPoints,
      exactScores: exactScores,
      correctOutcomes: correctOutcomes,
      predictions: predictions,
      updatedAt: new Date().toISOString()
    });

    // 3. Save to locally created/joined list in localStorage
    saveLeagueLocally(leagueId, leagueName);

    return leagueId;
  } catch (error) {
    console.error('Failed to create league in Firestore:', error);
    throw error;
  }
};

// Join an existing league
export const joinLeague = async (
  leagueId: string,
  participantName: string,
  userPoints: number,
  exactScores: number,
  correctOutcomes: number,
  predictions: Record<string, { home: number; away: number }> = {}
): Promise<LeagueInfo> => {
  try {
    // 1. Verify if league exists first
    const leagueDocRef = doc(db, 'leagues', leagueId);
    const leagueSnap = await getDoc(leagueDocRef);

    if (!leagueSnap.exists()) {
      throw new Error('This League ID does not exist. Please check the URL or invitation link.');
    }

    const leagueData = leagueSnap.data() as Omit<LeagueInfo, 'id'>;
    const leagueInfo: LeagueInfo = {
      id: leagueId,
      name: leagueData.name,
      creatorName: leagueData.creatorName
    };

    // 2. Add member record safely
    const memberId = getOrGenerateMemberId();
    const memberDocRef = doc(db, 'leagues', leagueId, 'members', memberId);

    await setDoc(memberDocRef, {
      name: participantName,
      points: userPoints,
      exactScores: exactScores,
      correctOutcomes: correctOutcomes,
      predictions: predictions,
      updatedAt: new Date().toISOString()
    });

    // 3. Save to locally joined lists in localStorage
    saveLeagueLocally(leagueId, leagueData.name);

    return leagueInfo;
  } catch (error) {
    console.error('Failed to join league:', error);
    throw error;
  }
};

// Helper to persist leagues inside client local registry
const saveLeagueLocally = (id: string, name: string) => {
  const savedLeaguesString = localStorage.getItem('goalmaster_joined_leagues');
  const leagues: { id: string; name: string }[] = savedLeaguesString 
    ? JSON.parse(savedLeaguesString) 
    : [];

  if (!leagues.some(l => l.id === id)) {
    leagues.push({ id, name });
    localStorage.setItem('goalmaster_joined_leagues', JSON.stringify(leagues));
  }
};

// Retrieve locally registered custom leagues
export const getMyLeagues = (): { id: string; name: string }[] => {
  const savedLeaguesString = localStorage.getItem('goalmaster_joined_leagues');
  return savedLeaguesString ? JSON.parse(savedLeaguesString) : [];
};

// Real-time listener for league participants
export const subscribeLeagueMembers = (
  leagueId: string,
  onUpdate: (members: LeagueMember[]) => void
) => {
  const membersRef = collection(db, 'leagues', leagueId, 'members');
  const q = query(membersRef, orderBy('points', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list: LeagueMember[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        name: data.name || '',
        points: data.points || 0,
        exactScores: data.exactScores || 0,
        correctOutcomes: data.correctOutcomes || 0,
        predictions: data.predictions || {},
        updatedAt: data.updatedAt || ''
      });
    });
    // Secondary tie-breaker sorting locally: sorted by points desc, then by exact scores desc, then alphabetically by name
    const sorted = [...list].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores;
      return a.name.localeCompare(b.name);
    });
    onUpdate(sorted);
  }, (err) => {
    console.error('Error in subscribeLeagueMembers context:', err);
  });
};

// Push live updates of ourselves to all joined leagues
export const syncMyScoreInLeagues = async (
  userName: string,
  userPoints: number,
  exactScores: number,
  correctOutcomes: number,
  predictions: Record<string, { home: number; away: number }>
) => {
  try {
    const leagues = getMyLeagues();
    const memberId = getOrGenerateMemberId();

    for (const league of leagues) {
      const memberDocRef = doc(db, 'leagues', league.id, 'members', memberId);
      
      // Merge updating scores dynamically so others can see!
      await setDoc(memberDocRef, {
        name: userName,
        points: userPoints,
        exactScores: exactScores,
        correctOutcomes: correctOutcomes,
        predictions: predictions,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Sync score operation omitted or offline:', err);
  }
};
