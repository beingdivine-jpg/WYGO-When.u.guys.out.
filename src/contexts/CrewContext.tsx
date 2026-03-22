import React, { createContext, useContext, useState, useEffect } from 'react';
import { Crew, GoldenWindow } from '../types';
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
    clearSyncDraft: () => {}
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
    const [syncDraft, setSyncDraftState] = useState<Record<string, string> | null>(null);

    const setSyncDraft = (draft: Record<string, string> | null) => {
        setSyncDraftState(draft);
    };

    const clearSyncDraft = () => {
        setSyncDraftState(null);
    };

    // Fetch crews when user logs in
    useEffect(() => {
        if (!user) {
            setUserCrews([]);
            setActiveCrew(null);
            setIsLoadingCrews(false);
            return;
        }

        const fetchCrews = async () => {
            setIsLoadingCrews(true);
            try {
                const crews = await dbService.getUserCrews(user.uid);
                setUserCrews(crews);
            } catch (error) {
                console.error("Failed to fetch crews", error);
            } finally {
                setIsLoadingCrews(false);
            }
        };

        fetchCrews();
    }, [user]);

    // Fetch Active Round, Responses & Members when activeCrew changes
    useEffect(() => {
        const fetchCrewDetails = async () => {
            if (!activeCrew) {
                setActiveSyncRound(null);
                setPastRounds([]);
                setActiveResponses([]);
                setCalculatedResults([]);
                setActiveMembers([]);
                setIsLoadingRound(false);
                return;
            }

            setIsLoadingRound(true);
            try {
                // Fetch Members
                const members = await dbService.getUserProfiles(activeCrew.memberIds);
                setActiveMembers(members);

                // Fetch Rounds History
                const allRounds = await dbService.getAllSyncRounds(activeCrew.id);
                setPastRounds(allRounds.filter(r => r.id !== activeCrew.activeSyncRoundId));

                if (activeCrew.activeSyncRoundId) {
                    const round = await dbService.getActiveSyncRound(activeCrew.id, activeCrew.activeSyncRoundId);
                    if (round) {
                        setActiveSyncRound(round);
                        const responses = await dbService.getRoundResponses(activeCrew.id, round.id);
                        setActiveResponses(responses);
                        
                        // Calculate live results
                        const results = syncEngine.calculateResults(responses, activeCrew, round.durationMonths);
                        setCalculatedResults(results);
                    }
                } else {
                    setActiveSyncRound(null);
                    setActiveResponses([]);
                    setCalculatedResults([]);
                }
            } catch (error) {
                console.error("Failed to fetch crew details", error);
            } finally {
                setIsLoadingRound(false);
            }
        };

        fetchCrewDetails();
    }, [activeCrew]);

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
        setActiveCrew({ ...activeCrew, activeSyncRoundId: round.id });
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
            clearSyncDraft
        }}>
            {children}
        </CrewContext.Provider>
    );
};
