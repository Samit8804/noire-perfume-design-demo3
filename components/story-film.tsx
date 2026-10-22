import ScrollVideo from "@/components/scroll-video";

const CARDS = [
  {
    kicker: "01 — Dusk",
    line: (
      <>
        Light leaves the room. <em>The scent stays.</em>
      </>
    ),
    body: "The film follows the house hour — the moment day gives up, and memory begins.",
  },
  {
    kicker: "02 — Trace",
    line: (
      <>
        Not the noise. <em>The outline it leaves.</em>
      </>
    ),
    body: "Smoke, gold, and shadow — filmed the way the compositions are built: slowly, and in the dark.",
  },
  {
    kicker: "03 — Keep",
    line: (
      <>
        Some hours <em>refuse to end.</em>
      </>
    ),
    body: "We bottle them. Scroll on — the archive continues.",
  },
];

export default function StoryFilm() {
  return (
    <section
      className="section section--dark story-film"
      data-video-scrub
      aria-label="NOIRÉ — the film"
    >
      <div className="story-film-stage">
        <ScrollVideo
          className="scroll-video-fill"
          src="/videos/story-film.mp4"
          poster="/images/story-poster.jpg"
          fallbackSrc="/images/story-poster.jpg"
          eager={false}
          sizes="100vw"
        />
        <div className="story-film-wash" aria-hidden="true" />

        <div className="story-film-content edge">
          <p className="eyebrow" data-reveal>
            <span className="rule" aria-hidden="true" />
            The film
          </p>
          <div className="story-film-cards">
            {CARDS.map((card) => (
              <figure className="story-film-card" key={card.kicker} data-film-card>
                <p className="story-kicker">{card.kicker}</p>
                <h3>{card.line}</h3>
                <p className="copy-sm">{card.body}</p>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
