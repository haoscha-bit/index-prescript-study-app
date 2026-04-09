import { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getRank } from "@shared/ranks";

// Types
export interface Prescript {
  id: number;
  name: string;
  duration: number; // minutes
  category: string | null;
  deckId: number | null;
  createdAt: Date;
}

export interface Deck {
  id: number;
  name: string;
  createdAt: Date;
}

export interface SessionRecord {
  id: number;
  prescriptId: number;
  prescriptName?: string;
  category?: string;
  duration?: number;
  status: "completed" | "failed";
  completedAt: Date;
}

export interface PrescriptState {
  prescripts: Prescript[];
  decks: Deck[];
  sessions: SessionRecord[];
  streak: number;
  totalCompleted: number;
  totalFailed: number;
  lastCompletedDate: Date | null;
  activePrescript: Prescript | null;
  timerEndTime: number | null;
  rank: string;
  selectedDeckId: number | null; // null = "All Prescripts"
}

interface PrescriptContextType extends PrescriptState {
  addPrescript: (p: Omit<Prescript, "id" | "createdAt">) => Promise<void>;
  removePrescript: (id: number) => Promise<void>;
  assignPrescript: () => Prescript | null;
  startTimer: () => void;
  completeSession: () => Promise<void>;
  failSession: () => Promise<void>;
  clearActivePrescript: () => void;
  getCompletionRate: () => number;
  // Deck operations
  createDeck: (name: string) => Promise<void>;
  renameDeck: (id: number, name: string) => Promise<void>;
  deleteDeck: (id: number) => Promise<void>;
  setSelectedDeckId: (deckId: number | null) => void;
  updatePrescriptDeck: (prescriptId: number, deckId: number | null) => Promise<void>;
  getPrescriptsForDeck: (deckId: number | null) => Prescript[];
}

const PrescriptContext = createContext<PrescriptContextType | null>(null);

export function PrescriptProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PrescriptState>({
    prescripts: [],
    decks: [],
    sessions: [],
    streak: 0,
    totalCompleted: 0,
    totalFailed: 0,
    lastCompletedDate: null,
    activePrescript: null,
    timerEndTime: null,
    rank: "Uninitialized",
    selectedDeckId: null,
  });

  // tRPC queries
  const prescriptsQuery = trpc.prescripts.list.useQuery();
  const decksQuery = trpc.decks.list.useQuery();
  const sessionsQuery = trpc.sessions.list.useQuery();
  const createPrescriptMutation = trpc.prescripts.create.useMutation();
  const deletePrescriptMutation = trpc.prescripts.delete.useMutation();
  const recordSessionMutation = trpc.sessions.record.useMutation();
  const createDeckMutation = trpc.decks.create.useMutation();
  const renameDeckMutation = trpc.decks.rename.useMutation();
  const deleteDeckMutation = trpc.decks.delete.useMutation();
  const updatePrescriptDeckMutation = trpc.prescripts.updateDeck.useMutation();

  // Load data from database
  useEffect(() => {
    if (prescriptsQuery.data && sessionsQuery.data) {
      const prescripts = prescriptsQuery.data;
      const sessions = sessionsQuery.data;
      const decks = decksQuery.data || [];

      const completed = sessions.filter((s) => s.status === "completed").length;
      const failed = sessions.filter((s) => s.status === "failed").length;

      // Calculate streak
      const sortedSessions = [...sessions].sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const session of sortedSessions) {
        const sessionDate = new Date(session.completedAt);
        sessionDate.setHours(0, 0, 0, 0);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - streak);

        if (
          session.status === "completed" &&
          sessionDate.getTime() === expectedDate.getTime()
        ) {
          streak++;
        } else {
          break;
        }
      }

      // getRank imported from shared/ranks.ts

      setState((prev) => ({
        ...prev,
        prescripts,
        decks,
        sessions,
        totalCompleted: completed,
        totalFailed: failed,
        lastCompletedDate:
          sortedSessions.find((s) => s.status === "completed")?.completedAt || null,
        streak,
        rank: getRank(completed),
      }));
    }
  }, [prescriptsQuery.data, sessionsQuery.data, decksQuery.data]);

  // Restore active prescript from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("activePrescript");
    if (stored) {
      try {
        const active = JSON.parse(stored);
        setState((prev) => ({ ...prev, activePrescript: active }));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const addPrescript = async (p: Omit<Prescript, "id" | "createdAt">) => {
    await createPrescriptMutation.mutateAsync({
      name: p.name,
      duration: p.duration,
      category: p.category || undefined,
      deckId: p.deckId,
    });
    prescriptsQuery.refetch();
  };

  const removePrescript = async (id: number) => {
    await deletePrescriptMutation.mutateAsync({ id });
    prescriptsQuery.refetch();
  };

  const getPrescriptsForDeck = (deckId: number | null): Prescript[] => {
    if (deckId === null) {
      // "All Prescripts" — return everything
      return state.prescripts;
    }
    return state.prescripts.filter((p) => p.deckId === deckId);
  };

  const assignPrescript = () => {
    const pool = getPrescriptsForDeck(state.selectedDeckId);
    if (pool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    setState((prev) => ({ ...prev, activePrescript: selected }));
    sessionStorage.setItem("activePrescript", JSON.stringify(selected));
    return selected;
  };

  const startTimer = () => {
    if (!state.activePrescript) return;
    const endTime = Date.now() + state.activePrescript.duration * 60 * 1000;
    setState((prev) => ({ ...prev, timerEndTime: endTime }));
  };

  const completeSession = async () => {
    if (!state.activePrescript) return;
    await recordSessionMutation.mutateAsync({
      prescriptId: state.activePrescript.id,
      status: "completed",
    });
    sessionsQuery.refetch();
    clearActivePrescript();
  };

  const failSession = async () => {
    if (!state.activePrescript) return;
    await recordSessionMutation.mutateAsync({
      prescriptId: state.activePrescript.id,
      status: "failed",
    });
    sessionsQuery.refetch();
    clearActivePrescript();
  };

  const clearActivePrescript = () => {
    setState((prev) => ({ ...prev, activePrescript: null, timerEndTime: null }));
    sessionStorage.removeItem("activePrescript");
  };

  const getCompletionRate = () => {
    if (state.sessions.length === 0) return 0;
    return Math.round((state.totalCompleted / state.sessions.length) * 100);
  };

  // Deck operations
  const createDeck = async (name: string) => {
    await createDeckMutation.mutateAsync({ name });
    decksQuery.refetch();
  };

  const renameDeck = async (id: number, name: string) => {
    await renameDeckMutation.mutateAsync({ id, name });
    decksQuery.refetch();
  };

  const deleteDeck = async (id: number) => {
    await deleteDeckMutation.mutateAsync({ id });
    // If the deleted deck was selected, reset to "All"
    if (state.selectedDeckId === id) {
      setState((prev) => ({ ...prev, selectedDeckId: null }));
    }
    decksQuery.refetch();
    prescriptsQuery.refetch(); // Prescripts may have been unassigned
  };

  const setSelectedDeckId = (deckId: number | null) => {
    setState((prev) => ({ ...prev, selectedDeckId: deckId }));
  };

  const updatePrescriptDeck = async (prescriptId: number, deckId: number | null) => {
    await updatePrescriptDeckMutation.mutateAsync({ id: prescriptId, deckId });
    prescriptsQuery.refetch();
  };

  const value: PrescriptContextType = {
    ...state,
    addPrescript,
    removePrescript,
    assignPrescript,
    startTimer,
    completeSession,
    failSession,
    clearActivePrescript,
    getCompletionRate,
    createDeck,
    renameDeck,
    deleteDeck,
    setSelectedDeckId,
    updatePrescriptDeck,
    getPrescriptsForDeck,
  };

  return (
    <PrescriptContext.Provider value={value}>{children}</PrescriptContext.Provider>
  );
}

export function usePrescript() {
  const context = useContext(PrescriptContext);
  if (!context) {
    throw new Error("usePrescript must be used within PrescriptProvider");
  }
  return context;
}
