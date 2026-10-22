export const homeProjectTypes = ['브랜드 / 광고 영상','뮤직비디오 / 콘텐츠','기업 홍보 / 인터뷰','기타'];
export const homeBudgetOptions = ['협의 예정','300만 원 미만','300만 원 ~ 500만 원','500만 원 ~ 1,000만 원','1,000만 원 이상'];
export const homeContactImage = '/assets/home-contact-shooting.png';

export function koreaToday(){
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part=(type:string)=>Number(parts.find(item=>item.type===type)?.value);
  return new Date(part('year'),part('month')-1,part('day'));
}
export function dateKey(date:Date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function displayDate(value:string){return value?value.split('-').join('. ')+'.':'';}
export function parseDate(value:string){const [y,m,d]=value.split('-').map(Number);return new Date(y,m-1,d);}
