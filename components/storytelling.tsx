import Image from "next/image";

const PANELS = [
  {
    kicker: "01 — Distill",
    statement: (
      <>
        We distill memory into <em>material.</em>
      </>
    ),
    body: "Every composition starts as a place, a person, a season — reduced to its essence on the perfumer's organ before a single accord is weighed.",
  },
  {
    kicker: "02 — Compose",
    statement: (
      <>
        We compose for the room <em>after dark.</em>
      </>
    ),
    body: "Accords are built to burn slowly: openings that speak softly, hearts that hold their nerve, bases that stay until morning.",
  },
  {
    kicker: "03 — Finish",
    statement: (
      <>
        We finish the way a signature is <em>signed.</em>
      </>
    ),
    body: "Resting, weighing, and re-weighing. Nothing leaves the organ until it feels inevitable — until it could not have been written any other way.",
  },
];

export default function Storytelling() {
  return (
    <section
      className="section section--dark story"
      data-story
      aria-label="The craft, in three movements"
    >
      <div className="story-stage">
        <div className="story-inner edge">
          <div className="story-copy">
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              The craft
            </p>

            <div className="story-panels">
              {PANELS.map((panel, index) => (
                <figure className="story-panel" key={panel.kicker}>
                  <p className="story-kicker">{panel.kicker}</p>
                  <h3>{panel.statement}</h3>
                  <p className="copy-sm">{panel.body}</p>
                  <span className="sr-only" aria-hidden="true">
                    Movement {index + 1} of {PANELS.length}
                  </span>
                </figure>
              ))}
            </div>

            <div className="story-dots" aria-hidden="true">
              {PANELS.map((panel, index) => (
                <span
                  className={`story-dot${index === 0 ? " is-active" : ""}`}
                  key={panel.kicker}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              ))}
              <span className="story-bar">
                <span className="story-bar-fill" />
              </span>
            </div>
          </div>

          <div className="story-media" aria-hidden="true">
            <div className="story-boss" />
            <div className="story-bottle-float">
              <Image
                src="/images/noire-noir.jpg"
                alt=""
                fill
                sizes="(max-width: 1024px) 78vw, 34vw"
                quality={90}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
