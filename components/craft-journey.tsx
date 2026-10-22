const STEPS = [
  {
    num: "1",
    title: "Inspiration",
    lead: "A composition begins long before the first material is opened.",
    items: [
      "A memory is written down before it is sourced — the room, the season, the person.",
      "Moodboards of place and texture: wet stone, cold brass, late light.",
      "A brief is agreed: what the scent must protect, and what it must never say.",
    ],
  },
  {
    num: "2",
    title: "Composition",
    lead: "Accords are built in layers, from the brightest note to the deepest.",
    items: [
      "Materials are weighed one by one on the perfumer's organ.",
      "Trials are logged in full — nothing is trusted to memory twice.",
      "Contradictions are kept if they earn their place; removed if they don't.",
    ],
  },
  {
    num: "3",
    title: "Refinement",
    lead: "Time is treated as an ingredient, not a delay.",
    items: [
      "Each trial rests for weeks before it is judged.",
      "Weighings are repeated until the formula stops moving.",
      "The formula is frozen and signed off like a manuscript.",
    ],
  },
  {
    num: "4",
    title: "The finished fragrance",
    lead: "A release is a decision, not an event.",
    items: [
      "Bottles are filled and sealed in small, numbered batches.",
      "Each flacon is checked by hand before it leaves the atelier.",
      "A composition ships only when the house itself would wear it.",
    ],
  },
];

export default function CraftJourney() {
  return (
    <section
      id="craft"
      className="section section--light craft edge"
      aria-labelledby="craft-title"
    >
      <header className="sec-head">
        <p className="eyebrow" data-reveal>
          <span className="rule" aria-hidden="true" />
          How it is made
        </p>
        <h2 id="craft-title" className="display-lg" data-reveal>
          From the first accord to the <em>finished bottle.</em>
        </h2>
        <p className="copy craft-note" data-reveal>
          An editorial telling of the house craft — a fictional narrative,
          composed for this concept in the way the maison likes to imagine its
          work.
        </p>
      </header>

      <div className="craft-steps">
        {STEPS.map((step) => (
          <article className="craft-step" key={step.num} data-reveal>
            <div className="craft-num num-ghost" aria-hidden="true">
              {step.num}
            </div>
            <div className="craft-step-title">
              <h3 className="display-md">{step.title}</h3>
              <p className="copy">{step.lead}</p>
              <ol className="craft-items">
                {step.items.map((item, index) => (
                  <li className="craft-item" key={item}>
                    <span className="craft-item-num">
                      {step.num}.{index + 1}
                    </span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
