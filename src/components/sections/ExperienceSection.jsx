import { useEffect, useRef } from 'react';
import Reveal from '../ui/Reveal';
import {
  ArrowIcon,
  EditIcon,
  FlaconIcon,
  GiftIcon,
  LightIcon,
} from '../ui/Icons';
import { navigateToAnchor } from '../../utils/navigation';
import { scrollState } from '../../hooks/useScrollProgress';

const features = [
  {
    index: '01',
    title: 'The Signature Flacon',
    copy: 'A sculptural silhouette created to be held, seen and remembered. Glass, light and proportion in quiet balance.',
    Icon: FlaconIcon,
  },
  {
    index: '02',
    title: 'Light & Reflection',
    copy: 'Warm light moves across each flacon, revealing depth and colour with every shift of angle.',
    Icon: LightIcon,
  },
  {
    index: '03',
    title: 'A Considered Ritual',
    copy: 'Presentation, pace and atmosphere compose the NOIRE moment — an experience as deliberate as the fragrance itself.',
    Icon: GiftIcon,
  },
  {
    index: '04',
    title: 'The Private Edit',
    copy: 'Three expressions of one house, each with a distinct presence. Discover the one that belongs to you.',
    Icon: EditIcon,
  },
];

export default function ExperienceSection() {
  const heroVideoRef = useRef(null);
  const storyVideoRef = useRef(null);

  useEffect(() => {
    const videos = [heroVideoRef.current, storyVideoRef.current].filter(
      Boolean,
    );

    if (scrollState.reducedMotion) {
      videos.forEach((video) => video.pause());
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            const playback = video.play();
            if (playback) playback.catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 },
    );

    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="experience" className="experience">
      <div className="experience__head">
        <Reveal>
          <span className="eyebrow">
            <i />
            The NOIRE Experience
          </span>
          <h2>
            Luxury, in
            <em>every detail.</em>
          </h2>
        </Reveal>
        <Reveal delay={110} className="experience__intro">
          <p>
            From the weight of the flacon to the final trace of light, the
            NOIRE experience is composed to make the ordinary feel otherwise.
          </p>
          <a
            className="link-arrow"
            href="#gallery"
            onClick={(event) => navigateToAnchor(event, '#gallery')}
          >
            Explore the flacons
            <ArrowIcon />
          </a>
        </Reveal>
      </div>

      <div className="experience__grid">
        {features.map(({ index, title, copy, Icon }, i) => (
          <Reveal
            key={title}
            className="experience-card"
            delay={i * 90}
            variant="fade"
          >
            <div className="experience-card__top">
              <span className="experience-card__icon">
                <Icon />
              </span>
              <span className="experience-card__index">{index}</span>
            </div>
            <h3>{title}</h3>
            <p>{copy}</p>
            <span className="experience-card__line" aria-hidden="true" />
          </Reveal>
        ))}
      </div>

      <div className="experience__cinema">
        <Reveal className="experience__cinema-item" variant="fade">
          <video
            ref={heroVideoRef}
            className="experience__cinema-video"
            src="/video/hero-film.mp4"
            poster="/video/hero-frames/ezgif-frame-001.jpg"
            muted
            loop
            playsInline
            preload="metadata"
          />
        </Reveal>
        <Reveal className="experience__cinema-item" delay={140} variant="fade">
          <video
            ref={storyVideoRef}
            className="experience__cinema-video"
            src="/video/story-film.mp4"
            poster="/video/hero-frames/ezgif-frame-002.jpg"
            muted
            loop
            playsInline
            preload="metadata"
          />
        </Reveal>
      </div>

      <Reveal className="experience__statement" variant="fade">
        <span className="experience__statement-rule" aria-hidden="true" />
        <p>
          “The most memorable presence is never the loudest. It is the one that
          remains.”
        </p>
        <span className="experience__statement-sig">NOIRE — The Noire Collection</span>
        <span className="experience__statement-rule" aria-hidden="true" />
      </Reveal>
    </section>
  );
}
