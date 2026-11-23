'use client';

import BrandLogo from './brand-logo';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const services = ['Acceleration sprints', 'Efficient development', 'Specialists on demand', 'Data & AI'];

type Props = { onContact: () => void; onServiceSelect: (index: number) => void };

export default function SiteHeader({ onContact, onServiceSelect }: Props) {
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const servicesToggle = useRef<HTMLButtonElement>(null);
  const pointerType = useRef('mouse');
  const [hidden, setHidden] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    let anchor = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const current = Math.max(0, window.scrollY);
      if (current < 80) setHidden(false);
      else if (Math.abs(current - anchor) >= 8) {
        const goingDown = current > anchor;
        setHidden(goingDown);
        if (goingDown) { setMobile(false); setServicesOpen(false); }
      }
      if (Math.abs(current - anchor) >= 8 || current < 80) anchor = current;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) { setMobile(false); setServicesOpen(false); }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (root.current?.querySelector('.floating-nav.is-open')) toggle.current?.focus();
        else if (root.current?.querySelector('.floating-dropdown')) servicesToggle.current?.focus();
        setMobile(false);
        setServicesOpen(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const close = () => { setMobile(false); setServicesOpen(false); };

  return <header ref={root} className={`floating-header ${hidden ? 'is-hidden' : ''}`} onFocusCapture={() => setHidden(false)}>
    <a className="floating-brand" href="#main" aria-label="Milten Studio home" onClick={close}>
      <BrandLogo />
    </a>
    <nav id="site-navigation" aria-label="Main navigation" className={`floating-nav ${mobile ? 'is-open' : ''}`}>
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
    <button className="floating-contact" onClick={() => { close(); onContact(); }}>Get in touch</button>
    <button ref={toggle} className="floating-menu-toggle" aria-label={mobile ? 'Close navigation' : 'Open navigation'} aria-expanded={mobile} aria-controls="site-navigation" onClick={() => setMobile(!mobile)}>
      {mobile ? <X size={22} /> : <Menu size={22} />}
    </button>
  </header>;
}
