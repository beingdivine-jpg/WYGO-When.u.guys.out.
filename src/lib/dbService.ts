import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc,
  arrayUnion,
  Timestamp,
  addDoc,
  arrayRemove,
  deleteDoc,
  writeBatch,
  runTransaction
} from 'firebase/firestore';

export interface CrewData {
  id: string;
  name: string;
  majorityCountry: string;
  ownerId: string;
  memberIds: string[];
  pendingMemberIds?: string[]; // Added for join requests
  inviteCode: string;
  activeSyncRoundId: string | null;
  createdAt: any;
}

export interface SyncRound {
  id: string;
  crewId: string;
  startDate: any;
  durationMonths: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: any;
}

export interface UserResponse {
  userId: string;
  displayName: string;
  availability: Record<string, string>; // weekendId -> status
  updatedAt: any;
}

export const dbService = {
  // Crew Operations
  async createCrew(name: string, country: string, userId: string) {
    const crewRef = doc(collection(db, 'crews'));
    const inviteCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const crewData: CrewData = {
      id: crewRef.id,
      name,
      majorityCountry: country,
      ownerId: userId,
      memberIds: [userId],
      pendingMemberIds: [],
      inviteCode,
      activeSyncRoundId: null,
      createdAt: serverTimestamp()
    };
    
    await setDoc(crewRef, crewData);
    return crewData;
  },

  async joinCrewByCode(inviteCode: string, userId: string) {
    const q = query(collection(db, 'crews'), where('inviteCode', '==', inviteCode.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error("SQUAD_NOT_FOUND");
    }
    
    const crewDoc = querySnapshot.docs[0];
    const crewData = crewDoc.data() as CrewData;
    
    if (crewData.memberIds.includes(userId)) {
      throw new Error("ALREADY_MEMBER");
    }
    
    if (crewData.pendingMemberIds?.includes(userId)) {
      throw new Error("ALREADY_REQUESTED");
    }
    
    await updateDoc(crewDoc.ref, {
      pendingMemberIds: arrayUnion(userId)
    });
    
    return { ...crewData, pendingMemberIds: [...(crewData.pendingMemberIds || []), userId] };
  },

  async acceptMember(crewId: string, userId: string) {
    const crewRef = doc(db, 'crews', crewId);
    await updateDoc(crewRef, {
      memberIds: arrayUnion(userId),
      pendingMemberIds: arrayRemove(userId)
    });
  },

  async rejectMember(crewId: string, userId: string) {
    const crewRef = doc(db, 'crews', crewId);
    await updateDoc(crewRef, {
      pendingMemberIds: arrayRemove(userId)
    });
  },

  async getUserCrews(userId: string) {
    const q = query(collection(db, 'crews'), where('memberIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as CrewData);
  },

  async _cascadeDeleteCrewData(crewId: string, crewRef: any) {
    const batch = writeBatch(db);
    
    // Read all rounds for this crew
    const roundsRef = collection(db, 'crews', crewId, 'syncRounds');
    const roundsSnap = await getDocs(roundsRef);
    
    for (const roundDoc of roundsSnap.docs) {
      // Read all responses for this round
      const responsesRef = collection(db, 'crews', crewId, 'syncRounds', roundDoc.id, 'responses');
      const responsesSnap = await getDocs(responsesRef);
      
      // Delete responses
      for (const responseDoc of responsesSnap.docs) {
        batch.delete(responseDoc.ref);
      }
      // Delete round
      batch.delete(roundDoc.ref);
    }
    
    // Delete main crew doc
    batch.delete(crewRef);
    await batch.commit();
  },

  async leaveCrew(crewId: string, userId: string) {
    const crewRef = doc(db, 'crews', crewId);
    const crewSnap = await getDoc(crewRef);
    if (!crewSnap.exists()) return;
    
    const crewData = crewSnap.data() as CrewData;
    const remainingMembers = crewData.memberIds.filter(id => id !== userId);
    
    if (remainingMembers.length === 0) {
      // Last member is leaving - fully cascade delete the crew
      await this._cascadeDeleteCrewData(crewId, crewRef);
      return;
    }
    
    const batch = writeBatch(db);
    
    const updates: any = {
      memberIds: arrayRemove(userId)
    };
    
    // If owner is leaving, transfer ownership to the next member
    if (crewData.ownerId === userId && remainingMembers.length > 0) {
      updates.ownerId = remainingMembers[0];
    }
    
    batch.update(crewRef, updates);
    
    // Deep clean active round response for this user
    if (crewData.activeSyncRoundId) {
      const responseRef = doc(db, 'crews', crewId, 'syncRounds', crewData.activeSyncRoundId, 'responses', userId);
      batch.delete(responseRef);
    }

    await batch.commit();
  },

  async deleteCrew(crewId: string) {
    const crewRef = doc(db, 'crews', crewId);
    await this._cascadeDeleteCrewData(crewId, crewRef);
  },

  async removeMember(crewId: string, userId: string) {
    const crewRef = doc(db, 'crews', crewId);
    const crewSnap = await getDoc(crewRef);
    if (!crewSnap.exists()) return;
    const crewData = crewSnap.data() as CrewData;
    
    const batch = writeBatch(db);
    
    // 1. Remove from member list
    batch.update(crewRef, {
      memberIds: arrayRemove(userId)
    });
    
    // 2. If there's an active round, delete their response
    if (crewData.activeSyncRoundId) {
      const responseRef = doc(db, 'crews', crewId, 'syncRounds', crewData.activeSyncRoundId, 'responses', userId);
      batch.delete(responseRef);
    }
    
    await batch.commit();
  },

  async updateCrewInfo(crewId: string, updates: Partial<CrewData>) {
    const crewRef = doc(db, 'crews', crewId);
    await updateDoc(crewRef, updates);
  },

  // Sync Round Operations
  async startSyncRound(crewId: string, durationMonths: number) {
    const crewRef = doc(db, 'crews', crewId);
    
    return await runTransaction(db, async (transaction) => {
      const crewSnap = await transaction.get(crewRef);
      if (!crewSnap.exists()) throw new Error("CREW_NOT_FOUND");
      const crewData = crewSnap.data() as CrewData;
      
      // If there's an active round, mark it as completed
      if (crewData.activeSyncRoundId) {
        const oldRoundRef = doc(db, 'crews', crewId, 'syncRounds', crewData.activeSyncRoundId);
        transaction.update(oldRoundRef, { status: 'completed' });
      }
      
      // Create new round
      const roundsRef = collection(db, 'crews', crewId, 'syncRounds');
      const newRoundRef = doc(roundsRef);
      const newRound: SyncRound = {
        id: newRoundRef.id,
        crewId,
        startDate: serverTimestamp(),
        durationMonths,
        status: 'active',
        createdAt: serverTimestamp()
      };
      
      transaction.set(newRoundRef, newRound);
      
      // Update crew with active round ID
      transaction.update(crewRef, {
        activeSyncRoundId: newRoundRef.id
      });
      
      return newRound;
    });
  },

  async getActiveSyncRound(crewId: string, roundId: string) {
    const roundRef = doc(db, 'crews', crewId, 'syncRounds', roundId);
    const roundSnap = await getDoc(roundRef);
    if (roundSnap.exists()) {
      return { id: roundSnap.id, ...roundSnap.data() } as SyncRound;
    }
    return null;
  },

  async getAllSyncRounds(crewId: string) {
    const roundsRef = collection(db, 'crews', crewId, 'syncRounds');
    const qSnapshot = await getDocs(roundsRef);
    return qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SyncRound))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  },

  async cancelActiveRound(crewId: string) {
    const crewRef = doc(db, 'crews', crewId);
    const crewSnap = await getDoc(crewRef);
    if (!crewSnap.exists()) return;
    const crewData = crewSnap.data() as CrewData;
    
    const batch = writeBatch(db);
    if (crewData.activeSyncRoundId) {
      const roundRef = doc(db, 'crews', crewId, 'syncRounds', crewData.activeSyncRoundId);
      batch.update(roundRef, { status: 'cancelled' });
    }
    
    batch.update(crewRef, {
      activeSyncRoundId: null
    });
    
    await batch.commit();
  },

  async deleteSyncRound(crewId: string, roundId: string) {
    const roundRef = doc(db, 'crews', crewId, 'syncRounds', roundId);
    await deleteDoc(roundRef);
  },

  // Response Operations
  async submitResponse(crewId: string, roundId: string, userId: string, displayName: string, availability: Record<string, string>) {
    const responseRef = doc(db, 'crews', crewId, 'syncRounds', roundId, 'responses', userId);
    const responseData: UserResponse = {
      userId,
      displayName,
      availability,
      updatedAt: serverTimestamp()
    };
    await setDoc(responseRef, responseData);
    return responseData;
  },

  async getRoundResponses(crewId: string, roundId: string) {
    const responsesRef = collection(db, 'crews', crewId, 'syncRounds', roundId, 'responses');
    const qSnapshot = await getDocs(responsesRef);
    return qSnapshot.docs.map(doc => doc.data() as UserResponse);
  },

  async getUserProfile(userId: string) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  },

  async getUserProfiles(userIds: string[]) {
    if (userIds.length === 0) return [];
    const profiles = [];
    // Firestore 'in' query works for up to 10 IDs, so we chunk requests
    for (let i = 0; i < userIds.length; i += 10) {
      const chunk = userIds.slice(i, i + 10);
      const q = query(collection(db, 'users'), where('uid', 'in', chunk));
      const querySnapshot = await getDocs(q);
      profiles.push(...querySnapshot.docs.map(doc => doc.data()));
    }
    return profiles;
  }
};
