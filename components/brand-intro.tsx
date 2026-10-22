import Image from "next/image";

const PRINCIPLES = [
  {
    num: "01",
    title: "Shadow first",
    body: "Every composition begins in darkness. Light is added drop by drop, until the fragrance glows instead of shines.",
  },
  {
    num: "02",
    title: "Rare, and weighed by hand",
    body: "Materials are chosen one by one on the perfumer's organ — never by volume, never by trend.",
  },
  {
    num: "03",
    title: "Nothing without a story",
    body: "If a note cannot name the memory it protects, it does not board. The house keeps only what it can defend.",
  },
];

export default function BrandIntro() {
  return (
    <section
      id="story"
      className="section section--light intro edge"
      aria-labelledby="intro-title"
    >
      <header className="sec-head">
        <p className="eyebrow" data-reveal>
          <span className="rule" aria-hidden="true" />
          The maison
        </p>
        <h2 id="intro-title" className="display-lg intro-title" data-reveal>
          Perfume, practiced as a <em>quiet art.</em>
        </h2>
        <p className="copy intro-stand" data-reveal>
          NOIRÉ works in the register of memory — fewer notes, longer shadows,
          slower drydowns. The house bottles the hour after dusk, not the
          daylight around it, and lets the wearer finish the sentence.
        </p>
      </header>

      <div className="intro-grid">
        <ol className="principles" data-reveal-group>
          {PRINCIPLES.map((principle) => (
            <li className="principle" key={principle.num} data-reveal-child>
              <span className="principle-num" aria-hidden="true">
                {principle.num}
              </span>
              <div>
                <h3>{principle.title}</h3>
                <p className="copy-sm">{principle.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <figure
          className="intro-media parallax-frame"
          data-parallax-frame="7"
          data-reveal
        >
          <div className="parallax-inner" data-parallax-inner>
            <Image
              src="/images/golden-oud.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 92vw, 42vw"
              quality={90}
            />
          </div>
          <figcaption aria-hidden="true">
            Golden Oud, no. II — a light study
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
