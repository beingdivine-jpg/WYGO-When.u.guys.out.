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
  addDoc
} from 'firebase/firestore';

export interface CrewData {
  id: string;
  name: string;
  majorityCountry: string;
  ownerId: string;
  memberIds: string[];
  inviteCode: string;
  activeSyncRoundId: string | null;
  createdAt: any;
}

export interface SyncRound {
  id: string;
  crewId: string;
  startDate: any;
  durationMonths: number;
  status: 'active' | 'completed';
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
      throw new Error("Invalid invite code.");
    }
    
    const crewDoc = querySnapshot.docs[0];
    const crewData = crewDoc.data() as CrewData;
    
    if (!crewData.memberIds.includes(userId)) {
      await updateDoc(crewDoc.ref, {
        memberIds: arrayUnion(userId)
      });
    }
    
    return { ...crewData, memberIds: [...crewData.memberIds, userId] };
  },

  async getUserCrews(userId: string) {
    const q = query(collection(db, 'crews'), where('memberIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as CrewData);
  },

  // Sync Round Operations
  async startSyncRound(crewId: string, durationMonths: number) {
    const roundsRef = collection(db, 'crews', crewId, 'syncRounds');
    const newRound: Omit<SyncRound, 'id'> = {
      crewId,
      startDate: serverTimestamp(),
      durationMonths,
      status: 'active',
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(roundsRef, newRound);
    
    // Update crew with active round ID
    await updateDoc(doc(db, 'crews', crewId), {
      activeSyncRoundId: docRef.id
    });
    
    return { ...newRound, id: docRef.id } as SyncRound;
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
      .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
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
