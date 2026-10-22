# VIDEO SHOP

React + TypeScript + Vite로 구현한 비디오샵 반응형 사이트 검토본입니다.

## 실행

```powershell
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

브라우저 테스트는 설치된 Microsoft Edge를 사용합니다. 다른 환경에서는 `playwright.config.ts`의 channel을 변경하거나 Playwright Chromium을 설치해야 합니다.

## 페이지

| URL | 화면 |
| --- | --- |
| `/` | HOME 및 제안 하단 섹션 |
| `/works` | 카테고리 필터 및 포트폴리오 목록 |
| `/works/:slug` | 프로젝트 상세 |
| `/works/layout-preview` | 실제 실적과 분리한 상세 구성 미리보기 |
| `/about` | 스튜디오 소개 제안안 |
| `/contact` | 문의 입력 및 검증 |
| 그 외 | 404 UI |

## 콘텐츠 연결

- `src/data/siteConfig.ts`: 공식 이메일·전화·SNS, 영상 소스, 문의 API, canonical origin.
- `src/data/projects.ts`: 검증된 프로젝트 데이터. 현재 실제 프로젝트 배열은 비어 있습니다.
- `public/assets/logo.png`, `halftone.png`: 원본의 바이트 단위 복사본.
- `hero-poster.jpg`, `hero-mobile.jpg`: 제공 시안에서 UI를 제외한 사진 영역을 자른 임시 포스터. 실제 제작 영상 또는 실적이 아닙니다.
- `src/components/HomeWorks.tsx`, `src/styles/homeWorks.css`: HOME 두 번째 WORKS 전용 컴포넌트와 스타일. 데스크톱 3열, 태블릿·모바일 2열, 모든 썸네일 16:9입니다.
- `src/data/homeWorks.ts`: HOME 대표 작품 선택과 검토용 샘플 6개. 검증된 featured 프로젝트가 있으면 order 순으로 최대 6개를 표시하고, 없으면 레퍼런스 샘플을 표시합니다. 샘플은 실제 WORKS 목록에 등록하지 않습니다.
- `public/assets/work-reference-*.jpg`: 사용자가 제공한 WORKS 레퍼런스에서 사진 영역만 추출한 검토용 썸네일입니다. 실적이나 원본 미디어로 확인된 자료가 아닙니다.

HOME 카드의 실제 호버 영상은 `previewVideo`에 연결합니다. mouse + hover/fine pointer일 때만 지연 로드하고, 음소거·반복·인라인 재생합니다. 이탈 시 즉시 정지·0초 초기화, 다른 카드 활성화·화면 밖·탭 숨김·언마운트에서도 정지합니다. reduced motion과 터치 장치에서는 자동 미리보기를 시작하지 않습니다. 현재 실제 previewVideo는 미제공입니다. 테스트는 네트워크 응답을 테스트에서만 교체하여 테스트 전용 패턴 WebM으로 재생 동작을 확인하며, 이 영상은 배포 파일에 포함하지 않습니다.

`desktopVideo`와 `mobileVideo`에 URL을 설정하면 영상 컴포넌트가 활성화됩니다. 소리·일시정지 컨트롤은 실제 video 요소와 연결되어 있습니다. 영상 소스가 없는 현재 버전은 포스터만 표시합니다. 재생 실패 시에도 포스터를 유지합니다.

문의 API를 연결하기 전에는 검증만 수행하며 네트워크 전송과 접수 성공 표시를 하지 않습니다. 서버 연결 시 반드시 서버 입력 검증, 속도 제한, 스팸 차단, 개인정보 정책·보유 기간 확정, 응답 계약 검증을 수행해야 합니다. 프런트엔드의 숨김 필드는 완전한 스팸 방지 수단이 아닙니다.

## 구조

```text
src/
  App.tsx                 라우팅과 페이지 메타데이터
  main.tsx                클라이언트 진입 및 hydration
  ssr.tsx                 빌드 시 HTML 사전 렌더링
  components/
    Layout.tsx            사이드바·모바일 메뉴·SNS·CTA·푸터
    Hero.tsx              포스터·영상·사운드·일시정지·하프톤
    Projects.tsx          프로젝트 카드·빈 상태
  pages/Pages.tsx          HOME·WORKS·상세·ABOUT·CONTACT·404
  data/
    projects.ts           포트폴리오 타입과 데이터
    siteConfig.ts         사이트 설정
  styles/global.css       디자인 토큰·전체·반응형 스타일
public/assets/            공식 PNG와 임시 사진 포스터
scripts/prerender.mjs     정적 페이지·sitemap·robots 생성
tests/site.spec.ts        Playwright 테스트
verification/            해상도별 HOME·메뉴 스크린샷
dist/                     프로덕션 출력물
```

공식 PNG는 수정하지 않았습니다. 로고 주요 불투명 적색 픽셀의 최빈값 `#770000`을 브랜드 토큰으로 사용합니다. 기본 언어는 한국어입니다.

## 운영 전 확인

### HOME PROCESS

`src/components/ProcessSection.tsx`, `src/styles/process.css`, `src/data/process.ts`가 HOME 세 번째 섹션을 구성합니다. 500svh 구간에서 100svh 화면을 sticky로 고정하고 네 단계로 진행합니다. 하나의 SVG clipPath를 사진 레이어 공통 부모에 적용하며, 사진과 텍스트만 크로스페이드합니다. 휠·터치 이벤트를 가로채지 않습니다. 단계 버튼으로도 이동할 수 있습니다.

`public/assets/process-contact.jpg`, `process-pre-production.jpg`, `process-production.jpg`, `process-post-production.jpg`는 AI 제작 설명용 이미지입니다. 실제 VIDEO SHOP 현장 사진이 아니며 화면과 alt에 표시했습니다. 사진을 교체하려면 `src/data/process.ts`의 image·alt·desktopObjectPosition·mobileObjectPosition·objectScale·overlayOpacity를 변경합니다. 생성 프롬프트는 `PROCESS-IMAGE-PROMPTS.md`에 기록했습니다.

기존 모바일 헤더를 중복 렌더링하지 않고, PROCESS 고정 구간에서만 전용 body 클래스와 PROCESS CSS로 같은 헤더의 위치를 fixed로 지정합니다. 고정 종료 및 페이지 이동 시 클래스를 해제합니다. HERO·WORKS·기존 레이아웃 컴포넌트와 글로벌 CSS는 수정하지 않았습니다.

실제 대표 영상, 원본 포스터, 프로젝트 사진·영상·설명·클라이언트 공개 승인, 협업사 로고, 연락처, SNS URL, 문의 서버, 개인정보 정책이 필요합니다. HOME 히어로 외 디자인은 제안안입니다. 검색 수집을 위해 12개 정적 HTML을 생성하며 `/works/layout-preview`는 noindex 및 sitemap 제외입니다. 동적 미등록 slug는 404 UI를 표시하나 SPA fallback 호스트에서는 HTTP 200일 수 있습니다. 운영 호스트에서 정확한 HTTP 404 응답 규칙을 적용해야 합니다.


