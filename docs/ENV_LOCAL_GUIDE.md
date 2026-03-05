# .env.local 에 넣을 값 정리

프로젝트 루트에 `.env.local` 파일을 만들고, 아래 변수들을 **이름=값** 형태로 넣으면 됩니다.  
값은 실제 사용하는 것으로 바꾸세요.

---

## 1. 복사해서 쓸 템플릿

`.env.local` 파일을 열고 아래 내용을 복사한 뒤, `xxxx` / `your-...` 부분만 본인 값으로 수정하세요.

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NextAuth (이메일/구글 로그인)
NEXTAUTH_SECRET=your-nextauth-secret-at-least-32-chars
# 로컬 개발 시에만 사용. 배포 시에는 Vercel 환경 변수에서 따로 설정 (아래 "NEXTAUTH_URL 배포" 참고)
NEXTAUTH_URL=http://localhost:3000

# 구글 로그인
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase 서비스 역할 (약관/학습 데이터 저장용, 노출 금지)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 2. 변수별 설명

| 변수명 | 필수 | 설명 | 어디서 구하는지 |
|--------|------|------|-----------------|
| NEXT_PUBLIC_SUPABASE_URL | O | Supabase 프로젝트 URL | Supabase 대시보드 - Settings - API - Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | O | Supabase anon 키 (회원가입/로그인에 사용) | **같은 프로젝트** Settings - API - anon public 키 (Reveal 후 전체 복사) |
| NEXTAUTH_SECRET | O | NextAuth 암호화용 비밀키 (32자 이상) | 아래 "NEXTAUTH_SECRET 만드는 방법" 참고 |
| NEXTAUTH_URL | O | 앱 주소 | 로컬: http://localhost:3000 / 배포: https://실제도메인 |
| GOOGLE_CLIENT_ID | 구글 사용 시 | 구글 OAuth 클라이언트 ID | Google Cloud Console - 사용자 인증 정보 - OAuth 2.0 클라이언트 ID |
| GOOGLE_CLIENT_SECRET | 구글 사용 시 | 구글 OAuth 비밀 | 위와 동일 화면 |
| SUPABASE_SERVICE_ROLE_KEY | O (약관/학습 저장 시) | Supabase service_role 키 | 아래 "SUPABASE_SERVICE_ROLE_KEY 찾는 방법" 참고 |

---

## 2-0. NEXTAUTH_SECRET 만드는 방법

이 값은 “찾는” 게 아니라 **본인이 새로 만드는** 랜덤 문자열입니다 (32자 이상).

- **Node.js 사용 (Windows 포함, 권장)**  
  터미널에서 한 번 실행하면 한 줄로 시크릿이 나옵니다. 그 전체를 복사해서 `NEXTAUTH_SECRET` 값으로 넣으면 됩니다.
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- **openssl 사용 (Mac/Linux 또는 Git Bash)**  
  ```bash
  openssl rand -base64 32
  ```
- **온라인 생성**  
  https://generate-secret.vercel.app/32 에서 생성한 32자 이상 문자열을 복사해 사용해도 됩니다.

로컬 `.env.local`과 Vercel 환경 변수에 **같은 값**을 넣으면 됩니다.

---

## 2-1. NEXTAUTH_URL – 로컬 vs 배포 (어디에 어떻게 쓸지)

- **`.env.local` (로컬 전용)**  
  - 로컬에서만 쓸 때는 **한 줄만** 넣으면 됩니다.  
    `NEXTAUTH_URL=http://localhost:3000`  
  - 배포 도메인을 `.env.local` **아래 줄에 하나 더 쓸 필요는 없습니다.**  
    (같은 파일에 로컬/배포 두 개 넣어도 Next.js는 하나만 쓰기 때문에 의미 없음.)

- **배포 시 (Vercel)**  
  - **Vercel 대시보드** → 해당 프로젝트 → **Settings** → **Environment Variables** 에서  
    `NEXTAUTH_URL` 를 **추가/수정**하고, 값만 **배포 도메인**으로 넣습니다.  
  - 예: `NEXTAUTH_URL=https://tto-dockk.vercel.app`  
  - 로컬은 `.env.local`의 `http://localhost:3000`, 배포는 Vercel에 등록한 `https://...` 가 각각 사용됩니다.

- **관리자 페이지 배포 도메인**  
  - 이 프로젝트에는 **또독 앱 하나**만 배포하는 구조입니다.  
  - 콘텐츠/단어 관리는 **Supabase 대시보드**(브라우저에서 supabase.com 로그인)에서 하므로,  
    **별도의 “관리자 페이지 배포 도메인”을 NEXTAUTH_URL 에 넣을 필요는 없습니다.**  
  - NEXTAUTH_URL 은 **사용자가 접속하는 또독 앱 주소**(로컬이면 localhost, 배포면 Vercel 도메인) 하나만 맞추면 됩니다.

---

## 2-2. SUPABASE_SERVICE_ROLE_KEY 찾는 방법

1. [Supabase](https://supabase.com/dashboard) 로그인 후, 사용 중인 **프로젝트** 선택.
2. 왼쪽 하단 **톱니바퀴(⚙️)** 클릭 → **Project Settings**.
3. 왼쪽 메뉴에서 **API** 선택.
4. **Project API keys** 섹션에서:
   - `anon` `public` / `service_role` 두 줄이 보입니다.
   - **`service_role`** 행 오른쪽에 **Reveal** 버튼이 있으면 클릭해 키를 표시.
   - 그 긴 문자열 전체를 복사해서 `SUPABASE_SERVICE_ROLE_KEY` 값으로 넣으면 됩니다.
5. 이 키는 **서버(API 라우트)에서만** 사용하고, 브라우저/클라이언트에는 노출하면 안 됩니다.

**중요: Project URL, anon 키, service_role 키는 반드시 같은 Supabase 프로젝트에서 복사해야 합니다.** 다른 프로젝트 것을 섞어 쓰면 "Invalid API key"가 납니다.

- **구글 로그인 후 약관 페이지**에서 "Invalid API key" → `SUPABASE_SERVICE_ROLE_KEY` 확인 (service_role, 같은 프로젝트).
- **이메일 회원가입** 시 "Invalid API key" → `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인. **같은 프로젝트**의 Settings → API → **anon public** 키를 Reveal 후 전체 복사해 넣으세요.

---

## 3. 주의사항

- .env.local 은 Git 에 올리지 마세요. (.gitignore 에 포함됨)
- SUPABASE_SERVICE_ROLE_KEY, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET 은 외부 노출 금지.
- Vercel 배포 시: 프로젝트 - Settings - Environment Variables 에 같은 변수 등록. NEXTAUTH_URL 만 배포 도메인으로 설정.
- 구글 로그인 사용 시: Google Cloud Console 에서 승인된 리디렉션 URI 에 https://실제도메인/api/auth/callback/google 추가.

---

## 4. 최소 구성 (로그인 없이 콘텐츠만)

이메일/구글 로그인 없이 Supabase 콘텐츠만 쓸 때는 아래 두 개만 있으면 됩니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

로그인/가입/약관/학습 저장을 쓰려면 위 1번 템플릿의 변수를 모두 채우면 됩니다.
