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
  Pencil,
  Check,
  X,
} from "lucide-react";

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
  const { prescripts, addPrescript, removePrescript } = usePrescript();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; duration: string; category: string }>({
    name: "",
    duration: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !duration) return;

    const dur = parseInt(duration);
    if (isNaN(dur) || dur <= 0 || dur > 480) {
      toast.error("Duration must be between 1 and 480 minutes.");
      return;
    }

    try {
      await addPrescript({
        name: name.trim(),
        duration: dur,
        category: category.trim() || null,
      });

      toast.success("Prescript has been inscribed into the pool.");
      setName("");
      setDuration("");
      setCategory("");
    } catch (err) {
      toast.error("Failed to inscribe prescript.");
    }
  };

  const startEdit = (p: Prescript) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      duration: p.duration.toString(),
      category: p.category || "",
    });
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.name.trim() || !editForm.duration) return;
    const dur = parseInt(editForm.duration);
    if (isNaN(dur) || dur <= 0) return;
    
    // For now, just delete and re-add since we don't have an edit endpoint
    try {
      await removePrescript(editingId);
      await addPrescript({
        name: editForm.name.trim(),
        duration: dur,
        category: editForm.category.trim() || null,
      });
      setEditingId(null);
      toast.success("Prescript has been amended.");
    } catch (err) {
      toast.error("Failed to update prescript.");
    }
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-system text-[0.6rem] text-index-blue-dim mb-2 tracking-[0.2em]">
            INSCRIBE // TASK POOL MANAGEMENT
          </p>
          <h1 className="text-display text-3xl font-bold text-ink">
            Inscribe Prescripts
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">
            Add tasks to your Prescript pool. These will become potential assignments
            when you request a new directive from the system.
          </p>
        </div>

        {/* Form */}
        <DocumentCard classification="INSCRIPTION FORM" priority="standard" className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-system text-[0.65rem] text-muted-foreground tracking-[0.1em] block mb-2">
                TASK NAME
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Review Chapter 5 — Organic Chemistry"
                className="bg-background/50 border-index-blue/20 text-ink h-10"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-system text-[0.65rem] text-muted-foreground tracking-[0.1em] block mb-2">
                  DURATION (MINUTES)
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="480"
                  className="bg-background/50 border-index-blue/20 text-ink h-10"
                />
              </div>
              <div>
                <label className="text-system text-[0.65rem] text-muted-foreground tracking-[0.1em] block mb-2">
                  CATEGORY (OPTIONAL)
                </label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Chemistry"
                  className="bg-background/50 border-index-blue/20 text-ink h-10"
                  list="categories"
                />
                <datalist id="categories">
                  {CATEGORY_SUGGESTIONS.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 px-4 py-3 bg-index-blue/10 border border-index-blue/30 text-index-blue text-system text-[0.65rem] tracking-[0.15em] hover:bg-index-blue/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              INSCRIBE PRESCRIPT
            </button>
          </form>
        </DocumentCard>

        {/* Prescript List */}
        <div>
          <p className="text-system text-[0.6rem] text-index-blue-dim mb-4 tracking-[0.2em]">
            ACTIVE PRESCRIPTS // {prescripts.length} IN POOL
          </p>

          {prescripts.length === 0 ? (
            <DocumentCard classification="STATUS" priority="elevated">
              <div className="text-center py-8">
                <p className="text-display text-lg font-semibold text-ink mb-2">
                  No Prescripts Inscribed
                </p>
                <p className="text-sm text-muted-foreground">
                  Add your first task to begin building your Prescript pool.
                </p>
              </div>
            </DocumentCard>
          ) : (
            <AnimatePresence>
              {prescripts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -12, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <div className="document-border bg-card/60 group mb-3">
                    <div className="classification-bar flex items-center justify-between">
                      <span>
                        PRESCRIPT #{String(i + 1).padStart(3, "0")} // {p.category || "UNCATEGORIZED"}
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
                            className="bg-background/50 border-index-blue/20 text-ink h-9 text-sm flex-1"
                            min="1"
                            max="480"
                          />
                          <Input
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="bg-background/50 border-index-blue/20 text-ink h-9 text-sm flex-1"
                            placeholder="Category"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex-1 px-3 py-2 bg-index-blue/10 border border-index-blue/30 text-index-blue text-system text-[0.6rem] hover:bg-index-blue/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <Check size={12} />
                            SAVE
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 px-3 py-2 bg-seal-red/10 border border-seal-red-bright/30 text-seal-red-bright text-system text-[0.6rem] hover:bg-seal-red/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <X size={12} />
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 flex items-center justify-between group-hover:bg-index-blue/5 transition-colors">
                        <div>
                          <p className="text-display text-base font-semibold text-ink">{p.name}</p>
                          <div className="flex items-center gap-3 mt-2 text-[0.75rem]">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock size={12} />
                              <span>{p.duration} min</span>
                            </div>
                            {p.category && (
                              <div className="flex items-center gap-1 text-index-blue-dim">
                                <Tag size={12} />
                                <span>{p.category}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(p)}
                            className="p-2 hover:bg-index-blue/10 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} className="text-index-blue" />
                          </button>
                          <button
                            onClick={() => removePrescript(p.id)}
                            className="p-2 hover:bg-seal-red/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-seal-red-bright" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </Layout>
  );
}
