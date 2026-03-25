import React, { createContext, useContext, useState, useEffect } from 'react';
import { Crew, GoldenWindow } from '../types';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    limit
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { dbService, CrewData, SyncRound, UserResponse } from '../lib/dbService';
import { syncEngine } from '../lib/syncEngine';

interface CrewContextType {
    userCrews: CrewData[];
    activeCrew: CrewData | null;
    setActiveCrew: (crew: CrewData | null) => void;
    isLoadingCrews: boolean;
    isLoadingRound: boolean;
    activeSyncRound: SyncRound | null;
    pastRounds: SyncRound[];
    activeResponses: UserResponse[];
    calculatedResults: GoldenWindow[];
    activeMembers: any[];
    createCrew: (data: any) => Promise<CrewData>;
    joinCrew: (code: string) => Promise<CrewData>;
    startNewSyncRound: (duration: number) => Promise<void>;
    submitWeekendResponse: (availability: Record<string, string>) => Promise<void>;
    syncDraft: Record<string, string> | null;
    setSyncDraft: (draft: Record<string, string> | null) => void;
    clearSyncDraft: () => void;
    leaveCrew: (crewId: string) => Promise<void>;
    deleteCrew: (crewId: string) => Promise<void>;
    removeMember: (crewId: string, userId: string) => Promise<void>;
    cancelActiveRound: (crewId: string) => Promise<void>;
    renameCrew: (crewId: string, newName: string) => Promise<void>;
}

const CrewContext = createContext<CrewContextType>({
    userCrews: [],
    activeCrew: null,
    setActiveCrew: () => {},
    isLoadingCrews: true,
    isLoadingRound: false,
    activeSyncRound: null,
    pastRounds: [],
    activeResponses: [],
    calculatedResults: [],
    activeMembers: [],
    createCrew: async () => { throw new Error("Not implemented"); },
    joinCrew: async () => { throw new Error("Not implemented"); },
    startNewSyncRound: async () => {},
    submitWeekendResponse: async () => {},
    syncDraft: null,
    setSyncDraft: () => {},
    clearSyncDraft: () => {},
    leaveCrew: async () => {},
    deleteCrew: async () => {},
    removeMember: async () => {},
    cancelActiveRound: async () => {},
    renameCrew: async () => {}
});

export const useCrew = () => useContext(CrewContext);

export const CrewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, userProfile } = useAuth();
    const [userCrews, setUserCrews] = useState<CrewData[]>([]);
    const [activeCrew, setActiveCrew] = useState<CrewData | null>(null);
    const [isLoadingCrews, setIsLoadingCrews] = useState(true);
    const [isLoadingRound, setIsLoadingRound] = useState(false);
    
    // Planning Round State
    const [activeSyncRound, setActiveSyncRound] = useState<SyncRound | null>(null);
    const [pastRounds, setPastRounds] = useState<SyncRound[]>([]);
    const [activeResponses, setActiveResponses] = useState<UserResponse[]>([]);
    const [calculatedResults, setCalculatedResults] = useState<GoldenWindow[]>([]);
    const [activeMembers, setActiveMembers] = useState<any[]>([]);
    const [syncDraft, setSyncDraftState] = useState<Record<string, string> | null>(() => {
        const saved = localStorage.getItem('wygo_sync_draft');
        return saved ? JSON.parse(saved) : null;
    });

    const setSyncDraft = (draft: Record<string, string> | null) => {
        setSyncDraftState(draft);
        if (draft) {
            localStorage.setItem('wygo_sync_draft', JSON.stringify(draft));
        } else {
            localStorage.removeItem('wygo_sync_draft');
        }
    };

    const clearSyncDraft = () => {
        setSyncDraftState(null);
        localStorage.removeItem('wygo_sync_draft');
    };

    // Fetch crews when user logs in - REAL-TIME
    useEffect(() => {
        if (!user) {
            setUserCrews([]);
            setActiveCrew(null);
            setIsLoadingCrews(false);
            return;
        }

        const q = query(
            collection(db, 'crews'), 
            where('memberIds', 'array-contains', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const crews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CrewData));
            setUserCrews(crews);
            setIsLoadingCrews(false);
            
            // If activeCrew was deleted/disbanded, or we were removed, clear it
            if (activeCrew && !crews.find(c => c.id === activeCrew.id)) {
                setActiveCrew(null);
            }
            // If activeCrew was renamed or round started, update its local copy
            if (activeCrew) {
                const updated = crews.find(c => c.id === activeCrew.id);
                if (updated && JSON.stringify(updated) !== JSON.stringify(activeCrew)) {
                   setActiveCrew(updated);
                }
            }
        }, (error) => {
            console.error("Crews listener error", error);
            setIsLoadingCrews(false);
        });

        return () => unsubscribe();
    }, [user, activeCrew]);

    // 1. Listen for Members
    useEffect(() => {
        if (!activeCrew) {
            setActiveMembers([]);
            return;
        }

        // We still use getUserProfiles (one-time) for member details like name/avatar
        // as they don't change often, but we trigger it when memberIds change
        const fetchMembers = async () => {
            const members = await dbService.getUserProfiles(activeCrew.memberIds);
            setActiveMembers(members);
        };
        fetchMembers();
    }, [activeCrew?.memberIds]);

    // 2. Listen for Rounds History
    useEffect(() => {
        if (!activeCrew) {
            setPastRounds([]);
            return;
        }

        const q = query(
            collection(db, 'crews', activeCrew.id, 'syncRounds'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allRounds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SyncRound));
            setPastRounds(allRounds.filter(r => r.id !== activeCrew.activeSyncRoundId));
        });

        return () => unsubscribe();
    }, [activeCrew?.id, activeCrew?.activeSyncRoundId]);

    // 3. Listen for Active Round & Responses
    useEffect(() => {
        if (!activeCrew || !activeCrew.activeSyncRoundId) {
            setActiveSyncRound(null);
            setActiveResponses([]);
            setCalculatedResults([]);
            return;
        }

        setIsLoadingRound(true);

        // Listen for Round Doc
        const roundRef = doc(db, 'crews', activeCrew.id, 'syncRounds', activeCrew.activeSyncRoundId);
        const unsubscribeRound = onSnapshot(roundRef, (doc) => {
            if (doc.exists()) {
                setActiveSyncRound({ id: doc.id, ...doc.data() } as SyncRound);
            } else {
                setActiveSyncRound(null);
            }
        });

        // Listen for Responses
        const responsesRef = collection(db, 'crews', activeCrew.id, 'syncRounds', activeCrew.activeSyncRoundId, 'responses');
        const unsubscribeResponses = onSnapshot(responsesRef, (snapshot) => {
            const responses = snapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() } as any));
            setActiveResponses(responses);
            
            // Recalculate results in real-time
            if (activeSyncRound) {
                const results = syncEngine.calculateResults(responses, activeCrew, activeSyncRound.durationMonths);
                setCalculatedResults(results);
            }
            setIsLoadingRound(false);
        });

        return () => {
            unsubscribeRound();
            unsubscribeResponses();
        };
    }, [activeCrew?.id, activeCrew?.activeSyncRoundId, activeSyncRound?.id]);

    const createCrew = async (data: any) => {
        if (!user) throw new Error("Must be logged in");
        const newCrew = await dbService.createCrew(data.name, data.country, user.uid);
        setUserCrews(prev => [newCrew, ...prev]);
        setActiveCrew(newCrew);
        return newCrew;
    };

    const joinCrew = async (code: string) => {
        if (!user) throw new Error("Must be logged in");
        const joinedCrew = await dbService.joinCrewByCode(code, user.uid);
        setUserCrews(prev => {
           if (prev.find(c => c.id === joinedCrew.id)) return prev;
           return [joinedCrew, ...prev];
        });
        setActiveCrew(joinedCrew);
        return joinedCrew;
    };

    const startNewSyncRound = async (duration: number) => {
        if (!activeCrew) return;
        const round = await dbService.startSyncRound(activeCrew.id, duration);
        setActiveSyncRound(round);
        setActiveResponses([]);
        setCalculatedResults([]);
        // Update active crew locally to include the new round ID
        const updatedCrew = { ...activeCrew, activeSyncRoundId: round.id };
        setActiveCrew(updatedCrew);
        setUserCrews(prev => prev.map(c => c.id === updatedCrew.id ? updatedCrew : c));
    };

    const leaveCrew = async (crewId: string) => {
        if (!user) return;
        await dbService.leaveCrew(crewId, user.uid);
        setUserCrews(prev => prev.filter(c => c.id !== crewId));
        if (activeCrew?.id === crewId) {
            setActiveCrew(null);
        }
    };

    const deleteCrew = async (crewId: string) => {
        await dbService.deleteCrew(crewId);
        setUserCrews(prev => prev.filter(c => c.id !== crewId));
        if (activeCrew?.id === crewId) {
            setActiveCrew(null);
        }
    };

    const removeMember = async (crewId: string, userId: string) => {
        await dbService.removeMember(crewId, userId);
        if (activeCrew?.id === crewId) {
            setActiveMembers(prev => prev.filter(m => m.uid !== userId));
            // Update activeCrew memberIds
            const updatedCrew = { 
                ...activeCrew, 
                memberIds: activeCrew.memberIds.filter(id => id !== userId) 
            };
            setActiveCrew(updatedCrew);
            setUserCrews(prev => prev.map(c => c.id === updatedCrew.id ? updatedCrew : c));
        }
    };

    const cancelActiveRound = async (crewId: string) => {
        await dbService.cancelActiveRound(crewId);
        if (activeCrew?.id === crewId) {
            const updatedCrew = { ...activeCrew, activeSyncRoundId: null };
            setActiveCrew(updatedCrew);
            setActiveSyncRound(null);
            setUserCrews(prev => prev.map(c => c.id === updatedCrew.id ? updatedCrew : c));
        }
    };

    const renameCrew = async (crewId: string, newName: string) => {
        await dbService.updateCrewInfo(crewId, { name: newName });
        setUserCrews(prev => prev.map(c => c.id === crewId ? { ...c, name: newName } : c));
        if (activeCrew?.id === crewId) {
            setActiveCrew({ ...activeCrew, name: newName });
        }
    };

    // Recalculate results whenever responses OR draft changes
    useEffect(() => {
        if (activeCrew && activeSyncRound) {
            let responsesToCalculate = [...activeResponses];
            
            // If we have a draft, inject/overwrite it into the calculation for the current user
            if (syncDraft && user) {
                const userResponseIdx = responsesToCalculate.findIndex(r => r.userId === user.uid);
                const draftResponse: UserResponse = {
                    userId: user.uid,
                    displayName: userProfile?.displayName || userProfile?.username || "You",
                    availability: syncDraft,
                    updatedAt: new Date().toISOString()
                };

                if (userResponseIdx > -1) {
                    responsesToCalculate[userResponseIdx] = draftResponse;
                } else {
                    responsesToCalculate.push(draftResponse);
                }
            }

            const results = syncEngine.calculateResults(
                responsesToCalculate, 
                activeCrew, 
                activeSyncRound.durationMonths,
                activeSyncRound.startDate?.toDate ? activeSyncRound.startDate.toDate() : new Date(activeSyncRound.startDate)
            );
            setCalculatedResults(results);
        }
    }, [activeResponses, syncDraft, activeCrew, activeSyncRound, user, userProfile]);

    const submitWeekendResponse = async (availability: Record<string, string>) => {
        if (!user || !activeCrew || !activeSyncRound || !userProfile) return;
        
        await dbService.submitResponse(
            activeCrew.id, 
            activeSyncRound.id, 
            user.uid, 
            userProfile.displayName || userProfile.username || "Friend",
            availability
        );
        
        // Refresh responses locally
        const updatedResponses = await dbService.getRoundResponses(activeCrew.id, activeSyncRound.id);
        setActiveResponses(updatedResponses);
        
        // Recalculate results - this will be handled by the effect above since updatedResponses is set
    };

    return (
        <CrewContext.Provider value={{
            userCrews,
            activeCrew,
            setActiveCrew,
            isLoadingCrews,
            isLoadingRound,
            activeSyncRound,
            pastRounds,
            activeResponses,
            calculatedResults,
            activeMembers,
            createCrew,
            joinCrew,
            startNewSyncRound,
            submitWeekendResponse,
            syncDraft,
            setSyncDraft,
            clearSyncDraft,
            leaveCrew,
            deleteCrew,
            removeMember,
            cancelActiveRound,
            renameCrew
        }}>
            {children}
        </CrewContext.Provider>
    );
};
