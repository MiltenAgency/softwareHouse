'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP);

export default function HeroArtwork() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const glow = root.current!.querySelector('.hero-gradient-glow');
      const wave = root.current!.querySelector('.hero-gradient-wave');
      const drift = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 8, ease: 'sine.inOut' } })
        .to(glow, { xPercent: 4, yPercent: -3, scale: 1.08 }, 0)
        .to(wave, { xPercent: -3, yPercent: 3, scale: 1.04 }, 0);
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) drift.resume(); else drift.pause();
      });
      observer.observe(root.current!);
      return () => observer.disconnect();
    });
    return () => media.revert();
  }, { scope: root });

  return <div ref={root} className="hero-art" aria-hidden="true">
    <div className="hero-gradient-glow" />
    <div className="hero-gradient-wave" />
  </div>;
}
