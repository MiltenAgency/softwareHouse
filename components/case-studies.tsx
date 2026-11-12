'use client';

import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger);

const cases = [
  { image: 'banking', width: 1448, height: 1086, alt: 'Digital banking dashboard on a tablet and smartphone', lead: 'SEPA certification', rest: ' enabled one bank to reach 36+ countries', client: 'UNDER NDA', discipline: 'FINANCIAL SOFTWARE', heading: 'Banking beyond borders.', description: 'A digital banking experience built around everyday accounts, payments, and transfers. SEPA certification enabled the bank to reach customers in more than 36 countries.' },
  { image: 'pet-care', width: 1362, height: 1155, alt: 'Pet care marketplace displayed on two isolated mobile devices', lead: 'Marketplace consolidation', rest: ' contributed to 4x revenue', client: 'PETSHOMES', discipline: 'MARKETPLACES', heading: 'One place for pet care.', description: 'Explore the pet-care marketplace behind the fourfold revenue result: service discovery, sitter profiles, and care options brought together in one experience.' },
  { image: 'travel', width: 1600, height: 819, alt: 'Travel booking interface with coastal resort and reservation details', lead: 'A remade backend', rest: ' cut eSky’s time to market by 75%', client: 'ESKY.PL', discipline: 'TRAVEL TECHNOLOGY', heading: 'More time for the next release.', description: 'An eSky backend rebuild focused on the foundations behind the travel-booking experience. The result: a 75% reduction in time to market, bringing product changes to customers sooner.' },
  { image: 'pension', width: 1536, height: 1024, alt: 'Isolated AI document-processing interface', lead: 'Pension Lab slashed document processing time', rest: ' by 95% with an AI app', client: 'PENSION LAB', discipline: 'AI & AUTOMATION', heading: 'Less paperwork. More progress.', description: 'An AI application for Pension Lab reduced document-processing time by 95%. The project shows how focused automation can take repetitive work out of a product workflow.' },
];

export default function CaseStudies() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const element = root.current!;
    const timeline = element.querySelector('.case-timeline')!;
    const rows = Array.from(element.querySelectorAll<HTMLElement>('.case-timeline-row'));
    const lastRow = rows[rows.length - 1];
    const axis = element.querySelector<HTMLElement>('.case-timeline-axis')!;
    // Stop the entire track behind marker 04, including at mobile row heights.
    const updateEndpoint = () => {
      axis.style.bottom = `${lastRow.getBoundingClientRect().height / 2}px`;
    };
    updateEndpoint();
    const resizeObserver = new ResizeObserver(updateEndpoint);
    resizeObserver.observe(lastRow);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(element.querySelector('.case-timeline-fill'), { scaleY: 0 }, {
        scaleY: 1, transformOrigin: 'top', ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 75%', endTrigger: lastRow, end: 'center 52%', scrub: 0.3, invalidateOnRefresh: true },
      });
      rows.forEach((row, index) => {
        const card = row.querySelector('.case-timeline-card');
        const marker = row.querySelector('.case-timeline-marker');
        const copy = row.querySelector('.case-timeline-copy');
        const reveal = gsap.timeline({
          scrollTrigger: { trigger: row, start: 'center 88%', end: 'center 52%', scrub: 0.35, invalidateOnRefresh: true },
        });
        reveal.fromTo(card, { opacity: 0, x: index % 2 ? 28 : -28, y: 36 },
          { opacity: 1, x: 0, y: 0, duration: 1, ease: 'power2.out' }, 0)
          .fromTo(copy, { opacity: 0, x: index % 2 ? -28 : 28, y: 36 },
            { opacity: 1, x: 0, y: 0, duration: 1, ease: 'power2.out' }, 0)
          .fromTo(marker, { backgroundColor: '#eef0f7', color: '#969ca9', scale: 0.8 },
            { backgroundColor: '#285dff', color: '#fff', scale: 1, duration: 1, ease: 'power2.out' }, 0);
      });
    });
    return () => {
      resizeObserver.disconnect();
      axis.style.removeProperty('bottom');
      media.revert();
    };
  }, { scope: root });

  return <section ref={root} className="cases content-pad" id="cases">
    <div className="case-heading flex justify-between">
      <h2>Effective software<br/>development</h2>
      <div className="case-intro"><p>160+ product development teams made<br/>their product competitive with our help</p><a className="dark-button" href="#case-grid">Go to cases</a></div>
    </div>
    <div className="case-timeline" id="case-grid">
      <div className="case-timeline-axis" aria-hidden="true"><span className="case-timeline-fill" /></div>
      <ol className="case-timeline-list">
        {cases.map((item, index) => <li className="case-timeline-row" key={item.image}>
          <span className="case-timeline-marker" aria-hidden="true">0{index + 1}</span>
          <a className="case-card case-timeline-card" href="https://tsh.io/portfolio" target="_blank" rel="noreferrer">
            <div className="case-timeline-media"><Image src={`/images/${item.image}-cutout.webp`} width={item.width} height={item.height} alt={item.alt} sizes="(max-width: 700px) 85vw, 40vw" /></div>
            <h3>→ {item.lead}<span>{item.rest}</span></h3><small>{item.client}</small>
          </a>
          <div className="case-timeline-copy">
            <p className="case-discipline">{item.discipline}</p>
            <h4>{item.heading}</h4>
            <p className="case-description">{item.description}</p>
          </div>
        </li>)}
      </ol>
    </div>
  </section>;
}
