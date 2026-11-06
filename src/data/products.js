export const products = [
  {
    id: 'black-noire',
    index: '01',
    name: 'Black Noire',
    shortName: 'Black',
    tagline: 'Bold. Mysterious. Timeless.',
    shortDescription:
      'A dark, magnetic presence for those who move with quiet confidence.',
    description:
      'Black Noire speaks in shadows. A presence rather than a statement, it is composed for the hours when silence says everything. Black glass gathers light only where it chooses, traced with golden highlights against a dark reflective world.',
    character: ['Bold', 'Mysterious', 'Timeless'],
    flacon: 'Black glass, golden highlights',
    atmosphere: 'Midnight, candlelight, polished stone.',
    model: '/models/black-noire.glb',
    image: '/images/black-noire-portrait.png',
    accent: '#c9a96a',
    glow: 'rgba(201, 169, 106, 0.22)',
    stageLabel: 'The midnight expression',
    lighting: {
      key: '#e8c287',
      rim: '#8c5a26',
      glow: '#c99a54',
    },
  },
  {
    id: 'golden-noire',
    index: '02',
    name: 'Golden Noire',
    shortName: 'Golden',
    tagline: 'Radiant. Regal. Unforgettable.',
    shortDescription:
      'A radiant expression of warmth, composed to be remembered.',
    description:
      'Golden Noire arrives like late-afternoon light held in glass. Warm champagne reflections move across its silhouette, lending every moment a sense of occasion. It is the expression of those who carry their own light.',
    character: ['Radiant', 'Regal', 'Unforgettable'],
    flacon: 'Golden glass, champagne light',
    atmosphere: 'Sunlit gold, celebration, warm air.',
    model: '/models/golden-noire.glb',
    image: '/images/golden-noire-portrait.png',
    accent: '#e0bd7c',
    glow: 'rgba(224, 189, 124, 0.28)',
    stageLabel: 'The radiant expression',
    lighting: {
      key: '#ffe3b3',
      rim: '#b98438',
      glow: '#e6be74',
    },
  },
  {
    id: 'velvet-amber-noire',
    index: '03',
    name: 'Velvet Amber Noire',
    shortName: 'Velvet Amber',
    tagline: 'Warm. Sensual. Enigmatic.',
    shortDescription:
      'A warm, enveloping presence that lingers in the imagination.',
    description:
      'Velvet Amber Noire wraps presence in warmth. Deep amber glass carries rich reddish-brown highlights, illuminated by a cinematic glow. Sensual without excess, it is an invitation into the intimate and the enigmatic.',
    character: ['Warm', 'Sensual', 'Enigmatic'],
    flacon: 'Deep amber glass, reddish-brown highlights',
    atmosphere: 'Amber dusk, embers, velvet.',
    model: '/models/velvet-amber-noire.glb',
    image: '/images/velvet-amber-noire-portrait.png',
    accent: '#cf8a4e',
    glow: 'rgba(185, 106, 52, 0.26)',
    stageLabel: 'The amber expression',
    lighting: {
      key: '#ffc183',
      rim: '#7f3d1c',
      glow: '#c26f34',
    },
  },
];

export const getProduct = (id) => products.find((product) => product.id === id);

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Collection', href: '#collection' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Journal', href: '#journal' },
  { label: 'Contact', href: '#contact' },
];

export const journalEntries = [
  {
    id: 'shadow',
    productId: 'black-noire',
    title: 'The Art of Wearing Shadow',
    excerpt:
      'On presence, restraint and the quiet confidence of choosing less.',
    category: 'Notes on Character',
    image: '/images/black-noire-portrait.png',
  },
  {
    id: 'light',
    productId: 'golden-noire',
    title: 'Light, Held in Glass',
    excerpt:
      'A study of warmth, reflection and the golden hour that never ends.',
    category: 'Notes on Radiance',
    image: '/images/golden-noire-portrait.png',
  },
  {
    id: 'amber',
    productId: 'velvet-amber-noire',
    title: 'An Ode to Amber',
    excerpt:
      'The colour of memory, half-light and the warmth that lingers.',
    category: 'Notes on Sensation',
    image: '/images/velvet-amber-noire-portrait.png',
  },
];
