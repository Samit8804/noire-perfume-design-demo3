import { useEffect, useRef, useState } from 'react';
import PerfumeCanvas from '../three/PerfumeCanvas';
import ViewerRig from '../three/ViewerRig';
import { ArrowIcon, CloseIcon, FullscreenIcon, ResetIcon } from '../ui/Icons';
import { shopProduct } from '../../utils/commerce';
import { lockScroll, unlockScroll } from '../../hooks/useScrollProgress';
import { site } from '../../data/site';

export default function ProductViewer({ product, onClose, webgl = true }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const controlsRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenSupported =
    typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    lockScroll();
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        } else {
          onClose();
        }
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      unlockScroll();
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const resetView = () => {
    controlsRef.current?.reset();
    if (controlsRef.current) {
      controlsRef.current.autoRotate = true;
    }
  };

  const toggleFullscreen = async () => {
    if (!fullscreenSupported) return;
    try {
      if (!document.fullscreenElement) {
        await dialogRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setIsFullscreen(false);
    }
  };

  const handleShop = () => {
    onClose();
    window.setTimeout(() => {
      shopProduct(product);
    }, 160);
  };

  return (
    <div
      className="viewer"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
      style={{
        '--viewer-accent': product.accent,
        '--viewer-glow': product.glow,
      }}
    >
      <div className="viewer__grain" aria-hidden="true" />
      <header className="viewer__top">
        <span className="viewer__wordmark">
          NOIRE <span>PERFUME</span>
        </span>
        <span className="viewer__mode">The 3D Atelier</span>
        <button
          type="button"
          className="viewer__close"
          onClick={onClose}
          ref={closeRef}
          aria-label="Close 3D viewer"
        >
          <span>Close</span>
          <CloseIcon />
        </button>
      </header>

      <div className="viewer__body">
        <div className="viewer__stage">
          <div className="viewer__stage-aura" aria-hidden="true" />
          {webgl ? (
            <PerfumeCanvas
              active
              camera={{ position: [0, 0.12, 4.65], fov: 30, near: 0.1, far: 30 }}
            >
              <ViewerRig product={product} controlsRef={controlsRef} />
            </PerfumeCanvas>
          ) : (
            <div className="viewer__fallback">
              <img
                src={product.image}
                alt={`${product.name} perfume flacon, still render`}
                loading="eager"
                decoding="async"
              />
              <p className="viewer__fallback-note">
                <span>Still view</span>
                Interactive 3D requires WebGL and is unavailable on this device.
              </p>
            </div>
          )}

          <div className="viewer__stage-overlay">
            <span className="viewer__stage-index">NO. {product.index}</span>
            <span className="viewer__stage-title">{product.name}</span>
            {webgl && (
              <span className="viewer__stage-hint">
                Drag to rotate <i /> Scroll to zoom
              </span>
            )}
          </div>

          {webgl && (
            <div className="viewer__controls">
              <button type="button" onClick={resetView}>
                <ResetIcon />
                <span>Reset view</span>
              </button>
              {fullscreenSupported && (
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-pressed={isFullscreen}
                >
                  <FullscreenIcon />
                  <span>{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="viewer__panel">
          <div className="viewer__panel-inner">
            <span className="eyebrow">
              <i />
              The Noire Collection
            </span>
            <h2 id="viewer-title" className="viewer__title">
              {product.name}
            </h2>
            <p className="viewer__tagline">{product.tagline}</p>
            <p className="viewer__description">{product.description}</p>

            <div className="viewer__chips" aria-label="Olfactive character">
              {product.character.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>

            <dl className="viewer__specs">
              <div>
                <dt>Collection</dt>
                <dd>Noire</dd>
              </div>
              <div>
                <dt>The Flacon</dt>
                <dd>{product.flacon}</dd>
              </div>
              <div>
                <dt>Atmosphere</dt>
                <dd>{product.atmosphere}</dd>
              </div>
              <div>
                <dt>Experience</dt>
                <dd>{webgl ? '360° interactive' : 'Still atelier view'}</dd>
              </div>
            </dl>

            <div className="viewer__actions">
              <button
                type="button"
                className="button button--gold viewer__shop"
                onClick={handleShop}
              >
                <span>Shop Now</span>
                <ArrowIcon />
              </button>
              {site.enquiryEmail && (
                <a
                  className="link-arrow"
                  href={`mailto:${site.enquiryEmail}?subject=${encodeURIComponent(
                    `Private enquiry — ${product.name}`,
                  )}`}
                >
                  Private client enquiry <ArrowIcon />
                </a>
              )}
            </div>
            <p className="viewer__note">
              Complete product details, availability and private client services
              are confirmed directly with the maison.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
