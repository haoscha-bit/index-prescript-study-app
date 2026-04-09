import { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

// Types
export interface Prescript {
  id: number;
  name: string;
  duration: number; // minutes
  category: string | null;
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
  sessions: SessionRecord[];
  streak: number;
  totalCompleted: number;
  totalFailed: number;
  lastCompletedDate: Date | null;
  activePrescript: Prescript | null;
  timerEndTime: number | null;
  rank: string;
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
}

const PrescriptContext = createContext<PrescriptContextType | null>(null);

export function PrescriptProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PrescriptState>({
    prescripts: [],
    sessions: [],
    streak: 0,
    totalCompleted: 0,
    totalFailed: 0,
    lastCompletedDate: null,
    activePrescript: null,
    timerEndTime: null,
    rank: "Uninitialized",
  });

  // tRPC queries
  const prescriptsQuery = trpc.prescripts.list.useQuery();
  const sessionsQuery = trpc.sessions.list.useQuery();
  const createPrescriptMutation = trpc.prescripts.create.useMutation();
  const deletePrescriptMutation = trpc.prescripts.delete.useMutation();
  const recordSessionMutation = trpc.sessions.record.useMutation();

  // Load data from database
  useEffect(() => {
    if (prescriptsQuery.data && sessionsQuery.data) {
      const prescripts = prescriptsQuery.data;
      const sessions = sessionsQuery.data;

      // Calculate stats
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

      // Calculate rank
      const getRank = (completed: number) => {
        if (completed === 0) return "Uninitialized";
        if (completed < 5) return "Proselyte";
        if (completed < 15) return "Proxy";
        if (completed < 30) return "Messenger";
        if (completed < 60) return "Weaver";
        return "Arbiter";
      };

      setState((prev) => ({
        ...prev,
        prescripts,
        sessions,
        totalCompleted: completed,
        totalFailed: failed,
        lastCompletedDate:
          sortedSessions.find((s) => s.status === "completed")?.completedAt || null,
        streak,
        rank: getRank(completed),
      }));
    }
  }, [prescriptsQuery.data, sessionsQuery.data]);

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

  const addPrescript = async (p: Omit<Prescript, "id" | "createdAt" | "userId" | "description" | "updatedAt">) => {
    await createPrescriptMutation.mutateAsync({
      name: p.name,
      duration: p.duration,
      category: p.category || undefined,
    });
    prescriptsQuery.refetch();
  };

  const removePrescript = async (id: number) => {
    await deletePrescriptMutation.mutateAsync({ id });
    prescriptsQuery.refetch();
  };

  const assignPrescript = () => {
    if (state.prescripts.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * state.prescripts.length);
    const selected = state.prescripts[randomIndex];
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
    return Math.round(
      (state.totalCompleted / state.sessions.length) * 100
    );
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
