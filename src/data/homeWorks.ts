import {projects, type PortfolioProject} from './projects';

// 제공된 디자인의 표시 예시입니다. 실제 제작 실적과 분리합니다.
const referenceItems = [
  ['dpr-ian-iqos', '뮤직비디오', 'DPR IAN - IQOS', 'drama'],
  ['suwon-film', '홍보영상', '수원시 홍보영상', 'corporate'],
  ['lg-styler', '기업 광고', 'LG전자 - LG Styler', 'commercial'],
  ['ckd-han-hye-jin', '스케치영상', '종근당건강 - 모델 한혜진', 'commercial'],
  ['hanwha-life', '기업홍보영상', '한화생명금융서비스', 'corporate'],
  ['genesis-journey', '브랜드 필름', '제네시스 - 새로운 여정', 'commercial'],
] as const;

export const homeWorkSamples: PortfolioProject[] = referenceItems.map(
  ([slug, categoryLabel, title, category], index) => ({
    id: `reference-${slug}`,
    slug: `reference-${slug}`,
    categoryLabel,
    title,
    category,
    thumbnail: `/assets/work-reference-${index + 1}.jpg`,
    description: '사용자가 제공한 WORKS 디자인 레퍼런스의 사진과 표기 예시입니다. VIDEO SHOP의 제작 실적으로 확인된 프로젝트가 아닙니다. 실제 사진·영상과 제작 정보 수령 후 교체합니다.',
    images: [],
    featured: true,
    order: index,
    isDemo: true,
  }),
);

export function getHomeWorks() {
  const featured = projects.filter(project => project.featured).sort((a, b) => a.order - b.order);
  return (featured.length ? featured : homeWorkSamples).slice(0, 6);
}

export const categoryLabels: Record<PortfolioProject['category'], string> = {
  commercial: '광고', documentary: '다큐멘터리', drama: '드라마',
  corporate: '기업홍보영상', 'ai-video': 'AI 영상',
};

