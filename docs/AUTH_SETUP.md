# 또독 인증 설정 (NextAuth + Supabase)

## 1. 환경 변수 (.env.local)

```env
# 기존
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 인증 추가
NEXTAUTH_SECRET=랜덤문자열32자이상
NEXTAUTH_URL=http://localhost:3000

# 구글 로그인 (Google Cloud Console에서 OAuth 2.0 클라이언트 ID 발급)
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx

# 약관/학습 데이터 저장용 (NextAuth 세션·마이그레이션 API에서 사용)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- `NEXTAUTH_SECRET`: `openssl rand -base64 32` 로 생성 권장.
- 프로덕션에서는 `NEXTAUTH_URL` 을 실제 도메인으로 설정.
- 구글: [Google Cloud Console](https://console.cloud.google.com/) → API 및 서비스 → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID. 리디렉션 URI에 `https://your-domain/api/auth/callback/google` 추가.

## 2. Supabase Auth (이메일 가입)

Supabase 대시보드에서 **Authentication → Providers → Email** 을 켜두면, 회원가입 API(`/api/auth/signup`)가 `supabase.auth.signUp()` 으로 사용자를 생성합니다. 비밀번호 정책은 Supabase 기본값을 따릅니다.

## 3. user_profiles 테이블 (약관·학습 데이터)

Supabase SQL 에디터에서 실행:

```sql
create table if not exists public.user_profiles (
  auth_user_id text primary key,
  email text,
  terms_agreed_at timestamptz,
  learning_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: 서비스 역할로만 접근 (앱에서는 API 라우트가 service role 사용)
alter table public.user_profiles enable row level security;

create policy "Service role only"
  on public.user_profiles
  for all
  using (auth.role() = 'service_role');
```

- `auth_user_id`: NextAuth 세션의 user.id (Supabase Auth UUID 또는 구글 sub).
- `terms_agreed_at`: 약관 동의 시각 (구글 첫 방문 시 동의 페이지 후 저장).
- `learning_data`: 로그인 후 “이전 학습 기록 연동” 시 localStorage 데이터(JSON) 저장.

## 4. 플로우 요약

- **이메일 가입**: `/auth/signup` → 이메일/비밀번호/만 14세/약관 동의 → `POST /api/auth/signup` (Supabase signUp) → 가입 직후 `user_profiles`에 반영(어드민에서 확인 가능) → 자동 로그인 후 홈으로 이동. (이메일 인증 필요 시에는 가입 완료 안내 후 로그인 페이지로.)
- **이메일 로그인**: `/auth/login` → Credentials provider가 Supabase signInWithPassword 로 검증.
- **구글 로그인**: 구글 OAuth → 첫 방문 시 `needsTermsAgreement` 로 `/auth/terms` 리다이렉트 → 동의 후 `POST /api/auth/agree-terms` → 이후 정상 이용.
- **보호 라우트**: `/mypage`, `/reading/:id` (목록이 아닌 상세 한 단계) 는 미인증 시 `/auth/login?callbackUrl=...` 로 리다이렉트.
- **학습 기록 연동**: 로그인 후 localStorage 에 `ttodock_weekly_challenge` 데이터가 있으면 “이전 학습 기록을 연동하시겠습니까?” 팝업 → 승인 시 `POST /api/migrate-learning-data` 로 서버에 저장.
