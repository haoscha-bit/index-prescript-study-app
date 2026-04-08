/**
 * Layout.tsx — The Index: Prescript System
 * Design: Dark with Index blue accents, clean and simple
 */
import { useLocation, Link } from "wouter";
import { usePrescript } from "@/contexts/PrescriptContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText,
  FilePlus,
  Timer,
  BarChart3,
  Archive,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const INDEX_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663528861189/RhtPG9LggTLTG7ANMWXNdF/index-logo_daddf937.png";

const NAV_ITEMS = [
  { path: "/", label: "Sanctum", icon: ScrollText, description: "Main Chamber" },
  { path: "/create", label: "Inscribe", icon: FilePlus, description: "Create Prescripts" },
  { path: "/receive", label: "Receive", icon: Timer, description: "Receive Prescript" },
  { path: "/dashboard", label: "Registry", icon: BarChart3, description: "Compliance Record" },
  { path: "/history", label: "Archives", icon: Archive, description: "Session Archives" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { rank, streak } = usePrescript();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-surface-darker/95 backdrop-blur-md border-b border-index-blue/20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 text-index-blue"
          >
            <img src={INDEX_LOGO} alt="The Index" className="w-5 h-5 object-contain" />
            <span className="text-system text-[0.65rem]">The Index</span>
          </button>
          <div className="text-system text-[0.6rem] text-muted-foreground">
            {rank}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64
          bg-surface-darker/95 backdrop-blur-md
          border-r border-index-blue/10
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ backgroundColor: "oklch(0.10 0.012 250 / 0.97)" }}
      >
        {/* Sidebar header with logo */}
        <div className="p-5 border-b border-index-blue/10">
          <div className="flex items-center gap-3">
            <img src={INDEX_LOGO} alt="The Index" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-display text-lg font-semibold text-index-blue blue-glow tracking-wide">
                The Index
              </h1>
              <p className="text-system text-[0.55rem] text-index-blue-dim mt-0.5">
                Prescript System
              </p>
            </div>
          </div>
        </div>

        {/* Rank display */}
        <div className="px-5 py-3 border-b border-index-blue/10">
          <div className="text-system text-[0.55rem] text-muted-foreground mb-1">
            Current Rank
          </div>
          <div className="text-display text-sm font-medium text-ink">
            {rank}
          </div>
          {streak > 0 && (
            <div className="text-system text-[0.55rem] text-index-blue mt-1">
              {streak} day streak
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 mb-1 transition-all duration-200
                    ${
                      isActive
                        ? "bg-index-blue/10 border-l-2 border-index-blue text-index-blue"
                        : "border-l-2 border-transparent text-muted-foreground hover:text-ink hover:bg-white/[0.03]"
                    }
                  `}
                >
                  <Icon size={16} className={isActive ? "text-index-blue" : "text-muted-foreground group-hover:text-index-blue-dim"} />
                  <div className="flex-1">
                    <div className="text-system text-[0.65rem]">{item.label}</div>
                    <div className="text-[0.55rem] text-muted-foreground font-normal" style={{ fontFamily: "var(--font-body)", textTransform: "none", letterSpacing: "normal" }}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && <ChevronRight size={12} className="text-index-blue/50" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-index-blue/10">
          <p className="text-[0.55rem] text-muted-foreground/50 text-center" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
            THE PRESCRIPT ALWAYS GUIDES
          </p>
          <p className="text-[0.5rem] text-muted-foreground/30 text-center mt-1" style={{ fontFamily: "var(--font-mono)" }}>
            US TO THE RIGHTEOUS PATH
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen relative z-10 lg:ml-0 pt-14 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
