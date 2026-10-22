import {build} from 'esbuild';
import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
await mkdir('.cache',{recursive:true});
await build({entryPoints:['src/ssr.tsx'],outfile:'.cache/ssr.mjs',bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic'});
const {render,metadata,origin,slugs}=await import('../.cache/ssr.mjs');
const template=await readFile('dist/index.html','utf8');
const routes=['/','/works','/about','/contact',...slugs.map(s=>'/works/'+s),'/works/layout-preview'];
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const route of [...routes,'/404']){const meta=metadata(route);const canonical=origin+route;const html=template.replace(/<title>.*?<\/title>/,`<title>${escape(meta.title)}</title>`).replace(/<meta name="description"[^>]*\/>/,`<meta name="description" content="${escape(meta.description)}"/>`).replace('</head>',`<link rel="canonical" href="${canonical}"/><meta property="og:title" content="${escape(meta.title)}"/><meta property="og:description" content="${escape(meta.description)}"/><meta property="og:type" content="website"/><meta property="og:url" content="${canonical}"/><meta property="og:image" content="${origin}/assets/hero-poster.jpg"/><meta name="robots" content="${meta.noindex?'noindex,follow':'index,follow'}"/></head>`).replace('<div id="root"></div>',`<div id="root">${render(route)}</div>`);const target=route==='/'?'dist/index.html':route==='/404'?'dist/404.html':path.join('dist',route,'index.html');await mkdir(path.dirname(target),{recursive:true});await writeFile(target,html)}
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter(r=>r!='/works/layout-preview').map(r=>`<url><loc>${origin+r}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nDisallow: /works/layout-preview\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile('dist/_redirects','/* /index.html 200\n');
await rm('.cache/ssr.mjs');
console.log(`Prerendered ${routes.length+1} pages; sitemap and robots generated.`);
