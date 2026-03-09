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

### 5.3 문해력 기초 퀴즈(핵심 단어 찾기) — 3단계 피드백

**위치:** `components/practice/CoreWordPractice.tsx`

- **시도 횟수:** 문항별 `attempts` (0 → 오답 시 +1). 문항 변경 시 0으로 리셋.
- **1회차 정답:** 정답 애니메이션 후 즉시 「다음 문제」 활성화.
- **1회차 오답:** `attempts === 1` → 오답 모달 "아쉬워요! 한 번 더 기회를 줄게요." + 어드민 단어별 피드백(subMessage), 확인 후 같은 문항에서 재선택.
- **2회차 오답:** `attempts === 2` → "정답은 [정답]였어요!" + 어드민 정답 단어 피드백, 정답 보기 하이라이트, 다른 보기 비활성화, 「다음 문제」만 활성화. `onWrong(quizId)` 호출로 학습 리포트에서 오답 처리.
- **완료 화면:** 10문항 모두 완료 시(정답 또는 2회 오답 후 다음) — "모든 퀴즈를 풀었어요!", 서브 텍스트, Confetti, 캐릭터 연출, [홈으로 가기] 버튼.

---

## 6. 읽기 타이머

**위치:** `lib/hooks/useReadingTimer.ts`

- **시작:** 컴포넌트 마운트 시 0초부터 시작.
- **간격:** 1초마다 +1, 최대 `60 * 60` (60:00).
- **표기:** `MM:SS` (2자리 패딩).
- **범위:** 단락(글) 읽기 페이지 진입 시마다 리셋(세션 유지 없음).

---

## 7. 챌린지·마이페이지 저장소(localStorage)

**위치:** `lib/challenge-storage.ts`

### 7.1 TTL(만료)

- **키:** `ttodock_weekly_challenge`
- **만료:** 생성 시점(`createdAt`)으로부터 **168시간(7일)**.
- **만료 시:** `readRaw()`에서 삭제 후 초기 데이터로 리셋.

### 7.2 저장 데이터 구조

| 필드                   | 설명                          |
|------------------------|-------------------------------|
| createdAt              | 생성 시점(ms)                 |
| totalSentencesRead     | 누적 읽은 문장 수            |
| quizCorrect / quizTotal| 퀴즈 정답 수 / 전체 문제 수   |
| lastWpm                | 마지막 기록 CPM(글자/분). 키는 호환용 유지 |
| streakDays             | 연속 학습 일수                |
| lastActivityDate       | 마지막 활동일 YYYY-MM-DD      |
| weeklySentencesByDay   | [월~일] 요일별 문장 수 (7개)  |
| weeklyWpmByDay         | [월~일] 요일별 CPM (7개)      |
| dailyStats             | 날짜별 { sentences, wpm } (wpm 값은 CPM) |

### 7.3 요일 인덱스

- **그래프/저장:** `(new Date().getDay() + 6) % 7` → 0=월, 6=일.

### 7.4 읽기 완료 시 — `addReadingResult(sentencesRead)`

- 만료 시: 새 챌린지로 초기화 후 오늘만 기록.
- 아니면:  
  - `totalSentencesRead` 누적  
  - 오늘 요일 인덱스에 `weeklySentencesByDay[dayIdx]` 누적  
  - `dailyStats[today].sentences` 누적  
  - `lastActivityDate`가 오늘과 다르면:  
    - 이전이 “어제”면 `streakDays += 1`  
    - 그 외면 `streakDays = 1`  
  - `lastActivityDate = today`

### 7.5 퀴즈 완료 시 — `addQuizResult(correct, total, cpm)`

- `quizCorrect`, `quizTotal` 누적, `lastWpm = cpm` (저장 키는 호환용)
- `weeklyWpmByDay[dayIdx] = cpm`, `dailyStats[today].wpm = cpm`
- 연속일·lastActivityDate 갱신 로직은 읽기와 동일.

### 7.6 마이페이지 통계 — `getChallengeStatsForMypage()`

- **정답률:** `todayAccuracy = round((quizCorrect / quizTotal) * 100)` (전체 누적 기준).
- **평균 속도(CPM):** `averageWpm = lastWpm` (실제 평균이 아닌 “최근 1회 CPM”. 필드명은 호환용).
- **주간 문장 수:** “오늘부터 앞으로 7일” `getNext7Days()`를 X축으로, `dailyStats[날짜].sentences` 매핑.  
  합이 `totalSentencesRead`보다 작으면 오늘에 차이만큼 보정.
- **주간 CPM:** 동일 7일 기준, `dailyStats` 또는 `weeklyWpmByDay`에서 매핑. 오늘만 0이면 `lastWpm`으로 보정.
- **라벨:** `last7DayLabels` = 위 7일의 `MM/DD` 포맷.

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

---

## 9. 읽기 후 코칭 메시지

**위치:** `components/reading/CoachingFeedback.tsx` — `getFeedbackMessage(tier, quizCorrect, quizTotal)`

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
