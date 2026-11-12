import Image from 'next/image';
import HeroArtwork from './hero-artwork';
import { ArrowRight, ArrowUp } from 'lucide-react';

const services = ['Acceleration sprints', 'Efficient development', 'Specialists on demand', 'Data & AI'];
type Props = { onContact: () => void; onServiceSelect: (index: number) => void };

export default function SiteFooter({ onContact, onServiceSelect }: Props) {
  return <footer className="site-footer" id="footer"><HeroArtwork/>
    <div className="footer-inner">
      <div className="footer-cta">
        <div><p className="footer-eyebrow">LET’S TALK</p><h2>Build your next<br/>chapter with us.</h2></div>
        <button className="footer-contact" onClick={onContact}>Get in touch <ArrowRight size={24} /></button>
      </div>
      <div className="footer-navigation">
        <div className="footer-identity">
          <a href="#main" aria-label="The Software House home"><Image src="/images/brand-generated.webp" alt="The Software House" width={640} height={256} /></a>
          <p>Build with confidence.<br/>Deliver on time.</p>
        </div>
        <nav aria-label="Footer services"><h3>Services</h3>{services.map((service, index) => <a key={service} href="#services" onClick={() => onServiceSelect(index)}>{service}</a>)}</nav>
        <nav aria-label="Footer navigation"><h3>Explore</h3><a href="#cases">Case studies</a><a href="#promise">Our promise</a><button onClick={onContact}>Start a conversation</button></nav>
      </div>
      <div className="footer-bottom"><span>© 2026 The Software House</span><a href="#main">Back to top <ArrowUp size={16} /></a></div>
    </div>
  </footer>;
}
