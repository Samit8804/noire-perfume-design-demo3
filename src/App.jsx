import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import Preloader from './components/layout/Preloader';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollProgressTracker from './components/ScrollProgressTracker';
import HeroSection from './components/sections/HeroSection';
import BrandHighlights from './components/sections/BrandHighlights';
import CollectionSection from './components/sections/CollectionSection';
import GallerySection from './components/sections/GallerySection';
import AboutSection from './components/sections/AboutSection';
import PhilosophySection from './components/sections/PhilosophySection';
import JournalSection from './components/sections/JournalSection';
import ExperienceSection from './components/sections/ExperienceSection';
import FinalCTA from './components/sections/FinalCTA';
const ProductViewer = lazy(() =>
  import('./components/products/ProductViewer').then((module) => ({
    default: module.default,
  })),
);
import { getProduct, products } from './data/products';
import {
  lockScroll,
  scrollState,
  unlockScroll,
  usePointerParallax,
  useWebGLSupport,
} from './hooks/useScrollProgress';

export default function App() {
  const [introReady, setIntroReady] = useState(false);
  const [viewerId, setViewerId] = useState(null);
  const webgl = useWebGLSupport();
  const viewerProduct = viewerId ? getProduct(viewerId) : null;

  usePointerParallax();

  useEffect(() => {
    lockScroll();
    const safety = window.setTimeout(() => {
      setIntroReady(true);
      unlockScroll();
    }, 9000);
    return () => {
      window.clearTimeout(safety);
      unlockScroll();
    };
  }, []);

  const handleIntroComplete = useCallback(() => {
    scrollState.introReady = true;
    setIntroReady(true);
    unlockScroll();
  }, []);

  useEffect(() => {
    if (!introReady || !webgl) return undefined;
    const timers = [
      window.setTimeout(
        () => useGLTF.preload(products[1].model, false, true),
        1800,
      ),
      window.setTimeout(
        () => useGLTF.preload(products[2].model, false, true),
        3600,
      ),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [introReady, webgl]);

  const openProduct = useCallback((id) => {
    setViewerId(id);
  }, []);

  const closeViewer = useCallback(() => setViewerId(null), []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Preloader onComplete={handleIntroComplete} maxWait={webgl ? 6500 : 2200} />

      <ScrollProgressTracker />
      <div className="page-grain" aria-hidden="true" />
      <div className="page-vignette" aria-hidden="true" />

      <Navbar introReady={introReady} />

      <main id="main">
        <HeroSection ready={introReady} webgl={webgl} />
        <BrandHighlights />
        <CollectionSection webgl={webgl} onOpenProduct={openProduct} />
        <GallerySection webgl={webgl} onOpenProduct={openProduct} />
        <AboutSection />
        <PhilosophySection />
        <JournalSection onOpenProduct={openProduct} />
        <ExperienceSection />
        <FinalCTA />
      </main>

      <Footer onOpenProduct={openProduct} />

      <Suspense fallback={null}>
        {viewerProduct && (
          <ProductViewer
            product={viewerProduct}
            onClose={closeViewer}
            webgl={webgl}
          />
        )}
      </Suspense>
    </>
  );
}
