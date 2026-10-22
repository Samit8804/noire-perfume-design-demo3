import Image from "next/image";

export default function FinalCta() {
  return (
    <section className="section section--dark cta" aria-labelledby="cta-title">
      <div
        className="cta-media parallax-frame"
        data-parallax-frame="9"
        aria-hidden="true"
      >
        <div className="parallax-inner" data-parallax-inner>
          <Image
            className="cta-img"
            src="/images/hero-perfume.png"
            alt=""
            fill
            sizes="100vw"
          />
        </div>
        <div className="cta-wash" aria-hidden="true" />
      </div>

      <div className="cta-inner edge" data-reveal-group>
        <p className="eyebrow" data-reveal-child>
          <span className="rule" aria-hidden="true" />
          Begin
        </p>
        <h2 id="cta-title" className="display-xl" data-reveal-child>
          The right scent changes <em>everything.</em>
        </h2>
        <p className="copy" data-reveal-child>
          Three fragrances. One idea — memory, made wearable. Start with the
          collection, or write to the house directly.
        </p>
        <div className="cta-actions" data-reveal-child>
          <a className="btn btn--solid" href="#collection">
            <span>Explore the collection</span>
            <span className="btn-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
          <a className="btn" href="mailto:atelier@noire-maison.com">
            <span>Write to the house</span>
            <span className="btn-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </div>

      <p className="cta-side" aria-hidden="true">
        NO. 06 — END OF VOLUME I
      </p>
    </section>
  );
}
