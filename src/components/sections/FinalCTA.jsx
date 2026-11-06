import { useEffect, useRef } from 'react';
import Reveal from '../ui/Reveal';
import { ArrowIcon } from '../ui/Icons';
import { site } from '../../data/site';
import { navigateToAnchor } from '../../utils/navigation';
import { scrollState } from '../../hooks/useScrollProgress';
import { startScrollVideoScrub } from '../../utils/videoScroll';

export default function FinalCTA() {
  const finalCtaRef = useRef(null);
  const finalVideoRef = useRef(null);

  useEffect(() => {
    const video = finalVideoRef.current;
    const cleanup = startScrollVideoScrub(video, finalCtaRef.current);
    if (video) {
      if (scrollState.reducedMotion) video.pause();
    }
    return () => {
      cleanup();
      if (video) video.pause();
    };
  }, []);

  return (
    <section id="contact" className="final-cta" ref={finalCtaRef}>
      <div className="final-cta__glow" aria-hidden="true" />
      <div className="final-cta__image" aria-hidden="true">
        <video
          ref={finalVideoRef}
          className="final-cta__video"
          src="/video/hero-film.mp4"
          poster="/video/hero-frames/ezgif-frame-001.jpg"
          muted
          loop
          playsInline
          preload="auto"
        />
        <span />
      </div>

      <div className="final-cta__inner">
        <Reveal className="final-cta__content">
          <span className="eyebrow">
            <i />
            The Invitation
          </span>
          <h2>
            Wear the
            <em>Extraordinary.</em>
          </h2>
          <p>Discover the fragrance that defines your presence.</p>
          <div className="final-cta__actions">
            <a
              className="button button--gold"
              href="#collection"
              onClick={(event) => navigateToAnchor(event, '#collection')}
            >
              <span>Explore The Collection</span>
              <ArrowIcon />
            </a>
            {site.enquiryEmail && (
              <a
                className="link-arrow"
                href={`mailto:${site.enquiryEmail}?subject=${encodeURIComponent(
                  'Private client enquiry — NOIRE PERFUME',
                )}`}
              >
                Private client enquiry
                <ArrowIcon />
              </a>
            )}
          </div>
        </Reveal>

        <div className="final-cta__foot">
          <span>Black Noire</span>
          <span>Golden Noire</span>
          <span>Velvet Amber Noire</span>
          <span className="final-cta__foot-mark">NOIRE PERFUME</span>
        </div>
      </div>
    </section>
  );
}
