const PILLARS = [
  {
    id: "pillar-craft",
    label: "Craftsmanship",
    num: "01",
    title: "Slow by design",
    body: "Compositions rest for weeks between weighings. Rather than chase volume, the house releases a batch when it feels finished — and not one day before.",
  },
  {
    id: "pillar-ingredients",
    label: "Ingredients",
    num: "02",
    title: "Materials with a memory",
    body: "Each raw material enters the organ with a story: the field, the harvest, the hands that carried it. If we cannot name the memory it protects, it does not make the accord.",
  },
  {
    id: "pillar-composition",
    label: "Composition",
    num: "03",
    title: "Structure over noise",
    body: "A NOIRÉ fragrance is built like a score — a quiet opening, a trained heart, and a base that keeps the story long after the first impression has faded.",
  },
  {
    id: "pillar-individuality",
    label: "Individuality",
    num: "04",
    title: "Worn, never advertised",
    body: "The same scent is never the same twice. Skin, weather, and time quietly edit every composition — which is precisely the point.",
  },
];

export default function BrandPillars() {
  return (
    <section
      id="pillars"
      className="section section--light pillars edge"
      aria-labelledby="pillars-title"
    >
      <header className="sec-head">
        <p className="eyebrow" data-reveal>
          <span className="rule" aria-hidden="true" />
          Why NOIRÉ
        </p>
        <h2 id="pillars-title" className="display-lg" data-reveal>
          Built on four <em>quiet convictions.</em>
        </h2>
      </header>

      <div className="pillars-grid">
        <nav className="pillar-nav" aria-label="Brand pillars">
          <small className="micro">Key pillars</small>
          {PILLARS.map((pillar) => (
            <a
              key={pillar.id}
              href={`#${pillar.id}`}
              data-pillar-link
              className={pillar.id === "pillar-craft" ? "is-active" : undefined}
            >
              {pillar.label}
            </a>
          ))}
        </nav>

        <div className="pillar-list">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.id}
              id={pillar.id}
              className="pillar"
              data-pillar-block
              data-reveal
            >
              <span className="pillar-num">{pillar.num}</span>
              <h3 className="display-md">{pillar.title}</h3>
              <p className="copy">{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
