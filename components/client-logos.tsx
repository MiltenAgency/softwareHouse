'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const brands = ['Northline', 'Vellum', 'Orbit', 'Aven', 'Forma', 'Nexora', 'Fieldwork', 'Cloudwell', 'Morrow', 'Arcway'];

export default function ClientLogos() {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={root} className={`client-logo-marquees ${visible ? 'logos-visible' : ''}`} aria-label="Illustrative company logos">
    <div className="client-marquee-row moves-left">
      <div className="client-marquee-track">
        {[0, 1].map(copy => <div className="client-logo-group" aria-hidden={copy === 1 ? true : undefined} key={copy}>
          {brands.map((brand, index) => <div className="client-logo-cell" key={brand}>
            <div className="client-logo-crop" role="img" aria-label={`${brand} concept logo`}>
              <Image src="/images/client-logos-generated.webp" alt="" width={2172} height={724} sizes="100vw" style={{ left: `${-(index % 5) * 100}%`, transform: `translateY(${index < 5 ? '-25%' : '-75%'})` }} />
            </div>
          </div>)}
        </div>)}
      </div>
    </div>
  </div>;
}
