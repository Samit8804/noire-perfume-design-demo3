const ENTRIES = [
  {
    day: "09",
    month: "Jul",
    year: "2026",
    category: "Field notes",
    title: "Why smoke reads as memory — resin, ash and the hours after dusk",
  },
  {
    day: "03",
    month: "Jun",
    year: "2026",
    category: "The art of wearing",
    title: "Layering two fragrances without conflict — a quiet protocol",
  },
  {
    day: "22",
    month: "May",
    year: "2026",
    category: "Ingredient study",
    title: "Oud, decoded — from raw resin to the accord in Golden Oud",
  },
];

export default function Journal() {
  return (
    <section
      id="journal"
      className="section section--dark journal edge"
      aria-labelledby="journal-title"
    >
      <header className="sec-head">
        <p className="eyebrow" data-reveal>
          <span className="rule" aria-hidden="true" />
          The journal
        </p>
        <h2 id="journal-title" className="display-lg" data-reveal>
          Notes from <em>the organ.</em>
        </h2>
      </header>

      <div className="journal-list" data-reveal-group>
        {ENTRIES.map((entry) => (
          <article
            className="journal-row"
            key={entry.title}
            data-reveal-child
          >
            <p className="journal-date">
              <span className="journal-day">{entry.day}</span>
              <span className="journal-ym">
                <span>{entry.month}</span>
                <span>{entry.year}</span>
              </span>
            </p>
            <div className="journal-main">
              <p className="micro">{entry.category}</p>
              <h3 className="display-sm">{entry.title}</h3>
            </div>
            <span className="journal-arrow" aria-hidden="true">
              ↗
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
