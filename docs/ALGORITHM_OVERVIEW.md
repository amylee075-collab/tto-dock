# 또독(Tto-dock) 서비스 알고리즘 정리

이 문서는 현재까지 개발된 또독 서비스의 핵심 알고리즘·로직을 체계적으로 정리한 것입니다.

---

## 1. 읽기 속도(CPM, 분당 글자 수) 측정

**위치:** `lib/hooks/useCPM.ts`

### 1.1 CPM 계산식

- **정의:** Characters Per Minute. “현재까지 읽은 글자 수 ÷ 경과 시간(분)”으로 계산.
- **글자 수:** `getCharsCountUntilActiveIndex(sentences, centerIndex)` — 0번 ~ `activeIndex` 문장까지 **전체 텍스트 길이** 합산.
- **경과 시간:** 사용자가 첫 문장을 클릭한 시점(`readingStarted`)을 `startTimeRef`에 저장하고, 이후 `Date.now() - start`로 초 단위 경과 시간 계산.

```
rawCPM = (totalChars × 60) / Math.max(sec, 1)
```

- **상한:** `CPM_CAP = 1200`으로 제한 (오측정·연타 방지).

### 1.2 스무딩(이동 평균) 및 노출 변화 제한

- **목적:** 수치 변동을 부드럽게 하여 “갑자기 빨라지고 느려지는” 혼란 완화.
- **공식:**  
  `smoothed = prev × (1 - weightNew) + raw × weightNew`  
  - 읽은 문장 수 ≥ 6: `weightNew = 0.1` (기존 0.9, 현재 0.1).  
  - 읽은 문장 수 < 6: `weightNew = 0.05` (기존 0.95) — 초반 급상승 억제.
- **초기값:** `INITIAL_SMOOTH_CPM = 400`.
- **노출 변화 제한:** 스무딩된 값이 한 번에 크게 바뀌지 않도록, 직전 노출값 대비 **한 번에 ±35 글자/분**을 넘지 않게 제한. (`MAX_DELTA_PER_UPDATE`)

### 1.3 노출 조건

- **“측정 중” 유지:**  
  경과 시간 < 8초 **또는** 읽은 문장 수 < 5이면 CPM 수치를 보이지 않고 `status: "measuring"`.
- **수치 노출:**  
  경과 시간 ≥ 8초 **그리고** 읽은 문장 수 ≥ 5이면 `status: "ready"`, 스무딩된 CPM 노출.  
  (초반 3~4문장만 클릭했을 때 1100 글자/분처럼 튀는 현상 방지를 위해 조건 강화.)
- **최소 계산 시간:** 1초 미만이면 0 반환 (0으로 나누기 방지).
- **초반 스무딩:** 읽은 문장 수 < 6일 때는 새 측정값 가중치 0.05(기존 0.95)로 더 강하게 스무딩하여 급상승을 억제.

### 1.4 속도 구간(Tier)

**위치:** `getCPMTier(cpm)` in `lib/hooks/useCPM.ts`

| 구간        | 조건               | 라벨           | 피드백 메시지 |
|------------|--------------------|----------------|----------------|
| 차근차근   | cpm ≤ 300          | 🐢 차근차근    | 꼼꼼하게 읽는 중이네요! |
| 안정적     | 301 ≤ cpm ≤ 500    | ✅ 안정적      | 좋아요! 내용도 잘 이해하고 있나요? |
| 빠름       | 501 ≤ cpm ≤ 700    | ⚡ 빠름        | 내용을 파악하며 읽어보세요! |
| 매우 빠름  | cpm ≥ 701          | 🚀 매우 빠름   | 주요 내용을 놓치지 않게 조심해요! |

- UI·피드백 메시지에 사용. 화면 노출 단위는 **글자 / 분**으로 통일.

---

## 2. 문장 분리 및 단어 매칭

### 2.1 짧은 글·동화 본문 → 문장 배열

**위치:** `lib/short-story-utils.ts` — `splitContentIntoSentences(content)`

- **규칙:** `.!?` 뒤의 공백을 기준으로 분리.
- **정규식:** `content.split(/(?<=[.!?])\s+/)`  
  (마침표·물음표·느낌표 뒤 lookbehind + 공백)
- **후처리:** `trim()`, 빈 문자열 제거.

### 2.2 문장 내 어휘(단어) 세그먼트 분할

**위치:**  
- `lib/short-story-utils.ts` — `splitSentenceByVocabulary(sentence, vocabulary)`  
- `lib/vocabulary-split.ts` — `splitByVocabulary(sentence, vocabulary)`  
- `components/reading/CoreWordMode.tsx` — `buildSegments(sentence, selectableWords)`

**공통 전략: 긴 단어 우선 매칭**

1. `vocabulary`(또는 `selectableWords`)를 **단어 길이 내림차순** 정렬.
2. 문장을 앞에서부터 스캔하며, 정렬된 목록에서 **가장 먼저 매칭되는 단어**로 치환.
3. 매칭된 부분은 `type: "vocab"`(또는 `"word"`) 세그먼트로, 나머지는 `type: "text"`로 저장.
4. **효과:** “공동체 의식”처럼 긴 어구가 “공동체”, “의식”으로 쪼개지지 않고 한 덩어리로 인식됨.

**CoreWordMode `buildSegments` 추가 동작**

- 매칭 실패 시, “다음 단어가 시작되는 위치”까지를 한 덩어리 텍스트로 처리해, 조사가 단어에 붙어 보이도록 함.

---

## 3. 문장 단위 진행(활성 문장)

**위치:** `lib/hooks/useActiveSentence.ts`

- **상태:** `activeIndex` (0-based). 현재 “읽고 있는” 문장 인덱스.
- **설정:**  
  - 클릭: `setActiveIndex(i)`  
  - [이전]: `goPrev()` → `Math.max(prev - 1, 0)`  
  - [다음]: `goNext()` → `Math.min(prev + 1, totalCount - 1)`
- **읽은 문장 수:** `readCount = activeIndex + 1` (1-based).
- **스크롤/IO:** 없음. 클릭·버튼으로만 변경.

---

## 4. 콘텐츠·지문 선택 로직

**위치:** `lib/data.ts`, `app/reading/[id]/page.tsx`

### 4.1 글 읽기 페이지 라우팅 (`/reading/[id]`)

1. **오늘의 긴 글 리다이렉트:**  
   `getTodayPassages().long.id === id` 이면 → `/reading/long`으로 redirect.
2. **콘텐츠 우선:**  
   `getContentById(id)`로 `ReadingContent` 조회.
   - 있으면: 타입에 따라 `CoreWordMode` / `ReadingContentExperience` 렌더.
   - `CORE_WORD`는 `coreWord`가 `selectableWords`에 포함될 때만 CoreWordMode.
3. **지문(Passage) fallback:**  
   `getPassageById(id)`로 `ReadingPassage` 조회.
   - 있으면: `ReadingExperience` (mode: `summary` | `read`).
4. 둘 다 없으면 `notFound()`.

### 4.2 오늘의 학습 지문

**함수:** `getTodayPassages()`

- `readingPassages`에서 `activityType`이 `"summary"`, `"short"`, `"long"`인 항목을 각각 1개씩 선택.
- 고정 매핑(데이터에 지정된 1편씩).

### 4.3 랜덤 선택

- **분야별:** `getRandomPassageByCategory(category)`  
  - `category`(science/history/society) + `!isNews` 필터 후 `list[Math.floor(Math.random() * list.length)]`.
- **뉴스:** `getRandomNewsPassage()`  
  - `isNews === true` 필터 후 동일하게 랜덤 1편.

### 4.4 짧은 글·긴 글 by ID

- **짧은 글:** `getShortStoryById(id)` — `shortStories` 또는 `categoryStories` 등에서 id로 검색.
- **긴 글:** `longStories`에서 id로 검색.

### 4.5 분야별 글 읽기 필터·정렬

**위치:** `components/reading/CategoryListClient.tsx`, `app/reading/category/page.tsx`

- 서버 페이지 `app/reading/category/page.tsx`는 Supabase에서 `type === "category"` 목록만 가져와 클라이언트 컴포넌트에 전달.
- 클라이언트 목록은 다음 필터칩을 제공:
  - `전체`
  - `과학`
  - `역사`
  - `사회`
  - `예술`
  - `기술·AI`
- **칩 개수 계산:** 현재 전체 목록을 기준으로 각 필터에 해당하는 콘텐츠 수를 `reduce`로 집계해 `라벨 (개수)` 형식으로 노출.
- **필터 판정:** `story.section === filter` 또는 `story.badges` 배열에 같은 문자열이 있으면 해당 분야로 간주.
- **정렬 옵션**
  - `제목 가나다순`: `title.localeCompare(..., "ko")`
  - `난이도순`: `normalizeDifficultyToLevel(difficulty)`로 `1 → 2 → 3 → 미지정` 순 정렬 후 제목 보조 정렬
- 필터 결과가 0건이면 빈 상태 메시지를 노출.

---

## 5. 퀴즈 정답 처리

### 5.1 객관식(선다형)

- **데이터:** `options: string[]`, `ans: number` (0-based 정답 인덱스).
- **판정:** 사용자 선택 인덱스 === `ans` → 정답.

### 5.2 주관식(핵심 단어/빈칸)

- **데이터:** `answer: string`.
- **정규화:** `normalizeAnswer(s)` — 공백 제거 후 `trim`.  
  `s.replace(/\s+/g, "").trim()`.
- **판정:** `normalizeAnswer(userInput) === normalizeAnswer(answer)`.

### 5.3 문해력 기초 훈련(핵심 단어 찾기) — 3단계 피드백

**위치:** `components/practice/CoreWordPractice.tsx`

- **시도 횟수:** 문항별 `attempts` (0 → 오답 시 +1). 문항 변경 시 0으로 리셋.
- **1회차 정답:** 정답 애니메이션 후 즉시 「다음 문제」 활성화.
- **1회차 오답:** `attempts === 1` → 오답 모달 "아쉬워요! 한 번 더 기회를 줄게요." + 어드민 단어별 피드백(subMessage), 확인 후 같은 문항에서 재선택.
- **2회차 오답:** `attempts === 2` → "정답은 [정답]였어요!" + 어드민 정답 단어 피드백, 정답 보기 하이라이트, 다른 보기 비활성화, 「다음 문제」만 활성화. `onWrong(quizId)` 호출로 학습 리포트에서 오답 처리.
- **완료 화면:** 10문항 모두 완료 시(정답 또는 2회 오답 후 다음) — "모든 퀴즈를 풀었어요!", 서브 텍스트, Confetti, 캐릭터 연출, [홈으로 가기] 버튼.

---

### 5.4 문해 활동 3단계(핵심 단어 → 독해 → 요약)

**위치:** `components/reading/ShortStoryQuizContainer.tsx`

- **데이터 원천:** Supabase `contents` 테이블 jsonb 컬럼  
  - `core_quiz`: { question, answer, sentence?, similarAnswers? }  
  - `read_quizzes`: [{ q, options: string[], ans: number }]  
  - `summary_quiz`: { requiredKeywords?, exampleAnswer?, charLimitByGrade? }
- 서비스 용어는 현재 `문해 활동`으로 통일하여 화면·문서·어드민 입력 구조에 동일하게 반영.

#### (1) Step 1 — 핵심 단어

- `core_quiz.sentence`에 있는 정답 단어(`answer`)를 찾아, UI에서 해당 구간을 **주황색 물음표 박스**로 치환.
- 주관식 채점은 `normalizeAnswer`로 **띄어쓰기 제거 후 비교**.
- `similarAnswers` 배열이 있으면, 동일한 정규화 값은 모두 정답으로 인정.

#### (2) Step 2 — 독해 퀴즈

- 각 문제는 `{ q, options, ans }` 구조.
- 옵션은 페이지 진입 시 **Fisher–Yates 셔플**로 순서를 섞고, 정답 인덱스는 셔플된 순서에 맞춰 재매핑.
- 하단 피드백/다음 버튼 영역은 **`min-height` 고정**으로 버튼 클릭 시 레이아웃이 흔들리지 않도록 함.

#### (3) Step 3 — 요약하기

- 사용자가 작성한 요약 텍스트 길이를 기준으로 **학년별 글자 수 카운터** 표시.  
  - `summary_quiz.charLimitByGrade["3" | "4" | ...]`에서 우선순위로 limit를 가져와 UI에 노출.
- `summary_quiz`는 단일 객체가 아니라 **배열 구조**를 지원하며, 여러 문항의 `question`, `modelAnswer`, `requiredKeywords`를 순차적으로 노출할 수 있음.
- 제출 후 요약 길이, 객관식 정답 수, 핵심 단어 정답 여부를 조합해 `어휘력 / 이해력 / 사고력 / 표현력` 4축 점수를 계산하고 `recharts` 기반 방사형 그래프로 렌더링.
- 각 요약 답안은 결과 페이지 표시용을 넘어서 `thinkingNotes` 형태로 저장 payload에 포함되어 마이페이지 사고력 노트에서 재사용됨.

#### (4) 결과 화면

- 결과 단계는 분리된 완료 화면이 아니라 **단일 학습 리포트** 형식으로 렌더링.
- 상단에는 글 제목, 학습일, 읽기 속도, 걸린 시간, 퀴즈 정답률을 요약 표시.
- `summary_quiz` 데이터가 있으면 사고력 글쓰기 분석, 영역별 결과(방사형 차트), 텍스트 피드백 설명을 추가 노출.

#### (5) 공통 완료 메시지

- 3단계 퀴즈가 종료되면 결과 화면에서 다음 문구를 **줄바꿈 포함**으로 노출:
  - `"준비된 또독 단어 퀴즈가 모두 끝났습니다.\n내일 다시 도전해 봐요!"`

---

## 6. 읽기 시작 오버레이와 타이머

**위치:** `components/reading/ReadingStartOverlay.tsx`, `lib/hooks/useReadingTimer.ts`, `lib/hooks/useCPM.ts`

- **초기 상태:** 읽기 상세 페이지 진입 직후에는 읽기 시작 오버레이가 먼저 노출되고, 타이머와 CPM 측정은 아직 시작하지 않음.
- **시작 트리거:** 사용자가 `읽기 시작` 버튼을 누르면 `startReading()`이 호출되고 첫 문장(`activeIndex = 0`)이 활성화됨.
- **오버레이 위치:** `fixed inset-0` 기준 중앙 정렬로 렌더링되어 모바일·태블릿에서도 별도 스크롤 없이 바로 시작 가능.
- **효과:** 새로고침이나 중간 이탈 후 재진입 시 읽기 시간이 왜곡되는 문제를 줄이고, 모든 디바이스에서 동일한 시작 경험을 제공.
- **타이머 시작:** 읽기 시작 후 0초부터 시작.
- **간격:** 1초마다 +1, 최대 `60 * 60` (60:00).
- **표기:** `MM:SS` (2자리 패딩).
- **범위:** 단락(글) 읽기 페이지 진입 시마다 리셋(세션 유지 없음).

---

## 7. 회원 중심 학습 저장(`study_logs`)

**위치:** `hooks/useUserStatus.ts`, `app/api/study-logs/route.ts`, `lib/study-log-types.ts`

### 7.1 저장 정책

- 학습 저장은 **로그인한 계정 기준**으로만 수행.
- 비회원은 `localStorage`에 학습 데이터를 저장하지 않으며, 새로고침 시 홈 퀴즈/읽기 상태가 초기화됨.
- 마이페이지는 비회원에게 통계 대신 **로그인 유도 화면**만 노출.

### 7.2 공통 접근 훅 — `useUserStatus()`

- 반환값
  - `isAuthenticated`
  - `authStatus`
  - `todayKey`
  - `loadProgress(logType)`
  - `saveProgress(input)`
  - `loadStudyLogs(logType?)`
  - `loadDashboardData()`
- 내부에서 `useSession()`으로 로그인 상태를 판별하고, 회원일 때만 `/api/study-logs`를 통해 저장/조회.

### 7.3 날짜 기준

- 모든 로그는 KST 기준 `YYYY-MM-DD` 문자열 `kst_date`를 사용.
- `getKstDateKey()`는 `Intl.DateTimeFormat(..., { timeZone: "Asia/Seoul" })` 기반으로 오늘 날짜 키를 생성.

### 7.4 저장 대상 로그

| log_type | 설명 |
|----------|------|
| `daily_word_quiz` | 홈 단어 퀴즈 진행 상태, 선택 답안, 완료 여부 |
| `reading_session` | 읽기 완료 후 퀴즈 결과, CPM, 총평, 사고력 노트, 방사형 점수 |

### 7.5 홈 퀴즈 복구 로직

**위치:** `components/dashboard/TodayWordQuizCard.tsx`

- 회원일 때만 `loadProgress("daily_word_quiz")`로 오늘 로그를 조회.
- 저장된 `payload.quizItems`, `step`, `answered`, `selectedWord`, `completed` 값을 상태에 다시 주입해 새로고침 후 즉시 복구.
- 비회원은 마운트 시 항상 초기 상태로 리셋.
- 마지막 문항을 풀면 `saveProgress({ logType: "daily_word_quiz", ... })`를 호출해 완료 상태를 `study_logs`에 저장.
- 이미 오늘 완료한 회원은 퀴즈 시작 화면 대신 **완료 배지 + "오늘의 퀴즈 완료! 내일 다시 만나요"** 메시지를 즉시 노출.

### 7.6 읽기 결과 저장 로직

**위치:** `components/reading/ShortStoryPageClient.tsx`, `components/reading/ShortStoryQuizContainer.tsx`

- 결과 화면 도달 시 `onComplete(payload)`가 1회 호출.
- 저장 payload에는 다음 정보가 포함:
  - 제목, 타입, 읽은 문장 수
  - 객관식 정답 수 / 전체 문제 수
  - CPM
  - 총평(`summaryFeedback`)
  - 사고력 피드백(`thinkingFeedback`)
  - 방사형 점수(`radarScores`)
  - 사고력 노트(`thinkingNotes`)
- 비회원은 저장하지 않고, 회원일 때만 `saveProgress({ logType: "reading_session", ... })` 실행.

### 7.7 마이페이지 집계

- `loadDashboardData()`는 회원일 때 `study_logs` 전체를 읽고 `aggregateDashboardStatsFromLogs()`로 집계.
- 집계 항목
  - `totalSentencesRead`
  - `todayAccuracy`
  - `averageWpm`
  - `streakDays`
  - `weeklySentencesByDay`
  - `weeklyWpmByDay`
  - `last7DayLabels`
  - `thinkingNotes`
- 데이터가 없으면 `hasAnyData = false`로 빈 상태 `"아직 학습 기록이 없어요"`를 노출.

### 7.8 마이페이지 라우팅 구조

- `/mypage` 진입 시 기본 화면은 `/mypage/info`로 리다이렉트된다.
- 하위 라우트
  - `/mypage/info`: 내 정보
  - `/mypage/info/edit`: 내 정보 수정
  - `/mypage/growth-report`: 나의 성장 리포트
- `middleware.ts`는 `/mypage/:path*` 전체에 인증 보호를 적용한다.
- 사이드 메뉴 `마이페이지` 그룹은 `내 정보`와 `나의 성장 리포트` 하위 메뉴를 고정 노출한다.

---

## 8. 마이페이지 피드백·배지

### 8.1 맞춤 피드백

**위치:** `lib/mypage-data.ts` — `getFeedbackFromStats(stats)`

- **입력:** totalSentencesRead, todayAccuracy, averageWpm, streakDays.
- **출력:** `goodItems`, `improveItems` (문자열 배열).

**규칙 요약:**

| 조건                         | goodItems                         | improveItems                |
|-----------------------------|------------------------------------|-----------------------------|
| 300 ≤ averageWpm(CPM) ≤ 700 | 꼼꼼한 읽기 속도 유지              | -                           |
| averageWpm > 700             | -                                  | 속도 조절                   |
| averageWpm < 300 (단, > 0)   | -                                  | 읽기 속도 올리기            |
| totalSentencesRead ≥ 10     | 꾸준히 읽고 있음                   | -                           |
| 0 < totalSentencesRead < 10 | -                                  | 조금 더 읽어보기            |
| todayAccuracy ≥ 80          | 퀴즈 정답률 좋음                   | -                           |
| 그 외 (학습 있음)           | -                                  | 퀴즈 90% 목표               |
| streakDays ≥ 3              | 연속 학습 중                       | -                           |
| 학습 있음, 위 조건 없음     | “오늘도 수고했어요” 1개            | 매일 10분 읽기 습관         |

### 8.2 성취 배지 해금

**위치:** `components/mypage/MypageDashboard.tsx` — `getBadgesWithUnlocked(stats)`

| 배지 id          | 해금 조건                          |
|------------------|-------------------------------------|
| sentences-100   | totalSentencesRead ≥ 100           |
| quiz-80          | todayAccuracy ≥ 80                  |
| steady-reader    | 300 ≤ averageWpm(CPM) ≤ 700 이고 averageWpm > 0 |
| sentences-500   | totalSentencesRead ≥ 500           |
| week-streak      | streakDays ≥ 7                     |

- `내 정보` 페이지는 프로필, 최근 획득 배지, 최근 학습 기록을 중심으로 구성된다.
- `나의 성장 리포트`는 별도 페이지(`components/mypage/GrowthReportDashboard.tsx`)에서 학습자 한 줄 분석, 습관 카드, 활동 요약, 성장 곡선, 사고력 노트, 학습 코칭을 렌더링한다.
- 성장 리포트의 `출석` 레이아웃은 제거되어 현재는 요약 수치와 그래프 중심으로 구성된다.

---

## 9. 읽기 후 코칭 메시지

**위치:** `components/reading/CoachingFeedback.tsx` — `getFeedbackMessage(tier, quizCorrect, quizTotal)`

- 학습 리포트 총평·영역별 결과용 상세 규칙은 `docs/LEARNING_REPORT_COMMENT_SYSTEM.md` 문서를 기준으로 확장한다.

- **정답률:** `rate = round((quizCorrect / quizTotal) * 100)`.
- **속도 코멘트:** tier별 고정 문구 (차근차근/안정적/매우 빠름).
- **퀴즈 코멘트:**  
  - rate ≥ 80: “퀴즈도 n% 맞춰서 대단해요!”  
  - rate ≥ 60: “퀴즈 n% 맞췄어요. 조금만 더 복습해 보면 좋겠어요.”  
  - 그 미만: “퀴즈를 다시 한번 읽어 보면 좋겠어요.”
- 최종 메시지 = 속도 코멘트 + 퀴즈 코멘트.

---

## 10. 시각화·게이지

### 10.1 CPM → 게이지 퍼센트

**위치:** `components/mypage/SpeedChart.tsx` — `cpmToPercent(cpm)`

- **공식:** `min(100, round((cpm / 1000) * 100))`.
- CPM 0~1000을 0~100%로 선형 매핑.

### 10.2 진행률 퍼센트

- **읽기 진행률:** `progressPercent = (readCount / totalSentences) * 100` (반올림).
- **퀴즈 진행률:** (현재까지 푼 문항 인덱스 / 전체 문항 수) × 100.

---

## 11. 기타 상수·레이아웃

- **바텀 네비 높이:** `BOTTOM_NAV_HEIGHT_REM = 3.5` (h-14, 56px).
- **읽기 네비 바 높이:** `READING_NAV_BAR_HEIGHT_REM = 4.5` (본문 하단 패딩용).
- **지능형 하단 액션바:**  
  - 모바일: `bottom = calc(3.5rem + env(safe-area-inset-bottom))`.  
  - PC: `bottom: 0`, LNB 너비만큼 `left`/`width` 조정 (SidebarContext `collapsed` 반영).

---

이 문서는 코드 기준으로 정리되었으며, 추후 API·백엔드 연동 시 수치·데이터 소스가 바뀌면 함께 갱신하는 것이 좋습니다.
