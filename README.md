# 또독 (Tto-dock)

**또독이와 함께하는 읽기 서비스** — 초등학생을 위한 문해력·디지털 읽기 학습 웹 앱입니다.

---

## 주요 기능

- **홈** — 오늘의 학습, 짧은 글·긴 글·분야별 읽기 진입
- **글 읽기** — 문장 단위 진행, 실시간 CPM(분당 글자 수) 측정, 학습 진행률 표시
- **짧은 글 / 긴 글** — 동화·전래동화·명작 읽기 + 어휘 툴팁, 핵심 단어 퀴즈, 읽기 이해 퀴즈
- **문해력 기초** — 핵심 단어 찾기 연습(3단계 피드백·2회 오답 시 정답 공개), 완료 시 축하 화면
- **마이페이지** — 읽은 문장 수, 퀴즈 정답률, 평균 속도, 주간 학습량·속도 그래프, 연속 학습일, 성취 배지
- **7일 챌린지** — 비회원용 localStorage 기반 1주일 학습 기록 (만료 시 자동 리셋)

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| UI | React 18, Tailwind CSS, Framer Motion |
| 데이터 | Supabase(콘텐츠·오늘의 단어·핵심 단어 퀴즈) + 정적 데이터(`lib/data.ts`) + localStorage 챌린지 |

---

## 시작하기

### 요구 사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론 후
cd tto-dock2

# 의존성 설치
npm install

# 개발 서버 실행 (기본 http://localhost:3000)
npm run dev
```

### 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과물로 서버 실행 |
| `npm run lint` | ESLint 실행 |
| `npm run deploy:vercel` | 빌드 후 Vercel Data Cache Purge 안내 출력 (배포 후 캐시 제거 권장) |

---

## 프로젝트 구조

```
tto-dock2/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx            # 홈
│   ├── mypage/             # 마이페이지
│   ├── practice/           # 문해력 기초 (핵심 단어 찾기)
│   └── reading/            # 글 읽기
│       ├── [id]/           # 통합 글 읽기 (Content / Passage)
│       ├── short/          # 짧은 글 목록·상세
│       ├── long/           # 긴 글 목록·상세
│       ├── category/       # 분야별 (과학/역사/사회)
│       └── digital/        # 디지털 문해력 (뉴스 등)
├── components/             # React 컴포넌트
│   ├── common/             # BottomNav, SideNav, Breadcrumbs 등
│   ├── reading/            # 읽기 경험, 사이드바, 네비바, 퀴즈
│   ├── mypage/             # 대시보드, 카드, 차트, 배지
│   └── dashboard/          # 홈 학습 카드
├── lib/                    # 데이터·유틸·훅
│   ├── data.ts             # 지문·콘텐츠·짧은글·긴글 데이터
│   ├── hooks/              # useCPM(분당 글자 수), useActiveSentence, useReadingTimer
│   ├── challenge-storage.ts # 7일 챌린지 localStorage
│   ├── short-story-utils.ts # 문장 분리, 어휘 세그먼트
│   └── vocabulary-split.ts # 어휘 기준 문장 분할
├── contexts/               # Sidebar, Breadcrumb
└── docs/                   # 문서
    ├── ALGORITHM_OVERVIEW.md   # 알고리즘 정리 (CPM, 퀴즈, 챌린지, 문해력 기초 3단계 퀴즈 등)
    ├── CONTENTS_ADMIN.md       # 어드민 콘텐츠 등록 (API, categories/difficulty)
    ├── DEPLOY_VERCEL.md        # Vercel 배포·Data Cache Purge·온디맨드 재검증
    ├── THUMBNAIL_IMAGE_GUIDE.md # 썸네일 이미지 가이드
    ├── CPM_IMPROVEMENT.md      # CPM 개선 사항
    ├── VERCEL_DEPLOY_GUIDE.md  # Vercel CLI 링크·배포
    ├── ENV_LOCAL_GUIDE.md      # .env.local 설정
    └── AUTH_SETUP.md           # 인증 설정
```

---

## 문서

| 문서 | 설명 |
|------|------|
| [알고리즘 정리](docs/ALGORITHM_OVERVIEW.md) | CPM 측정, 문장·어휘 분할, 챌린지 저장소, 문해력 기초 3단계 퀴즈, 마이페이지 피드백·배지 등 |
| [콘텐츠 등록 (어드민)](docs/CONTENTS_ADMIN.md) | API 등록, title/categories/difficulty, 서비스 카드 반영 |
| [Vercel 배포·캐시 제거](docs/DEPLOY_VERCEL.md) | 배포 스크립트, Data Cache Purge, 온디맨드 재검증 |
| [썸네일 이미지 가이드](docs/THUMBNAIL_IMAGE_GUIDE.md) | 읽기 목록용 썸네일 규격 및 등록 방법 |
| [CPM 개선](docs/CPM_IMPROVEMENT.md) | 읽기 속도 측정 개선 사항 |
| [Vercel 배포 가이드](docs/VERCEL_DEPLOY_GUIDE.md) | Vercel CLI 링크·프로덕션 배포 |
| [ENV 로컬 가이드](docs/ENV_LOCAL_GUIDE.md) | .env.local 설정 |
| [인증 설정](docs/AUTH_SETUP.md) | AUTH 설정 |

---

## 라이선스

Private. 상업적 사용 및 재배포는 허가에 따릅니다.
