import { useEffect, useRef, useState } from 'react';
import { navLinks } from '../../data/products';
import {
  lockScroll,
  scrollToTarget,
  unlockScroll,
} from '../../hooks/useScrollProgress';
import { ArrowIcon } from '../ui/Icons';

function useActiveSection() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const ids = ['home', 'collection', 'about', 'gallery', 'journal', 'contact'];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: '-42% 0px -48% 0px', threshold: [0, 0.1, 0.25] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

export default function Navbar({ introReady = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    lockScroll();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    menuRef.current?.querySelector('a, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      unlockScroll();
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 960) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleNavigate = (event, href) => {
    event.preventDefault();
    setOpen(false);
    window.history.replaceState(null, '', href);
    window.setTimeout(() => {
      if (href === '#home') {
        scrollToTarget('#home', { offset: 0 });
      } else {
        scrollToTarget(href);
      }
    }, open ? 60 : 0);
  };

  return (
    <>
      <header
        className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''} ${introReady ? 'is-ready' : ''}`}
      >
        <span className="nav__progress" aria-hidden="true" />
        <div className="nav__inner">
          <a
            className="nav__brand"
            href="#home"
            onClick={(event) => handleNavigate(event, '#home')}
            aria-label="NOIRE PERFUME — home"
          >
            <span className="nav__brand-name">NOIRE</span>
            <span className="nav__brand-sub">PERFUME</span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {navLinks.map((link) => {
              const id = link.href.replace('#', '');
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={active === id ? 'is-active' : ''}
                  aria-current={active === id ? 'page' : undefined}
                  onClick={(event) => handleNavigate(event, link.href)}
                >
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="nav__right">
            <a
              className="nav__shop"
              href="#gallery"
              onClick={(event) => handleNavigate(event, '#gallery')}
            >
              <span>Shop Now</span>
              <ArrowIcon />
            </a>
            <button
              type="button"
              className={`nav__burger ${open ? 'is-open' : ''}`}
              ref={menuButtonRef}
              aria-label={open ? 'Close navigation' : 'Open navigation'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`mobile-menu ${open ? 'is-open' : ''}`}
        ref={menuRef}
        aria-hidden={!open}
        inert={open ? false : undefined}
      >
        <div className="mobile-menu__glow" aria-hidden="true" />
        <nav className="mobile-menu__links" aria-label="Mobile">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleNavigate(event, link.href)}
              style={{ '--menu-delay': `${120 + index * 55}ms` }}
            >
              <span className="mobile-menu__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{link.label}</span>
              <ArrowIcon />
            </a>
          ))}
        </nav>
        <div className="mobile-menu__footer">
          <span>NOIRE PERFUME</span>
          <span>Wear the extraordinary.</span>
        </div>
      </div>
    </>
  );
}
