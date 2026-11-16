# Project Creation Prompt

Below is the complete prompt used to generate this project:

```text
Build a full-screen, scroll-driven hero for "Vanité & Co.", a handcrafted solid oak dressing table with a lit mirror, in warm oak finish #B88A5C. The hero plays a 240-frame image sequence scrubbed by scroll, showing the mirror lights warm up, the drawer slide open and closed, and the camera push into the glowing mirror until the brand is revealed. Keep everything photographic and calm. No cartoon effects, no bouncing, no overshoot.

SKILLS TO APPLY
- Taste: sets the visual direction. Keep the palette to warm oak #B88A5C, soft linen #EDE6DA, cream #F4EDE1, and the warm 2700K glow. Text is warm off-white #F4EDE1 on the frame, never pure white.
- Impeccable Design: governs layout, typography, and spacing. Use a serif display face for the brand wordmark (for example Cormorant Garamond) and a clean sans for body copy (for example Inter). Keep 8 px spacing steps and generous margins of at least 6vw.
- Emil Design Engineering: governs motion and interaction. Use eased, damped scrubbing with no snapping, no bounce, and no motion longer than the scroll it belongs to.
- Conflict rule: if Taste and Impeccable disagree, Taste wins on color and mood, Impeccable wins on layout and type. If either conflicts with Emil on motion, Emil wins on timing, and the result must still feel calm.

STACK
- Next.js 15 (App Router), TypeScript (strict), Tailwind CSS v4.
- Frame scrubbing on a single <canvas>, no 3D libraries.
- Choose GSAP ScrollTrigger or Framer Motion for scroll tracking. Pick one, justify the choice in two sentences, and use it consistently. Prefer GSAP ScrollTrigger for its scrub control.
- Smooth the scroll-to-frame mapping with a lerp factor of 0.12 per animation frame so the frames never jump.

CONCEPT
- Pinned hero: a section 300vh tall, containing a sticky 100vh viewport.
- Starting state: the first frame (dark room, mirror off) is drawn and visible before any scroll, with the headline already readable.
- Scroll progress p runs from 0 to 1 across the pinned section, and p drives everything: the frame index, the text stage, and the wordmark opacity.
- Frame index = round(p * 239), so frame 0 is p = 0 and frame 239 is p = 1.
- Scroll stages:
  - 0 to 0.33: lights warm up (frames 0 to 79). Headline visible.
  - 0.33 to 0.66: drawer opens and closes, the push-in begins (frames 79 to 158). Second headline visible.
  - 0.66 to 1: the mirror fills the frame and the wordmark is revealed (frames 158 to 239).

FRAME ASSETS
- Frames live in /public/frames/frame_000.webp through frame_239.webp, at 640x360.
- Preload all 240 frames before the canvas draws, but render the text immediately. Show a thin progress hairline in warm oak while loading.
- Decode each frame with new Image() and store it in an array. Draw with object-fit: cover logic, centered, to fill the viewport.
- Cap the canvas backing store at DPR [1, 2]. Because the source is 640x360, scale up with imageSmoothingQuality = "high" and do not add sharpening.

MOTION
- Lights: frames 0 to 79 map to the warm-up. No extra effect is added.
- Drawer: the drawer open and close is in the footage itself, so no code animation is needed. Keep the scroll mapping linear here so the drawer moves at a steady pace.
- Push-in: frames 158 to 239. Ease the wordmark opacity with a cubic-bezier(0.22, 1, 0.36, 1) curve over p from 0.72 to 0.88, going from 0 to 1.
- Idle motion: none on the canvas. The footage already contains dust motes. Do not add a second idle motion.
- Use transform and opacity only for overlays. Never animate layout properties.

OVERLAY TEXT (exact copy, short, in the brand voice)
- Stage 0 to 0.33: headline "Light, awakened." Subline: "Warm from the first glow." Position: left, vertically centered, max width 28ch.
- Stage 0.33 to 0.66: headline "Everything, in its place." Subline: "A drawer for what you love." Position: left, vertically centered, max width 28ch.
- Stage 0.66 to 1: wordmark "Vanité & Co." in the serif face, 64 px on mobile and 96 px on desktop, centered in the glow, with the subline "Made by hand. Lit for you." below it. Position: center. The wordmark is the brand reveal, so it must be the only text in this stage.
- Scroll cue: a small label "Scroll" with a thin 40 px line below it, placed bottom center, fading out after p = 0.05.
- Typography: serif headlines at 48 to 72 px, sans sublines at 16 to 18 px, line height 1.2 for headlines and 1.5 for sublines. Text color #F4EDE1 on the glowing frames, with a soft text-shadow of 0 2px 24px rgba(46, 46, 51, 0.35) for legibility over the bright mirror.

LAYOUT
- Desktop (1024 px and up): all text sits on the left third (left 6vw, width 34vw) during stages 1 and 2. In stage 3 the wordmark centers in the glow. The oak table sits in the center-right of the frame, so the left text never overlaps the table.
- Mobile (below 768 px): text sits in the top 35% of the viewport in stages 1 and 2, and the table sits in the lower 60%, so text never overlaps the object. In stage 3 the wordmark centers vertically in the glow.
- Never let text overlap the object's main body; keep a 24 px minimum gap.

BEHAVIOR AND ACCESSIBILITY
- Reduced motion: if prefers-reduced-motion is set, skip scroll scrubbing. Show frame 239 as a static image with the wordmark visible, and remove the scroll cue.
- Touch: scrubbing works through native touch scroll. Do not hijack touch events.
- Suspense fallback: render the headline and scroll section first. Show the canvas only after the first 10 frames are decoded, with a 300 ms fade-in.
- Low-end devices: if the device reports fewer than 4 CPU cores (navigator.hardwareConcurrency < 4), draw every second frame and round the index to the nearest even number.
- Contrast: all text meets WCAG AA. Check the subline over the brightest glow, and add a dark-to-transparent gradient from the left if needed to reach 4.5:1.
- Canvas: role="img" and aria-label="Dressing table with a lit mirror, showing the lights warming, the drawer opening, and the mirror glow, by Vanité & Co." Each text block uses real headings in order (h1 for the first headline, h2 for the second, and the wordmark as a styled p with the brand name).

FILE STRUCTURE
- app/layout.tsx: root layout, fonts, metadata.
- app/page.tsx: renders the Hero.
- components/Hero.tsx: pinned 300vh section and sticky viewport, scroll tracking.
- components/FrameCanvas.tsx: canvas, frame preloading, lerp drawing.
- components/HeroOverlay.tsx: stage text, wordmark, and scroll cue.
- lib/frames.ts: frame count, paths, and index mapping.
- lib/useReducedMotion.ts: reduced-motion hook.
- app/globals.css: Tailwind v4 import and brand tokens.
- public/frames/: the 240 WebP frames.
```
