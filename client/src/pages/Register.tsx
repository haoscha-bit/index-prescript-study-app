import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";

const INDEX_LOGO = "/assets/The_Index_Logo.webp";

export default function Register() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = trpc.auth.register.useMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await registerMutation.mutateAsync({ email, password, name: name || undefined });
      // Redirect to home on success
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="document-border bg-card/80 max-w-md w-full"
      >
        <div className="classification-bar">
          REGISTRATION // <span className="text-index-blue">NEW ACCOUNT</span>
        </div>
        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={INDEX_LOGO}
              alt="The Index"
              className="w-20 h-20 object-contain"
              style={{ filter: "drop-shadow(0 0 15px oklch(0.68 0.16 240 / 0.3))" }}
            />
          </div>

          <h1 className="text-display text-2xl font-bold text-ink text-center mb-2">
            The Index
          </h1>
          <p className="text-system text-[0.6rem] text-index-blue text-center tracking-[0.2em] mb-6">
            JOIN THE SYSTEM
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-seal-red/10 border border-seal-red-bright/30 text-seal-red-bright text-sm rounded">
                {error}
              </div>
            )}

            <div>
              <label className="text-system text-[0.65rem] text-muted-foreground tracking-[0.1em] block mb-2">
                NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 bg-background border border-index-blue/20 text-ink placeholder-muted-foreground focus:outline-none focus:border-index-blue/50 transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-system text-[0.65rem] text-muted-foreground tracking-[0.1em] block mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 bg-background border border-index-blue/20 text-ink placeholder-muted-foreground focus:outline-none focus:border-index-blue/50 transition-colors"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="text-system text-[0.65rem] text-muted-foreground tracking-[0.1em] block mb-2">
                PASSWORD (MIN 6 CHARACTERS)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-background border border-index-blue/20 text-ink placeholder-muted-foreground focus:outline-none focus:border-index-blue/50 transition-colors"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-3 bg-index-blue/10 border border-index-blue/30 text-index-blue text-system text-[0.65rem] tracking-[0.15em] hover:bg-index-blue/20 disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? "REGISTERING..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Already have an account?
            </p>
            <button
              onClick={() => setLocation("/login")}
              className="text-index-blue text-system text-[0.65rem] tracking-[0.1em] hover:text-index-blue/80 transition-colors"
            >
              SIGN IN
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
