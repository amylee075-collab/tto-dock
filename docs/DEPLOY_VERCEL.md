# Vercel 배포 및 캐시 제거

어드민 수정 사항이 서비스에 즉시 반영되도록, 배포 후 **Data Cache Purge**를 진행하는 것을 권장합니다.

## 1. 전역 실시간화 설정 (이미 적용됨)

다음 페이지에는 `export const dynamic = 'force-dynamic'` 및 `export const revalidate = 0`이 적용되어 있습니다.

- `app/page.tsx` (홈)
- `app/reading/page.tsx`, `app/reading/[id]/page.tsx`
- `app/reading/short/page.tsx`, `app/reading/short/[id]/page.tsx`
- `app/reading/long/page.tsx`, `app/reading/long/[id]/page.tsx`
- `app/reading/category/page.tsx`, `app/reading/category/[id]/page.tsx`
- `app/reading/digital/page.tsx`, `app/reading/digital/[id]/page.tsx`
- `app/practice/core-word/page.tsx`
- `app/mypage/page.tsx`
- `app/debug-fetch/page.tsx`

## 2. 배포 스크립트

```bash
npm run deploy:vercel
```

- `npm run build` 실행 후, Vercel Data Cache Purge 방법을 안내합니다.
- 실제 푸시·배포는 Vercel Git 연동 또는 `vercel --prod`로 진행합니다.

## 3. Vercel 대시보드에서 Data Cache Purge

1. **Vercel Dashboard** → 프로젝트 선택
2. **Deployments** → 최신 배포 선택 후 **Redeploy** (필요 시 "Clear cache and redeploy" 옵션 사용)
3. 또는 **Settings** → **General** 등에서 **Build Cache** / **Data Cache** 관련 Purge 옵션 확인

## 4. 온디맨드 재검증 (선택)

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
