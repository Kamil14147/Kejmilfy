"use client";

import * as React from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

interface Props {
  count?: number;
  colors?: string[];
  className?: string;
  interactive?: boolean;
  speed?: number;
}

/**
 * Optimized particle field — O(n) rendering (no O(n²) connection lines).
 * Uses simple fillRect/arc without expensive radial gradients.
 * Frame rate capped at 30fps to save CPU on weak devices.
 */
export function ParticleField({
  count = 40,
  colors = ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4"],
  className = "",
  interactive = true,
  speed = 0.3,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const mouseRef = React.useRef({ x: -1000, y: -1000 });
  const rafRef = React.useRef<number>(0);
  const lastFrameRef = React.useRef(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveCount = prefersReduced ? Math.min(count, 10) : count;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      // Cap DPR at 1.5 for performance (2x is overkill for particles)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    const initParticles = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      particlesRef.current = Array.from({ length: effectiveCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.4 + 0.2,
      }));
    };
    initParticles();

    const draw = (now: number) => {
      // Cap at 30fps (33ms) — particles don't need 60fps
      if (now - lastFrameRef.current < 33) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      lastFrameRef.current = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Single pass — no O(n²) connections
      for (const p of particles) {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Mouse interaction (simple, no distance calc per pair)
        if (interactive) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 22500) {
            // 150²
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / 150) * 0.8;
            p.x -= (dx / dist) * force;
            p.y -= (dy / dist) * force;
          }
        }

        // Wrap
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw — simple arc, no gradient
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    if (interactive) {
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseout", onLeave, { passive: true });
    }

    // Debounced resize
    let resizeTimer: number;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        initParticles();
      }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [count, colors, interactive, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
}
