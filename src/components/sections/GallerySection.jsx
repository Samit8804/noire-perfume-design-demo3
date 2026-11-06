import { useEffect, useRef, useState } from 'react';
import PerfumeCanvas from '../three/PerfumeCanvas';
import GalleryScene from '../three/GalleryScene';
import Reveal from '../ui/Reveal';
import { ArrowIcon, ResetIcon } from '../ui/Icons';
import { products } from '../../data/products';
import { scrollState, useProgressiveInView } from '../../hooks/useScrollProgress';
import { shopProduct } from '../../utils/commerce';

export default function GallerySection({ webgl = true, onOpenProduct }) {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const panelRefs = useRef([]);
  const dragRef = useRef({ active: false, lastX: 0 });
  const stageRef = useRef(null);
  const [canvasRef, canvasMounted, canvasActive] = useProgressiveInView({
    mountMargin: '1200px 0px',
    activeMargin: '250px 0px',
  });

  const activeProduct = products[active];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.dataset.index);
          setActive(index);
          scrollState.gallery = index;
        });
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    );
    panelRefs.current.forEach((panel) => panel && observer.observe(panel));
    return () => observer.disconnect();
  }, []);

  const onPointerDown = (event) => {
    if (event.target.closest('button, a')) return;
    dragRef.current = { active: true, lastX: event.clientX };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!dragRef.current.active) return;
    const delta = event.clientX - dragRef.current.lastX;
    dragRef.current.lastX = event.clientX;
    scrollState.galleryRotation += delta * 0.0085;
  };

  const endDrag = () => {
    dragRef.current.active = false;
    setDragging(false);
  };

  const resetView = () => {
    scrollState.galleryRotation = 0;
  };

  return (
    <section
      id="gallery"
      className="gallery"
      style={{
        '--active-accent': activeProduct.accent,
        '--active-glow': activeProduct.glow,
      }}
    >
      <div className="gallery__head">
        <Reveal className="gallery__heading">
          <span className="eyebrow">
            <i />
            The Flacons
          </span>
          <h2>
            An Icon in
            <em>Three Expressions.</em>
          </h2>
        </Reveal>
        <Reveal className="gallery__intro" delay={120}>
          <p>
            Each NOIRE flacon is presented in its original three-dimensional
            form. Turn it in the light, discover its character, and choose the
            expression that speaks to you.
          </p>
          <span>
            {activeProduct.index} — {activeProduct.name}
          </span>
        </Reveal>
      </div>

      <div className="gallery__layout">
        <div className="gallery__stage-col">
          <div
            className={`gallery__stage ${dragging ? 'is-dragging' : ''}`}
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
            style={{
              '--active-accent': activeProduct.accent,
              '--active-glow': activeProduct.glow,
            }}
          >
            <div className="gallery__stage-aura" aria-hidden="true" />
            <span className="gallery__stage-word" aria-hidden="true">
              {activeProduct.shortName}
            </span>

            <div className="gallery__canvas-wrap" ref={canvasRef}>
              {webgl && canvasMounted ? (
                <PerfumeCanvas
                  active={canvasActive}
                  camera={{ position: [0, 0.05, 4.75], fov: 30, near: 0.1, far: 30 }}
                  className="gallery__canvas"
                >
                  <GalleryScene activeIndex={active} />
                </PerfumeCanvas>
              ) : !webgl ? (
                <div className="webgl-fallback webgl-fallback--gallery">
                  <img
                    src={activeProduct.image}
                    alt={`${activeProduct.name} perfume flacon`}
                    loading="lazy"
                  />
                  <p>Interactive 3D is unavailable on this device.</p>
                </div>
              ) : (
                <div className="stage-placeholder" aria-hidden="true">
                  <span />
                </div>
              )}
            </div>

            <div className="gallery__stage-top">
              <span className="gallery__stage-label">{activeProduct.name}</span>
              <span className="gallery__stage-index">
                {activeProduct.index} / 03
              </span>
            </div>

            <div className="gallery__stage-bottom">
              <span className="gallery__hint">
                <i aria-hidden="true" />
                Drag to rotate
              </span>
              <button
                type="button"
                className="gallery__reset"
                onClick={resetView}
                aria-label="Reset flacon rotation"
              >
                <ResetIcon />
                Reset
              </button>
              <button
                type="button"
                className="button button--ghost gallery__open"
                onClick={() => onOpenProduct(activeProduct.id)}
              >
                <span>Open the Atelier</span>
                <ArrowIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="gallery__panels">
          {products.map((product, index) => (
            <article
              key={product.id}
              className={`gallery-product ${active === index ? 'is-active' : ''}`}
              data-index={index}
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
              style={{ '--product-accent': product.accent }}
            >
              <div className="gallery-product__top">
                <span>{product.index}</span>
                <span>{product.tagline}</span>
              </div>
              <h3>{product.name}</h3>
              <p className="gallery-product__desc">{product.description}</p>

              <dl className="gallery-product__meta">
                <div>
                  <dt>The Flacon</dt>
                  <dd>{product.flacon}</dd>
                </div>
                <div>
                  <dt>Atmosphere</dt>
                  <dd>{product.atmosphere}</dd>
                </div>
              </dl>

              <div className="gallery-product__actions">
                <button
                  type="button"
                  className="button button--gold"
                  onClick={() => onOpenProduct(product.id)}
                >
                  <span>Enter the Atelier</span>
                  <ArrowIcon />
                </button>
                <button
                  type="button"
                  className="link-arrow"
                  onClick={() => shopProduct(product)}
                >
                  Shop Now
                  <ArrowIcon />
                </button>
              </div>

              <span className="gallery-product__line" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
