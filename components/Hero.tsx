"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameCanvas } from "./FrameCanvas";
import { HeroOverlay } from "./HeroOverlay";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Register ScrollTrigger once on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isFixed, setIsFixed] = useState<boolean>(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      setIsFixed(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Use GSAP ScrollTrigger to track scroll across the 300vh track
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        setProgress(self.progress);
        // While within the 300vh scroll range, hero is fixed to viewport
        setIsFixed(self.progress < 1);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={containerRef}
      className={`relative w-full ${
        reducedMotion ? "h-screen" : "h-[300vh]"
      } bg-[#12100e]`}
    >
      {/* 
        Fixed Viewport: pinned to the screen (`fixed inset-0`) while scrubbing through the 300vh section, 
        and pins cleanly at the bottom if any subsequent content exists.
      */}
      <div
        className={`${
          isFixed
            ? "fixed top-0 left-0"
            : "absolute bottom-0 left-0"
        } w-full h-screen overflow-hidden z-10 pointer-events-auto`}
      >
        {/* Scrubbed Canvas */}
        <FrameCanvas progress={progress} reducedMotion={reducedMotion} />

        {/* Text & Brand Overlays */}
        <HeroOverlay progress={progress} reducedMotion={reducedMotion} />
      </div>
    </section>
  );
};
