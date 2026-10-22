import {useEffect,useRef,useState} from 'react';
import ContactForm from './ContactForm';
import {homeContactImage} from '../data/contactOptions';
import '../styles/homeContact.css';

export default function HomeContactSection(){
  const section=useRef<HTMLElement>(null);
  const [calendarHost,setCalendarHost]=useState<HTMLDivElement|null>(null);
  useEffect(()=>{
    let frame=0;
    const measure=()=>{frame=0;const rect=section.current?.getBoundingClientRect();document.body.classList.toggle('home-contact-header-pinned',!!rect&&rect.top<=0&&rect.bottom>100);};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure)};
    measure();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.body.classList.remove('home-contact-header-pinned');};
  },[]);
  return <section id="home-contact" className="home-contact-section" ref={section} aria-labelledby="home-contact-heading">
    <div className="hc-left"><h2 id="home-contact-heading">CONTACT</h2>
      <div className="hc-shooting-image"><img src={homeContactImage} alt="카메라 촬영 장면 — 제공된 제작 과정 설명용 이미지" loading="lazy"/></div>
      <div className="hc-calendar-host" ref={setCalendarHost}/>
    </div>
    <ContactForm calendarHost={calendarHost}/>
  </section>;
}
