# STUDY_LOGS 스키마

회원 학습 기록을 Supabase `study_logs` 테이블에 저장하기 위한 최소 스키마입니다.

## 권장 SQL

```sql
create table if not exists public.study_logs (
  id text primary key,
  user_id uuid not null,
  log_type text not null check (log_type in ('daily_word_quiz', 'reading_session')),
  kst_date date not null,
  status text not null check (status in ('in_progress', 'completed')),
  content_id text,
  content_type text,
  payload jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_logs_user_id_idx
  on public.study_logs (user_id);

create index if not exists study_logs_user_date_idx
  on public.study_logs (user_id, kst_date desc);

create index if not exists study_logs_type_idx
  on public.study_logs (user_id, log_type, kst_date desc);
```

## payload 예시

### daily_word_quiz

```json
{
  "quizItems": [{ "id": "1", "word": "뉴스", "meaning": "새로 일어난 소식", "example": "...", "options": ["뉴스", "반사", "용해"] }],
  "step": 2,
  "answered": true,
  "selectedWord": "뉴스",
  "totalQuestions": 3,
  "completed": true
}
```

### reading_session

```json
{
  "title": "임금님 귀는 당나귀 귀",
  "source": "short",
  "sentencesRead": 12,
  "quizCorrect": 4,
  "quizTotal": 5,
  "cpm": 312,
  "summaryFeedback": "핵심 내용을 잘 따라왔어요.",
  "thinkingFeedback": "근거를 더 자세히 써 보면 더 좋아질 거예요.",
  "radarScores": {
    "vocabulary": 88,
    "understanding": 80,
    "thinking": 76,
    "expression": 79
  },
  "thinkingNotes": [
    {
      "question": "주인공은 왜 그런 선택을 했을까요?",
      "userAnswer": "비밀을 말하고 싶었기 때문이에요.",
      "modelAnswer": "비밀을 혼자 간직하기 어려웠기 때문입니다."
    }
  ],
  "completed": true
}
```
