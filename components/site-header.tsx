'use client';

import BrandLogo from './brand-logo';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger);

const services = ['Acceleration sprints', 'Efficient development', 'Specialists on demand', 'Data & AI'];

type Props = { onContact: () => void; onServiceSelect: (index: number) => void };

export default function SiteHeader({ onContact, onServiceSelect }: Props) {
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const servicesToggle = useRef<HTMLButtonElement>(null);
  const pointerType = useRef('mouse');
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useGSAP(() => {
    const header = root.current!;
    const update = (trigger: ScrollTrigger) => {
      const folded = trigger.scroll() >= trigger.start;
      setCompact(folded);
      if (folded && document.activeElement?.closest('#site-navigation') &&
          document.activeElement.matches(':focus-visible')) setMenuOpen(true);
    };
    ScrollTrigger.create({
      start: 48, end: 'max',
      onEnter: update, onLeaveBack: update, onRefresh: update,
    });
    const onOutside = (event: PointerEvent) => {
      if (!header.contains(event.target as Node)) { setMenuOpen(false); setServicesOpen(false); }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (root.current?.querySelector('.floating-nav.is-open')) toggle.current?.focus();
        else if (root.current?.querySelector('.floating-dropdown')) servicesToggle.current?.focus();
        setMenuOpen(false);
        setServicesOpen(false);
      }
    };
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, { scope: root });

  const close = () => { setMenuOpen(false); setServicesOpen(false); };

  return <header ref={root} className={`floating-header ${compact ? 'is-compact' : ''}`}>
    <a className="floating-brand" href="#main" aria-label="Milten Studio home" onClick={close}>
      <BrandLogo />
    </a>
    <button ref={toggle} className="floating-menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(open => !open)}>
      {menuOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
    <nav id="site-navigation" aria-label="Main navigation" className={`floating-nav ${menuOpen ? 'is-open' : ''}`}>
      <a href="#cases" onClick={close}>Case studies</a>
      <div className="floating-services"
        onPointerEnter={event => { if (event.pointerType === 'mouse') setServicesOpen(true); }}
        onPointerLeave={event => {
          if (event.pointerType === 'mouse' && !event.currentTarget.querySelector(':focus-visible')) setServicesOpen(false);
        }}
        onFocusCapture={event => {
          if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) setServicesOpen(true);
        }}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setServicesOpen(false);
        }}>

        <button ref={servicesToggle} aria-expanded={servicesOpen} aria-controls="services-navigation" onPointerDown={event => { pointerType.current = event.pointerType; }}
          onClick={event => {
            if (event.detail === 0 || pointerType.current !== 'mouse') setServicesOpen(open => !open);
            else setServicesOpen(true);
          }}>
          Services <ChevronDown size={12} />
        </button>
        {servicesOpen && <div id="services-navigation" className="floating-dropdown">
          {services.map((service, index) => <a href="#services" key={service} onClick={() => { onServiceSelect(index); close(); }}>{service}</a>)}
        </div>}
      </div>
      <a href="#promise" onClick={close}>How we deliver</a>
      <a href="#footer" onClick={close}>About</a>
    </nav>
    <div className="floating-actions">
      <button className="floating-contact-link" onClick={() => { close(); onContact(); }}>Contact</button>
      <button className="floating-contact" onClick={() => { close(); onContact(); }}>Get started</button>
    </div>
  </header>;
}
