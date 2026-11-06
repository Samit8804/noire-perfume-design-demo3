import { useEffect, useRef, useState } from 'react';

/**
 * Central scroll state shared by every 3D scene.
 * ScrollProgressTracker is the only writer; scenes read from it inside useFrame.
 */
export const scrollState = {
  hero: 0,
  collection: 0,
  collectionIndex: 0,
  gallery: 0,
  galleryProgress: 0,
  page: 0,
  pointer: { x: 0, y: 0 },
  galleryRotation: 0,
  reducedMotion: false,
  introReady: false,
};

if (typeof window !== 'undefined') {
  scrollState.reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
}

let lenisInstance = null;

export function registerLenis(lenis) {
  lenisInstance = lenis;
}

export function lockScroll() {
  lenisInstance?.stop();
  document.documentElement.classList.add('scroll-locked');
}

export function unlockScroll() {
  lenisInstance?.start();
  document.documentElement.classList.remove('scroll-locked');
}

export function scrollToTarget(target, options = {}) {
  const element =
    typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const offset = options.offset ?? -70;
  if (lenisInstance) {
    lenisInstance.start();
    lenisInstance.scrollTo(element, {
      offset,
      duration: options.duration ?? 1.5,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  } else {
    const top = element.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { duration: 1.6 });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function scrollToPosition(top, options = {}) {
  if (lenisInstance) {
    lenisInstance.scrollTo(top, {
      duration: options.duration ?? 1.35,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  } else {
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const damp = (current, target, lambda, delta) =>
  current + (target - current) * (1 - Math.exp(-lambda * delta));

/** Horizontal page pointer, normalised to -1..1. */
export function usePointerParallax() {
  useEffect(() => {
    if (scrollState.reducedMotion) return undefined;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const onMove = (event) => {
      nextX = (event.clientX / window.innerWidth) * 2 - 1;
      nextY = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          scrollState.pointer.x = nextX;
          scrollState.pointer.y = nextY;
          frame = 0;
        });
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function useInView(options = {}) {
  const { threshold = 0.18, rootMargin = '0px 0px -8% 0px', once = true } =
    options;
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

export function useProgressiveInView({
  mountMargin = '1000px',
  activeMargin = '220px',
  threshold = 0,
} = {}) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      setActive(true);
      return undefined;
    }

    const mountObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          mountObserver.disconnect();
        }
      },
      { rootMargin: mountMargin, threshold },
    );

    const activeObserver = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: activeMargin, threshold },
    );

    mountObserver.observe(node);
    activeObserver.observe(node);

    return () => {
      mountObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [mountMargin, activeMargin, threshold]);

  return [ref, mounted, active];
}

export function useWebGLSupport() {
  const [supported] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext('webgl2') || canvas.getContext('webgl')),
      );
    } catch {
      return false;
    }
  });

  return supported;
}
