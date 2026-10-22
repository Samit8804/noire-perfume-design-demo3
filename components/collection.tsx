import Image from "next/image";

const CONTACT_EMAIL = "atelier@noire-maison.com";

const FRAGRANCES = [
  {
    numeral: "I",
    name: "NOIR",
    type: "Eau de Parfum",
    notes: ["Black iris", "Smoked cedar", "Truffle accord"],
    price: "€195",
    volume: "50 ml",
    description:
      "The house signature — a dry, botanical darkness that warms the longer it is worn. Quiet at first touch, then unmistakable.",
    image: "/images/noire-noir.jpg",
    alt: "NOIRÉ Noir eau de parfum — a matte black flacon with a gold plaque",
    position: "center 38%",
  },
  {
    numeral: "II",
    name: "GOLDEN OUD",
    type: "Extrait de Parfum",
    notes: ["Saffron", "Resin oud", "Aged amber"],
    price: "€240",
    volume: "50 ml",
    description:
      "Light behaving badly. A molten heart of amber and resin oud, lifted by saffron — the warmest page in the house archive.",
    image: "/images/golden-oud.jpg",
    alt: "NOIRÉ Golden Oud extrait de parfum — glowing amber liquid over dark wood",
    position: "center 55%",
  },
  {
    numeral: "III",
    name: "VELVET AMBER",
    type: "Eau de Parfum",
    notes: ["Tonka", "Amber", "White musk"],
    price: "€175",
    volume: "50 ml",
    description:
      "The gentlest study in the collection — tonka and musk folded into amber, worn close to the skin like something remembered.",
    image: "/images/velvet-amber.jpg",
    alt: "NOIRÉ Velvet Amber eau de parfum — an amber flacon on a black stone pedestal",
    position: "center 45%",
  },
];

export default function Collection() {
  return (
    <section
      id="collection"
      className="section section--dark collection"
      aria-labelledby="collection-title"
    >
      <div className="edge">
        <header className="sec-head">
          <p className="eyebrow" data-reveal>
            <span className="rule" aria-hidden="true" />
            The collection — Vol. I
          </p>
          <h2 id="collection-title" className="display-lg" data-reveal>
            Three studies in shadow <em>and gold.</em>
          </h2>
        </header>

        <div className="perfume-list">
          {FRAGRANCES.map((fragrance, index) => (
            <article
              key={fragrance.name}
              className={`perfume-row${
                index % 2 === 1 ? " perfume-row--flip" : ""
              }`}
              data-reveal
            >
              <div className="perfume-num num-ghost" aria-hidden="true">
                {fragrance.numeral}
              </div>

              <div
                className="perfume-media parallax-frame"
                data-parallax-frame="6"
              >
                <div className="parallax-inner" data-parallax-inner>
                  <Image
                    src={fragrance.image}
                    alt={fragrance.alt}
                    fill
                    sizes="(max-width: 1024px) 92vw, 40vw"
                    quality={90}
                    style={{ objectPosition: fragrance.position }}
                  />
                </div>
              </div>

              <div className="perfume-body">
                <p className="micro">{fragrance.type}</p>
                <h3 className="display-lg">{fragrance.name}</h3>
                <ul className="perfume-notes">
                  {fragrance.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                <p className="copy-sm">{fragrance.description}</p>
                <p className="perfume-price">
                  <span className="perfume-amount">{fragrance.price}</span>
                  <span className="perfume-volume">
                    {fragrance.volume} · Eau de Parfum strength
                  </span>
                </p>
                <a
                  className="text-link"
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                    `Enquiry — NOIRÉ ${fragrance.name}`
                  )}`}
                >
                  Enquire
                  <span className="btn-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
