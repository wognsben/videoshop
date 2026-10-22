import {Link} from 'react-router-dom';
import type {PortfolioProject} from '../data/projects';
export function ProjectCard({project}:{project:PortfolioProject}){return <Link className="project" to={`/works/${project.slug}`}><div className="project-image"><img src={project.thumbnail} alt={project.title} loading="lazy"/></div><div className="project-caption"><h3>{project.title}</h3><span>{project.category.toUpperCase()} {project.year}</span></div>{project.isDemo&&<p className="notice">LAYOUT PREVIEW · 실제 제작 실적이 아닙니다</p>}</Link>}
export function EmptyProjects(){return <div className="empty-state"><span className="red-dot"/><h2>작품을 준비하고 있습니다.</h2><p>검증된 프로젝트 자료가 등록되면 이곳에서 만나보실 수 있습니다.</p></div>}
