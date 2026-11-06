import Reveal from '../ui/Reveal';
import { ArrowIcon } from '../ui/Icons';
import { products } from '../../data/products';
import { navigateToAnchor } from '../../utils/navigation';

export default function AboutSection() {
  const golden = products[1];

  return (
    <section id="about" className="about">
      <span className="about__watermark" aria-hidden="true">
        B
      </span>

      <div className="about__inner">
        <Reveal className="about__media" variant="left">
          <figure>
            <div className="about__frame">
              <div className="about__frame-inner">
                <img
                  src={golden.image}
                  alt={`${golden.name} perfume flacon in warm golden light`}
                  loading="lazy"
                />
              </div>
              <span className="about__frame-line" aria-hidden="true" />
            </div>
            <figcaption>
              <span>{golden.name}</span>
              <span>No. {golden.index}</span>
            </figcaption>
          </figure>

          <div className="about__aside">
            <span className="about__aside-number">03</span>
            <p>
              Signature expressions
              <br />
              One singular house
            </p>
          </div>
        </Reveal>

        <div className="about__content">
          <Reveal>
            <span className="eyebrow">
              <i />
              About NOIRE
            </span>
            <h2>
              A Fragrance
              <em>Beyond Time</em>
            </h2>
          </Reveal>

          <Reveal delay={100} className="about__copy">
            <p>
              NOIRE is more than a perfume. It is an expression of
              individuality, sophistication and timeless elegance. Every
              fragrance represents a distinctive character, created for those
              who appreciate the extraordinary.
            </p>
            <p>
              The maison approaches scent as an atmosphere — an invisible
              signature that enters a room before you do and remains after you
              leave. Three compositions. Three characters. One unmistakable
              presence.
            </p>
          </Reveal>

          <Reveal delay={160} className="about__quote">
            <blockquote>
              “Elegance is not a statement. It is the quiet certainty of being
              yourself.”
            </blockquote>
          </Reveal>

          <Reveal delay={220} className="about__actions">
            <a
              className="button button--outline"
              href="#philosophy"
              onClick={(event) => navigateToAnchor(event, '#philosophy')}
            >
              <span>Our Philosophy</span>
              <ArrowIcon />
            </a>
            <span className="about__signature">The House of NOIRE</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
