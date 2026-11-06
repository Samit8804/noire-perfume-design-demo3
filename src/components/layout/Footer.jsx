import { useState } from 'react';
import { navLinks, products } from '../../data/products';
import { activeSocials, site } from '../../data/site';
import { scrollToTarget, scrollToTop } from '../../hooks/useScrollProgress';
import { ArrowIcon } from '../ui/Icons';
import LegalDialog from './LegalDialog';

export default function Footer({ onOpenProduct }) {
  const [policy, setPolicy] = useState(null);

  const go = (event, href) => {
    event.preventDefault();
    scrollToTarget(href);
  };

  return (
    <footer className="footer">
      <div className="footer__halo" aria-hidden="true" />
      <div className="footer__top">
        <div className="footer__brand">
          <a
            className="footer__logo"
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              scrollToTop();
            }}
            aria-label="NOIRE PERFUME — back to top"
          >
            <span>NOIRE</span>
            <small>PERFUME</small>
          </a>
          <p className="footer__intro">
            A modern maison of scent. Three expressions of presence, composed
            for those who wear the extraordinary.
          </p>
          <p className="footer__coords">
            The Noire Collection
            <span />
            MMXXVI
          </p>
        </div>

        <div className="footer__statement" aria-hidden="true">
          <span>WEAR THE</span>
          <em>EXTRAORDINARY.</em>
        </div>

        <div className="footer__columns">
          <div className="footer__column">
            <h3>Explore</h3>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => go(event, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="footer__column">
            <h3>The Collection</h3>
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onOpenProduct(product.id)}
              >
                {product.name}
              </button>
            ))}
          </div>

          <div className="footer__column footer__column--care">
            <h3>Client Care</h3>
            <a href="#contact" onClick={(event) => go(event, '#contact')}>
              Contact
            </a>
            <button type="button" onClick={() => setPolicy('privacy')}>
              Privacy Policy
            </button>
            <button type="button" onClick={() => setPolicy('terms')}>
              Terms &amp; Conditions
            </button>
            {site.enquiryEmail && (
              <a href={`mailto:${site.enquiryEmail}`} className="footer__mail">
                {site.enquiryEmail}
              </a>
            )}
            {activeSocials.length > 0 && (
              <div className="footer__socials">
                {activeSocials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.label}
                    <ArrowIcon />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} NOIRE PERFUME. All rights reserved.</span>
        <span className="footer__bottom-mark">NOIRE — WEAR THE EXTRAORDINARY</span>
        <button type="button" onClick={scrollToTop}>
          Back to top
          <ArrowIcon />
        </button>
      </div>

      {policy && (
        <LegalDialog
          policy={site.legal[policy]}
          onClose={() => setPolicy(null)}
        />
      )}
    </footer>
  );
}
