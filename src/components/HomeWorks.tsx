import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight, ArrowUpRight} from 'lucide-react';
import {categoryLabels, getHomeWorks} from '../data/homeWorks';
import type {PortfolioProject} from '../data/projects';
import '../styles/homeWorks.css';

function WorkCard({project, active, activate, deactivate, hoverEnabled}: {
  project: PortfolioProject;
  active: boolean;
  activate: () => void;
  deactivate: () => void;
  hoverEnabled: boolean;
}) {
  const card = useRef<HTMLAnchorElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  function stop() {
    const element = video.current;
    if (element) {
      element.pause();
      element.currentTime = 0;
    }
    setPlaying(false);
  }

  useEffect(() => {
    const element = video.current;
    if (!active || !hoverEnabled || !project.previewVideo || failed || !element) return;
    element.muted = true;
    element.play().catch(() => {
      // AbortError can occur when leaving before the play promise resolves.
      setPlaying(false);
    });
    return () => {
      element.pause();
      element.currentTime = 0;
      setPlaying(false);
    };
  }, [active, hoverEnabled, requested, project.previewVideo, failed]);

  useEffect(() => {
    if (!active || !card.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.15) deactivate();
    }, {threshold: [0, 0.15]});
    observer.observe(card.current);
    const onVisibility = () => {if (document.hidden) deactivate();};
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active, deactivate]);

  return <Link ref={card} to={`/works/${project.slug}`} className="home-work-card"
    onPointerEnter={event => {
      if (event.pointerType !== 'mouse' || !hoverEnabled || !project.previewVideo || failed) return;
      setRequested(true);
      activate();
    }}
    onPointerLeave={() => {stop(); if (active) deactivate();}}
    onClick={stop}>
    <div className="home-work-thumbnail">
      <img src={project.thumbnail} alt={project.title} loading="lazy" decoding="async"/>
      {requested && project.previewVideo && <video ref={video} src={project.previewVideo}
        className={playing && active ? 'is-playing' : ''} aria-hidden="true" tabIndex={-1}
        muted playsInline loop preload="none" disablePictureInPicture
        onPlaying={() => {
          if (!active || !hoverEnabled) {stop(); return;}
          setPlaying(true);
        }}
        onError={() => {stop(); setFailed(true); deactivate();}}/>}
    </div>
    <div className="home-work-caption">
      <span className="home-work-category">{project.categoryLabel ?? categoryLabels[project.category]}</span>
      <h3>{project.title}</h3>
      <ArrowUpRight aria-hidden="true" strokeWidth={1.3}/>
    </div>
  </Link>;
}

export default function HomeWorks() {
  const works = getHomeWorks();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverEnabled, setHoverEnabled] = useState(false);
  useEffect(() => {
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setHoverEnabled(pointer.matches && !motion.matches);
      if (!pointer.matches || motion.matches) setActiveId(null);
    };
    update();
    pointer.addEventListener('change', update);
    motion.addEventListener('change', update);
    return () => {
      pointer.removeEventListener('change', update);
      motion.removeEventListener('change', update);
    };
  }, []);
  return <section className="home-works" id="selected" aria-labelledby="home-works-heading">
    <div className="home-works-header">
      <h2 id="home-works-heading">WORKS</h2>
      <Link to="/works">VIEW ALL WORKS <ArrowRight strokeWidth={1.2} aria-hidden="true"/></Link>
    </div>
    <div className="home-works-grid">
      {works.map(project => <WorkCard key={project.id} project={project}
        active={activeId === project.id} hoverEnabled={hoverEnabled}
        activate={() => setActiveId(project.id)}
        deactivate={() => setActiveId(current => current === project.id ? null : current)}/>) }
    </div>
    {works.some(project => project.isDemo) && <p className="home-works-disclosure">
      디자인 검토용 샘플입니다. 이미지·작품명은 제공 레퍼런스의 예시이며, VIDEO SHOP의 제작 실적으로 확인되지 않았습니다.
    </p>}
  </section>;
}
