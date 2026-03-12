# Vercel 배포 및 캐시 제거

어드민 수정 사항이 서비스에 즉시 반영되도록 **완전 자동화**가 적용되어 있습니다.

## 1. 어드민 저장 시 자동 재검증 (Webhook 없이 동작)

- **콘텐츠 저장:** `POST /api/contents` 로 저장하면 **저장 성공 직후** 서버에서 홈(/), 읽기 목록·문해력 기초 훈련·마이페이지 등 **전체 경로를 자동으로 재검증**합니다. 별도 버튼이나 Vercel 대시보드 접속 불필요.
- **단어/기타:** 어드민에서 단어를 수정·저장하는 경우, 저장 후 **한 번만** 재검증 API를 호출하면 됩니다.  
  - **GET** `https://<서비스 도메인>/api/revalidate?secret=<REVALIDATE_SECRET>`  
  - 또는 **POST** `https://<서비스 도메인>/api/revalidate` + 헤더 `Authorization: Bearer <REVALIDATE_SECRET>`  
  브라우저에서 링크로 열거나, 어드민 [저장] 로직 마지막에 `fetch('/api/revalidate?secret=...')` 를 호출하도록 넣으면 됩니다.

## 2. 전역 실시간화 설정 (이미 적용됨)

다음 페이지에는 `export const dynamic = 'force-dynamic'` 및 `export const revalidate = 0`이 적용되어 있습니다.

- `app/page.tsx` (홈)
- `app/reading/page.tsx`, `app/reading/[id]/page.tsx`
- `app/reading/short/page.tsx`, `app/reading/short/[id]/page.tsx`
- `app/reading/long/page.tsx`, `app/reading/long/[id]/page.tsx`
- `app/reading/category/page.tsx`, `app/reading/category/[id]/page.tsx`
- `app/reading/digital/page.tsx`, `app/reading/digital/[id]/page.tsx`
- `app/practice/core-word/page.tsx`
- `app/mypage/page.tsx`
- `app/mypage/info/page.tsx`
- `app/mypage/info/edit/page.tsx`
- `app/mypage/growth-report/page.tsx`
- `app/debug-fetch/page.tsx`

## 3. 배포 후 자동 캐시 초기화 (수동 작업 제거)

```bash
npm run deploy:vercel
```

- **동작:** `npm run build` 실행 후, **자동으로** 프로덕션의 Revalidate API를 한 번 호출해 **전체 캐시를 초기화**합니다.
- **필요 설정:** `.env.local`에 다음을 넣어 두세요.  
  - `PRODUCTION_URL=https://<your-app>.vercel.app`  
  - `REVALIDATE_SECRET=<your-secret>`  
  설정이 없으면 스크립트는 재검증 호출을 건너뛰고 안내만 출력합니다.
- **흐름:** Git push → Vercel 자동 배포. 배포가 끝난 뒤 로컬에서 `npm run deploy:vercel` 실행하면 빌드 검증 + 재검증 API 호출까지 한 번에 처리됩니다.

## 4. Vercel 대시보드에서 Data Cache Purge (수동, 필요 시만)

1. **Vercel Dashboard** → 프로젝트 선택
2. **Deployments** → 최신 배포 선택 후 **Redeploy** (필요 시 "Clear cache and redeploy" 옵션 사용)
3. 또는 **Settings** → **General** 등에서 **Build Cache** / **Data Cache** 관련 Purge 옵션 확인

## 5. 온디맨드 재검증 (직접 호출 시)

배포 후 특정 경로만 즉시 갱신하려면 `POST /api/revalidate`를 호출합니다.

```bash
curl -X POST https://YOUR_VERCEL_DOMAIN/api/revalidate \
  -H "Authorization: Bearer YOUR_REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

- `REVALIDATE_SECRET`이 설정된 경우 헤더 필수.
- body `{}`: 읽기 관련 경로 전체 무효화 (short, long, category, digital 목록·상세).
- body `{ "type": "short" | "long" | "category" | "digital", "id": "xxx" }`: 해당 타입 목록 + 상세 페이지만 무효화.

환경 변수 `REVALIDATE_SECRET`은 `.env.example` 참고 후 Vercel 프로젝트에 설정합니다.
