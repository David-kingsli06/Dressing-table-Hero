"use client";

import React from "react";

interface HeroOverlayProps {
  /** Scroll progress [0, 1] */
  progress: number;
  /** Whether reduced motion is active */
  reducedMotion?: boolean;
}

/**
 * Evaluates cubic-bezier(0.22, 1, 0.36, 1) easeOutCubic-like curve.
 * Maps normalized t in [0, 1] to eased value [0, 1].
 */
function cubicBezierEase(t: number): number {
  const clampedT = Math.max(0, Math.min(1, t));
  // Analytical evaluation for cubic bezier with P0=0, P1=0.22, P2=1, P3=1
  // Or standard formula for cubic-bezier(0.22, 1, 0.36, 1)
  // Accurate parametric solve:
  const u = 1 - clampedT;
  return 3 * u * u * clampedT * 1 + 3 * u * clampedT * clampedT * 1 + clampedT * clampedT * clampedT;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  progress,
  reducedMotion = false,
}) => {
  if (reducedMotion) {
    return (
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-[64px] lg:text-[96px] tracking-tight text-[#F4EDE1] leading-[1.1] text-glow-shadow">
          Vanité &amp; Co.
        </h1>
        <p className="mt-4 font-sans text-base lg:text-lg text-[#EDE6DA] tracking-widest uppercase font-light text-glow-shadow">
          Made by hand. Lit for you.
        </p>
      </div>
    );
  }

  // --- Stage Calculations ---
  // Stage 1: p from 0 to 0.33 (lights warm up)
  // Fully visible from p = 0 to 0.25, gently fades out by 0.33
  let stage1Opacity = 0;
  if (progress < 0.25) {
    stage1Opacity = 1;
  } else if (progress < 0.33) {
    stage1Opacity = 1 - (progress - 0.25) / (0.33 - 0.25);
  }

  // Stage 2: p from 0.33 to 0.66 (drawer opens and closes, push-in starts)
  // Fades in 0.33 -> 0.40, fully visible 0.40 -> 0.58, fades out 0.58 -> 0.66
  let stage2Opacity = 0;
  if (progress >= 0.33 && progress < 0.40) {
    stage2Opacity = (progress - 0.33) / (0.40 - 0.33);
  } else if (progress >= 0.40 && progress < 0.58) {
    stage2Opacity = 1;
  } else if (progress >= 0.58 && progress < 0.66) {
    stage2Opacity = 1 - (progress - 0.58) / (0.66 - 0.58);
  }

  // Stage 3: p from 0.66 to 1 (wordmark revealed in glowing mirror)
  // Ease the wordmark opacity with cubic-bezier(0.22, 1, 0.36, 1) over p from 0.72 to 0.88, going from 0 to 1
  let stage3Opacity = 0;
  if (progress >= 0.72) {
    const rawT = (progress - 0.72) / (0.88 - 0.72);
    stage3Opacity = cubicBezierEase(rawT);
  }

  // Scroll cue: fades out after p = 0.05
  let scrollCueOpacity = 0;
  if (progress < 0.05) {
    scrollCueOpacity = 1 - progress / 0.05;
  }

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none">
      {/* Subtle legibility gradient from left on desktop to ensure WCAG AA contrast over brightest mirror glows */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent pointer-events-none hidden lg:block transition-opacity duration-300"
        style={{ opacity: stage1Opacity > 0 || stage2Opacity > 0 ? 0.75 : 0 }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none lg:hidden transition-opacity duration-300"
        style={{ opacity: stage1Opacity > 0 || stage2Opacity > 0 ? 0.85 : 0 }}
      />

      {/* Stage 1: Left-aligned on Desktop, Top-third on Mobile */}
      <div
        className="absolute transition-opacity duration-150 will-change-transform
          top-[12vh] left-[6vw] max-w-[28ch]
          lg:top-1/2 lg:-translate-y-1/2 lg:left-[6vw] lg:w-[34vw]"
        style={{
          opacity: stage1Opacity,
          visibility: stage1Opacity > 0.005 ? "visible" : "hidden",
        }}
      >
        <h1 className="font-serif text-[44px] md:text-[56px] lg:text-[72px] leading-[1.2] text-[#F4EDE1] tracking-tight text-glow-shadow">
          Light, awakened.
        </h1>
        <p className="mt-3 font-sans text-base md:text-[17px] lg:text-[18px] leading-[1.5] text-[#EDE6DA] font-normal tracking-wide text-glow-shadow">
          Warm from the first glow.
        </p>
      </div>

      {/* Stage 2: Left-aligned on Desktop, Top-third on Mobile */}
      <div
        className="absolute transition-opacity duration-150 will-change-transform
          top-[12vh] left-[6vw] max-w-[28ch]
          lg:top-1/2 lg:-translate-y-1/2 lg:left-[6vw] lg:w-[34vw]"
        style={{
          opacity: stage2Opacity,
          visibility: stage2Opacity > 0.005 ? "visible" : "hidden",
        }}
      >
        <h2 className="font-serif text-[44px] md:text-[56px] lg:text-[72px] leading-[1.2] text-[#F4EDE1] tracking-tight text-glow-shadow">
          Everything, in its place.
        </h2>
        <p className="mt-3 font-sans text-base md:text-[17px] lg:text-[18px] leading-[1.5] text-[#EDE6DA] font-normal tracking-wide text-glow-shadow">
          A drawer for what you love.
        </p>
      </div>

      {/* Stage 3: Centered in the Glow */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 will-change-transform"
        style={{
          opacity: stage3Opacity,
          visibility: stage3Opacity > 0.005 ? "visible" : "hidden",
        }}
      >
        <p className="font-serif text-[64px] lg:text-[96px] tracking-tight text-[#F4EDE1] leading-[1.1] text-glow-shadow">
          Vanité &amp; Co.
        </p>
        <p className="mt-4 font-sans text-base lg:text-[18px] text-[#EDE6DA] tracking-widest uppercase font-light text-glow-shadow">
          Made by hand. Lit for you.
        </p>
      </div>

      {/* Scroll cue: bottom center */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 will-change-transform pointer-events-none"
        style={{
          opacity: scrollCueOpacity,
          visibility: scrollCueOpacity > 0.005 ? "visible" : "hidden",
        }}
      >
        <span className="font-sans text-[12px] tracking-[0.25em] uppercase text-[#EDE6DA]/80">
          Scroll
        </span>
        <div className="w-[1px] h-[40px] bg-[#B88A5C]/60" />
      </div>
    </div>
  );
};
