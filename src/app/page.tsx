"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import {
  Sparkles,
  Type,
  Image as ImageIcon,
  Shapes,
  Layers,
  Download,
  Share2,
  Users,
  Zap,
  Wand2,
  ArrowRight,
  Check,
  Palette,
  MousePointerClick,
  ChevronDown,
} from "lucide-react";
import { ParticleField } from "@/components/ParticleField";
import { Button } from "@/components/ui/button";
import { useSession, login, register, logout } from "@/lib/use-session";

export default function LandingPage() {
  const { user: session } = useSession();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a14] text-white overflow-x-clip relative">
      {/* Animated gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }}
          animate={{ x: [0, -80, 0], y: [0, 80, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[700px] h-[700px] rounded-full blur-[140px] opacity-20"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
          animate={{ x: [0, 60, 0], y: [0, -60, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/5"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"
            >
              k
            </motion.div>
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              kejmilfy
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Funkcje</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Jak działa</a>
            <a href="#templates" className="hover:text-white transition-colors">Szablony</a>
          </div>
          <div className="flex items-center gap-2">
            {session ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-0">
                  Mój dashboard <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Zaloguj
                  </Button>
                </Link>
                <Link href="/auth?mode=register">
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-0">
                    Zacznij za darmo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        <ParticleField count={50} colors={["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b"]} />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs text-white/80 mb-8"
          >
            <Sparkles className="h-3 w-3 text-yellow-400" />
            Nowy: Współpraca na żywo z Supabase Realtime
            <ArrowRight className="h-3 w-3" />
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6"
          >
            Twórz projekt,
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                nie ograniczenia
              </span>
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 1.5 }}
              >
                <motion.path
                  d="M2 8C50 4 100 4 150 6C200 8 250 8 298 4"
                  stroke="url(#grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10"
          >
            Pełnowartościowy edytor graficzny w przeglądarce. Posty, prezentacje, plakaty,
            dokumenty — wszystko w jednym miejscu, zbudowane w najnowocześniejszym stacku.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Link href={session ? "/dashboard" : "/auth?mode=register"}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-0 text-base px-8 py-6 group"
              >
                {session ? "Otwórz dashboard" : "Zacznij za darmo"}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 backdrop-blur text-white hover:bg-white/10 text-base px-8 py-6 group"
              >
                Zobacz jak działa
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-2"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex items-center justify-center gap-8 text-xs text-white/40"
          >
            <div className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-green-400" /> Bez karty kredytowej
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-green-400" /> Działa w przeglądarce
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-green-400" /> Eksport bez znaków wodnych
            </div>
          </motion.div>

          {/* Floating preview cards */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-full max-w-5xl hidden lg:block"
          >
            <div className="relative">
              <FloatingCard
                className="absolute -left-12 top-8 w-56 rotate-[-8deg]"
                gradient="from-orange-400 to-red-500"
                label="Post Instagram"
              />
              <FloatingCard
                className="absolute left-1/2 -translate-x-1/2 top-0 w-72 z-10"
                gradient="from-indigo-500 to-purple-600"
                label="Prezentacja"
                big
              />
              <FloatingCard
                className="absolute -right-12 top-12 w-56 rotate-[8deg]"
                gradient="from-emerald-400 to-teal-500"
                label="Plakat A3"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats bar */}
      <section className="relative z-10 py-20 border-y border-white/5 bg-black/30 backdrop-blur">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "15+", label: "Formatów gotowych" },
            { value: "120+", label: "Ikonek" },
            { value: "6", label: "Szablonów premium" },
            { value: "∞", label: "Projektów" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== NEW: How it works — sticky scroll animated editor demo ====== */}
      <HowItWorksSection />

      {/* Features */}
      <section id="features" className="relative z-10 py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 mb-4">
              <Zap className="h-3 w-3" /> Pełna moc edytora
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Wszystko, czego potrzebujesz
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Od prostego posta po złożoną prezentację — narzędzia są projektowane, by przyspieszyć Twoją pracę.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Type}
              title="Zaawansowany tekst"
              desc="Fonty, wagi, cienie, kontury, wyrównanie, interlinia, odstępy. Pełna kontrola typografii."
              gradient="from-indigo-500 to-purple-600"
              delay={0}
            />
            <FeatureCard
              icon={Shapes}
              title="Kształty i ikony"
              desc="6 kształtów bazowych, 120+ ikon Lucide, wielokąty z regulowaną liczbą boków, strzałki."
              gradient="from-pink-500 to-rose-600"
              delay={0.1}
            />
            <FeatureCard
              icon={ImageIcon}
              title="Obrazy i filtry"
              desc="Upload własnych plików, biblioteka stockowych zdjęć, 7 filtrów (jasność, kontrast, sepia, blur)."
              gradient="from-emerald-500 to-teal-600"
              delay={0.2}
            />
            <FeatureCard
              icon={Layers}
              title="Warstwy i grupy"
              desc="Lock, hide, group, multi-select, wyrównywanie, równomierne rozłożenie, z-order."
              gradient="from-amber-500 to-orange-600"
              delay={0.3}
            />
            <FeatureCard
              icon={Wand2}
              title="Magic Resize"
              desc="Zmień format projektu bez utraty układu. Skaluje proporcjonalnie każdy element."
              gradient="from-cyan-500 to-blue-600"
              delay={0.4}
            />
            <FeatureCard
              icon={Download}
              title="Eksport wszystkiego"
              desc="PNG, JPG, SVG, PDF (wszystkie strony), przezroczyste tła, HD @2x. Bez znaków wodnych."
              gradient="from-violet-500 to-fuchsia-600"
              delay={0.5}
            />
            <FeatureCard
              icon={Share2}
              title="Udostępnianie"
              desc="Link z uprawnieniami (podgląd/komentarz/edycja), kod QR do telefonu, panel aktywności."
              gradient="from-red-500 to-pink-600"
              delay={0.6}
            />
            <FeatureCard
              icon={Users}
              title="Współpraca"
              desc="Komentarze przypięte do elementów, odpowiedzi, resolve, feed aktywności w czasie rzeczywistym."
              gradient="from-teal-500 to-emerald-600"
              delay={0.7}
            />
            <FeatureCard
              icon={Palette}
              title="Brand Kit"
              desc="Zapisz kolory marki i fonty. Stosuj jednym kliknięciem do dowolnego elementu."
              gradient="from-yellow-500 to-amber-600"
              delay={0.8}
            />
          </div>
        </div>
      </section>

      {/* Templates preview */}
      <section id="templates" className="relative z-10 py-32 bg-black/30 backdrop-blur border-y border-white/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 mb-4">
              <Sparkles className="h-3 w-3" /> Gotowe starty
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Zaczynaj od szablonu
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Post IG", gradient: "from-orange-400 to-red-500" },
              { name: "Story", gradient: "from-pink-500 to-purple-600" },
              { name: "Prezentacja", gradient: "from-indigo-500 to-blue-600" },
              { name: "Plakat A3", gradient: "from-emerald-400 to-teal-500" },
              { name: "Wizytówka", gradient: "from-amber-400 to-orange-500" },
              { name: "Dokument", gradient: "from-slate-400 to-slate-600" },
            ].map((tpl, i) => (
              <motion.div
                key={tpl.name}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${tpl.gradient} shadow-2xl cursor-pointer relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-4">
                  <div className="text-white">
                    <div className="font-bold text-sm">{tpl.name}</div>
                    <div className="text-xs opacity-70">kejmilfy</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/10 p-12 md:p-20 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
            <ParticleField count={20} colors={["#6366f1", "#ec4899"]} />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                Zacznij tworzyć
                <br />
                <span className="bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent">
                  już teraz
                </span>
              </h2>
              <p className="text-white/60 max-w-xl mx-auto mb-8">
                Dołącz do twórców, którzy już projektują w kejmilfy. Bezpłatne konto, pełne funkcje.
              </p>
              <Link href={session ? "/dashboard" : "/auth?mode=register"}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-0 text-base px-10 py-7 group"
                >
                  {session ? "Otwórz dashboard" : "Załóż konto"}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 bg-black/50 backdrop-blur">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              k
            </div>
            <span className="font-semibold">kejmilfy</span>
            <span className="text-xs text-white/40 ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/50">
            <a href="#" className="hover:text-white">Regulamin</a>
            <a href="#" className="hover:text-white">Prywatność</a>
            <a href="#" className="hover:text-white">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============= How It Works — sticky scroll animated editor demo =============
const STEPS = [
  {
    n: "01",
    title: "Wybierz format",
    desc: "Instagram, Facebook, prezentacja, plakat A3, wizytówka albo własny rozmiar. Twój projekt startuje z właściwymi proporcjami.",
    badge: "Start",
  },
  {
    n: "02",
    title: "Dodaj elementy",
    desc: "Przeciągnij tekst, kształt, ikonę lub zdjęcie z lewego panelu. Każdy element można przesuwać, skalować, obracać.",
    badge: "Elementy",
  },
  {
    n: "03",
    title: "Edytuj treść",
    desc: "Kliknij dwukrotnie w tekst, aby edytować inline. Zmień font, kolor, wagę, cień, kontur — wszystko w prawym panelu.",
    badge: "Edycja",
  },
  {
    n: "04",
    title: "Zmień kolory i tło",
    desc: "Gradient, solid, wzór albo zdjęcie jako tło. Każdy element dostaje własny kolor, cień, obramowanie.",
    badge: "Styl",
  },
  {
    n: "05",
    title: "Eksportuj i udostępnij",
    desc: "PNG, JPG, SVG, PDF — w pełnej rozdzielczości, bez znaków wodnych. Wyślij link z kodem QR do telefonu.",
    badge: "Eksport",
  },
];

function HowItWorksSection() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Smooth the scroll progress for buttery animations
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  // Each step gets a slice of the scroll progress
  const stepIndex = useTransform(smoothProgress, (v) => {
    const i = Math.min(STEPS.length - 1, Math.floor(v * STEPS.length));
    return i;
  });

  return (
    <section id="how-it-works" ref={sectionRef} className="relative z-10" style={{ height: `${STEPS.length * 100}vh` }}>
      {/* Sticky wrapper — exactly one viewport tall, centered content stays centered the whole time */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Section heading (absolute, top) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs text-pink-300 mb-2">
            <MousePointerClick className="h-3 w-3" /> Zobacz na żywo
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Tak działa kejmilfy
          </h2>
        </motion.div>

        {/* Main two-column grid — fits inside viewport */}
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full max-w-7xl">
          {/* Left: text step (changes with scroll) */}
          <div className="relative h-[50vh] lg:h-[60vh] flex items-center justify-center lg:justify-start">
            <div className="space-y-6 w-full max-w-md">
              {STEPS.map((step, i) => (
                <StepText
                  key={step.n}
                  step={step}
                  index={i}
                  stepIndex={stepIndex}
                />
              ))}
            </div>
          </div>

          {/* Right: animated editor mockup */}
          <div className="relative h-[50vh] lg:h-[60vh] flex items-center justify-center">
            <EditorMockup scrollYProgress={smoothProgress} />
          </div>
        </div>

        {/* Scroll progress dots (right side) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-30">
          {STEPS.map((s, i) => (
            <ProgressDot key={s.n} index={i} stepIndex={stepIndex} label={s.n} />
          ))}
        </div>

        {/* Scroll hint (bottom) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-xs flex flex-col items-center gap-1"
        >
          <span>Przewiń, aby zobaczyć kolejny krok</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StepText({
  step,
  index,
  stepIndex,
}: {
  step: typeof STEPS[number];
  index: number;
  stepIndex: MotionValue<number>;
}) {
  // Each step text fades in only when its index is active (no overlap)
  const opacity = useTransform(stepIndex, (i) => {
    const distance = Math.abs(i - index);
    if (distance === 0) return 1;
    if (distance < 0.5) return 1; // small safety margin
    if (distance < 1) return (1 - distance) * 2; // quick fade at edges only
    return 0; // hidden for any other step
  });
  const y = useTransform(stepIndex, (i) => {
    const distance = i - index;
    // Only shift slightly so adjacent doesn't overlap visually
    return distance * 20;
  });
  const scale = useTransform(stepIndex, (i) => {
    const distance = Math.abs(i - index);
    if (distance === 0) return 1;
    if (distance < 1) return 0.98;
    return 0.95;
  });
  const visibility = useTransform(opacity, (o) => (o > 0.01 ? "visible" : "hidden"));

  return (
    <motion.div
      style={{ opacity, y, scale, visibility }}
      className="absolute top-0 left-0 right-0"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="text-6xl font-black bg-gradient-to-br from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          {step.n}
        </div>
        <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 uppercase tracking-wider">
          {step.badge}
        </div>
      </div>
      <h3 className="text-3xl md:text-4xl font-bold mb-3">{step.title}</h3>
      <p className="text-white/60 text-lg leading-relaxed max-w-md">{step.desc}</p>
    </motion.div>
  );
}

function ProgressDot({
  index,
  stepIndex,
  label,
}: {
  index: number;
  stepIndex: MotionValue<number>;
  label: string;
}) {
  const scale = useTransform(stepIndex, (i) => (i === index ? 1.5 : 1));
  const opacity = useTransform(stepIndex, (i) => (i === index ? 1 : 0.3));
  return (
    <motion.div className="flex items-center gap-2" style={{ opacity }}>
      <motion.div
        style={{ scale }}
        className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400"
      />
      <span className="text-[10px] text-white/40 font-mono">{label}</span>
    </motion.div>
  );
}

// ============= Editor Mockup — animated based on scroll =============
function EditorMockup({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  // Sidebar slide-in: 0 → 0.2 of scroll
  const sidebarX = useTransform(scrollYProgress, [0, 0.15, 0.2], [-300, -300, 0]);
  const sidebarOpacity = useTransform(scrollYProgress, [0.15, 0.2], [0, 1]);

  // Text element appears: 0.2 → 0.4
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
  const textScale = useTransform(scrollYProgress, [0.2, 0.3], [0.6, 1]);
  const textY = useTransform(scrollYProgress, [0.2, 0.3], [40, 0]);

  // Shape element appears: 0.3 → 0.5
  const shapeOpacity = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
  const shapeScale = useTransform(scrollYProgress, [0.3, 0.4], [0.4, 1]);
  const shapeRotate = useTransform(scrollYProgress, [0.3, 0.4], [-30, 0]);

  // Right panel appears (when element selected): 0.4 → 0.6
  const rightPanelX = useTransform(scrollYProgress, [0.4, 0.5], [300, 0]);
  const rightPanelOpacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);

  // Color changes: 0.5 → 0.7
  const textColor = useTransform(
    scrollYProgress,
    [0.5, 0.6, 0.7],
    ["#0f172a", "#0f172a", "#6366f1"]
  );
  // Background: solid white → solid amber → solid orange (crossfade via opacity layers below)
  const bgWhiteOpacity = useTransform(scrollYProgress, [0.5, 0.6], [1, 0]);
  const bgAmberOpacity = useTransform(scrollYProgress, [0.5, 0.6, 0.7], [0, 1, 0]);
  const bgOrangeOpacity = useTransform(scrollYProgress, [0.6, 0.7], [0, 1]);

  // Export menu: 0.7 → 1
  const exportOpacity = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);
  const exportScale = useTransform(scrollYProgress, [0.8, 0.9], [0.8, 1]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#0f0f1a] shadow-2xl shadow-indigo-500/20"
    >
      {/* Editor top bar */}
      <div className="h-8 bg-[#1a1a2e] border-b border-white/5 flex items-center px-3 gap-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white">
            k
          </div>
          <span className="text-[10px] text-white/60">Mój projekt</span>
        </div>
        <motion.div
          style={{ opacity: exportOpacity, scale: exportScale }}
          className="px-2 py-0.5 rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-[9px] text-white font-medium flex items-center gap-1"
        >
          <Download className="h-2 w-2" /> Eksportuj
        </motion.div>
      </div>

      {/* Editor body */}
      <div className="flex h-[calc(100%-2rem)] relative">
        {/* Left sidebar */}
        <motion.div
          style={{ x: sidebarX, opacity: sidebarOpacity }}
          className="w-32 bg-[#1a1a2e] border-r border-white/5 p-2 flex flex-col gap-2 flex-shrink-0"
        >
          <SidebarTab icon={Type} label="Tekst" active />
          <SidebarTab icon={Shapes} label="Kształty" />
          <SidebarTab icon={ImageIcon} label="Zdjęcia" />
          <SidebarTab icon={Layers} label="Warstwy" />
          <SidebarTab icon={Palette} label="Marka" />
        </motion.div>

        {/* Canvas */}
        <div className="flex-1 relative bg-[#0a0a14] flex items-center justify-center p-4 overflow-hidden">
          {/* Canvas page (background changes via crossfade layers) */}
          <div
            className="relative w-3/4 aspect-video rounded shadow-2xl overflow-hidden"
            style={{ background: "#ffffff" }}
          >
            {/* Layer 1: amber background */}
            <motion.div
              style={{ opacity: bgAmberOpacity, background: "#fef3c7" }}
              className="absolute inset-0"
            />
            {/* Layer 2: orange gradient background */}
            <motion.div
              style={{ opacity: bgOrangeOpacity }}
              className="absolute inset-0 bg-gradient-to-br from-amber-500 to-red-500"
            />
            {/* Text element */}
            <motion.div
              style={{ opacity: textOpacity, scale: textScale, y: textY }}
              className="absolute top-4 left-1/2 -translate-x-1/2"
            >
              <motion.div
                style={{ color: textColor }}
                className="text-2xl font-black whitespace-nowrap"
              >
                WITAJ W kejmilfy
              </motion.div>
              {/* Selection box around text */}
              <motion.div
                style={{ opacity: rightPanelOpacity }}
                className="absolute -inset-2 border-2 border-indigo-400 rounded pointer-events-none"
              >
                <div className="absolute -top-1 -left-1 h-2 w-2 bg-white border border-indigo-400 rounded-sm" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-white border border-indigo-400 rounded-sm" />
                <div className="absolute -bottom-1 -left-1 h-2 w-2 bg-white border border-indigo-400 rounded-sm" />
                <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-white border border-indigo-400 rounded-sm" />
              </motion.div>
            </motion.div>

            {/* Shape element (circle) */}
            <motion.div
              style={{ opacity: shapeOpacity, scale: shapeScale, rotate: shapeRotate }}
              className="absolute bottom-4 right-4 h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg"
            />

            {/* Shape element (triangle) */}
            <motion.div
              style={{ opacity: shapeOpacity, scale: shapeScale }}
              className="absolute bottom-8 left-6"
            >
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: "20px solid transparent",
                  borderRight: "20px solid transparent",
                  borderBottom: "32px solid #06b6d4",
                }}
              />
            </motion.div>
          </div>

          {/* Floating cursor from another user (collab hint) */}
          <motion.div
            style={{ opacity: exportOpacity }}
            className="absolute bottom-6 right-12 flex items-center gap-1"
          >
            <MousePointer2 className="h-4 w-4 text-pink-400 fill-white" />
            <div className="px-1.5 py-0.5 rounded bg-pink-500 text-white text-[9px] font-medium">
              Anna
            </div>
          </motion.div>
        </div>

        {/* Right panel (properties) */}
        <motion.div
          style={{ x: rightPanelX, opacity: rightPanelOpacity }}
          className="w-32 bg-[#1a1a2e] border-l border-white/5 p-2 flex-shrink-0"
        >
          <div className="text-[9px] text-white/40 uppercase tracking-wider mb-2">Właściwości</div>
          <div className="space-y-1.5">
            <PropRow label="Font" value="Inter" />
            <PropRow label="Rozmiar" value="48" />
            <PropRow label="Waga" value="900" />
            <div className="pt-1">
              <div className="text-[8px] text-white/40 mb-1">Kolor</div>
              <div className="flex gap-1">
                <div className="h-4 w-4 rounded bg-[#0f172a] border border-white/20" />
                <motion.div
                  className="h-4 w-4 rounded border-2 border-indigo-400"
                  style={{ background: textColor }}
                />
                <div className="h-4 w-4 rounded bg-[#ef4444] border border-white/20" />
                <div className="h-4 w-4 rounded bg-[#10b981] border border-white/20" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SidebarTab({
  icon: Icon,
  label,
  active,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
        active ? "bg-indigo-500/20 text-indigo-300" : "text-white/40"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-[9px]">{label}</span>
    </div>
  );
}

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] text-white/40">{label}</span>
      <span className="text-[9px] text-white/80 font-mono">{value}</span>
    </div>
  );
}

function FloatingCard({
  className,
  gradient,
  label,
  big,
}: {
  className: string;
  gradient: string;
  label: string;
  big?: boolean;
}) {
  return (
    <motion.div
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={`${className} aspect-[3/4] rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl flex items-end p-4 backdrop-blur`}
    >
      <div className="text-white">
        <div className={`font-bold ${big ? "text-xl" : "text-base"}`}>{label}</div>
        <div className="text-xs opacity-70">kejmilfy</div>
      </div>
    </motion.div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  gradient,
  delay,
}: {
  icon: any;
  title: string;
  desc: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="group relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur hover:border-white/20 transition-all overflow-hidden"
    >
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
      <div className={`relative inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg mb-4`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// Inline MousePointer2 import (avoid adding to top imports)
import { MousePointer2 } from "lucide-react";
