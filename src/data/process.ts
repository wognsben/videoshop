export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string[];
  image: string;
  alt: string;
  desktopObjectPosition: string;
  mobileObjectPosition: string;
  objectScale: number;
  overlayOpacity: number;
}

export const processSteps: ProcessStep[] = [
  {id:'contact',number:'01',title:'CONTACT',subtitle:'프로젝트 상담 및 협의',
    description:['브랜드의 목표와 방향을 이해하고,','최적의 제작 방안을 함께 설계합니다.'],
    image:'/assets/process-contact.jpg',alt:'스토리보드를 함께 검토하는 상담 장면 — AI 제작 설명용 이미지',
    desktopObjectPosition:'50% 50%',mobileObjectPosition:'50% 50%',objectScale:1,overlayOpacity:0.08},
  {id:'pre-production',number:'02',title:'PRE-PRODUCTION',subtitle:'기획과 제작 준비',
    description:['아이디어를 구체화하고,','촬영 기획과 제작 준비를 진행합니다.'],
    image:'/assets/process-pre-production.jpg',alt:'촬영 계획과 스토리보드를 정리하는 장면 — AI 제작 설명용 이미지',
    desktopObjectPosition:'50% 50%',mobileObjectPosition:'50% 50%',objectScale:1,overlayOpacity:0.08},
  {id:'production',number:'03',title:'PRODUCTION',subtitle:'촬영 및 현장 제작',
    description:['기획된 내용을 바탕으로,','최고의 결과물을 위해 촬영을 진행합니다.'],
    image:'/assets/process-production.jpg',alt:'시네마 카메라를 운용하는 촬영 장면 — AI 제작 설명용 이미지',
    desktopObjectPosition:'50% 45%',mobileObjectPosition:'50% 45%',objectScale:1,overlayOpacity:0.06},
  {id:'post-production',number:'04',title:'POST-PRODUCTION',subtitle:'편집 및 후반 작업',
    description:['촬영된 영상을 편집하고,','색보정과 사운드 작업을 통해','완성도 높은 결과물을 만듭니다.'],
    image:'/assets/process-post-production.jpg',alt:'편집 모니터와 타임라인을 살펴보는 후반 작업 장면 — AI 제작 설명용 이미지',
    desktopObjectPosition:'50% 50%',mobileObjectPosition:'50% 50%',objectScale:1,overlayOpacity:0.08},
];
