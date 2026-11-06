import Reveal from '../ui/Reveal';

const principles = [
  {
    index: '01',
    title: 'Individuality',
    copy: 'Every fragrance represents a different expression of personality. There is no single NOIRE presence — only the one you choose to make your own.',
  },
  {
    index: '02',
    title: 'Elegance',
    copy: 'A refined approach to luxury, design and presentation. Restraint is our most considered form of expression.',
  },
  {
    index: '03',
    title: 'Timelessness',
    copy: 'A distinctive identity that goes beyond temporary trends. Composed to feel as relevant in a decade as it does tonight.',
  },
];

export default function PhilosophySection() {
  return (
    <section id="philosophy" className="philosophy">
      <div className="philosophy__inner">
        <div className="philosophy__aside">
          <Reveal>
            <span className="eyebrow">
              <i />
              The Philosophy
            </span>
            <h2>
              Presence,
              <em>considered.</em>
            </h2>
          </Reveal>
          <Reveal delay={120} className="philosophy__aside-copy">
            <p>
              NOIRE is built on the belief that true luxury is personal. Not
              louder. Not more. Simply more considered.
            </p>
            <span className="philosophy__mark" aria-hidden="true">
              B
            </span>
          </Reveal>
        </div>

        <div className="philosophy__list">
          {principles.map((principle, index) => (
            <Reveal
              key={principle.index}
              className="principle"
              delay={index * 100}
              variant="fade"
            >
              <span className="principle__index">{principle.index}</span>
              <div className="principle__body">
                <h3>{principle.title}</h3>
                <p>{principle.copy}</p>
              </div>
              <span className="principle__line" aria-hidden="true" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
