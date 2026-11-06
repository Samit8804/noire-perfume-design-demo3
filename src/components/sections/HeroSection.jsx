import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PerfumeCanvas from '../three/PerfumeCanvas';
import HeroScene from '../three/HeroScene';
import { ArrowIcon } from '../ui/Icons';
import { navigateToAnchor } from '../../utils/navigation';
import { products } from '../../data/products';
import {
  scrollState,
  useInView,
} from '../../hooks/useScrollProgress';

gsap.registerPlugin(ScrollTrigger);

const PARTICLE_SEEDS = [
  [8, 68, 7], [16, 32, 5], [24, 78, 9], [31, 18, 6], [38, 60, 8],
  [45, 25, 4], [52, 71, 6], [58, 44, 9], [63, 84, 5], [69, 12, 7],
  [74, 58, 4], [80, 30, 8], [86, 72, 6], [90, 46, 5], [94, 20, 7],
  [12, 50, 4], [28, 42, 5], [47, 88, 4],
];

export default function HeroSection({ ready, webgl = true }) {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const [canvasRef, canvasInView] = useInView({
    threshold: 0,
    rootMargin: '250px 0px',
    once: false,
  });

  const particles = useMemo(
    () =>
      PARTICLE_SEEDS.map(([left, top, duration], index) => ({
        left: `${left}%`,
        top: `${top}%`,
        animationDuration: `${duration + 7}s`,
        animationDelay: `${-index * 1.7}s`,
        opacity: 0.18 + (index % 4) * 0.08,
        size: index % 3 === 0 ? 2.5 : 1.4,
      })),
    [],
  );

  useEffect(() => {
    if (!ready || scrollState.reducedMotion) return undefined;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });
      timeline
        .from('.hero__eyebrow', { opacity: 0, y: 16, duration: 0.9 })
        .from(
          '.hero__title-mask > span',
          { yPercent: 112, duration: 1.35, stagger: 0.14 },
          '-=0.55',
        )
        .from(
          '.hero__subtitle',
          { opacity: 0, letterSpacing: '1.1em', duration: 1.2 },
          '-=0.9',
        )
        .from('.hero__rule', { scaleX: 0, duration: 0.9 }, '-=0.85')
        .from(
          ['.hero__desc', '.hero__actions', '.hero__foot'],
          { opacity: 0, y: 18, duration: 0.9, stagger: 0.12 },
          '-=0.65',
        )
        .from(
          '.hero__stage',
          { opacity: 0, scale: 0.96, duration: 1.4 },
          '-=1.5',
        )
        .from(
          ['.hero__stage-caption', '.hero__stage-vertical'],
          { opacity: 0, duration: 0.8, stagger: 0.1 },
          '-=0.8',
        );
    }, sectionRef);

    return () => context.revert();
  }, [ready]);

  useEffect(() => {
    if (scrollState.reducedMotion) return undefined;
    const context = gsap.context(() => {
      gsap.to('.hero__content', {
        yPercent: -13,
        opacity: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
      gsap.to('.hero__stage', {
        yPercent: -7,
        opacity: 0.45,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
      gsap.to('.hero__foot', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '22% top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section
      id="home"
      className="hero"
      ref={sectionRef}
      aria-label="NOIRE PERFUME — Black Noire"
    >
      <div className="hero__ambient" aria-hidden="true" />

      <div className="hero__particles" aria-hidden="true">
        {particles.map((particle, index) => (
          <span
            key={index}
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              animationDuration: particle.animationDuration,
              animationDelay: particle.animationDelay,
            }}
          />
        ))}
      </div>

      <div className="hero__inner">
        <div className="hero__content" ref={contentRef}>
          <p className="hero__eyebrow">
            <span aria-hidden="true" />
            More than a fragrance
          </p>

          <h1 className="hero__title" aria-label="NOIRE PERFUME">
            <span className="hero__title-mask">
              <span>NOIRE</span>
            </span>
            <span className="hero__subtitle">Perfume</span>
          </h1>

          <span className="hero__rule" aria-hidden="true" />

          <p className="hero__desc">
            An essence of luxury, crafted for those who dare to be
            unforgettable.
          </p>

          <div className="hero__actions">
            <a
              className="button button--gold"
              href="#collection"
              onClick={(event) => navigateToAnchor(event, '#collection')}
            >
              <span>Explore Collection</span>
              <ArrowIcon />
            </a>
            <a
              className="link-arrow"
              href="#about"
              onClick={(event) => navigateToAnchor(event, '#about')}
            >
              Discover Our Story
              <ArrowIcon />
            </a>
          </div>

          <div className="hero__meta">
            <span>The Noire Collection</span>
            <span className="hero__meta-line" />
            <span>Three Expressions</span>
          </div>
        </div>

        <div className="hero__stage" ref={canvasRef}>
          <div className="hero__stage-aura" aria-hidden="true" />
          <div className="hero__orbit hero__orbit--outer" aria-hidden="true" />
          <div className="hero__orbit hero__orbit--inner" aria-hidden="true" />

          {webgl ? (
            <PerfumeCanvas
              active={canvasInView}
              camera={{ position: [0, 0.08, 4.35], fov: 30, near: 0.1, far: 30 }}
              className="hero__canvas"
            >
              <HeroScene ready={ready} />
            </PerfumeCanvas>
          ) : (
            <div className="webgl-fallback webgl-fallback--hero">
              <img
                className="webgl-fallback__portrait"
                src={products[0].image}
                alt="Black Noire perfume flacon in warm light"
                loading="eager"
                decoding="async"
              />
              <span className="webgl-fallback__eyebrow">Black Noire</span>
              <span className="webgl-fallback__title">NOIRE</span>
              <p>
                The interactive 3D flacon requires WebGL. The complete
                collection remains available below.
              </p>
              <a
                className="link-arrow"
                href="#collection"
                onClick={(event) => navigateToAnchor(event, '#collection')}
              >
                Explore the collection <ArrowIcon />
              </a>
            </div>
          )}

          <div className="hero__stage-caption">
            <span>Black Noire</span>
            <span>01 / 03</span>
          </div>
          <span className="hero__stage-vertical">The Noire Collection</span>
        </div>
      </div>

      <div className="hero__foot">
        <span className="hero__foot-label">Scroll to discover</span>
        <span className="hero__scroll-line" aria-hidden="true">
          <i />
        </span>
        <span className="hero__foot-index">Black Noire — 01</span>
      </div>
    </section>
  );
}
