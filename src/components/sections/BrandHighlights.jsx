import Reveal from '../ui/Reveal';
import {
  DiamondIcon,
  DropletIcon,
  HourglassIcon,
  StarIcon,
} from '../ui/Icons';

const highlights = [
  {
    title: 'Timeless Elegance',
    copy: 'A presence composed beyond the passing moment.',
    Icon: HourglassIcon,
  },
  {
    title: 'Premium Quality',
    copy: 'An uncompromising eye for detail, from silhouette to sensation.',
    Icon: DiamondIcon,
  },
  {
    title: 'Long-Lasting Fragrance',
    copy: 'An impression designed to remain after you have left.',
    Icon: DropletIcon,
  },
  {
    title: 'Unmatched Sophistication',
    copy: 'Refined restraint, expressed in every gesture.',
    Icon: StarIcon,
  },
];

export default function BrandHighlights() {
  return (
    <section className="highlights" aria-label="The NOIRE standard">
      <div className="highlights__inner">
        {highlights.map(({ title, copy, Icon }, index) => (
          <Reveal
            key={title}
            className="highlight"
            delay={index * 90}
            variant="fade"
          >
            <span className="highlight__icon">
              <Icon />
            </span>
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
