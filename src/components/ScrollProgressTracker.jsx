import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  clamp,
  registerLenis,
  scrollState,
} from '../hooks/useScrollProgress';

gsap.registerPlugin(ScrollTrigger);

function emitCollection(progress) {
  const active = Math.min(2, Math.max(0, Math.round(progress * 2)));
  scrollState.collectionIndex = active;
  window.dispatchEvent(
    new CustomEvent('noire:collection', {
      detail: { progress, active },
    }),
  );
}

export default function ScrollProgressTracker() {
  useEffect(() => {
    const reduced = scrollState.reducedMotion;

    const lenis = new Lenis({
      duration: reduced ? 0.01 : 1.1,
      smoothWheel: !reduced,
      syncTouch: false,
      touchMultiplier: 1.35,
      wheelMultiplier: 0.95,
      autoRaf: false,
    });

    registerLenis(lenis);

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.config({ ignoreMobileResize: true });

    const triggers = [];

    triggers.push(
      ScrollTrigger.create({
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          scrollState.hero = self.progress;
          document.documentElement.style.setProperty(
            '--hero-progress',
            self.progress.toFixed(4),
          );
        },
      }),
    );

    triggers.push(
      ScrollTrigger.create({
        trigger: '#collection',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          scrollState.collection = clamp(self.progress);
          const active = scrollState.collectionIndex;
          const nextActive = Math.min(
            2,
            Math.max(0, Math.round(scrollState.collection * 2)),
          );
          document.documentElement.style.setProperty(
            '--collection-progress',
            self.progress.toFixed(4),
          );
          if (nextActive !== active) {
            scrollState.collectionIndex = nextActive;
          }
          emitCollection(self.progress);
        },
      }),
    );

    const onPageScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? clamp(window.scrollY / max) : 0;
      scrollState.page = progress;
      document.documentElement.style.setProperty(
        '--page-progress',
        progress.toFixed(4),
      );
    };
    lenis.on('scroll', onPageScroll);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    const refreshTimer = window.setTimeout(refresh, 700);

    return () => {
      window.clearTimeout(refreshTimer);
      triggers.forEach((trigger) => trigger.kill());
      gsap.ticker.remove(raf);
      lenis.off('scroll', onScroll);
      lenis.off('scroll', onPageScroll);
      lenis.destroy();
      registerLenis(null);
    };
  }, []);

  return null;
}
