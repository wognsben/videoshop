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

실제 대표 영상, 원본 포스터, 프로젝트 사진·영상·설명·클라이언트 공개 승인, 협업사 로고, 연락처, SNS URL, 문의 서버, 개인정보 정책이 필요합니다. HOME 히어로 외 디자인은 제안안입니다. 검색 수집을 위해 6개 정적 HTML을 생성하며 `/works/layout-preview`는 noindex 및 sitemap 제외입니다. 동적 미등록 slug는 404 UI를 표시하나 SPA fallback 호스트에서는 HTTP 200일 수 있습니다. 운영 호스트에서 정확한 HTTP 404 응답 규칙을 적용해야 합니다.
