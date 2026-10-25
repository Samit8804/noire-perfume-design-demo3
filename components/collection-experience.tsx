"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CineStage } from "./cine/stage";
import { FRAGRANCES, CINE_STATES, STATE_ORDER } from "@/lib/collection-data";

gsap.registerPlugin(ScrollTrigger);

function smoothStep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function getStateIndex(p: number) {
  for (let i = 0; i < CINE_STATES.length; i++) {
    const [s, e] = CINE_STATES[i].progress;
    if (p >= s && p < e) return i;
  }
  return CINE_STATES.length - 1;
}

export default function CollectionExperience({ fragrances }: { fragrances: typeof FRAGRANCES }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const copyStackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef(0);
  const stateIndexRef = useRef(0);
  const loadedModelsRef = useRef(new Set([0]));
  const [loadedModels, setLoadedModels] = useState([0]);
  const [readyModels, setReadyModels] = useState<number[]>([]);
  const [mode, setMode] = useState<"3d" | "fallback">("fallback");
  const [mounted, setMounted] = useState(false);

  const handleModelReady = useCallback((index: number) => {
    setReadyModels((current) => (current.includes(index) ? current : [...current, index]));
  }, []);

  useEffect(() => {
    setMounted(true);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let webgl = false;
    try {
      const canvas = document.createElement("canvas");
      webgl = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }

    if (!prefersReduced && webgl) {
      setMode("3d");
    } else {
      setMode("fallback");
    }
  }, []);

  useEffect(() => {
    if (mode !== "3d" || !stageRef.current) return;

    const ctx = gsap.context(() => {
      const stage = stageRef.current;
      if (!stage) return;

      const updateProgress = (trigger: ScrollTrigger) => {
        const p = trigger.progress;
        const si = getStateIndex(p);
        progressRef.current = p;
        stateIndexRef.current = si;
        stage.style.setProperty("--cine-p", p.toFixed(4));

        copyStackRefs.current.forEach((el, i) => {
          if (!el) return;
          const active = i === si;
          el.classList.toggle("is-active", active);
          el.setAttribute("aria-hidden", String(!active));
        });
        stage.querySelectorAll<HTMLElement>(".cine-vignette").forEach((el, i) => {
          el.classList.toggle("is-active", i === si);
        });
        stage.querySelectorAll<HTMLElement>(".cine-progress-dot").forEach((el, i) => {
          el.classList.toggle("is-active", si === i + 1 || si === 4);
        });

        if (p >= 0.08 && !loadedModelsRef.current.has(1)) {
          loadedModelsRef.current.add(1);
          setLoadedModels((current) => [...current, 1]);
        }
        if (p >= 0.22 && !loadedModelsRef.current.has(2)) {
          loadedModelsRef.current.add(2);
          setLoadedModels((current) => [...current, 2]);
        }
      };

      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        invalidateOnRefresh: true,
        onUpdate: updateProgress,
        onRefresh: updateProgress,
      });
    }, stageRef);

    return () => ctx.revert();
  }, [mode]);

  const renderCopyStacks = () => {
    return CINE_STATES.map((state, i) => (
      <div
        key={state.id}
        ref={(el: HTMLDivElement | null) => { copyStackRefs.current[i] = el; }}
        className={`cine-copy-stack cine-state-${state.id}`}
        data-state={state.id}
        aria-hidden={i !== 0}
      >
        <div className="cine-copy-inner">
          {state.id === "hero" && (
            <>
              <h2 className="cine-title">{state.label}</h2>
              <p className="cine-sub">
                Three fragrances. One memory. Scroll to explore the NOIRÉ collection.
              </p>
              <a className="cine-scroll-cue" href="#fragrance-NOIR">
                <span className="cine-cue-text">Scroll</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 5v14M12 19l-5-5M12 19l5-5" />
                </svg>
              </a>
            </>
          )}

          {state.id === "noir" && (
            <>
              <p className="cine-eyebrow">Study I</p>
              <h2 className="cine-title">NOIR</h2>
              <p className="cine-desc">
                The house signature — a dry, botanical darkness that warms the longer it is worn.
                Quiet at first touch, then unmistakable.
              </p>
              <ul className="cine-notes">
                {fragrances[0].notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="cine-price">
                <span>{fragrances[0].price}</span> / {fragrances[0].volume}
              </p>
              <a className="cine-enquire" href={`mailto:atelier@noire-maison.com?subject=${encodeURIComponent(`Enquiry — NOIRÉ ${fragrances[0].name}`)}`}>Enquire <span aria-hidden="true">↗</span></a>
            </>
          )}

          {state.id === "golden-oud" && (
            <>
              <p className="cine-eyebrow">Study II</p>
              <h2 className="cine-title">GOLDEN OUD</h2>
              <p className="cine-desc">
                Light behaving badly. A molten heart of amber and resin oud, lifted by saffron —
                the warmest page in the house archive.
              </p>
              <ul className="cine-notes">
                {fragrances[1].notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="cine-price">
                <span>{fragrances[1].price}</span> / {fragrances[1].volume}
              </p>
              <a className="cine-enquire" href={`mailto:atelier@noire-maison.com?subject=${encodeURIComponent(`Enquiry — NOIRÉ ${fragrances[1].name}`)}`}>Enquire <span aria-hidden="true">↗</span></a>
            </>
          )}

          {state.id === "velvet-amber" && (
            <>
              <p className="cine-eyebrow">Study III</p>
              <h2 className="cine-title">VELVET AMBER</h2>
              <p className="cine-desc">
                The gentlest study in the collection — tonka and musk folded into amber, worn close
                to the skin like something remembered.
              </p>
              <ul className="cine-notes">
                {fragrances[2].notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="cine-price">
                <span>{fragrances[2].price}</span> / {fragrances[2].volume}
              </p>
              <a className="cine-enquire" href={`mailto:atelier@noire-maison.com?subject=${encodeURIComponent(`Enquiry — NOIRÉ ${fragrances[2].name}`)}`}>Enquire <span aria-hidden="true">↗</span></a>
            </>
          )}

          {state.id === "ending" && (
            <>
              <h2 className="cine-title">THE COLLECTION</h2>
              <p className="cine-sub">Three studies in shadow and gold.</p>
              <nav className="cine-indicators" aria-label="Explore fragrances">
                {STATE_ORDER.slice(1, 4).map((s, i) => (
                  <a
                    key={s}
                    className="cine-indicator"
                    data-state={s}
                    href={`#fragrance-${fragrances[i].name.replaceAll(" ", "-")}`}
                  >
                    <span className="cine-indicator-ring" aria-hidden="true" />
                    <span className="cine-indicator-label">{CINE_STATES[i + 1].label}</span>
                  </a>
                ))}
              </nav>
            </>
          )}
        </div>
      </div>
    ));
  };

  if (!mounted) {
    return (
      <section id="collection" className="section section--dark collection" aria-labelledby="collection-title">
        <div className="edge">
          <header className="sec-head">
            <p className="eyebrow" data-reveal>
              <span className="rule" aria-hidden="true" />
              The collection — Vol. I
            </p>
            <h2 id="collection-title" className="display-lg" data-reveal>
              Three studies in shadow <em>and gold.</em>
            </h2>
          </header>
          <div className="cine-loader" aria-hidden="true" />
        </div>
      </section>
    );
  }

  if (mode === "fallback") {
    return (
      <section id="collection" className="section section--dark collection" aria-labelledby="collection-title">
        <div className="edge">
          <header className="sec-head">
            <p className="eyebrow" data-reveal>
              <span className="rule" aria-hidden="true" />
              The collection — Vol. I
            </p>
            <h2 id="collection-title" className="display-lg" data-reveal>
              Three studies in shadow <em>and gold.</em>
            </h2>
          </header>
          <div className="perfume-list">
            {fragrances.map((f) => (
              <article key={f.name} id={`fragrance-${f.name.replaceAll(" ", "-")}`} className="perfume-row" data-reveal>
                <div className="perfume-num num-ghost" aria-hidden="true">{f.numeral}</div>
                <div className="perfume-media parallax-frame" data-parallax-frame="6">
                  <div className="parallax-inner" data-parallax-inner>
                    <img src={f.image} alt={f.alt} style={{ objectPosition: f.position }} />
                  </div>
                </div>
                <div className="perfume-body">
                  <p className="micro">{f.type}</p>
                  <h3 className="display-lg">{f.name}</h3>
                  <ul className="perfume-notes">
                    {f.notes.map((n) => <li key={n}>{n}</li>)}
                  </ul>
                  <p className="copy-sm">{f.description}</p>
                  <p className="perfume-price">
                    <span className="perfume-amount">{f.price}</span>
                    <span className="perfume-volume">{f.volume} · {f.type}</span>
                  </p>
                  <a
                    className="text-link"
                    href={`mailto:atelier@noire-maison.com?subject=${encodeURIComponent(`Enquiry — NOIRÉ ${f.name}`)}`}
                  >
                    Enquire
                    <span className="btn-arrow" aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
        <p className="cine-final-tagline" data-reveal>SCENT is a memory.</p>
      </section>
    );
  }

  return (
    <section id="collection" className="section section--dark collection" aria-labelledby="collection-title">
      <div className="edge">
        <header className="sec-head">
          <p className="eyebrow" data-reveal>
            <span className="rule" aria-hidden="true" />
            The collection — Vol. I
          </p>
          <h2 id="collection-title" className="display-lg" data-reveal>
            Three studies in shadow <em>and gold.</em>
          </h2>
        </header>

        <div ref={stageRef} className="cine-stage">
          <div className="cine-sticky">
            <div className="cine-vignettes" aria-hidden="true">
              <div className="cine-vignette cine-v-hero" />
              <div className="cine-vignette cine-v-noir" />
              <div className="cine-vignette cine-v-golden-oud" />
              <div className="cine-vignette cine-v-velvet-amber" />
              <div className="cine-vignette cine-v-ending" />
            </div>

            <CineStage
              fragrances={fragrances}
              progressRef={progressRef}
              stateIndexRef={stateIndexRef}
              loadedModels={loadedModels}
              onModelReady={handleModelReady}
              onModelError={(error) => {
                console.error("NOIRÉ collection model failed to load.", error);
                setMode("fallback");
              }}
            />

            {!readyModels.includes(0) && (
              <div className="cine-model-loading" role="status">Preparing the collection</div>
            )}

            <div className="cine-copy-layer">{renderCopyStacks()}</div>

            <div className="cine-progress-rail" aria-hidden="true">
              {STATE_ORDER.slice(1, 4).map((s, i) => (
                <div key={s} className="cine-progress-dot" data-state={s}>
                  <span className="cine-dot-numeral">{["I", "II", "III"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="perfume-list">
          {fragrances.map((f) => (
            <article key={f.name} id={`fragrance-${f.name.replaceAll(" ", "-")}`} className="perfume-row" data-reveal>
              <div className="perfume-num num-ghost" aria-hidden="true">{f.numeral}</div>
              <div className="perfume-media parallax-frame" data-parallax-frame="6">
                <div className="parallax-inner" data-parallax-inner>
                  <img src={f.image} alt={f.alt} style={{ objectPosition: f.position }} />
                </div>
              </div>
              <div className="perfume-body">
                <p className="micro">{f.type}</p>
                <h3 className="display-lg">{f.name}</h3>
                <ul className="perfume-notes">
                  {f.notes.map((n) => <li key={n}>{n}</li>)}
                </ul>
                <p className="copy-sm">{f.description}</p>
                <p className="perfume-price">
                  <span className="perfume-amount">{f.price}</span>
                  <span className="perfume-volume">{f.volume} · {f.type}</span>
                </p>
                <a
                  className="text-link"
                  href={`mailto:atelier@noire-maison.com?subject=${encodeURIComponent(`Enquiry — NOIRÉ ${f.name}`)}`}
                >
                  Enquire
                  <span className="btn-arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <p className="cine-final-tagline" data-reveal>SCENT is a memory.</p>
    </section>
  );
}