'use client';

import { Fragment, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ShieldCheck, Clock3, Code2, GitBranch } from 'lucide-react';
import { getLayoutTop } from './section-stack';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger);

const statement = 'We help CTOs and product teams speed up development, modernize existing products, and adopt AI so they can ship faster without compromising on quality. That’s our promise.';
const words = statement.split(' ');

export default function ScrollPromise({ readingSpace }: { readingSpace?: RefObject<HTMLDivElement | null> }) {
  const section = useRef<HTMLElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const corners = useRef<(HTMLSpanElement | null)[]>([]);
  const decorations = useRef<(HTMLDivElement | SVGSVGElement | null)[]>([]);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', roomy: '(min-height: 600px)' }, context => {
      if (!context.conditions?.motion) return;

      const element = section.current!;
      const textBlock = block.current!;
      const wordElements = wordRefs.current.filter((word): word is HTMLSpanElement => word !== null);
      const cornerElements = corners.current.filter((corner): corner is HTMLSpanElement => corner !== null);
      let scrollIndex = 0;
      let hoveredIndex: number | null = null;
      let activeIndex = -1;
      let disposed = false;
      let cornerSize = 12;
      let bounds: { left: number; top: number; right: number; bottom: number }[] = [];

      // Reuse these eight tweens for every word; event handlers create no animations.
      const movers = cornerElements.map(corner => ({
        x: gsap.quickTo(corner, 'x', { duration: 0.4, ease: 'power3.out' }),
        y: gsap.quickTo(corner, 'y', { duration: 0.4, ease: 'power3.out' }),
      }));

      const focusWord = (index: number, immediate = false) => {
        if (!bounds[index] || (index === activeIndex && !immediate)) return;
        if (activeIndex >= 0) delete wordElements[activeIndex].dataset.focused;
        wordElements[index].dataset.focused = 'true';
        activeIndex = index;
        const { left, top, right, bottom } = bounds[index];
        const positions = [[left, top], [right - cornerSize, top], [left, bottom - cornerSize], [right - cornerSize, bottom - cornerSize]];
        movers.forEach((move, corner) => {
          move.x(positions[corner][0]);
          move.y(positions[corner][1]);
          if (immediate) {
            move.x.tween.progress(1);
            move.y.tween.progress(1);
          }
        });
      };

      // Layout reads happen on refresh/resize, never on every scroll frame.
      const measure = () => {
        if (disposed) return;
        cornerSize = cornerElements[0].offsetWidth;
        const origin = textBlock.getBoundingClientRect();
        const scaleX = origin.width ? textBlock.offsetWidth / origin.width : 1;
        const scaleY = origin.height ? textBlock.offsetHeight / origin.height : 1;
        bounds = wordElements.map(word => {
          const rect = word.getBoundingClientRect();
          return { left: (rect.left - origin.left) * scaleX - 8, right: (rect.right - origin.left) * scaleX + 8, top: (rect.top - origin.top) * scaleY - 4, bottom: (rect.bottom - origin.top) * scaleY + 4 };
        });
        focusWord(hoveredIndex ?? scrollIndex, true);
      };

      measure();
      element.dataset.focusReady = 'true';

      const drift = gsap.to(decorations.current.filter(Boolean), {
        xPercent: index => [90, -100, -150, 160][index],
        yPercent: index => [-35, 40, 55, -45][index],
        rotation: index => [14, -18, 95, -75][index],
        duration: 1, ease: 'none', paused: true,
      });
      const stackedReading = Boolean(readingSpace && context.conditions.roomy);
      const pin = !readingSpace && Boolean(context.conditions.roomy) && element.offsetHeight <= window.innerHeight + 1;
      ScrollTrigger.create({
        id: 'promise-focus', trigger: element,
        start: stackedReading ? () => getLayoutTop(element) + Math.max(0, element.offsetHeight - window.innerHeight) : pin ? 'top top' : 'top 65%',
        end: stackedReading ? () => `+=${readingSpace?.current?.offsetHeight || window.innerHeight * 2}` : pin ? () => `+=${window.innerHeight * 2}` : 'bottom 35%',
        pin, pinType: 'transform', anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: measure,
        onUpdate: self => {
          scrollIndex = Math.min(words.length - 1, Math.floor(self.progress * words.length));
          drift.progress(self.progress);
          // Scrolling resumes the reading sequence even if the pointer rests on a word.
          hoveredIndex = null;
          focusWord(scrollIndex);
        },
      });

      const listeners = wordElements.map((word, index) => {
        const enter = (event: PointerEvent) => {
          if (event.pointerType === 'touch') return;
          hoveredIndex = index;
          focusWord(index);
        };
        const press = () => focusWord(index);
        word.addEventListener('pointerenter', enter);
        word.addEventListener('pointerdown', press);
        return () => {
          word.removeEventListener('pointerenter', enter);
          word.removeEventListener('pointerdown', press);
        };
      });
      const leave = () => { hoveredIndex = null; focusWord(scrollIndex); };
      textBlock.addEventListener('pointerleave', leave);
      const observer = new ResizeObserver(measure);
      observer.observe(textBlock);
      document.fonts.addEventListener('loadingdone', measure);
      void document.fonts.ready.then(measure);

      return () => {
        disposed = true;
        observer.disconnect();
        document.fonts.removeEventListener('loadingdone', measure);
        textBlock.removeEventListener('pointerleave', leave);
        listeners.forEach(remove => remove());
        delete element.dataset.focusReady;
        wordElements.forEach(word => delete word.dataset.focused);
      };
    });
    return () => media.revert();
  }, { scope: section, dependencies: [readingSpace], revertOnUpdate: true });

  return <section ref={section} className="promise promise-focus" id="promise" aria-labelledby="promise-heading">
    <h2 id="promise-heading" className="sr-only">Our promise</h2>
    <div className="promise-decorations" aria-hidden="true">
      <div ref={element => { decorations.current[0] = element; }} className="promise-card promise-confidence"><ShieldCheck /></div>
      <div ref={element => { decorations.current[1] = element; }} className="promise-card promise-delivery"><Clock3 /></div>
      <Code2 ref={element => { decorations.current[2] = element; }} className="promise-symbol promise-symbol-code" />
      <GitBranch ref={element => { decorations.current[3] = element; }} className="promise-symbol promise-symbol-branch" />
    </div>
    <div ref={block} className="promise-focus-block">
      <p className="sr-only">{statement}</p>
      <p className="promise-focus-text" aria-hidden="true">
        {words.map((word, index) => <Fragment key={index}>
          <span ref={element => { wordRefs.current[index] = element; }} className="promise-focus-word">{word}</span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>)}
      </p>
      <div className="promise-focus-frame" aria-hidden="true">
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner, index) =>
          <span key={corner} ref={element => { corners.current[index] = element; }} className={`promise-focus-corner ${corner}`} />)}
      </div>
    </div>
  </section>;
}
