# Supabase contents 테이블 — 3단계 퀴즈 컬럼

어드민에서 3단계 독후 활동(핵심 단어, 독해, 요약) 데이터를 저장하려면 `contents` 테이블에 아래 컬럼을 추가하세요.

## 마이그레이션 SQL (Supabase SQL Editor에서 실행)

```sql
-- 3단계 독후 활동용 jsonb 컬럼 추가
ALTER TABLE contents
  ADD COLUMN IF NOT EXISTS core_quiz jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS read_quizzes jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS summary_quiz jsonb DEFAULT NULL;

COMMENT ON COLUMN contents.core_quiz IS '핵심 단어 퀴즈: { question, answer, sentence?, similarAnswers? }';
COMMENT ON COLUMN contents.read_quizzes IS '독해 퀴즈 배열(최대 5): [{ q, options: string[], ans: number }]';
COMMENT ON COLUMN contents.summary_quiz IS '요약 퀴즈: { requiredKeywords?, exampleAnswer?, charLimitByGrade? }';
```

## 스키마 요약

| 컬럼           | 타입  | 설명 |
|----------------|-------|------|
| `core_quiz`    | jsonb | 단어 퀴즈: 문장(sentence), 정답(answer), 유사 정답(similarAnswers) |
| `read_quizzes` | jsonb | 독해 퀴즈 배열(3~5세트), 보기 2~4개, 정답 인덱스 |
| `summary_quiz` | jsonb | 요약: 필수 키워드, 예시 답안, 학년별 글자 수 |

PGRST100 방지: 서버 쿼리는 `id`로만 조회하고, `type` 필터는 조회 결과를 메모리에서 적용합니다.
