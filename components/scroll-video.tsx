"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export type ScrollVideoProps = {
  src: string;
  poster: string;
  /** Static image used when video is skipped (reduced motion, save-data, low-end) */
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
  /** Start loading + scrubbing immediately (hero). Otherwise loads lazily. */
  eager?: boolean;
  /** ScrollTrigger bounds, relative to the closest [data-video-scrub] ancestor */
  start?: string;
  end?: string;
  /** Scroll smoothing in seconds (scrub value) */
  scrub?: number;
  posterPriority?: boolean;
};

type VideoMode = "video" | "static";

/**
 * Detects environments where a scroll-scrubbed video would be a poor
 * experience: reduced-motion, save-data, very slow connections, or
 * very low-end hardware. Those get the static poster fallback.
 */
function shouldSkipVideo(): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return true;
    }
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    const connection = nav.connection;
    if (connection?.saveData) return true;
    if (
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g"
    ) {
      return true;
    }
    const cores = navigator.hardwareConcurrency ?? 8;
    if (cores > 0 && cores <= 2) return true;
  } catch {
    // Detection is best-effort; default to video.
  }
  return false;
}

export default function ScrollVideo({
  src,
  poster,
  fallbackSrc,
  className,
  sizes,
  eager = false,
  start = "top top",
  end = "bottom bottom",
  scrub = 0.6,
  posterPriority = false,
}: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<VideoMode>("video");
  const [attach, setAttach] = useState(eager);
  const [hasMeta, setHasMeta] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);

  /* Capability check + live reduced-motion switch */
  useEffect(() => {
    if (shouldSkipVideo()) setMode("static");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (media.matches) setMode("static");
    };
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  /* Lazy attach: wait until the section is within ~1.2 viewports */
  useEffect(() => {
    if (attach || mode !== "video") return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setAttach(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setAttach(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120% 0px 120% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [attach, mode]);

  /* Scrub wiring: waits for metadata, then maps scroll -> currentTime */
  useEffect(() => {
    if (mode !== "video" || !attach) return;
    const video = videoRef.current;
    if (!video) return;

    let tween: gsap.core.Tween | null = null;
    let disposed = false;
    let targetTime = 0;
    let onSeeked: (() => void) | null = null;
    let cancelPendingRaf: (() => void) | null = null;

    /* Defers trigger creation until the motion provider's effect has run
       and its layout (.has-motion pin spacing) is applied + measurable. */
    const raf2 = (callback: () => void) => {
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(callback);
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    };

    const createTween = (duration: number) => {
      const trigger =
        (video.closest("[data-video-scrub]") as HTMLElement | null) ??
        video.parentElement;
      if (!trigger) return;

      const proxy = { time: 0 };
      const tail = Math.min(0.08, duration * 0.02);
      const seekToTarget = () => {
        if (disposed || video.readyState < 1 || video.seeking) return;
        if (Math.abs(video.currentTime - targetTime) < 1 / 30) return;
        try {
          video.currentTime = targetTime;
        } catch {
          /* seek not ready yet; the next scroll update retries */
        }
      };
      onSeeked = () => {
        if (Math.abs(video.currentTime - targetTime) >= 1 / 30) {
          seekToTarget();
        }
      };

      /* Anchored 0 -> duration mapping with no invalidateOnRefresh, so a
         refresh can never re-capture the start value and skew the
         mapping (which made scrubbing jump near the final frame). */
      tween = gsap.fromTo(
        proxy,
        { time: 0 },
        {
          time: duration - tail,
          ease: "none",
          immediateRender: false,
          onUpdate: () => {
            targetTime = proxy.time;
            seekToTarget();
          },
          scrollTrigger: {
            trigger,
            start,
            end,
            scrub,
          },
        }
      );
      video.addEventListener("seeked", onSeeked);
    };

    const buildScrub = () => {
      if (disposed || cancelPendingRaf || tween) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0.1) return;

      setHasMeta(true);

      cancelPendingRaf = raf2(() => {
        cancelPendingRaf = null;
        if (disposed || tween) return;
        createTween(duration);
      });
    };

    const onFirstFrame = () => setHasFrame(true);
    const onError = () => setMode("static");

    video.addEventListener("loadedmetadata", buildScrub);
    video.addEventListener("durationchange", buildScrub);
    video.addEventListener("loadeddata", onFirstFrame);
    video.addEventListener("error", onError);

    /* Cached videos may already have metadata by effect time */
    if (video.readyState >= 1) buildScrub();
    if (video.readyState >= 2) onFirstFrame();

    video.muted = true;

    return () => {
      disposed = true;
      cancelPendingRaf?.();
      video.removeEventListener("loadedmetadata", buildScrub);
      video.removeEventListener("durationchange", buildScrub);
      video.removeEventListener("loadeddata", onFirstFrame);
      video.removeEventListener("error", onError);
      if (onSeeked) video.removeEventListener("seeked", onSeeked);
      tween?.scrollTrigger?.kill();
      tween?.kill();
      tween = null;
    };
  }, [mode, attach, start, end, scrub]);

  const posterSrc =
    mode === "static" && fallbackSrc ? fallbackSrc : poster;

  return (
    <div
      ref={rootRef}
      className={`scroll-video${className ? ` ${className}` : ""}`}
      data-video-state={hasFrame ? "ready" : "poster"}
    >
      <Image
        className="scroll-video-poster"
        src={posterSrc}
        alt=""
        fill
        sizes={sizes}
        priority={posterPriority}
        quality={posterPriority ? 88 : 80}
      />
      {mode === "video" && (
        <video
          ref={videoRef}
          className="scroll-video-media"
          src={attach ? src : undefined}
          poster={poster}
          preload={attach ? "auto" : "none"}
          muted
          playsInline
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
