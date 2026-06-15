import { useRef, useEffect } from "react";
import { useThemeStore } from "@/stores/theme";

type ParticleType = "rain" | "snow" | "firefly";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  type: ParticleType;
  hue: number;
  saturation: number;
  lightness: number;
}

const themeParticleMap: Record<string, { type: ParticleType; hue: number; sat: number; light: number }> = {
  ink: { type: "rain", hue: 35, sat: 40, light: 70 },
  paper: { type: "firefly", hue: 40, sat: 60, light: 75 },
  night: { type: "snow", hue: 0, sat: 0, light: 85 },
  forest: { type: "firefly", hue: 100, sat: 50, light: 65 },
};

function isMobile(): boolean {
  return window.innerWidth < 768;
}

function createParticle(canvas: HTMLCanvasElement, type: ParticleType, hue: number, sat: number, light: number): Particle {
  const base = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    life: 0,
    maxLife: 300 + Math.random() * 400,
  };

  switch (type) {
    case "rain":
      return {
        ...base,
        vx: 0,
        vy: 4 + Math.random() * 6,
        size: 1 + Math.random(),
        opacity: 0.15 + Math.random() * 0.25,
        type: "rain",
        hue,
        saturation: sat,
        lightness: light,
      };
    case "snow":
      return {
        ...base,
        vx: -0.3 + Math.random() * 0.6,
        vy: 0.5 + Math.random() * 1.5,
        size: 1.5 + Math.random() * 2.5,
        opacity: 0.2 + Math.random() * 0.5,
        type: "snow",
        hue,
        saturation: sat,
        lightness: light,
      };
    case "firefly":
      return {
        ...base,
        vx: -0.3 + Math.random() * 0.6,
        vy: -0.3 + Math.random() * 0.6,
        size: 2 + Math.random() * 3,
        opacity: 0,
        type: "firefly",
        hue,
        saturation: sat,
        lightness: light,
      };
  }
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useThemeStore((s) => s.theme);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cfg = themeParticleMap[theme] || themeParticleMap.ink;
    const count = isMobile() ? 40 : 80;
    particlesRef.current = Array.from({ length: count }, () => createParticle(canvas, cfg.type, cfg.hue, cfg.sat, cfg.light));

    let running = true;

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Reset particle when off-screen or expired
        const offScreen = p.y > h + 20 || p.y < -20 || p.x > w + 20 || p.x < -20;
        const expired = p.life > p.maxLife;
        if (offScreen || expired) {
          Object.assign(p, createParticle(canvas, cfg.type, cfg.hue, cfg.sat, cfg.light));
          if (p.type === "rain" || p.type === "snow") {
            p.y = -10;
            p.x = Math.random() * w;
          }
        }

        const hsla = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.opacity})`;
        ctx.fillStyle = hsla;
        ctx.strokeStyle = hsla;

        switch (p.type) {
          case "rain": {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - 0.2, p.y + 8 + p.size * 2);
            ctx.lineWidth = 0.5;
            ctx.stroke();
            break;
          }
          case "snow": {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            // Occasional sparkle
            if (Math.random() < 0.005) {
              ctx.fillStyle = `rgba(255,255,255,${p.opacity + 0.4})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          }
          case "firefly": {
            // Pulsing opacity
            const pulse = Math.sin(p.life * 0.05) * 0.5 + 0.5;
            const alpha = pulse * 0.7;
            ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${alpha})`;
            ctx.shadowColor = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${alpha * 0.8})`;
            ctx.shadowBlur = p.size * 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            break;
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // Pause when tab not visible
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafRef.current);
      } else {
        running = true;
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}
