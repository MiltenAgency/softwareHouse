'use client';

import { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger);

type StackRefs = {
  panels: RefObject<(HTMLDivElement | null)[]>;
  shells: RefObject<(HTMLDivElement | null)[]>;
  cards: RefObject<(HTMLDivElement | null)[]>;
  shades: RefObject<(HTMLDivElement | null)[]>;
};
const StackContext = createContext<StackRefs | null>(null);

// offsetTop deliberately ignores the transforms used by both the pin and card.
export function getLayoutTop(element: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = element;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

export function StackChapter({ index, tone, children, holdScreens = 0, readingSpaceRef }: {
  index: number;
  tone: string;
  children: ReactNode;
  holdScreens?: number;
  readingSpaceRef?: RefObject<HTMLDivElement | null>;
}) {
  const refs = useContext(StackContext);
  if (!refs) throw new Error('StackChapter must be rendered inside SectionStack.');

  return <div ref={element => { refs.panels.current[index] = element; }} className={`stack-chapter stack-chapter--${tone}`} style={{ zIndex: index + 1 }}>
    <div ref={element => { refs.shells.current[index] = element; }} className="stack-pin">
      <div ref={element => { refs.cards.current[index] = element; }} className="stack-card">
        {children}
        <div ref={element => { refs.shades.current[index] = element; }} className="stack-shade" aria-hidden="true" />
      </div>
    </div>
    {holdScreens > 0 && <div ref={readingSpaceRef} className="stack-reading-space" style={{ height: `${holdScreens * 100}svh` }} aria-hidden="true" />}
  </div>;
}

export default function SectionStack({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const shells = useRef<(HTMLDivElement | null)[]>([]);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const shades = useRef<(HTMLDivElement | null)[]>([]);
  const refs = useRef<StackRefs>({ panels, shells, cards, shades });

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      root.current!.dataset.stackReady = 'true';
      const chapters = panels.current.filter((panel): panel is HTMLDivElement => panel !== null);

      chapters.forEach((panel, index) => {
        const incoming = chapters[index + 1];
        if (!incoming) return;
        const shell = shells.current[index]!;
        const card = cards.current[index]!;
        const shade = shades.current[index]!;

        // Pin an independent shell: the card can scale without fighting the
        // pin's transform. A reading spacer extends the hold without a nested pin.
        ScrollTrigger.create({
          id: `section-stack-hold-${index}`,
          trigger: shell, start: 'bottom bottom',
          endTrigger: incoming, end: 'top top',
          pin: shell, pinSpacing: false, pinType: 'transform',
          anticipatePin: 1, invalidateOnRefresh: true,
        });

        gsap.set(card, { transformOrigin: () => `50% ${card.offsetHeight - window.innerHeight / 2}px` });
        const cover = gsap.timeline({
          scrollTrigger: {
            id: `section-stack-${index}`,
            trigger: incoming, start: 'top bottom', end: 'top top',
            scrub: true, invalidateOnRefresh: true,
            onRefresh: () => { card.style.transformOrigin = `50% ${card.offsetHeight - window.innerHeight / 2}px`; },
            onUpdate: self => { panel.inert = self.progress > 0.6; },
          },
        });

        cover
          // Crop just the already-read area, so a tall chapter's visible screen
          // can round off too. Reversing restores the full chapter immediately.
          .to(card, { '--stack-crop': () => `${Math.max(0, card.offsetHeight - window.innerHeight)}px`, duration: 0.001, ease: 'none' }, 0)
          .to(card, {
            scale: 0.94, '--stack-radius': '32px',
            duration: 1, ease: 'none',
          }, 0)
          .to(shade, { opacity: 0.28, duration: 1, ease: 'none' }, 0);
      });

      const navigate = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
        const hash = link?.getAttribute('href');
        if (!hash || hash === '#') return;
        let id: string;
        try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
        const target = document.getElementById(id);
        if (!target) return;
        const index = chapters.findIndex(panel => panel.contains(target));
        if (index < 0) return;

        event.preventDefault();
        if (window.location.hash !== hash) window.history.pushState(null, '', hash);
        const margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
        window.scrollTo({ top: Math.max(0, getLayoutTop(target) - margin), behavior: 'smooth' });
      };

      document.addEventListener('click', navigate);
      // All child hooks have run; include the reading spacer and every chapter
      // in one document-order refresh before the first animation frame.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        document.removeEventListener('click', navigate);
        delete root.current?.dataset.stackReady;
        chapters.forEach(panel => { panel.inert = false; });
      };
    });
    return () => media.revert();
  }, { scope: root });

  return <StackContext.Provider value={refs.current}><div ref={root} className="section-stack">{children}</div></StackContext.Provider>;
}
