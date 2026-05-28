import { useEffect, useRef } from "react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type Particle = {
  alpha: number;
  baseAlpha: number;
  radius: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

type GravityStarsProps = ComponentProps<"div"> & {
  gravityStrength?: number;
  mouseInfluence?: number;
  movementSpeed?: number;
  starsCount?: number;
  starsOpacity?: number;
  starsSize?: number;
};

function createParticle(
  width: number,
  height: number,
  speed: number,
  size: number,
  opacity: number,
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const velocity = speed * (0.35 + Math.random() * 0.75);

  return {
    alpha: opacity,
    baseAlpha: opacity,
    radius: 1 + Math.random() * size,
    vx: Math.cos(angle) * velocity,
    vy: Math.sin(angle) * velocity,
    x: Math.random() * width,
    y: Math.random() * height,
  };
}

function GravityStarsBackground({
  className,
  gravityStrength = 0.025,
  mouseInfluence = 150,
  movementSpeed = 0.35,
  starsCount = 200,
  starsOpacity = 0.72,
  starsSize = 2.4,
  ...props
}: GravityStarsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef({ active: false, x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = Array.from({ length: starsCount }, () =>
        createParticle(
          rect.width,
          rect.height,
          movementSpeed,
          starsSize,
          starsOpacity,
        ),
      );
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        active: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const clearPointer = () => {
      pointerRef.current.active = false;
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const pointer = pointerRef.current;
      const particles = particlesRef.current;
      const color = getComputedStyle(canvas).color;
      context.clearRect(0, 0, rect.width, rect.height);

      for (const particle of particles) {
        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);

          if (distance > 0 && distance < mouseInfluence) {
            const force = (mouseInfluence - distance) / mouseInfluence;
            particle.vx += (dx / distance) * force * gravityStrength;
            particle.vy += (dy / distance) * force * gravityStrength;
            particle.alpha = Math.min(1, particle.baseAlpha + force * 0.28);
          }
        } else {
          particle.alpha = Math.max(particle.baseAlpha, particle.alpha - 0.015);
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.994;
        particle.vy *= 0.994;

        if (particle.x < 0) particle.x = rect.width;
        if (particle.x > rect.width) particle.x = 0;
        if (particle.y < 0) particle.y = rect.height;
        if (particle.y > rect.height) particle.y = 0;

        context.save();
        context.globalAlpha = particle.alpha;
        context.fillStyle = color;
        context.shadowColor = color;
        context.shadowBlur = 18;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", updatePointer);
    window.addEventListener("pointerdown", updatePointer);
    window.addEventListener("pointerleave", clearPointer);
    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", updatePointer);
      window.removeEventListener("pointerleave", clearPointer);

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [
    gravityStrength,
    mouseInfluence,
    movementSpeed,
    starsCount,
    starsOpacity,
    starsSize,
  ]);

  return (
    <div
      className={cn(
        "text-primary/70 pointer-events-none absolute inset-0",
        className,
      )}
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}

export { GravityStarsBackground };
