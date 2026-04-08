/**
 * ReceivePrescript.tsx — Receive a Prescript assignment
 * Design: Clean, dramatic reveal with Index blue accents. Press Start 2P for prescript text.
 */
import Layout from "@/components/Layout";
import DocumentCard from "@/components/DocumentCard";
import { usePrescript } from "@/contexts/PrescriptContext";
import { useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ScrollText, ChevronRight, Clock, Tag, AlertTriangle, RefreshCw } from "lucide-react";

const INDEX_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663528861189/RhtPG9LggTLTG7ANMWXNdF/index-logo_daddf937.png";

export default function ReceivePrescript() {
  const { prescripts, assignPrescript, activePrescript } = usePrescript();
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<"idle" | "assigning" | "revealed">(
    activePrescript ? "revealed" : "idle"
  );
  const [assignedPrescript, setAssignedPrescript] = useState(activePrescript);
  const [rerollsUsed, setRerollsUsed] = useState(0);
  const MAX_REROLLS = 1;

  const handleAssign = () => {
    if (prescripts.length === 0) {
      toast.error("No Prescripts in the pool. Inscribe tasks first.");
      return;
    }

    setPhase("assigning");

    setTimeout(() => {
      const result = assignPrescript();
      if (result) {
        setAssignedPrescript(result);
        setPhase("revealed");
        setRerollsUsed(0);
      } else {
        setPhase("idle");
        toast.error("Assignment failed. The system could not select a Prescript.");
      }
    }, 1800);
  };

  const handleReroll = () => {
    if (rerollsUsed >= MAX_REROLLS) {
      toast.error("Reroll limit reached. You must comply.");
      return;
    }

    setPhase("assigning");
    setRerollsUsed((prev) => prev + 1);

    setTimeout(() => {
      const result = assignPrescript();
      if (result) {
        setAssignedPrescript(result);
        setPhase("revealed");
        toast("Prescript has been reassigned. This is your final directive.");
      }
    }, 1200);
  };

  const handleBeginSession = () => {
    navigate("/focus");
  };

  const difficultyColor = (d?: string) => {
    switch (d) {
      case "critical": return "text-seal-red-bright";
      case "high": return "text-index-blue";
      case "low": return "text-muted-foreground";
      default: return "text-index-blue-dim";
    }
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-system text-[0.6rem] text-index-blue-dim tracking-[0.2em] mb-2">
            ASSIGNMENT CHAMBER
          </p>
          <h2 className="text-display text-2xl sm:text-3xl font-bold text-ink">
            Receive Your Prescript
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            The system will select a directive from the pool. You are required to comply.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Idle state — waiting to assign */}
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DocumentCard
                classification="SEALED DIRECTIVE"
                priority="standard"
                className="text-center"
              >
                <div className="py-12 sm:py-16">
                  {/* Index logo */}
                  <motion.div
                    className="w-24 h-24 mx-auto mb-8"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img
                      src={INDEX_LOGO}
                      alt="The Index"
                      className="w-full h-full object-contain"
                      style={{ filter: "drop-shadow(0 0 15px oklch(0.68 0.16 240 / 0.3))" }}
                    />
                  </motion.div>

                  <p className="text-display text-xl font-semibold text-ink mb-2">
                    A Prescript Awaits
                  </p>
                  <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
                    {prescripts.length} task{prescripts.length !== 1 ? "s" : ""} in the pool.
                    The system will determine your assignment.
                  </p>

                  <button
                    onClick={handleAssign}
                    disabled={prescripts.length === 0}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-index-blue/10 border border-index-blue/30 text-index-blue text-system text-[0.75rem] tracking-[0.15em] hover:bg-index-blue/20 transition-all duration-300 animate-pulse-blue disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ScrollText size={18} />
                    Break the Seal
                  </button>

                  {prescripts.length === 0 && (
                    <p className="text-[0.65rem] text-seal-red-bright mt-4">
                      No Prescripts inscribed. Visit the Inscription Chamber first.
                    </p>
                  )}
                </div>
              </DocumentCard>
            </motion.div>
          )}

          {/* Assigning state — pendulum animation */}
          {phase === "assigning" && (
            <motion.div
              key="assigning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DocumentCard
                classification="PROCESSING"
                priority="elevated"
                className="text-center"
                animate={false}
              >
                <div className="py-16 sm:py-24">
                  {/* Pendulum animation */}
                  <div className="relative w-32 h-40 mx-auto mb-8">
                    <div className="absolute top-0 left-1/2 w-px h-2 bg-index-blue/30 -translate-x-1/2" />
                    <motion.div
                      className="absolute top-2 left-1/2 -translate-x-1/2 origin-top"
                      animate={{ rotate: [-25, 25, -25] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-px h-28 bg-gradient-to-b from-index-blue/60 to-index-blue/20" />
                      <div className="w-5 h-5 bg-index-blue/30 border border-index-blue/50 -translate-x-[9px] rotate-45" />
                    </motion.div>
                  </div>

                  <motion.p
                    className="text-system text-[0.7rem] text-index-blue tracking-[0.2em]"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    THE PENDULUM SWINGS...
                  </motion.p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The system is determining your directive.
                  </p>
                </div>
              </DocumentCard>
            </motion.div>
          )}

          {/* Revealed state — assigned prescript with Press Start 2P */}
          {phase === "revealed" && assignedPrescript && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DocumentCard
                classification="ISSUED PRESCRIPT"
                priority={assignedPrescript.difficulty === "critical" ? "critical" : assignedPrescript.difficulty === "high" ? "elevated" : "standard"}
                animate={false}
              >
                <div className="relative">
                  {/* Index logo watermark */}
                  <motion.div
                    className="absolute top-2 right-2 w-20 h-20 opacity-10 pointer-events-none"
                    initial={{ scale: 3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <img
                      src={INDEX_LOGO}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </motion.div>

                  <div className="py-8 sm:py-12 px-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-system text-[0.6rem] text-index-blue-dim tracking-[0.25em] mb-4">
                        A PRESCRIPT HAS BEEN ISSUED
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    >
                      <p className="text-system text-[0.55rem] text-muted-foreground mb-3">
                        YOU ARE REQUIRED TO COMPLETE THE FOLLOWING TASK:
                      </p>
                      {/* Press Start 2P for the prescript name */}
                      <h3
                        className="text-pixel text-base sm:text-lg text-index-blue-bright blue-glow leading-relaxed mb-6"
                      >
                        {assignedPrescript.name}
                      </h3>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex flex-wrap gap-4 mb-8"
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={14} className="text-index-blue-dim" />
                        <span>{assignedPrescript.duration} minutes</span>
                      </div>
                      {assignedPrescript.category && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Tag size={14} className="text-index-blue-dim" />
                          <span>{assignedPrescript.category}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle size={14} className={difficultyColor(assignedPrescript.difficulty)} />
                        <span className={difficultyColor(assignedPrescript.difficulty)}>
                          {(assignedPrescript.difficulty || "standard").toUpperCase()}
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 }}
                      className="flex flex-col sm:flex-row gap-3"
                    >
                      <button
                        onClick={handleBeginSession}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-index-blue/10 border border-index-blue/40 text-index-blue text-system text-[0.7rem] tracking-[0.15em] hover:bg-index-blue/20 transition-all duration-300"
                      >
                        Begin Compliance
                        <ChevronRight size={16} />
                      </button>

                      {rerollsUsed < MAX_REROLLS && prescripts.length > 1 && (
                        <button
                          onClick={handleReroll}
                          className="flex items-center justify-center gap-2 px-4 py-4 border border-border text-muted-foreground text-system text-[0.6rem] hover:border-index-blue/20 hover:text-index-blue-dim transition-all duration-200"
                        >
                          <RefreshCw size={14} />
                          Reroll ({MAX_REROLLS - rerollsUsed} remaining)
                        </button>
                      )}
                    </motion.div>
                  </div>
                </div>
              </DocumentCard>

              {/* Warning notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="mt-4 text-center"
              >
                <p className="text-[0.6rem] text-muted-foreground/50" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
                  CANCELLATION OF AN ACTIVE SESSION WILL BE RECORDED AS DEVIATION.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
