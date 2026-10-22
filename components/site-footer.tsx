const NAVIGATE = [
  { label: "Collection", href: "#collection" },
  { label: "Our Story", href: "#story" },
  { label: "Brand Pillars", href: "#pillars" },
  { label: "The Craft", href: "#craft" },
  { label: "Journal", href: "#journal" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "Pinterest", href: "https://www.pinterest.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com" },
];

export default function SiteFooter() {
  return (
    <footer id="contact" className="footer">
      <div className="edge">
        <div className="footer-mark">
          <p className="footer-wordmark">
            NOIRÉ<span className="wordmark-period">.</span>
          </p>
          <p className="footer-tag">Scent is a memory.</p>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h4>The house</h4>
            <p className="copy-sm">
              A concept fragrance house — three compositions, one archive, no
              noise. This is a fictional brand built as a design study.
            </p>
          </div>

          <nav className="footer-col" aria-label="Footer navigation">
            <h4>Navigate</h4>
            <ul>
              {NAVIGATE.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="mailto:atelier@noire-maison.com">
                  atelier@noire-maison.com
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                  Instagram ↗
                </a>
              </li>
              <li>
                <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer">
                  Pinterest ↗
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 NOIRÉ — a concept fragrance house. All rights reserved.</span>
          <span className="footer-credit">
            Concept website by <strong>Samit</strong>
          </span>
          <a className="footer-top-link" href="#home">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>

      <p className="footer-ghost" aria-hidden="true">
        NOIRÉ
      </p>
    </footer>
  );
}
