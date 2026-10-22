export const siteConfig = {
  origin:'https://video-shop-cinematic-1022.robusteft8.chatgpt.site',
  brand:'VIDEO SHOP', email:null as string|null, phone:null as string|null,
  social:{kakao:null,instagram:null,youtube:null} as Record<string,string|null>,
  hero:{poster:'/assets/hero-poster.jpg', desktopVideo:null as string|null,mobileVideo:null as string|null},
  inquiryEndpoint:null as string|null,
};
export const categories = [{id:'all',label:'ALL'},{id:'commercial',label:'COMMERCIAL'},{id:'documentary',label:'DOCUMENTARY'},{id:'drama',label:'DRAMA'},{id:'corporate',label:'CORPORATE / PUBLIC'},{id:'ai-video',label:'AI VIDEO'}] as const;
export const expertise = ['Commercial','Documentary','Drama','Corporate / Public','AI Video','Post-production'];
