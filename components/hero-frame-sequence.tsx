"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 151;
const FRAME_PATH = "/videos/hero-frames/ezgif-frame-";

/** Frames preloaded + decoded before the scrub is allowed to drive anything. */
const INITIAL_FRAMES = 14;
/** Concurrency: playhead-serving loads vs. background trickle. */
const MAX_CONCURRENT = 6;
const MAX_BACKGROUND = 4;
/** Cap for waiting on the initial burst before the scrub enables anyway. */
const BURST_TIMEOUT_MS = 2500;

function frameSrc(index: number) {
  return `${FRAME_PATH}${String(index + 1).padStart(3, "0")}.jpg`;
}

type FrameState = "loading" | "loaded" | "failed";
type FrameEntry = { img: HTMLImageElement; state: FrameState };

type LoadRequest = { index: number; high: boolean };

/* ---- Module-level frame cache --------------------------------------------
   Shared across StrictMode remounts so frames are never requested twice,
   and a small priority queue keeps concurrent downloads bounded.          */

const cache = new Map<number, FrameEntry>();
const queued = new Set<number>();
const queue: LoadRequest[] = [];
let inFlight = 0;
const readyListeners = new Set<(index: number) => void>();

function pump(): void {
  for (;;) {
    /* Serve playhead-serving (high) requests ahead of background ones. */
    const pickIndex = queue.findIndex((item) => item.high);
    const take = pickIndex >= 0 ? pickIndex : 0;
    const head = queue[take];
    if (!head) return;
    const cap = head.high ? MAX_CONCURRENT : MAX_BACKGROUND;
    if (inFlight >= cap) return;

    queue.splice(take, 1);
    queued.delete(head.index);
    const entry = cache.get(head.index);
    if (!entry || entry.state !== "loading") continue;

    if (entry.img.complete && entry.img.naturalWidth > 0) {
      entry.state = "loaded";
      notify(head.index);
      continue;
    }

    inFlight++;
    const index = head.index;
    entry.img.onload = () => {
      inFlight--;
      entry.state = "loaded";
      notify(index);
      pump();
    };
    entry.img.onerror = () => {
      inFlight--;
      entry.state = "failed";
      pump();
    };
    entry.img.src = frameSrc(index);
  }
}

function notify(index: number): void {
  readyListeners.forEach((listener) => listener(index));
}

function request(index: number, high: boolean): void {
  if (index < 0 || index >= FRAME_COUNT) return;
  let entry = cache.get(index);
  if (!entry) {
    const img = document.createElement("img");
    img.decoding = "async";
    entry = { img, state: "loading" };
    cache.set(index, entry);
  } else if (entry.state !== "loading") {
    return;
  }
  if (queued.has(index)) {
    /* Bump an already-queued frame to the fast lane when it becomes
       the playhead target. */
    const item = high ? queue.find((r) => r.index === index) : undefined;
    if (item && !item.high) {
      item.high = true;
      pump();
    }
    return;
  }
  queued.add(index);
  queue.push({ index, high });
  pump();
}

function isLoaded(index: number): boolean {
  const entry = cache.get(index);
  return !!entry && entry.state === "loaded";
}

/* Nearest loaded frame with a directional bias: ahead-of-playhead when
   rewinding, behind-of-playhead when advancing. Breaking ties this way
   keeps what is on screen monotonic with the playhead instead of
   hopping between whichever frames happen to decode first. */
function nearestLoaded(from: number, forward: boolean): number {
  if (isLoaded(from)) return from;
  for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
    const behind = from - distance;
    const ahead = from + distance;
    const first = forward ? behind : ahead;
    const second = forward ? ahead : behind;
    if (first >= 0 && isLoaded(first)) return first;
    if (second >= 0 && second < FRAME_COUNT && isLoaded(second)) return second;
  }
  return -1;
}

function raf2(callback: () => void): () => void {
  let outer = 0;
  let inner = 0;
  outer = requestAnimationFrame(() => {
    inner = requestAnimationFrame(callback);
  });
  return () => {
    cancelAnimationFrame(outer);
    cancelAnimationFrame(inner);
  };
}

/* ---- Component ------------------------------------------------------------ */

export default function HeroFrameSequence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const image = imageRef.current;
    if (!root || !image) return;

    /* Static fallback on reduced motion / save-data / low-end devices */
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    const cores = navigator.hardwareConcurrency ?? 8;
    if (
      media.matches ||
      nav.connection?.saveData ||
      nav.connection?.effectiveType === "slow-2g" ||
      nav.connection?.effectiveType === "2g" ||
      (cores > 0 && cores <= 2)
    ) {
      return;
    }

    let disposed = false;
    let tween: gsap.core.Tween | null = null;
    let cancelInitRaf: (() => void) | null = null;
    let scrubReady = false;
    let painted = -1;
    let wantIndex = 0;
    let decodeToken = 0;

    const readyListener = (index: number) => {
      if (disposed) return;
      /* Exact-frame catch-up when the playhead target's decode lands.
         While nothing is on screen yet, catch-up stays within the
         opening frames: a late background load must never become the
         first visible frame. */
      if (index === wantIndex && index !== painted) {
        paint(index);
      } else if (painted === -1 && index <= 4) {
        const nearest = nearestLoaded(wantIndex, true);
        if (nearest >= 0 && nearest <= 4) paint(nearest);
      }
    };
    readyListeners.add(readyListener);

    const paint = (index: number): boolean => {
      if (disposed) return false;
      if (!isLoaded(index)) return false;
      const nextSrc = frameSrc(index);
      if (image.getAttribute("src") === nextSrc) {
        painted = index;
        root.dataset.videoState = "ready";
        return true;
      }

      /* The very first frame commits synchronously. Afterwards every
         swap waits for the frame's decode and is tokenized: stale
         decodes resolve late but commit nothing, so the picture can
         never flash or step backward while loads are racing. */
      if (painted === -1) {
        image.src = nextSrc;
        image.decoding = "async";
        painted = index;
        root.dataset.videoState = "ready";
        return true;
      }

      const entry = cache.get(index);
      const token = ++decodeToken;
      const commit = () => {
        if (disposed || token !== decodeToken) return;
        if (image.getAttribute("src") === nextSrc) return;
        image.src = nextSrc;
        painted = index;
        root.dataset.videoState = "ready";
      };
      entry?.img.decode().then(commit, commit);
      return true;
    };

    const paintNearest = (index: number, forward: boolean): boolean => {
      const fallback = nearestLoaded(index, forward);
      if (fallback < 0) return false;
      paint(fallback);
      return true;
    };

    const updateFrame = (value: number) => {
      if (!scrubReady) return;
      const index = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(value)));
      wantIndex = index;

      /* Keep a rolling window warm around the playhead. */
      const direction = index >= painted ? 1 : -1;
      request(index, true);
      for (let offset = 1; offset <= 16; offset += 1) {
        request(index + offset * direction, true);
      }
      for (let offset = 1; offset <= 6; offset += 1) {
        request(index - offset * direction, false);
      }

      if (!paint(index)) paintNearest(index, direction > 0);
    };

    /* 2) Preload + decode the opening frames, paint frame 0, and only
          then allow ScrollTrigger to exist. */
    const init = () => {
      for (let index = 0; index < INITIAL_FRAMES; index += 1) {
        request(index, true);
      }
      /* Progressive background load of the remaining set — bounded by
         MAX_BACKGROUND, so the whole sequence costs ~3.5 MB spread out. */
      for (let index = INITIAL_FRAMES; index < FRAME_COUNT; index += 1) {
        request(index, false);
      }

      const createScrub = () => {
        if (disposed || tween) return;
        const trigger =
          (root.closest("[data-video-scrub]") as HTMLElement | null) ?? root;
        const progress = { frame: 0 };
        tween = gsap.fromTo(
          progress,
          { frame: 0 },
          {
            frame: FRAME_COUNT - 1,
            ease: "none",
            immediateRender: false,
            onUpdate: () => updateFrame(progress.frame),
            scrollTrigger: {
              trigger,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.15,
              /* No invalidateOnRefresh: the mapping is absolute
                 (0 -> FRAME_COUNT - 1) and must never re-anchor. */
            },
          }
        );
        ScrollTrigger.refresh();
      };

      /* 3) Resolves true once the scrub may be created. The motion
            provider adds .has-motion in its own effect; the double-rAF
            guarantees that layout is applied before creation. */
      const trySettle = (): boolean => {
        if (disposed || scrubReady) return true;
        if (!paintNearest(0, true)) return false; /* first frame not decoded yet */
        scrubReady = true;
        cancelInitRaf = raf2(createScrub);
        return true;
      };

      if (!trySettle()) {
        const started = performance.now();
        const timer = window.setInterval(() => {
          if (disposed || trySettle()) {
            window.clearInterval(timer);
            return;
          }
          if (performance.now() - started > BURST_TIMEOUT_MS) {
            window.clearInterval(timer);
            if (!disposed && !scrubReady) {
              /* Timeout fallback: enable with whatever is loaded. */
              scrubReady = true;
              cancelInitRaf = raf2(createScrub);
            }
          }
        }, 80);
      }
    };

    waitFrameZero(init);

    return () => {
      disposed = true;
      readyListeners.delete(readyListener);
      cancelInitRaf?.();
      tween?.scrollTrigger?.kill();
      tween?.kill();
      tween = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="scroll-video scroll-video-fill hero-frame-sequence"
      data-video-state="poster"
    >
      <Image
        className="scroll-video-poster"
        src="/images/hero-poster.jpg"
        alt=""
        fill
        sizes="(max-width: 700px) 100vw, 78vw"
        priority
        quality={88}
      />
      <img
        ref={imageRef}
        className="hero-frame-sequence-media"
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}

/* Resolves once frame 0 is loaded (or the timeout fires), without polling
   the DOM: the cache's notify() drives a one-shot promise. */
function waitFrameZero(onReady: () => void): void {
  if (isLoaded(0)) {
    onReady();
    return;
  }
  const listener = (index: number) => {
    if (index === 0) {
      readyListeners.delete(listener);
      onReady();
    }
  };
  readyListeners.add(listener);
  request(0, true);
}
