import HeroFrameSequence from "@/components/hero-frame-sequence";

export default function Hero() {
  return (
    <section
      id="home"
      className="hero"
      data-hero
      data-video-scrub
      aria-labelledby="hero-title"
    >
      <div className="hero-stage">
        <div className="hero-media" data-hero="frame" aria-hidden="true">
          <div className="hero-imgwrap" data-hero="wing">
            <HeroFrameSequence />
          </div>
          <div className="hero-wash" aria-hidden="true" />
        </div>
        <div className="hero-grain" aria-hidden="true" />

        <div className="hero-content edge" data-hero-parallax-content>
          <p className="eyebrow" data-hero-reveal>
            <span className="rule" aria-hidden="true" />
            Maison de parfum — est. 2024
          </p>
          <h1 id="hero-title" className="display-xl" data-hero-reveal>
            Scent is
            <br />
            a <em>memory.</em>
          </h1>
          <p className="hero-copy" data-hero-reveal>
            An ode to the moments that linger — composed in shadow, worn like a
            secret. Three fragrances, one idea: memory, made wearable.
          </p>
          <p data-hero-reveal>
            <a className="btn" href="#collection">
              <span>Discover the collection</span>
              <span className="btn-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </p>
        </div>

        <div className="hero-foot edge" data-hero-reveal>
          <span className="scroll-cue">
            Scroll to explore
            <span className="scroll-line" aria-hidden="true" />
          </span>
          <span className="hero-caption">No. 01 — The NOIRÉ signature</span>
        </div>

        <div className="hero-index" aria-hidden="true">
          <span>01</span>
          <span className="index-rule" />
          <span>06</span>
        </div>
      </div>
    </section>
  );
}
