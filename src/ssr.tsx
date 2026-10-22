import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import App,{getMetadata} from './App';
import {siteConfig} from './data/siteConfig';
import {projects} from './data/projects';
export const render=(route:string)=>renderToString(<StaticRouter location={route}><App/></StaticRouter>);
export const metadata=getMetadata;
export const origin=siteConfig.origin;
export const slugs=projects.map(p=>p.slug);
