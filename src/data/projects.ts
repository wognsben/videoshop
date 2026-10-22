export type ProjectCategory = 'commercial'|'documentary'|'drama'|'corporate'|'ai-video';
export interface PortfolioProject {id:string;slug:string;title:string;category:ProjectCategory;year?:number;client?:string;description?:string;thumbnail:string;poster?:string;videoUrl?:string;images:string[];featured:boolean;order:number;isDemo?:boolean}
// 검증된 프로젝트만 이 배열에 추가합니다. 시안 이미지를 제작 실적으로 사용하지 않습니다.
export const projects:PortfolioProject[] = [];
export const previewProject:PortfolioProject = {id:'layout-preview',slug:'layout-preview',title:'프로젝트 상세 구성 미리보기',category:'drama',description:'제공된 HOME 시안의 사진을 사용한 레이아웃 검토 화면입니다. 실제 제작 실적이 아닙니다.',thumbnail:'/assets/hero-poster.jpg',images:[],featured:false,order:0,isDemo:true};
