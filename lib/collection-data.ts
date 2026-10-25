export interface FragranceData {
  numeral: string;
  name: string;
  type: string;
  notes: string[];
  price: string;
  volume: string;
  description: string;
  image: string;
  alt: string;
  position: string;
  model: string;
  modelColor: string;
  rimColor: string;
}

export const FRAGRANCES: FragranceData[] = [
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
    model: "noire-perfume-black-NOIR.glb",
    modelColor: "#0a0a0a",
    rimColor: "#c8a96b",
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
    model: "noire-perfume-GOLDEN OUD.glb",
    modelColor: "#2d1808",
    rimColor: "#d4a543",
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
    model: "noire-velvet-amber.glb",
    modelColor: "#1a0606",
    rimColor: "#b87045",
  },
];

export const CINE_STATES = [
  { id: "hero", label: "SCENT IS A MEMORY", progress: [0, 0.16] },
  { id: "noir", label: "NOIR", progress: [0.16, 0.40] },
  { id: "golden-oud", label: "GOLDEN OUD", progress: [0.40, 0.64] },
  { id: "velvet-amber", label: "VELVET AMBER", progress: [0.64, 0.88] },
  { id: "ending", label: "THE COLLECTION", progress: [0.88, 1.0] },
] as const;

export const STATE_ORDER = ["hero", "noir", "golden-oud", "velvet-amber", "ending"] as const;