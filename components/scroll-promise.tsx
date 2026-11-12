'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Gauge, Blocks, BrainCircuit, Rocket, ShieldCheck, Clock3, Code2, GitBranch } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger);

function Letters({ children }: { children: string }) {
  return <>{Array.from(children).map((letter, index) => <span data-promise-letter key={index}>{letter}</span>)}</>;
}

export default function ScrollPromise() {
  const section = useRef<HTMLElement>(null);

  useGSAP(() => {
    const element = section.current!;
    const letters = element.querySelectorAll('[data-promise-letter]');
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      // Hold this section in view for the whole reveal. Before reaching its
      // top every letter stays gray; leaving it keeps the completed text dark.
      const timeline = gsap.timeline({
        scrollTrigger: {
          id: 'promise-reveal', trigger: element,
          start: 'top top', end: () => `+=${window.innerHeight}`,
          pin: true, scrub: 0.25, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
      timeline.fromTo(letters, { color: '#bfbfbf' }, {
        color: '#242424', duration: 0.18, stagger: { amount: 0.82 }, ease: 'none',
      }, 0);
      timeline.to(element.querySelectorAll('[data-promise-decoration]'), {
        xPercent: index => [90, -100, -150, 160][index],
        yPercent: index => [-35, 40, 55, -45][index],
        rotation: index => [14, -18, 95, -75][index],
        duration: 1, ease: 'none',
      }, 0);
    });
    media.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(letters, { color: '#242424' });
    });
    return () => media.revert();
  }, { scope: section });

  return <section ref={section} className="promise" id="promise">
    <div className="promise-decorations" aria-hidden="true">
      <div data-promise-decoration className="promise-card promise-confidence"><ShieldCheck /></div>
      <div data-promise-decoration className="promise-card promise-delivery"><Clock3 /></div>
      <Code2 data-promise-decoration className="promise-symbol promise-symbol-code" />
      <GitBranch data-promise-decoration className="promise-symbol promise-symbol-branch" />
    </div>
    <p aria-label="We help CTOs and product teams speed up development, modernize existing products, and adopt AI so they can ship faster without compromising on quality. That’s our promise."><span aria-hidden="true">
    <span className="promise-start"><ArrowRight/><Letters>We help</Letters></span><Letters> CTOs and product teams</Letters><br/>
    <span className="purple"><Letters>speed up </Letters><i><Gauge/></i></span><Letters> development, </Letters><span className="orange"><Letters>modernize </Letters><i><Blocks/></i></span><br/>
    <Letters>existing products, and </Letters><span className="blue"><Letters>adopt AI </Letters><i><BrainCircuit/></i></span><Letters> so they</Letters><br/>
    <Letters>can </Letters><span className="pink"><Letters>ship faster </Letters><i><Rocket/></i></span><Letters> without compromising</Letters><br/>
    <Letters>on quality. That’s our promise.</Letters>
  </span></p></section>;
}
