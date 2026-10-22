"use client";

import { useEffect, useState } from "react";
import { setMenuScrollLock } from "@/components/motion-provider";

const NAV_LINKS = [
  { label: "Collection", href: "#collection" },
  { label: "Our Story", href: "#story" },
  { label: "Journal", href: "#journal" },
  { label: "Contact", href: "#contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMenuScrollLock(open);
    return () => setMenuScrollLock(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="NOIRÉ — home">
          NOIRÉ<span className="wordmark-period">.</span>
        </a>

        <nav className="primary-nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a className="header-cta" href="#collection">
          Discover
        </a>

        <button
          type="button"
          className="burger"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="burger-line" aria-hidden="true" />
        </button>
      </header>

      <div
        id="site-menu"
        className={`menu-overlay${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="menu-overlay-foot">
          <a
            className="micro"
            href="mailto:atelier@noire-maison.com"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            atelier@noire-maison.com
          </a>
          <span className="micro">Maison de Parfum — Est. 2024</span>
        </div>
      </div>
    </>
  );
}
