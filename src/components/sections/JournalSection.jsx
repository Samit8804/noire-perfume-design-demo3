import Reveal from '../ui/Reveal';
import { ArrowIcon } from '../ui/Icons';
import { journalEntries } from '../../data/products';

export default function JournalSection({ onOpenProduct }) {
  return (
    <section id="journal" className="journal">
      <div className="journal__head">
        <Reveal>
          <span className="eyebrow">
            <i />
            The Journal
          </span>
          <h2>
            Notes on
            <em>Presence.</em>
          </h2>
        </Reveal>
        <Reveal delay={110} className="journal__intro">
          <p>
            A study of character, light and sensation — three quiet
            observations from the world of NOIRE.
          </p>
          <span>Volume 01 — The Noire Collection</span>
        </Reveal>
      </div>

      <div className="journal__grid">
        {journalEntries.map((entry, index) => (
          <Reveal
            key={entry.id}
            delay={index * 100}
            className="journal-card"
          >
            <button
              type="button"
              className="journal-card__button"
              onClick={() => onOpenProduct(entry.productId)}
              aria-label={`Open ${entry.title} in the 3D atelier`}
            >
              <div className="journal-card__media">
                <img src={entry.image} alt="" loading="lazy" />
                <span className="journal-card__shade" aria-hidden="true" />
                <span className="journal-card__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="journal-card__hover">
                  Enter the atelier
                  <ArrowIcon />
                </span>
              </div>
              <div className="journal-card__body">
                <span className="journal-card__category">{entry.category}</span>
                <h3>{entry.title}</h3>
                <p>{entry.excerpt}</p>
                <span className="journal-card__read">
                  Read in 3D
                  <ArrowIcon />
                </span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
