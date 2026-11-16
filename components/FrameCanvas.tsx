"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { TOTAL_FRAMES, getFramePath, preloadFrames } from "@/lib/frames";

interface FrameCanvasProps {
  /** Target progress [0, 1] coming from scroll */
  progress: number;
  /** Whether reduced motion is active */
  reducedMotion?: boolean;
}

export const FrameCanvas: React.FC<FrameCanvasProps> = ({
  progress,
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadCount, setLoadCount] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [lowEndMode, setLowEndMode] = useState<boolean>(false);

  // Current smoothed frame index for lerp animation
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Check hardware concurrency for low-end devices (< 4 cores)
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
      if (navigator.hardwareConcurrency < 4) {
        setLowEndMode(true);
      }
    }
  }, []);

  // Preload and decode images
  useEffect(() => {
    let isCancelled = false;

    // Load first frame immediately for fast starting state
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    imagesRef.current[0] = firstImg;

    preloadFrames((loaded, _total) => {
      if (!isCancelled) {
        setLoadCount(loaded);
        if (loaded >= 10 && !isReady) {
          setIsReady(true);
        }
      }
    }).then((loadedImages) => {
      if (!isCancelled) {
        imagesRef.current = loadedImages;
        setIsReady(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isReady]);

  // Draw image with object-fit: cover logic and DPR cap [1, 2]
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const img = imagesRef.current[frameIndex] || imagesRef.current[0];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Canvas size vs logical viewport size
    const width = canvas.width;
    const height = canvas.height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (canvasRatio > imgRatio) {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imgRatio;
      drawHeight = height;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  // Resize listener capping backing store at DPR [1, 2]
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      if (
        canvas.width !== Math.round(displayWidth * dpr) ||
        canvas.height !== Math.round(displayHeight * dpr)
      ) {
        canvas.width = Math.round(displayWidth * dpr);
        canvas.height = Math.round(displayHeight * dpr);
        drawFrame(Math.round(currentFrameRef.current));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // Update target frame when progress or reducedMotion changes
  useEffect(() => {
    if (reducedMotion) {
      targetFrameRef.current = TOTAL_FRAMES - 1;
      currentFrameRef.current = TOTAL_FRAMES - 1;
      drawFrame(TOTAL_FRAMES - 1);
      return;
    }

    const clampedP = Math.max(0, Math.min(1, progress));
    let frame = Math.round(clampedP * (TOTAL_FRAMES - 1));

    if (lowEndMode) {
      frame = Math.round(frame / 2) * 2;
      if (frame >= TOTAL_FRAMES) frame = TOTAL_FRAMES - 2;
    }

    targetFrameRef.current = frame;
  }, [progress, reducedMotion, lowEndMode, drawFrame]);

  // Emil Design Engineering: Damped scrubbing with lerp factor 0.12, no overshoot, calm easing
  useEffect(() => {
    if (reducedMotion) return;

    const LERP_FACTOR = 0.12;
    let lastDrawnFrame = -1;

    const animate = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;

      if (Math.abs(diff) > 0.005) {
        currentFrameRef.current += diff * LERP_FACTOR;
      } else {
        currentFrameRef.current = targetFrameRef.current;
      }

      const frameToDraw = Math.round(currentFrameRef.current);
      if (frameToDraw !== lastDrawnFrame) {
        drawFrame(frameToDraw);
        lastDrawnFrame = frameToDraw;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [reducedMotion, drawFrame]);

  // Draw initial frame as soon as first image loads
  useEffect(() => {
    if (imagesRef.current[0]) {
      drawFrame(0);
    }
  }, [drawFrame]);

  const loadPercent = Math.min(100, Math.round((loadCount / TOTAL_FRAMES) * 100));

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#12100e]">
      {/* Loading Hairline in Warm Oak #B88A5C */}
      {loadCount < TOTAL_FRAMES && (
        <div
          role="progressbar"
          aria-valuenow={loadPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading sequence frames"
          className="fixed top-0 left-0 w-full h-[2px] bg-black/20 z-50 pointer-events-none"
        >
          <div
            className="h-full bg-[#B88A5C] transition-all duration-150 ease-out"
            style={{ width: `${loadPercent}%` }}
          />
        </div>
      )}

      {/* Frame Canvas with 300ms fade-in once first 10 frames are ready */}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Dressing table with a lit mirror, showing the lights warming, the drawer opening, and the mirror glow, by Vanité & Co."
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};
