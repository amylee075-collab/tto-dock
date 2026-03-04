# 콘텐츠·오늘의 단어·퀴즈를 관리자(Supabase)로 옮기기

`npm run migrate:contents` 한 번에 다음 세 가지를 옮깁니다.

1. **contents**: `lib/data.ts`의 짧은 글·긴 글·분야별·디지털 콘텐츠
2. **today_words**: `lib/todayWordList.ts`의 오늘의 단어 50개
3. **core_word_quiz**: `lib/coreWordPractice.ts`의 문해력 기초 퀴즈(핵심 단어 찾기) 10문항

오늘의 단어는 **today_words** 테이블이 있을 때만 넣어지며, **첫 실행 시에만** 실행하는 것을 권장합니다. (재실행 시 같은 단어가 또 들어갈 수 있습니다.)  
퀴즈는 **core_word_quiz** 테이블이 있고 문항 수가 부족할 때만 넣으며, 이미 10개 이상 있으면 건너뜁니다.

## 1. Supabase `contents` 테이블의 id를 TEXT로

마이그레이션은 **기존 스토리 id**(예: `fox-sister`, `giving-tree`)를 그대로 사용합니다.  
Supabase에서 `contents`를 **처음 만드는 경우**에는 id를 **text**로 만들면 됩니다.

```sql
create table public.contents (
  id text primary key,
  title text not null,
  description text,
  thumbnail_url text,
  type text not null default 'reading',
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

이미 **id를 uuid**로 만들어 둔 경우에는, 아래 중 하나를 선택하면 됩니다.

- **A) id를 text로 바꾸기** (같은 테이블에서 기존 id와 스토리 id를 함께 쓰고 싶을 때)
  - 기존 행이 없으면: 컬럼 타입만 변경
  - 기존 행이 있으면: 기본키 제거 → id 타입 변경 → 기본키 다시 지정 등 단계가 필요합니다. Supabase 대시보드에서 테이블을 새로 만들고 id를 text로 두는 편이 쉽습니다.

- **B) 테이블은 그대로 두고, 마이그레이션만 포기**
  - 새 콘텐츠는 관리자에서만 추가하고, 기존 `lib/data.ts` 콘텐츠는 그대로 두는 방식입니다.

## 2. 오늘의 단어를 넣으려면: today_words 테이블

Supabase SQL 에디터에서:

```sql
create table if not exists public.today_words (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  meaning text not null,
  example text not null,
  type text not null check (type in ('순우리말', '한자어', '외래어')),
  created_at timestamptz not null default now()
);
```

이 테이블이 없으면 마이그레이션 시 오늘의 단어는 건너뛰고, contents만 반영됩니다.

`word`에 **유일 제약**을 두면 재실행 시 기존 행을 덮어써서(upsert) 안전하게 다시 옮길 수 있습니다. (테이블을 이미 만든 경우 아래만 실행해도 됨.)

```sql
-- today_words가 이미 있을 때, 재실행 시 중복/실패 방지용
alter table public.today_words add constraint today_words_word_key unique (word);
```

---

## 2-1. 오늘의 단어 데이터 옮기기가 실패했을 때

| 원인 | 확인 방법 | 해결 |
|------|-----------|------|
| **테이블 없음** | 터미널에 `today_words 테이블이 없어` 메시지 | 위 **§2** SQL로 `today_words` 테이블을 만든 뒤 `npm run migrate:contents` 다시 실행 |
| **RLS로 INSERT 막힘** | Supabase 대시보드 → Table Editor → today_words → RLS 정책 | `today_words`에 INSERT 허용 정책 추가하거나, 마이그레이션용으로 **service_role key** 사용 (스크립트에서만, 노출 금지) |
| **중복 오류** | `duplicate key` / `unique constraint` 메시지 | `word`에 unique가 있으면 스크립트가 upsert로 덮어쓰므로 그대로 재실행. 없으면 위 `today_words_word_key` 추가 후 재실행 |
| **기타 오류** | 터미널에 나온 에러 메시지 | 컬럼 이름·타입이 위 스키마와 같은지, `type`이 `순우리말`/`한자어`/`외래어`만 있는지 확인 |

`.env.local`의 `NEXT_PUBLIC_SUPABASE_ANON_KEY`로는 RLS 때문에 INSERT가 막혀 있을 수 있습니다. 그럴 때는 **Supabase 대시보드 → Project Settings → API** 에서 **service_role key**를 복사해, 마이그레이션용으로만 별도 env(예: `SUPABASE_SERVICE_ROLE_KEY`)에 넣고 스크립트가 그걸 쓰도록 바꾸는 방법도 있습니다. (service_role은 RLS를 거치지 않음. 코드 저장소·클라이언트에 올리지 마세요.)

## 3. 퀴즈를 넣으려면: core_word_quiz 테이블

Supabase SQL 에디터에서:

```sql
create table if not exists public.core_word_quiz (
  id uuid primary key default gen_random_uuid(),
  sentence text not null,
  correct_answer text not null,
  selectable_words jsonb not null default '[]'::jsonb,
  feedback_by_word jsonb not null default '{}'::jsonb,
  sort_order int,
  created_at timestamptz not null default now()
);
```

이 테이블이 없으면 마이그레이션 시 퀴즈는 건너뜁니다. **이미 테이블이 있는데 저장이 안 되면** 아래로 기본값을 jsonb로 고정하세요:

```sql
alter table public.core_word_quiz alter column selectable_words set default '[]'::jsonb;
alter table public.core_word_quiz alter column feedback_by_word set default '{}'::jsonb;
``` 이미 문항이 10개 이상 있으면 넣지 않고 건너뜁니다.

### 4. 퀴즈 반영이 실패할 때 (RLS 등)

| 원인 | 해결 |
|------|------|
| **테이블 없음** | 위 **§3** SQL로 `core_word_quiz` 테이블 생성 후 `npm run migrate:contents` 재실행 |
| **RLS로 INSERT 막힘** | today_words와 같이 `core_word_quiz`에 INSERT 허용 정책 추가하거나, 마이그레이션용 **service_role key** 사용 |

## 5. TTO-DOCK2에서 환경 변수 설정 (contents/today_words/퀴즈 공통)

프로젝트 루트에 `.env.local`을 만들고, **관리자와 같은 Supabase 프로젝트** 정보를 넣습니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 6. 마이그레이션 실행

TTO-DOCK2 루트에서:

```bash
npm run migrate:contents
```

성공하면 `contents`에 콘텐츠가(**단어 설명 vocabulary 포함**, 각 스토리에 있던 단어·뜻·예문이 그대로 들어감), `today_words` 테이블이 있으면 **오늘의 단어** 50개, `core_word_quiz` 테이블이 있으면 **핵심 단어 퀴즈** 10문항이 들어갑니다.  
이후 **관리자 페이지**의 콘텐츠·오늘의 단어·문해력 기초 퀴즈 메뉴에서 조회·수정할 수 있습니다.

## 7. 관리자에서 새로 만드는 콘텐츠의 id

`id`를 text로 쓰는 경우, 관리자에서 **새 콘텐츠**를 만들 때도 **id(문자열)** 를 넣어줘야 합니다.  
지금 관리자 코드는 id를 넣지 않으면 Supabase가 uuid를 채우므로, **id를 text로 쓰려면** 관리자 폼에서 “URL용 id(영문·숫자)”를 입력받아 저장하도록 수정하는 것이 좋습니다.
