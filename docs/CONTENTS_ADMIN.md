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
  "badges": ["과학", "쉬움"],
  "categories": ["문학", "과학"],
  "difficulty": 2
}
```

- **type**: `short` | `long` | `category` | `digital`
- **title**, **categories**(배열, 최대 3개 저장), **difficulty**(1~3 또는 `"쉬움"`/`"보통"`/`"어려움"`) — 서비스 카드에 즉시 반영
- **id**: 없거나 빈 문자열이면 서버에서 UUID 자동 생성
- **응답**: `{ "ok": true, "id": "<생성된-uuid>" }`

기존 콘텐츠 수정 시에는 body에 **id**를 넣어서 보내면 됩니다.

### 서비스 화면 반영 (실시간)

- 모든 읽기·학습 페이지에 `dynamic = 'force-dynamic'`, `revalidate = 0` 적용으로 **캐시 없이** 최신 데이터 조회.
- **분야 칩:** `categories` 배열을 최대 **3개**까지 칩으로 표시. 유효 분야만 노출(문학, 비문학, 과학, 역사, 사회, 예술, 기술·AI, 디지털, 신문 기사, 미디어 비판).
- **난이도 칩:** `difficulty` 1→★☆☆, 2→★★☆, 3→★★★. 텍스트 `"쉬움"`/`"보통"`/`"어려움"`도 동일하게 별표로 변환되어 표시됨.
- 배포 후 반영이 느리면 [Vercel 배포·캐시 제거](DEPLOY_VERCEL.md) 참고.

---

### 방법 2: Supabase Table Editor에서 직접 넣는 경우

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
