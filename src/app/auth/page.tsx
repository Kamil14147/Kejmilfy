"use client";

import * as React from "react";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleField } from "@/components/ParticleField";
import { toast } from "sonner";

export default function AuthPage() {
  return (
    <React.Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </React.Suspense>
  );
}

function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
    </div>
  );
}

function AuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = React.useState<"login" | "register">(
    params.get("mode") === "register" ? "register" : "login"
  );
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [dbReady, setDbReady] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    fetch("/api/setup-check")
      .then((r) => r.json())
      .then((d) => setDbReady(!!d.ready))
      .catch(() => setDbReady(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const ok = await register(name, email, password);
        if (!ok) {
          toast.error("Rejestracja nieudana — email już istnieje");
          setLoading(false);
          return;
        }
        toast.success("Konto utworzone!");
      } else {
        const ok = await login(email, password);
        if (!ok) {
          toast.error("Nieprawidłowy email lub hasło");
          setLoading(false);
          return;
        }
        toast.success("Zalogowano!");
      }
      // Hard redirect — ensures middleware sees the new session cookie
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 300);
    } catch (e) {
      console.error(e);
      toast.error("Coś poszło nie tak");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }}
          animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>
      <ParticleField count={30} colors={["#6366f1", "#8b5cf6", "#ec4899"]} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 text-sm">
          <ArrowLeft className="h-4 w-4" /> Wróć na stronę główną
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
          {/* DB not ready banner */}
          {dbReady === false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2"
            >
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-100/80">
                <div className="font-semibold mb-0.5">Baza danych nie jest skonfigurowana</div>
                Aby się zalogować, utwórz tabele w Supabase.{" "}
                <Link href="/setup" className="underline hover:text-amber-100">
                  Przejdź do setupu →
                </Link>
              </div>
            </motion.div>
          )}

          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30 mb-4"
            >
              C
            </motion.div>
            <h1 className="text-2xl font-bold">
              {mode === "login" ? "Witaj ponownie" : "Załóż konto"}
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {mode === "login"
                ? "Zaloguj się, aby kontynuować tworzenie"
                : "Zacznij projektować za darmo"}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Label className="text-xs text-white/60">Imię</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jan Kowalski"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-400"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label className="text-xs text-white/60">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jan@example.com"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-400"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-white/60">Hasło</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 znaków"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-400"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-0 py-6 group"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {mode === "login" ? "Zaloguj się" : "Utwórz konto"}
              {!loading && (
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white/50">
            {mode === "login" ? "Nie masz konta? " : "Masz już konto? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {mode === "login" ? "Zarejestruj się" : "Zaloguj się"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-[10px] text-white/30">
          Kontynuując, akceptujesz Regulamin i Politykę Prywatności.
        </div>
      </motion.div>
    </div>
  );
}
