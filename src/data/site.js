/**
 * Site-wide configuration.
 *
 * Social accounts are only rendered when `active` is true and a URL is present.
 * Commerce links are optional; when no boutique URL is configured, "Shop Now"
 * leads visitors to the private enquiry area instead of a broken destination.
 */
export const site = {
  name: 'NOIRE',
  subtitle: 'PERFUME',
  tagline: 'Wear the extraordinary.',
  enquiryEmail: '',
  boutiqueUrl: '',
  socials: [
    { label: 'Instagram', href: '', active: false },
    { label: 'YouTube', href: '', active: false },
    { label: 'X', href: '', active: false },
    { label: 'Facebook', href: '', active: false },
  ],
  legal: {
    privacy: {
      title: 'Privacy Policy',
      updated: 'Last updated November 2026',
      body: [
        'NOIRE PERFUME respects the privacy of every visitor. This site is a brand and product experience; it does not require an account, process payments or store personal information.',
        'The website loads its typefaces, 3D models and interface assets directly from this domain. No advertising trackers or third-party analytics are embedded.',
        'If you contact the maison by email, your message is used solely to respond to your enquiry. You may request the removal of that correspondence at any time.',
        'For any privacy question, please reach the maison through the contact channel published in the footer.',
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      updated: 'Last updated November 2026',
      body: [
        'The NOIRE PERFUME website is provided for personal, non-commercial viewing. All content, including text, imagery and the three-dimensional perfume models, is the property of NOIRE PERFUME and may not be reproduced without written permission.',
        'The interactive 3D experience requires a WebGL-capable browser. Visual presentation may vary across devices and displays.',
        'Product descriptions on this site are presented as brand storytelling. Complete product information, availability and pricing are confirmed directly with the maison.',
        'By using this website you agree to these terms. They may be updated from time to time without prior notice.',
      ],
    },
  },
};

export const activeSocials = site.socials.filter(
  (social) => social.active && social.href,
);
