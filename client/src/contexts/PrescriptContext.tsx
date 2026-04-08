import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// Types
export interface Prescript {
  id: string;
  name: string;
  duration: number; // minutes
  category?: string;
  difficulty?: "low" | "standard" | "high" | "critical";
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  prescriptId: string;
  prescriptName: string;
  category?: string;
  duration: number;
  status: "completed" | "failed";
  timestamp: string;
}

export interface PrescriptState {
  prescripts: Prescript[];
  sessions: SessionRecord[];
  streak: number;
  totalCompleted: number;
  totalFailed: number;
  lastCompletedDate: string | null;
  activePrescript: Prescript | null;
  timerEndTime: number | null;
  rank: string;
}

interface PrescriptContextType extends PrescriptState {
  addPrescript: (p: Omit<Prescript, "id" | "createdAt">) => void;
  removePrescript: (id: string) => void;
  editPrescript: (id: string, updates: Partial<Omit<Prescript, "id" | "createdAt">>) => void;
  assignPrescript: () => Prescript | null;
  completeSession: () => void;
  failSession: () => void;
  clearActivePrescript: () => void;
  getCompletionRate: () => number;
}

const PrescriptContext = createContext<PrescriptContextType | null>(null);

const STORAGE_KEY = "index-prescript-data";

const RANKS = [
  { threshold: 0, title: "Uninitiated" },
  { threshold: 5, title: "Proselyte" },
  { threshold: 15, title: "Blindfolded Proselyte" },
  { threshold: 30, title: "Proxy Aspirant" },
  { threshold: 50, title: "Proxy" },
  { threshold: 80, title: "Senior Proxy" },
  { threshold: 120, title: "Messenger" },
  { threshold: 200, title: "Weaver" },
];

function getRank(completed: number): string {
  let rank = RANKS[0].title;
  for (const r of RANKS) {
    if (completed >= r.threshold) rank = r.title;
  }
  return rank;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadState(): PrescriptState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        activePrescript: parsed.activePrescript || null,
        timerEndTime: parsed.timerEndTime || null,
        rank: getRank(parsed.totalCompleted || 0),
      };
    }
  } catch {
    // ignore
  }
  return {
    prescripts: [],
    sessions: [],
    streak: 0,
    totalCompleted: 0,
    totalFailed: 0,
    lastCompletedDate: null,
    activePrescript: null,
    timerEndTime: null,
    rank: "Uninitiated",
  };
}

function saveState(state: PrescriptState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function PrescriptProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrescriptState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addPrescript = useCallback((p: Omit<Prescript, "id" | "createdAt">) => {
    setState((prev) => ({
      ...prev,
      prescripts: [
        ...prev.prescripts,
        { ...p, id: generateId(), createdAt: new Date().toISOString() },
      ],
    }));
  }, []);

  const removePrescript = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      prescripts: prev.prescripts.filter((p) => p.id !== id),
    }));
  }, []);

  const editPrescript = useCallback((id: string, updates: Partial<Omit<Prescript, "id" | "createdAt">>) => {
    setState((prev) => ({
      ...prev,
      prescripts: prev.prescripts.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const assignPrescript = useCallback((): Prescript | null => {
    let pool = state.prescripts;
    if (pool.length === 0) return null;

    // Prevent immediate repetition
    if (pool.length > 1 && state.activePrescript) {
      pool = pool.filter((p) => p.id !== state.activePrescript!.id);
    }

    // Weighted randomness by difficulty
    const weights = pool.map((p) => {
      switch (p.difficulty) {
        case "critical": return 4;
        case "high": return 3;
        case "standard": return 2;
        case "low": return 1;
        default: return 2;
      }
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selected = pool[0];
    for (let i = 0; i < pool.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selected = pool[i];
        break;
      }
    }

    const endTime = Date.now() + selected.duration * 60 * 1000;
    setState((prev) => ({
      ...prev,
      activePrescript: selected,
      timerEndTime: endTime,
    }));
    return selected;
  }, [state.prescripts, state.activePrescript]);

  const completeSession = useCallback(() => {
    setState((prev) => {
      if (!prev.activePrescript) return prev;
      const today = new Date().toISOString().split("T")[0];
      const lastDate = prev.lastCompletedDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      let newStreak = prev.streak;
      if (lastDate === today) {
        // Same day, keep streak
      } else if (lastDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      const newCompleted = prev.totalCompleted + 1;
      return {
        ...prev,
        sessions: [
          {
            id: generateId(),
            prescriptId: prev.activePrescript.id,
            prescriptName: prev.activePrescript.name,
            category: prev.activePrescript.category,
            duration: prev.activePrescript.duration,
            status: "completed" as const,
            timestamp: new Date().toISOString(),
          },
          ...prev.sessions,
        ],
        streak: newStreak,
        totalCompleted: newCompleted,
        lastCompletedDate: today,
        activePrescript: null,
        timerEndTime: null,
        rank: getRank(newCompleted),
      };
    });
  }, []);

  const failSession = useCallback(() => {
    setState((prev) => {
      if (!prev.activePrescript) return prev;
      return {
        ...prev,
        sessions: [
          {
            id: generateId(),
            prescriptId: prev.activePrescript.id,
            prescriptName: prev.activePrescript.name,
            category: prev.activePrescript.category,
            duration: prev.activePrescript.duration,
            status: "failed" as const,
            timestamp: new Date().toISOString(),
          },
          ...prev.sessions,
        ],
        streak: Math.max(0, prev.streak - 1),
        totalFailed: prev.totalFailed + 1,
        activePrescript: null,
        timerEndTime: null,
      };
    });
  }, []);

  const clearActivePrescript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activePrescript: null,
      timerEndTime: null,
    }));
  }, []);

  const getCompletionRate = useCallback((): number => {
    const total = state.totalCompleted + state.totalFailed;
    if (total === 0) return 0;
    return Math.round((state.totalCompleted / total) * 100);
  }, [state.totalCompleted, state.totalFailed]);

  return (
    <PrescriptContext.Provider
      value={{
        ...state,
        addPrescript,
        removePrescript,
        editPrescript,
        assignPrescript,
        completeSession,
        failSession,
        clearActivePrescript,
        getCompletionRate,
      }}
    >
      {children}
    </PrescriptContext.Provider>
  );
}

export function usePrescript() {
  const ctx = useContext(PrescriptContext);
  if (!ctx) throw new Error("usePrescript must be used within PrescriptProvider");
  return ctx;
}
