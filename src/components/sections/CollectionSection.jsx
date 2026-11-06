import { useEffect, useRef, useState } from 'react';
import PerfumeCanvas from '../three/PerfumeCanvas';
import CollectionScene from '../three/CollectionScene';
import Reveal from '../ui/Reveal';
import { ArrowIcon } from '../ui/Icons';
import { products } from '../../data/products';
import {
  scrollToPosition,
  useProgressiveInView,
} from '../../hooks/useScrollProgress';

function ProductPanel({ product, active, onOpen }) {
  return (
    <article
      className={`product-panel ${active ? 'is-active' : ''}`}
      style={{ '--product-accent': product.accent }}
    >
      <div className="product-panel__top">
        <span className="product-panel__index">{product.index}</span>
        <span className="product-panel__status">
          <i aria-hidden="true" />
          {active ? 'Now viewing' : 'The Noire Collection'}
        </span>
      </div>
      <h3>{product.name}</h3>
      <p className="product-panel__tagline">{product.tagline}</p>
      <p className="product-panel__copy">{product.shortDescription}</p>
      <button
        type="button"
        className="link-arrow product-panel__link"
        onClick={() => onOpen(product.id)}
      >
        Discover More
        <ArrowIcon />
      </button>
      <span className="product-panel__line" aria-hidden="true" />
    </article>
  );
}

export default function CollectionSection({ webgl = true, onOpenProduct }) {
  const [active, setActive] = useState(0);
  const [loadSecondary, setLoadSecondary] = useState(false);
  const sectionRef = useRef(null);
  const progressRef = useRef(null);
  const [canvasRef, canvasMounted, canvasActive] = useProgressiveInView({
    mountMargin: '1100px 0px',
    activeMargin: '250px 0px',
  });

  const activeProduct = products[active];
  const quickView = activeProduct.shortDescription;

  useEffect(() => {
    if (!canvasMounted) return undefined;
    const timer = window.setTimeout(() => setLoadSecondary(true), 1400);
    return () => window.clearTimeout(timer);
  }, [canvasMounted]);

  useEffect(() => {
    const onCollection = (event) => {
      const { progress, active: next } = event.detail;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.max(
          0.015,
          progress,
        )})`;
      }
      setActive((current) => (current === next ? current : next));
    };
    window.addEventListener('noire:collection', onCollection);
    return () => window.removeEventListener('noire:collection', onCollection);
  }, []);

  const goToStage = (index) => {
    const section = sectionRef.current;
    if (!section) return;
    const distance = section.offsetHeight - window.innerHeight;
    const top = section.offsetTop + (index / 2) * Math.max(distance, 0);
    scrollToPosition(top);
  };

  return (
    <section
      id="collection"
      className="collection"
      ref={sectionRef}
      style={{
        '--active-accent': activeProduct.accent,
        '--active-glow': activeProduct.glow,
      }}
    >
      <div className="collection__sticky">
        <header className="collection__head">
          <Reveal className="collection__heading">
            <span className="eyebrow">
              <i />
              The Collection
            </span>
            <h2>
              Three Essences.
              <em>One Legacy.</em>
            </h2>
          </Reveal>
          <Reveal className="collection__intro" delay={120}>
            <p>
              Three distinct expressions of the NOIRE signature. Move through
              the collection to reveal each character in light.
            </p>
            <div className="collection__count" aria-hidden="true">
              <span>{activeProduct.index}</span>
              <small>/ 03</small>
            </div>
          </Reveal>
        </header>

        <div className="collection__grid">
          <aside className="collection__rail collection__rail--left">
            <ProductPanel
              product={products[0]}
              active={active === 0}
              onOpen={onOpenProduct}
            />
          </aside>

          <div className="collection__stage">
            <span
              className="collection__watermark"
              key={activeProduct.id}
              aria-hidden="true"
            >
              {activeProduct.shortName}
            </span>
            <div className="collection__stage-glow" aria-hidden="true" />
            <div className="collection__canvas-wrap" ref={canvasRef}>
              {webgl && canvasMounted ? (
                <PerfumeCanvas
                  active={canvasActive}
                  camera={{ position: [0, 0.05, 4.45], fov: 30, near: 0.1, far: 30 }}
                  className="collection__canvas"
                >
                  <CollectionScene loadSecondary={loadSecondary} />
                </PerfumeCanvas>
              ) : !webgl ? (
                <div className="webgl-fallback webgl-fallback--collection">
                  <img
                    src={activeProduct.image}
                    alt={`${activeProduct.name} perfume flacon`}
                    loading="lazy"
                  />
                  <span>{activeProduct.name}</span>
                  <p>Interactive 3D is unavailable on this device.</p>
                </div>
              ) : (
                <div className="stage-placeholder" aria-hidden="true">
                  <span />
                </div>
              )}
            </div>

            <div className="collection__stage-meta">
              <span className="collection__stage-name">
                {activeProduct.name}
              </span>
              <span className="collection__stage-hint">
                Scroll to reveal
                <i aria-hidden="true" />
              </span>
            </div>
            <div className="collection__progress" aria-hidden="true">
              <span ref={progressRef} />
            </div>
          </div>

          <aside className="collection__rail collection__rail--right">
            <ProductPanel
              product={products[1]}
              active={active === 1}
              onOpen={onOpenProduct}
            />
            <ProductPanel
              product={products[2]}
              active={active === 2}
              onOpen={onOpenProduct}
            />
          </aside>
        </div>

        <div className="collection__foot">
          <span className="collection__foot-note">
            A continuous 3D experience — scroll slowly
          </span>
          <div className="collection__dots" role="tablist" aria-label="Collection stage">
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-label={`View ${product.name}`}
                className={active === index ? 'is-active' : ''}
                onClick={() => goToStage(index)}
              >
                <span>{product.index}</span>
                <i />
              </button>
            ))}
          </div>
          <span className="collection__quickview">{quickView}</span>
        </div>
      </div>
    </section>
  );
}
