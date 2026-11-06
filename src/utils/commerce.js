import { site } from '../data/site';
import { scrollToTarget } from '../hooks/useScrollProgress';

/**
 * Shopping navigation is intentionally configuration-led. When no boutique URL
 * or enquiry address has been provided, the visitor is guided to the private
 * enquiry area rather than an invented checkout.
 */
export function shopProduct(product) {
  if (site.boutiqueUrl) {
    window.open(site.boutiqueUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  if (site.enquiryEmail) {
    window.location.href = `mailto:${site.enquiryEmail}?subject=${encodeURIComponent(
      `Private enquiry — ${product.name}`,
    )}`;
    return;
  }

  scrollToTarget('#contact', { offset: 0 });
}
