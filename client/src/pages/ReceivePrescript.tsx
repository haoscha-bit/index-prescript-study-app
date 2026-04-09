/**
 * ReceivePrescript.tsx — Receive a Prescript assignment
 * Design: Matches nyos.dev/prescript style.
 *   - Black background, Index logo centered at top
 *   - "- Click to Receive -" prompt in pixel font
 *   - On click: scramble animation with PrescriptRandomizer.mp3
 *   - Then: text resolves left-to-right with PrescriptMessage.mp3 (looping)
 *   - After reveal: show task details and Begin Compliance button
 */
import Layout from "@/components/Layout";
import { usePrescript } from "@/contexts/PrescriptContext";
import { useLocation } from "wouter";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ChevronRight, Clock, Tag, AlertTriangle, RefreshCw } from "lucide-react";
import { usePrescriptAudio } from "@/hooks/usePrescriptAudio";

const INDEX_LOGO_GLOW = "/assets/The_Index_Logo.webp";

const SCRAMBLE_CHARS = "0123456789!█▒░ABCDEF";
const BLOCK_CHAR = "█";
const BLOCK_CHANCE = 0.35;

function randomChar(): string {
  return Math.random() < BLOCK_CHANCE
    ? BLOCK_CHAR
    : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

export default function ReceivePrescript() {
  const { prescripts, assignPrescript, activePrescript } = usePrescript();
  const [, navigate] = useLocation();
  const { playRandomizer, stopRandomizer, playMessage, stopMessage, stopAll } = usePrescriptAudio();

  // States: idle -> scrambling -> revealing -> revealed
  const [phase, setPhase] = useState<"idle" | "scrambling" | "revealing" | "revealed">(
    activePrescript ? "revealed" : "idle"
  );
  const [assignedPrescript, setAssignedPrescript] = useState(activePrescript);
  const [displayText, setDisplayText] = useState("");
  const [rerollsUsed, setRerollsUsed] = useState(0);
  const [showDetails, setShowDetails] = useState(activePrescript ? true : false);
  const MAX_REROLLS = 1;

  const scrambleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (scrambleTimerRef.current) clearInterval(scrambleTimerRef.current);
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [stopAll]);

  const runScrambleAndReveal = useCallback((taskName: string, onComplete: () => void) => {
    const len = taskName.length;
    const FPS = 16;
    const SCRAMBLE_DURATION_MS = 1500; // Pure scramble phase
    const REVEAL_SPEED = 0.04; // Fraction of total length per frame

    // Phase 1: Pure scramble — play randomizer audio
    playRandomizer();
    setPhase("scrambling");

    scrambleTimerRef.current = setInterval(() => {
      let out = "";
      for (let i = 0; i < len; i++) {
        if (taskName[i] === " ") {
          out += " ";
        } else {
          out += randomChar();
        }
      }
      setDisplayText(out);
    }, 1000 / FPS);

    // After scramble duration, transition to reveal
    phaseTimerRef.current = setTimeout(() => {
      if (scrambleTimerRef.current) {
        clearInterval(scrambleTimerRef.current);
        scrambleTimerRef.current = null;
      }

      // Stop randomizer, start message audio
      stopRandomizer();
      playMessage();
      setPhase("revealing");

      let progress = 0;

      revealTimerRef.current = setInterval(() => {
        progress += REVEAL_SPEED * len;

        let out = "";
        for (let i = 0; i < len; i++) {
          const targetChar = taskName[i] ?? "";
          if (i < progress) {
            out += targetChar;
          } else {
            if (targetChar === " ") out += " ";
            else out += randomChar();
          }
        }
        setDisplayText(out);

        if (progress >= len) {
          setDisplayText(taskName);
          if (revealTimerRef.current) {
            clearInterval(revealTimerRef.current);
            revealTimerRef.current = null;
          }
          stopMessage();
          onComplete();
        }
      }, 1000 / FPS);
    }, SCRAMBLE_DURATION_MS);
  }, [playRandomizer, stopRandomizer, playMessage, stopMessage]);

  const handleAssign = useCallback(() => {
    if (prescripts.length === 0) {
      toast.error("No Prescripts in the pool. Inscribe tasks first.");
      return;
    }

    const result = assignPrescript();
    if (result) {
      setAssignedPrescript(result);
      setShowDetails(false);

      runScrambleAndReveal(result.name, () => {
        setPhase("revealed");
        // Show details with a slight delay after text is fully revealed
        setTimeout(() => {
          setShowDetails(true);
        }, 400);
      });
    } else {
      toast.error("Assignment failed. The system could not select a Prescript.");
    }
  }, [prescripts, assignPrescript, runScrambleAndReveal]);

  const handleReroll = useCallback(() => {
    if (rerollsUsed >= MAX_REROLLS) {
      toast.error("Reroll limit reached. You must comply.");
      return;
    }

    setRerollsUsed((prev) => prev + 1);
    setShowDetails(false);

    const result = assignPrescript();
    if (result) {
      setAssignedPrescript(result);

      runScrambleAndReveal(result.name, () => {
        setPhase("revealed");
        setTimeout(() => {
          setShowDetails(true);
          toast("Prescript has been reassigned. This is your final directive.");
        }, 400);
      });
    }
  }, [rerollsUsed, MAX_REROLLS, assignPrescript, runScrambleAndReveal]);

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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        {/* Index Logo — always visible at top */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={INDEX_LOGO_GLOW}
            alt="The Index"
            className="w-28 h-28 sm:w-36 sm:h-36 mx-auto object-contain"
            style={{ filter: "drop-shadow(0 0 20px oklch(0.68 0.16 240 / 0.4))" }}
          />
        </motion.div>

        {/* Idle state — Click to Receive */}
        {phase === "idle" && !activePrescript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <button
              onClick={handleAssign}
              disabled={prescripts.length === 0}
              className="text-pixel text-sm sm:text-base text-index-blue-bright tracking-wider hover:text-index-blue transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              - Click to Receive -
            </button>

            {prescripts.length === 0 && (
              <p className="text-[0.65rem] text-seal-red-bright mt-4 font-mono">
                No Prescripts inscribed. Visit the Inscription Chamber first.
              </p>
            )}

            {prescripts.length > 0 && (
              <p className="text-[0.55rem] text-muted-foreground/40 mt-4 font-mono tracking-wider">
                {prescripts.length} TASK{prescripts.length !== 1 ? "S" : ""} IN POOL
              </p>
            )}
          </motion.div>
        )}

        {/* Scrambling / Revealing / Revealed — show the text */}
        {(phase === "scrambling" || phase === "revealing" || phase === "revealed") && (
          <div className="text-center max-w-2xl w-full">
            {/* The scramble/reveal text in Press Start 2P */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="min-h-[3rem] flex items-center justify-center"
            >
              <p className="text-pixel text-sm sm:text-base md:text-lg text-index-blue-bright blue-glow leading-relaxed break-words">
                {displayText || assignedPrescript?.name || ""}
              </p>
            </motion.div>

            {/* Task details — fade in after reveal completes */}
            <AnimatePresence>
              {showDetails && assignedPrescript && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-10"
                >
                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
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
                      <span className="text-index-blue">
                        {assignedPrescript.duration} MIN
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleBeginSession}
                      className="flex items-center gap-3 px-8 py-4 bg-index-blue/10 border border-index-blue/40 text-index-blue text-system text-[0.7rem] tracking-[0.15em] hover:bg-index-blue/20 transition-all duration-300"
                    >
                      Begin Compliance
                      <ChevronRight size={16} />
                    </button>

                    {rerollsUsed < MAX_REROLLS && prescripts.length > 1 && (
                      <button
                        onClick={handleReroll}
                        className="flex items-center gap-2 px-4 py-4 border border-border text-muted-foreground text-system text-[0.6rem] hover:border-index-blue/20 hover:text-index-blue-dim transition-all duration-200"
                      >
                        <RefreshCw size={14} />
                        Reroll ({MAX_REROLLS - rerollsUsed} remaining)
                      </button>
                    )}
                  </div>

                  {/* Warning */}
                  <p className="text-[0.5rem] text-muted-foreground/40 mt-8 tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
                    CANCELLATION OF AN ACTIVE SESSION WILL BE RECORDED AS DEVIATION.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
