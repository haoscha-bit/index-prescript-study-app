/**
 * CreatePrescript.tsx — Inscribe Prescripts
 * Design: Form styled as filling out an official Index document, blue accents
 */
import Layout from "@/components/Layout";
import DocumentCard from "@/components/DocumentCard";
import { usePrescript, type Prescript } from "@/contexts/PrescriptContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Clock,
  Tag,
  AlertTriangle,
  Pencil,
  Check,
  X,
} from "lucide-react";

const DIFFICULTY_OPTIONS = [
  { value: "low", label: "Low", color: "text-muted-foreground" },
  { value: "standard", label: "Standard", color: "text-ink" },
  { value: "high", label: "High", color: "text-index-blue" },
  { value: "critical", label: "Critical", color: "text-seal-red-bright" },
] as const;

const CATEGORY_SUGGESTIONS = [
  "Mathematics",
  "Science",
  "Literature",
  "History",
  "Languages",
  "Programming",
  "Art",
  "Music",
  "Philosophy",
  "Review",
  "Practice",
  "Reading",
];

export default function CreatePrescript() {
  const { prescripts, addPrescript, removePrescript, editPrescript } = usePrescript();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<"low" | "standard" | "high" | "critical">("standard");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; duration: string; category: string; difficulty: string }>({
    name: "",
    duration: "",
    category: "",
    difficulty: "standard",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !duration) return;

    const dur = parseInt(duration);
    if (isNaN(dur) || dur <= 0 || dur > 480) {
      toast.error("Duration must be between 1 and 480 minutes.");
      return;
    }

    addPrescript({
      name: name.trim(),
      duration: dur,
      category: category.trim() || undefined,
      difficulty,
    });

    toast.success("Prescript has been inscribed into the pool.");
    setName("");
    setDuration("");
    setCategory("");
    setDifficulty("standard");
  };

  const startEdit = (p: Prescript) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      duration: p.duration.toString(),
      category: p.category || "",
      difficulty: p.difficulty || "standard",
    });
  };

  const saveEdit = () => {
    if (!editingId || !editForm.name.trim() || !editForm.duration) return;
    const dur = parseInt(editForm.duration);
    if (isNaN(dur) || dur <= 0) return;
    editPrescript(editingId, {
      name: editForm.name.trim(),
      duration: dur,
      category: editForm.category.trim() || undefined,
      difficulty: editForm.difficulty as Prescript["difficulty"],
    });
    setEditingId(null);
    toast.success("Prescript has been amended.");
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-system text-[0.6rem] text-index-blue-dim tracking-[0.2em] mb-2">
            INSCRIPTION CHAMBER
          </p>
          <h2 className="text-display text-2xl sm:text-3xl font-bold text-ink">
            Inscribe New Prescripts
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">
            Define the tasks that the system may assign. Each inscription becomes
            a potential directive in the Prescript pool.
          </p>
        </div>

        {/* Creation form */}
        <DocumentCard
          classification="INSCRIPTION FORM"
          priority="standard"
          className="mb-8"
          delay={0.1}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Task name */}
            <div>
              <label className="text-system text-[0.6rem] text-index-blue-dim block mb-2">
                Task Designation
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Review Chapter 5 — Organic Chemistry"
                className="bg-background/50 border-index-blue/20 text-ink placeholder:text-muted-foreground/40 focus:border-index-blue/50 h-11"
                style={{ fontFamily: "var(--font-body)" }}
                required
              />
            </div>

            {/* Duration + Category row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-system text-[0.6rem] text-index-blue-dim block mb-2">
                  <Clock size={12} className="inline mr-1.5" />
                  Duration (Minutes)
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 25"
                  min={1}
                  max={480}
                  className="bg-background/50 border-index-blue/20 text-ink placeholder:text-muted-foreground/40 focus:border-index-blue/50 h-11"
                  style={{ fontFamily: "var(--font-body)" }}
                  required
                />
              </div>
              <div>
                <label className="text-system text-[0.6rem] text-index-blue-dim block mb-2">
                  <Tag size={12} className="inline mr-1.5" />
                  Subject / Category
                </label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Chemistry"
                  list="category-suggestions"
                  className="bg-background/50 border-index-blue/20 text-ink placeholder:text-muted-foreground/40 focus:border-index-blue/50 h-11"
                  style={{ fontFamily: "var(--font-body)" }}
                />
                <datalist id="category-suggestions">
                  {CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-system text-[0.6rem] text-index-blue-dim block mb-2">
                <AlertTriangle size={12} className="inline mr-1.5" />
                Weight / Difficulty
              </label>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDifficulty(opt.value)}
                    className={`
                      flex-1 py-2 text-system text-[0.6rem] border transition-all duration-200
                      ${
                        difficulty === opt.value
                          ? "border-index-blue/50 bg-index-blue/10 text-index-blue"
                          : "border-border bg-background/30 text-muted-foreground hover:border-index-blue/20"
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[0.6rem] text-muted-foreground/60 mt-1.5" style={{ fontFamily: "var(--font-body)", textTransform: "none", letterSpacing: "normal" }}>
                Higher difficulty increases the probability of assignment.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!name.trim() || !duration}
              className="w-full h-12 bg-index-blue/10 border border-index-blue/30 text-index-blue hover:bg-index-blue/20 text-system text-[0.7rem] tracking-[0.15em] disabled:opacity-30"
              variant="outline"
            >
              <Plus size={16} className="mr-2" />
              Inscribe Prescript
            </Button>
          </form>
        </DocumentCard>

        {/* Existing prescripts */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-system text-[0.6rem] text-index-blue-dim tracking-[0.2em]">
            PRESCRIPT POOL — {prescripts.length} INSCRIBED
          </p>
        </div>

        {prescripts.length === 0 ? (
          <DocumentCard classification="NOTICE" priority="standard" delay={0.2}>
            <p className="text-center text-muted-foreground py-8 text-sm">
              The Prescript pool is empty. Inscribe tasks above to begin.
            </p>
          </DocumentCard>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {prescripts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <div className="document-border bg-card/60 group">
                    <div className="classification-bar flex items-center justify-between">
                      <span>
                        PRESCRIPT #{String(i + 1).padStart(3, "0")} //{" "}
                        <span className={
                          p.difficulty === "critical" ? "text-seal-red-bright" :
                          p.difficulty === "high" ? "text-index-blue" :
                          "text-index-blue-dim"
                        }>
                          {(p.difficulty || "standard").toUpperCase()}
                        </span>
                      </span>
                      <span className="text-muted-foreground/60">
                        {p.duration}min
                      </span>
                    </div>

                    {editingId === p.id ? (
                      <div className="p-3 space-y-3">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="bg-background/50 border-index-blue/20 text-ink h-9 text-sm"
                          style={{ fontFamily: "var(--font-body)" }}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={editForm.duration}
                            onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                            className="bg-background/50 border-index-blue/20 text-ink h-9 text-sm w-24"
                            style={{ fontFamily: "var(--font-body)" }}
                            min={1}
                            max={480}
                          />
                          <Input
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            placeholder="Category"
                            className="bg-background/50 border-index-blue/20 text-ink h-9 text-sm flex-1"
                            style={{ fontFamily: "var(--font-body)" }}
                          />
                          <button
                            onClick={saveEdit}
                            className="px-3 h-9 border border-index-blue/30 text-index-blue hover:bg-index-blue/10 transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 h-9 border border-border text-muted-foreground hover:bg-white/5 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-display text-base font-medium text-ink truncate">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[0.65rem] text-muted-foreground flex items-center gap-1">
                              <Clock size={10} /> {p.duration} min
                            </span>
                            {p.category && (
                              <span className="text-[0.65rem] text-index-blue-dim flex items-center gap-1">
                                <Tag size={10} /> {p.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(p)}
                            className="p-2 text-muted-foreground hover:text-index-blue transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => {
                              removePrescript(p.id);
                              toast("Prescript has been expunged from the pool.");
                            }}
                            className="p-2 text-muted-foreground hover:text-seal-red-bright transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
