'use client';
import { ArrowRight, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import ClientLogos from './client-logos';
import ScrollPromise from './scroll-promise';
import HeroArtwork from './hero-artwork';
import SiteHeader from './site-header';
import SiteFooter from './site-footer';
import CaseStudies from './case-studies';
import SectionStack, { StackChapter } from './section-stack';
import { useServiceRotation } from './use-service-rotation';

const services = [
  { title: 'ACCELERATION SPRINTS™', short: 'ACCELERATION SPRINTS™', description: 'Test a new technology initiative in 1–2 weeks, create a strategy to increase key metrics, identify and eliminate delivery bottlenecks.', color: '#ffc66e' },
  { title: 'EFFICIENT DEVELOPMENT', short: 'EFFICIENT DEVELOPMENT', description: 'Build with an experienced software development team. Increase delivery capacity and turn your product goals into working software.', color: '#8bd3f5' },
  { title: 'SPECIALISTS ON DEMAND', short: 'SPECIALISTS ON DEMAND', description: 'Bring the right expertise to your team. Work with specialists who help you solve challenges and move your product forward.', color: '#b6affb' },
  { title: 'DATA & AI', short: 'DATA & AI', description: 'Put your data to work. Explore practical AI solutions, automate processes and create more value for your customers.', color: '#e7acf6' },
];


function Contact({ close }: { close: () => void }) {
 const [sent,setSent]=useState(false);
 return <div className="modal-backdrop" onClick={close}><section role="dialog" aria-modal="true" aria-labelledby="contact-title" className="contact-modal" onClick={e=>e.stopPropagation()}><button className="close-button" onClick={close} aria-label="Close contact form"><X size={22}/></button><h2 id="contact-title">Let’s build with confidence.</h2>{sent ? <p role="status">Thanks for your interest. This is a frontend demo, so your message hasn’t been sent.</p> : <form onSubmit={e=>{e.preventDefault();setSent(true);}}><label>Your name<input name="name" required autoComplete="name"/></label><label>Work email<input name="email" type="email" required autoComplete="email"/></label><label>What would you like to build?<textarea name="message" required rows={4}/></label><button className="dark-button" type="submit">Get in touch <ArrowRight size={16}/></button><p className="form-note">Demo form — no information is transmitted.</p></form>}</section></div>;
}
export default function Website() {
 const [active,setActive]=useState<number | null>(null), [contact,setContact]=useState(false);
 const servicesRoot = useRef<HTMLDivElement>(null);
 const promiseReadingSpace = useRef<HTMLDivElement>(null);
 const [servicesHovered, setServicesHovered] = useState(false);
 const [servicesFocused, setServicesFocused] = useState(false);
 const advanceService = useCallback(() => setActive(current => current === null ? 0 : (current + 1) % services.length), []);
 const serviceRotation = useServiceRotation(servicesRoot, advanceService, servicesHovered || servicesFocused || contact);
 return <><a className="skip-link" href="#main">Skip to content</a><SiteHeader onContact={()=>setContact(true)} onServiceSelect={setActive}/><SectionStack><main id="main" className="site-shell">
 <StackChapter index={0} tone="hero">
 <div className="intro-area">
 <section className="hero" aria-labelledby="hero-title">
 <HeroArtwork/>

 <div className="hero-copy"><h1 id="hero-title">Build with confidence<br/>and deliver on time</h1><p className="hero-description">Bring your product ambitions to life with a team that works alongside yours. From shaping the first idea and modernizing existing platforms to solving delivery bottlenecks, we help you turn complex requirements into reliable software, build with confidence, and keep your next release moving forward.</p><div className="hero-bottom flex items-center justify-between"><a href="#services" className="hero-promise flex items-center"><span>Unlock development capacity, remove biggest<br/> delivery blockers and see your key metrics improve</span><ArrowRight/><span>All without refocusing<br/> your core team</span></a><a className="rating" href="#cases"><span>Strategy · Design · Engineering</span><span>Explore our <strong>selected work</strong></span></a></div></div>
 </section>
 </div>
 </StackChapter>
 <StackChapter index={1} tone="clients">
 <section className="clients" aria-label="Our clients"><p>BUILT AROUND AMBITIOUS PRODUCT TEAMS</p><ClientLogos/></section>
 </StackChapter>
 <StackChapter index={2} tone="promise" holdScreens={2} readingSpaceRef={promiseReadingSpace}>
 <ScrollPromise readingSpace={promiseReadingSpace}/>
 </StackChapter>
 <StackChapter index={3} tone="services">
 <section className="services content-pad" id="services"><div className="section-heading flex justify-between"><h2>See tangible<br/>outcomes</h2><span className="eyebrow">WHAT WE DO</span></div><div
   ref={servicesRoot}
   className="service-list"
   data-rotating={serviceRotation}
   style={{ gridTemplateRows: services.map((_, index) => active === null || active !== index ? '1fr' : '4fr').join(' ') }}
   onPointerEnter={event => { if (event.pointerType !== 'touch') setServicesHovered(true); }}
   onPointerLeave={event => { if (event.pointerType !== 'touch') setServicesHovered(false); }}
   onFocusCapture={() => setServicesFocused(true)}
   onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setServicesFocused(false); }}
 >{services.map((service,i)=><article
   key={service.title}
   className={`service ${active===i?'is-active':''}`}
   style={{backgroundColor:service.color}}
   onPointerEnter={event=>{if(event.pointerType!=='touch')setActive(i);}}
 >
   <button className="service-toggle" aria-label={service.title} aria-expanded={active===i} aria-controls={`service-${i}`}
     onFocus={event=>{if(event.currentTarget.matches(':focus-visible'))setActive(i);}}
     onClick={()=>setActive(active===i?null:i)}>
     <span className="service-number">0{i+1}</span><span className="service-title">{service.short}</span>
   </button>
   <div id={`service-${i}`} className="service-details" aria-hidden={active!==i} inert={active!==i}>
     <p>{service.description}</p>
     <button aria-label={`Discuss ${service.title.toLowerCase()}`} onClick={()=>setContact(true)}><ArrowRight/></button>
   </div>
   {serviceRotation && active === i && <span key={`timer-${active}`} className="service-cycle-progress" aria-hidden="true" />}
 </article>)}</div></section>
 </StackChapter>
 <StackChapter index={4} tone="cases"><CaseStudies/></StackChapter>
 </main><StackChapter index={5} tone="footer"><SiteFooter onContact={()=>setContact(true)} onServiceSelect={setActive}/></StackChapter></SectionStack>{contact&&<Contact close={()=>setContact(false)}/>}</>;
}
