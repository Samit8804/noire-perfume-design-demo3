"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export const scrollControl: { lenis: Lenis | null } = { lenis: null };

const HEADER_OFFSET = -88;

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function setMenuScrollLock(locked: boolean) {
  const documentElement = document.documentElement;
  documentElement.classList.remove("menu-open");
  if (locked) {
    if (scrollControl.lenis) scrollControl.lenis.stop();
    else documentElement.classList.add("menu-open");
  } else if (scrollControl.lenis) {
    scrollControl.lenis.start();
  }
}

export default function MotionProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;

    ScrollTrigger.config({ ignoreMobileResize: true });

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      document.documentElement.classList.add("motion-reduced");
    }

    let lenis: Lenis | null = null;
    let onDocClick: ((event: MouseEvent) => void) | null = null;

    let tick: ((time: number) => void) | null = null;

    if (!prefersReduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      scrollControl.lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);

      tick = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      onDocClick = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;

        const anchor = (event.target as HTMLElement | null)?.closest(
          'a[href^="#"]'
        ) as HTMLAnchorElement | null;
        if (!anchor) return;

        const hash = anchor.getAttribute("href");
        if (!hash || hash === "#") return;

        const target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();
        if (scrollControl.lenis) {
          scrollControl.lenis.scrollTo(target as HTMLElement, {
            offset: HEADER_OFFSET,
            duration: 1.4,
          });
        } else {
          const top =
            target.getBoundingClientRect().top +
            window.scrollY +
            HEADER_OFFSET;
          window.scrollTo({ top, behavior: "auto" });
        }
      };

      document.addEventListener("click", onDocClick);
    }

    if (!prefersReduced) {
      document.documentElement.classList.add("has-motion");
    }

    const mm = gsap.matchMedia(rootEl);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(rootEl);

      /* ---------- Header state ---------- */
      const header = q<HTMLElement>(".site-header")[0];
      if (header) {
        ScrollTrigger.create({
          start: 88,
          end: "max",
          onToggle: (self) =>
            header.classList.toggle("is-scrolled", self.isActive),
        });
      }

      /* ---------- Hero entrance ---------- */
      const heroIntro = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (header) {
        heroIntro.from(header, { y: -16, autoAlpha: 0, duration: 0.9 }, 0.15);
      }

      heroIntro
        .fromTo(
          q('[data-hero="frame"]'),
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            ease: "power4.inOut",
          },
          0.35
        )
        .from(
          q('[data-hero="wing"]'),
          { scale: 1.22, duration: 2.1, ease: "power2.out" },
          0.35
        )
        .from(
          q("[data-hero-reveal]"),
          { y: 44, autoAlpha: 0, duration: 1, stagger: 0.1 },
          0.75
        );

      /* ---------- Hero scroll parallax + pinned zoom ---------- */
      const heroSection = q(".hero")[0];
      if (heroSection) {
        gsap.fromTo(
          q('[data-hero="frame"]'),
          { yPercent: 0 },
          {
            yPercent: 9,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }
        );

        gsap.fromTo(
          q("[data-hero-parallax-content]"),
          { yPercent: 0 },
          {
            yPercent: -8,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }
        );

        gsap.fromTo(
          q('[data-hero="frame"]'),
          { scale: 1 },
          {
            scale: 1.12,
            ease: "none",
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      }

      /* ---------- Generic reveals ---------- */
      q<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 40,
          autoAlpha: 0,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });

      q<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const children = group.querySelectorAll("[data-reveal-child]");
        if (!children.length) return;
        gsap.from(children, {
          y: 42,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.11,
          scrollTrigger: {
            trigger: group,
            start: "top 84%",
            once: true,
          },
        });
      });

      /* ---------- Parallax frames ---------- */
      q<HTMLElement>("[data-parallax-frame]").forEach((frame) => {
        const inner = frame.querySelector("[data-parallax-inner]");
        if (!inner) return;
        const strength =
          Number(frame.getAttribute("data-parallax-frame")) || 8;
        gsap.fromTo(
          inner,
          { yPercent: -strength },
          {
            yPercent: strength,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      /* ---------- Storytelling scrub ---------- */
      const story = q<HTMLElement>(".story")[0];
      if (story) {
        const panels = q<HTMLElement>(".story-panel");
        const bottle = q(".story-bottle-float img")[0];
        const barFill = q(".story-bar-fill")[0];
        const dots = q<HTMLElement>(".story-dot");

        if (panels.length && bottle) {
          const storyTl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: story,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              onUpdate: (self) => {
                const index = Math.max(
                  0,
                  Math.min(
                    dots.length - 1,
                    Math.floor(self.progress * dots.length)
                  )
                );
                dots.forEach((dot: HTMLElement, i: number) =>
                  dot.classList.toggle("is-active", i === index)
                );
                if (barFill) gsap.set(barFill, { scaleX: self.progress });
              },
            },
          });

          panels.forEach((panel, i) => {
            const at = i * 1;
            storyTl.fromTo(
              panel,
              { autoAlpha: 0, y: 64 },
              { autoAlpha: 1, y: 0, duration: 0.4 },
              at
            );
            if (i < panels.length - 1) {
              storyTl.to(
                panel,
                { autoAlpha: 0, y: -64, duration: 0.26 },
                at + 0.72
              );
            }
          });

          storyTl.fromTo(
            bottle,
            { yPercent: 5, scale: 0.96, rotate: -1.5 },
            { yPercent: -7, scale: 1.05, rotate: 1.5, duration: 3, ease: "none" },
            0
          );

          storyTl.to({}, { duration: 0.6 }, 2.4);
        }
      }

      /* ---------- Brand-film cards (scroll-synced text over video) ---------- */
      const film = q<HTMLElement>(".story-film")[0];
      if (film) {
        const cards = q<HTMLElement>(".story-film-card");
        if (cards.length) {
          const filmTl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: film,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
            },
          });

          cards.forEach((card, i) => {
            filmTl.fromTo(
              card,
              { autoAlpha: 0, y: 48 },
              { autoAlpha: 1, y: 0, duration: 0.38 },
              i + 0.08
            );
            if (i < cards.length - 1) {
              filmTl.to(card, { autoAlpha: 0, y: -48, duration: 0.22 }, i + 0.78);
            }
          });

          filmTl.to({}, { duration: 0.54 }, 2.46);
        }
      }

      /* ---------- Pillar nav active state ---------- */
      const pillarBlocks = q<HTMLElement>("[data-pillar-block]");
      const pillarLinks = q<HTMLElement>("[data-pillar-link]");
      pillarBlocks.forEach((block, i) => {
        const link = pillarLinks[i];
        if (!link) return;
        ScrollTrigger.create({
          trigger: block,
          start: "top 58%",
          end: "bottom 58%",
          onToggle: (self) =>
            link.classList.toggle("is-active", self.isActive),
        });
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    let fontsRefreshed = false;
    if (document.fonts) {
      document.fonts.ready.then(() => {
        fontsRefreshed = true;
        ScrollTrigger.refresh();
      });
    }

    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
      if (onDocClick) document.removeEventListener("click", onDocClick);
      if (tick) gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(0);
      lenis?.destroy();
      scrollControl.lenis = null;
      document.documentElement.classList.remove("has-motion", "motion-reduced");
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
