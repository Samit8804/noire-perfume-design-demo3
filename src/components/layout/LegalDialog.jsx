import { useEffect, useRef } from 'react';
import { lockScroll, unlockScroll } from '../../hooks/useScrollProgress';
import { CloseIcon } from '../ui/Icons';

export default function LegalDialog({ policy, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    lockScroll();
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), a[href]',
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

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      unlockScroll();
    };
  }, [onClose]);

  return (
    <div
      className="legal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="legal__panel"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
      >
        <div className="legal__head">
          <div>
            <span className="eyebrow">
              <i />
              NOIRE Perfume
            </span>
            <h2 id="legal-title">{policy.title}</h2>
            <p>{policy.updated}</p>
          </div>
          <button
            type="button"
            className="legal__close"
            onClick={onClose}
            ref={closeRef}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="legal__body">
          {policy.body.map((paragraph) => (
            <p key={paragraph.slice(0, 28)}>{paragraph}</p>
          ))}
        </div>
        <div className="legal__foot">
          <span>NOIRE PERFUME</span>
          <button type="button" className="link-arrow" onClick={onClose}>
            Close <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}
