# 또독 (Tto-dock)

**또독이와 함께하는 또박또박 독해** — 초등학생을 위한 문해력·디지털 읽기 학습 웹 앱입니다.

---

## 주요 기능

- **홈** — `오늘의 단어`, `또독 단어 퀴즈`, `오늘의 학습` 3개 영역 중심의 학습 대시보드
- **또독 단어 퀴즈** — 회원은 `study_logs` 기반으로 오늘 진행 상태·완료 상태를 복구, 비회원은 새로고침 시 초기화
- **글 읽기** — 문장 단위 진행, 실시간 CPM(분당 글자 수) 측정, 학습 진행률 표시
- **짧은 글 읽기 / 긴 글 읽기** — 동화·전래동화·명작 읽기 + 어휘 툴팁, 핵심 단어 퀴즈, 읽기 이해 퀴즈, 3단계 문해 활동(핵심 단어 → 독해 → 요약 + 학습 리포트)
- **분야별 글 읽기** — `전체 / 과학 / 역사 / 사회 / 예술 / 기술·AI` 필터칩, 칩별 콘텐츠 개수 표시, `제목 가나다순 / 난이도순` 정렬
- **문해력 기초 훈련** — 핵심 단어 찾기 연습, 3단계 피드백, 2회 오답 시 정답 공개, 완료 화면 제공
- **마이페이지** — `내 정보`, `내 정보 수정`, `나의 성장 리포트`를 분리한 구조로 로그인 계정의 학습 기록과 프로필을 관리
  - 모바일에서는 `/mypage/info` ↔ `/mypage/growth-report` 를 전환하는 상단 탭 노출, PC/태블릿에서는 좌측 LNB로 탐색
  - 출석 체크(최근 5일)·획득한 배지(최근 5개 + placeholder)·최근 학습 기록 섹션을 카드 없이 타이포그래피 중심의 리포트 스타일로 제공
  - 누적 학습량·평균 속도·정답률 등은 Growth Report에서 KPI(큰 숫자 + 작은 라벨) 형태로 확인
- **통합 학습 저장** — 회원은 Supabase `study_logs`를 단일 저장소로 사용, 읽기 결과와 홈 퀴즈 상태를 계정 기준으로 복구

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| UI | React 18, Tailwind CSS, Framer Motion |
| 데이터 | Supabase(콘텐츠·오늘의 단어·핵심 단어·3단계 문해 활동 퀴즈·`study_logs`) + 정적 데이터(`lib/data.ts`) |

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
│   ├── mypage/             # 마이페이지 (내 정보, 내 정보 수정, 성장 리포트)
│   ├── practice/           # 문해력 기초 훈련 (핵심 단어 찾기)
│   ├── admin/contents/[id]/# 콘텐츠 수정 (어드민, 3단계 문해 활동 퀴즈 포함)
│   └── reading/            # 글 읽기
│       ├── [id]/           # 통합 글 읽기 (Content / Passage)
│       ├── short/          # 짧은 글 목록·상세
│       ├── long/           # 긴 글 목록·상세
│       ├── category/       # 분야별 읽기 (필터칩·정렬형 목록)
│       └── digital/        # 디지털 문해력 (뉴스 등)
├── components/             # React 컴포넌트
│   ├── common/             # BottomNav, SideNav, Breadcrumbs 등
│   ├── reading/            # 읽기 경험, 사이드바, 네비바, 퀴즈
│   ├── mypage/             # 대시보드, 카드, 차트, 배지
│   └── dashboard/          # 홈 대시보드 카드 (오늘의 단어, 단어 퀴즈, 오늘의 학습)
├── lib/                    # 데이터·유틸·훅
│   ├── data.ts             # 지문·콘텐츠·짧은글·긴글 데이터
│   ├── hooks/              # useCPM(분당 글자 수), useActiveSentence, useReadingTimer
│   ├── study-log-types.ts  # study_logs payload 타입, KST 날짜 키, 마이페이지 집계기
│   ├── short-story-utils.ts # 문장 분리, 어휘 세그먼트
│   └── vocabulary-split.ts # 어휘 기준 문장 분할
├── hooks/                  # useUserStatus 등 회원 중심 학습 저장 훅
├── contexts/               # Sidebar, Breadcrumb
└── docs/                   # 문서
    ├── ALGORITHM_OVERVIEW.md    # 알고리즘 정리 (CPM, 퀴즈, study_logs, 문해력 기초 훈련, 3단계 문해 활동 등)
    ├── CONTENTS_ADMIN.md        # 어드민 콘텐츠 등록 (API, categories/difficulty, 3단계 문해 활동 퀴즈 입력)
    ├── SUPABASE_QUIZ_COLUMNS.md # Supabase contents 테이블 3단계 문해 활동용 jsonb 컬럼 정의
    ├── STUDY_LOGS_SCHEMA.md     # Supabase study_logs 스키마와 payload 예시
    ├── LEARNING_REPORT_COMMENT_SYSTEM.md # 학습 리포트 코멘트 규칙 기반 시스템 명세
    ├── DEPLOY_VERCEL.md         # Vercel 배포·Data Cache Purge·온디맨드 재검증
    ├── THUMBNAIL_IMAGE_GUIDE.md # 썸네일 이미지 가이드
    ├── CPM_IMPROVEMENT.md       # CPM 개선 사항
    ├── VERCEL_DEPLOY_GUIDE.md   # Vercel CLI 링크·배포
    ├── ENV_LOCAL_GUIDE.md       # .env.local 설정
    └── AUTH_SETUP.md            # 인증 설정
```

---

## 문서

| 문서 | 설명 |
|------|------|
| [알고리즘 정리](docs/ALGORITHM_OVERVIEW.md) | CPM 측정, 읽기 시작 오버레이, 문장·어휘 분할, `study_logs` 저장 구조, 분야별 필터·정렬, 문해력 기초 훈련, 3단계 문해 활동, 마이페이지 라우팅·피드백·배지 등 |
| [콘텐츠 등록 (어드민)](docs/CONTENTS_ADMIN.md) | API 등록, title/categories/difficulty, 3단계 문해 활동 퀴즈 입력, 서비스 카드 반영 |
| [Supabase 퀴즈 컬럼](docs/SUPABASE_QUIZ_COLUMNS.md) | contents 테이블 3단계 문해 활동용 jsonb 컬럼(`core_quiz`, `read_quizzes`, `summary_quiz`) 정의 |
| [Study Logs 스키마](docs/STUDY_LOGS_SCHEMA.md) | 회원 학습 상태 복구용 `study_logs` 테이블 SQL과 payload 예시 |
| [학습 리포트 코멘트 시스템](docs/LEARNING_REPORT_COMMENT_SYSTEM.md) | 학습 리포트 총평·영역별 결과용 규칙 기반 코멘트 시스템 명세 |
| [Vercel 배포·캐시 제거](docs/DEPLOY_VERCEL.md) | 배포 스크립트, Data Cache Purge, 온디맨드 재검증 |
| [썸네일 이미지 가이드](docs/THUMBNAIL_IMAGE_GUIDE.md) | 읽기 목록용 썸네일 규격 및 등록 방법 |
| [CPM 개선](docs/CPM_IMPROVEMENT.md) | 읽기 속도 측정 개선 사항 |
| [Vercel 배포 가이드](docs/VERCEL_DEPLOY_GUIDE.md) | Vercel CLI 링크·프로덕션 배포 |
| [ENV 로컬 가이드](docs/ENV_LOCAL_GUIDE.md) | .env.local 설정 |
| [인증 설정](docs/AUTH_SETUP.md) | AUTH 설정 |

---

## 라이선스

Private. 상업적 사용 및 재배포는 허가에 따릅니다.
