# 콘텐츠 등록 (어드민)

## "null value in column id" 오류 해결

새 콘텐츠를 등록할 때 **id**가 비어 있으면 Supabase에서 위 오류가 납니다. 아래 두 가지 중 하나를 사용하세요.

---

### 방법 1: API로 등록 (권장)

**POST** `/api/contents` 를 사용하면 **id를 보내지 않아도 자동으로 UUID가 생성**됩니다.

- **URL**: `https://<your-domain>/api/contents` (또는 로컬 `http://localhost:3000/api/contents`)
- **Method**: POST
- **Headers**: `Content-Type: application/json`  
  - `REVALIDATE_SECRET`을 설정해 두었다면: `Authorization: Bearer <REVALIDATE_SECRET>`
- **Body 예시 (새 등록 시 id 생략)**:

```json
{
  "type": "short",
  "title": "글 제목",
  "content": "본문 내용...",
  "thumbnail_url": "/images/placeholder.png",
  "section": "과학",
  "badges": ["비문학", "사회"],
  "difficulty": 2
}
```

- **type**: `short` | `long` | `category` | `digital`
- **title**: Supabase 컬럼명 `title` — 썸네일·상세 페이지 제목에 그대로 반영
- **badges**: Supabase 컬럼명 `badges`(배열). 비문학·사회 등 분야 칩으로 `badges.map()` 노출. body에 `categories`만 보내도 내부에서 `badges`로 저장
- **difficulty**: 1~3 또는 `"쉬움"`/`"보통"`/`"어려움"` — 별표 칩으로 표시
- **id**: 없거나 빈 문자열이면 서버에서 UUID 자동 생성
- **응답**: `{ "ok": true, "id": "<생성된-uuid>" }`

기존 콘텐츠 수정 시에는 body에 **id**를 넣어서 보내면 됩니다.

**저장 즉시 캐시 자동 삭제:** 이 API로 저장에 성공하면, 서버에서 홈(/)·읽기 목록·문해력 기초·마이페이지 등 **전체 경로를 자동 재검증**합니다. Vercel 대시보드에서 수동 Purge 할 필요 없습니다.

### 서비스 화면 반영 (실시간)

- 모든 읽기·학습 페이지에 `export const dynamic = 'force-dynamic'`, `export const revalidate = 0` 적용으로 **캐시 없이** 최신 데이터 조회.
- **제목:** Supabase 컬럼 `title` → 목록 카드·상세 페이지 제목에 즉시 반영.
- **분야 칩:** Supabase 컬럼 `badges`(배열)만 사용. `badges.map()`으로 비문학·사회 등 각 칩 노출, 유효 분야만 최대 3개.
- **난이도 칩:** `difficulty` 1→★☆☆, 2→★★☆, 3→★★★. 텍스트 `"쉬움"`/`"보통"`/`"어려움"`도 별표로 변환.
- 배포 후 반영이 느리면 [Vercel 배포·캐시 제거](DEPLOY_VERCEL.md) 참고.

---

## 2. 3단계 독후 활동 퀴즈 입력

### 2.1 어드민 화면 위치

- 경로: `/admin/contents/[id]`
- 기능:
  - 상단: 제목, 본문, 썸네일, section, badges, difficulty 수정
  - 하단: **탭 형식의 3단계 독후 활동 퀴즈 폼**

### 2.2 핵심 단어 탭

- `core_quiz` jsonb로 저장됩니다. (스키마는 [Supabase 퀴즈 컬럼](SUPABASE_QUIZ_COLUMNS.md) 참고)
- 필드
  - **문제 문장(sentence)**: 정답이 들어갈 위치를 `?`로 넣은 문장 (예: `오늘 날씨가 ? 좋다`)
  - **정답 단어(answer)**: 물음표 자리에 들어갈 단어
  - **유사 정답 목록(similarAnswers)**: 줄바꿈 또는 쉼표로 구분 (띄어쓰기를 무시하고 정답 처리)
  - **질문 문장(question)**: sentence가 없을 때 대체로 사용할 설명 문장
- 학습자 UI에서는 `sentence` 안의 `answer` 위치를 찾아 **주황색 물음표 박스**로 치환해서 노출합니다.

### 2.3 독해 퀴즈 탭

- `read_quizzes` jsonb 배열로 저장됩니다.
- 기능
  - **문제 추가** 버튼으로 최대 5세트까지 생성
  - 각 세트마다
    - **지문(q)**: 질문 문장
    - **보기 개수(options)**: 2~4개 사이에서 선택
    - 각 보기 텍스트
    - **정답 인덱스(ans)**: 0-base (UI에서는 1~N 중 선택)
- 학습자 UI에서는 이 배열을 기반으로
  - 옵션을 **셔플(Shuffle)** 해서 보여주고
  - 하단 피드백/버튼 영역의 높이를 고정해, 버튼 클릭 시 레이아웃이 흔들리지 않도록 합니다.

### 2.4 요약하기 탭

- `summary_quiz` jsonb로 저장됩니다.
- 필드
  - **필수 키워드(requiredKeywords)**: 쉼표 또는 줄바꿈으로 입력, AI 피드백용
  - **예시 답안(exampleAnswer)**: 모델 또는 튜닝 시 참고할 수 있는 예시 요약
  - **학년별 글자 수(charLimitByGrade)**: 3~6학년별 권장 글자 수
- 학습자 UI에서는
  - 현재 입력 글자 수와 `charLimitByGrade`를 함께 보여주고
  - 제출 후 `recharts` 방사형 그래프로 이해력/사고력/표현력 3축 그래프를 렌더링합니다.

---

### 3. Supabase Table Editor에서 직접 넣는 경우

Supabase 대시보드 → Table Editor → **contents** 테이블에서 새 행을 추가한다면, **id 컬럼에 기본값**을 두면 됩니다.

1. Supabase 대시보드 → **SQL Editor**
2. 아래 중 프로젝트에 맞게 실행 (한 번만 하면 됨):

**PostgreSQL 13+ (gen_random_uuid 사용 가능):**

```sql
ALTER TABLE contents
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
```

**이전 버전 또는 확장 없을 때:**

```sql
-- uuid-ossp 확장 활성화 후
ALTER TABLE contents
ALTER COLUMN id SET DEFAULT uuid_generate_v4()::text;
```

이후 Table Editor에서 새 행 추가 시 **id**를 비워 두면 자동으로 값이 채워집니다.
