import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {processSteps} from '../data/process';
import '../styles/process.css';

const vPath='M24 0H238Q265 0 278 28L482 448Q500 482 518 448L722 28Q735 0 762 0H976Q1000 0 987 28L637 740Q618 780 574 780H426Q382 780 363 740L13 28Q0 0 24 0Z';

export default function ProcessSection(){
  const section=useRef<HTMLElement>(null);
  const stage=useRef<HTMLDivElement>(null);
  const [active,setActive]=useState(0);
  const [loaded,setLoaded]=useState<boolean[]>([false,false,false,false]);
  const [displayed,setDisplayed]=useState(0);
  const [reduced,setReduced]=useState(false);

  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(media.matches);
    update();media.addEventListener('change',update);
    return()=>media.removeEventListener('change',update);
  },[]);

  useEffect(()=>{
    let frame=0;
    const measure=()=>{
      frame=0;
      if(!section.current||!stage.current)return;
      const rect=section.current.getBoundingClientRect();
      const distance=Math.max(1,rect.height-stage.current.offsetHeight);
      const progress=Math.max(0,Math.min(1,-rect.top/distance));
      const next=Math.min(3,Math.floor(progress*4));
      setActive(current=>current===next?current:next);
      // 기존 모바일 헤더를 복제하지 않고 PROCESS 고정 구간에서만 같은 헤더를 고정합니다.
      document.body.classList.toggle('process-header-pinned',rect.top<=0&&rect.bottom>=stage.current.offsetHeight);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure)};
    measure();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    const observer=new ResizeObserver(schedule);
    if(section.current)observer.observe(section.current);
    if(stage.current)observer.observe(stage.current);
    return()=>{
      cancelAnimationFrame(frame);observer.disconnect();
      window.removeEventListener('scroll',schedule);
      window.removeEventListener('resize',schedule);
      document.body.classList.remove('process-header-pinned');
    };
  },[]);

  useEffect(()=>{
    if(loaded[active])setDisplayed(active);
    else if(!loaded[displayed]){
      const available=loaded.findIndex(Boolean);
      if(available>=0)setDisplayed(available);
    }
  },[active,loaded,displayed]);

  function goToStep(index:number){
    if(!section.current||!stage.current)return;
    const top=window.scrollY+section.current.getBoundingClientRect().top;
    const distance=section.current.offsetHeight-stage.current.offsetHeight;
    window.scrollTo({top:top+distance*(index+0.18)/4,behavior:reduced?'instant':'smooth'});
  }
  const navigation=(mobile:boolean)=><nav className={`process-steps ${mobile?'process-steps-mobile':'process-steps-desktop'}`} aria-label="제작 과정 단계">
    {processSteps.map((step,index)=><button key={step.id} type="button"
      aria-label={`${step.number} ${step.title} 단계로 이동`}
      aria-current={active===index?'step':undefined}
      onClick={()=>goToStep(index)}>
      <span>{step.number}</span><span className="process-step-name">{step.title}</span>
    </button>)}
  </nav>;

  return <section id="process" ref={section} className="process-section" aria-labelledby="process-heading" data-step={active+1}>
    <div ref={stage} className="process-stage">
      <div className="process-layout">
        <div className="process-text">
          <h2 id="process-heading">PROCESS</h2>
          <div className="process-copy">
            {processSteps.map((step,index)=><div className={`process-copy-panel ${active===index?'is-active':''}`}
              key={step.id} aria-hidden={active!==index}>
              <div className="process-step-index"><span>{step.number}</span><span>/ 04</span></div>
              <h3 className={step.title.includes('-')?'process-long-title':''}>{step.title}</h3>
              <h4>{step.subtitle}</h4>
              <p>{step.description.map(line=><span key={line}>{line}</span>)}</p>
            </div>)}
          </div>
          {navigation(false)}
        </div>
        <div className="process-visual">
          <svg className="process-clip-def" width="0" height="0" aria-hidden="true"><defs>
            <clipPath id="process-v-clip" clipPathUnits="objectBoundingBox">
              <path d={vPath} transform="scale(.001 .001282051282)"/>
            </clipPath>
          </defs></svg>
          <div className="process-v-frame">
            {processSteps.map((step,index)=><div key={step.id}
              className={`process-image-layer ${displayed===index&&loaded[index]?'is-visible':''}`}
              style={{'--process-position':step.desktopObjectPosition,'--process-mobile-position':step.mobileObjectPosition,
                '--process-scale':step.objectScale,'--process-overlay':step.overlayOpacity} as CSSProperties}>
              <img src={step.image} alt={step.alt} width="1024" height="1024" decoding="async"
                aria-hidden={displayed!==index} onLoad={()=>setLoaded(current=>current.map((value,i)=>i===index?true:value))}/>
            </div>)}
          </div>
          {navigation(true)}
          <div className="process-scroll" aria-hidden="true">SCROLL<span/></div>
        </div>
      </div>
      <p className="process-image-note">AI 제작 설명용 이미지 · 실제 VIDEO SHOP 현장 사진이 아닙니다.</p>
    </div>
  </section>;
}
