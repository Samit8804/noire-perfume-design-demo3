import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';

export default function Preloader({ onComplete, maxWait = 6500 }) {
  const { progress, active } = useProgress();
  const [minElapsed, setMinElapsed] = useState(false);
  const [forceReady, setForceReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [removed, setRemoved] = useState(false);
  const completedRef = useRef(false);
  const removeTimerRef = useRef(null);

  useEffect(() => {
    const minTimer = window.setTimeout(() => setMinElapsed(true), 1300);
    const maxTimer = window.setTimeout(() => setForceReady(true), maxWait);
    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
  }, [maxWait]);

  useEffect(() => {
    if (completedRef.current) return;
    const loaded = forceReady || (!active && progress >= 100);
    if (!loaded || !minElapsed) return;

    completedRef.current = true;
    setExiting(true);
    onComplete?.();
    removeTimerRef.current = window.setTimeout(() => {
      setRemoved(true);
    }, 1350);
  }, [progress, active, minElapsed, forceReady, onComplete]);

  useEffect(
    () => () => {
      window.clearTimeout(removeTimerRef.current);
    },
    [],
  );

  if (removed) return null;

  const percent = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div
      className={`preloader ${exiting ? 'is-exiting' : ''}`}
      aria-hidden={exiting}
      aria-label="Loading the NOIRE experience"
    >
      <div className="preloader__top">
        <span className="preloader__wordmark">NOIRE</span>
        <span className="preloader__sub">PERFUME</span>
      </div>

      <div className="preloader__center">
        <div className="preloader__diamond" aria-hidden="true">
          <span />
        </div>
        <p className="preloader__line">An essence of luxury</p>
      </div>

      <div className="preloader__bottom">
        <div className="preloader__track">
          <span style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
        <div className="preloader__meta">
          <span>Preparing the experience</span>
          <span>{String(percent).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  );
}
