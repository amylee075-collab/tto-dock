# 분야별 글 읽기 / 디지털 문해력 섬네일 이미지 가이드

## 0. 콘텐츠별 섬네일 파일명 (제작용 체크리스트)

아래 파일명으로 이미지를 만들어 `public/images/` 에 넣으면 됩니다. (확장자 `.webp` 권장, `.png` 가능)

### 분야별 글 읽기 (6개)

| No | 콘텐츠 id | 제목 | **파일명** | 저장 경로 |
|----|-----------|------|------------|-----------|
| 1 | science-photosynthesis | 식물의 광합성 | `science-photosynthesis.webp` | `public/images/science-photosynthesis.webp` |
| 2 | science-earthquake | 지표의 변화와 지진 | `science-earthquake.webp` | `public/images/science-earthquake.webp` |
| 3 | history-sejong | 세종대왕과 훈민정음 | `history-sejong.webp` | `public/images/history-sejong.webp` |
| 4 | history-ganghwa | 강화도 조약과 근대화 | `history-ganghwa.webp` | `public/images/history-ganghwa.webp` |
| 5 | society-scarcity | 희소성과 합리적 선택 | `society-scarcity.webp` | `public/images/society-scarcity.webp` |
| 6 | society-democracy | 민주주의와 선거 | `society-democracy.webp` | `public/images/society-democracy.webp` |

### 디지털 문해력 (2개)

| No | 콘텐츠 id | 제목 | **파일명** | 저장 경로 |
|----|-----------|------|------------|-----------|
| 1 | digital-plastic | 플라스틱 줄이기 캠페인 | `digital-plastic.webp` | `public/images/digital-plastic.webp` |
| 2 | digital-fakenews | 가짜 뉴스 판별하기 | `digital-fakenews.webp` | `public/images/digital-fakenews.webp` |

- **총 8개 파일**. 위 파일명으로 저장하면 코드에서 자동으로 해당 경로를 참조함.  
  확장자를 `.png`로 쓸 경우 파일명을 `*.png`로 만들고, `lib/data.ts` 의 각 스토리 `thumbnail` 값을 `"/images/xxx.png"` 로 수정하면 됨.

---

## 1. 이미지 소스 경로

### 분야별 글 읽기 (app/reading/category)

- **호출 위치**: `app/reading/category/page.tsx` → `<ThumbnailWithFallback src={story.thumbnail} />`
- **경로 정의**: **데이터 파일** `lib/data.ts` 의 `categoryStories` 배열에서 각 스토리의 `thumbnail` 필드 (콘텐츠별 파일명 사용).

### 디지털 문해력 (app/reading/digital)

- **호출 위치**: `app/reading/digital/page.tsx` → `<ThumbnailWithFallback src={story.thumbnail} />`
- **경로 정의**: **데이터 파일** `lib/data.ts` 의 `digitalLiteracy` 배열에서 각 스토리의 `thumbnail` 필드.

| 스토리 id | 현재 thumbnail 값 |
|-----------|-------------------|
| digital-plastic | `/images/digital-plastic.webp` |
| digital-fakenews | `/images/digital-fakenews.webp` |

- **파일**:  
  - 페이지: `app/reading/digital/page.tsx`  
  - 데이터: `lib/data.ts` (export `digitalLiteracy`)  
  - 컴포넌트: `components/reading/ThumbnailWithFallback.tsx` (전달받은 `src` 그대로 사용)

### 참고

- 분야별·디지털 모두 **콘텐츠별** `thumbnail` 경로를 `lib/data.ts` 에서 정의하고, 페이지에서 `story.thumbnail` 로 전달해 사용함.

---

## 2. 이미지 저장 경로 (폴더 구조)

- **기본 루트**: Next.js `public` 폴더가 웹 루트이므로, 코드에서 `/images/...` 는 **`public` 아래**를 가리킴.
- **저장할 디렉터리**:
  ```
  public/images/
  ```
- 현재 `public/images/` 안에는 `.gitkeep`, `animal_farm.svg` 등만 있고,  
  `dummy-science.png`, `dummy-history.png`, `dummy-social.png`, `fox_thumb.png` 는 **없는 상태**임.

---

## 3. 회색 박스 / image_413f16.png 가 나오는 이유

- **이미지 파일이 없음**  
  - `public/images/` 에 콘텐츠별 섬네일(예: `science-photosynthesis.webp`, `digital-plastic.webp` 등)이 없을 때.
- **동작 방식**  
  - **분야별·디지털 공통**: `ThumbnailWithFallback` 에서 `<Image>` 의 `onError` 시 →  
    회색 배경 + `/images/character.png` 캐릭터 이미지로 **fallback**.
- **`image_413f16.png`**  
  - 코드베이스에는 해당 파일명이 없음.  
  - Next.js `Image` 컴포넌트가 로드 실패(404 등) 시 사용하는 **내부 placeholder/blur** 용 해시 파일명으로 추정됨.  
  - 즉, **특정 기본 파일을 직접 호출하는 것이 아니라**, 이미지가 없거나 실패했을 때 나오는 **기본 동작**으로 보면 됨.

**정리**: 회색 박스/이상한 파일명은 **이미지가 없어서 fallback 이 나오는 것**이 맞음.  
위 **§0 콘텐츠별 파일명**대로 `public/images/` 에 넣으면 됨.

---

## 4. 새 이미지 제작 시 권장 사양 (교체 가이드)

### 레이아웃 기준

- **분야별 글 읽기**:  
  - 컨테이너: `aspect-video` (16:9)  
  - `sizes="(max-width:1024px) 100vw, 33vw"` → 대략 최대 33vw(데스크톱), 모바일 100vw.
- **디지털 문해력**:  
  - 동일하게 `aspect-video` (16:9)  
  - `sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"`

### 권장 이미지 사양

| 항목 | 권장값 |
|------|--------|
| **비율** | **16:9** (가로:세로) |
| **권장 해상도** | **640×360 px** 또는 **800×450 px** (2x 대응 시 1280×720 도 가능) |
| **확장자** | **.webp** (용량·품질 균형) 또는 **.png** (투명/호환 필요 시) |
| **파일 위치** | `public/images/` |

### 콘텐츠별 파일 (현재 적용됨)

- 분야별 6개: `science-photosynthesis.webp`, `science-earthquake.webp`, `history-sejong.webp`, `history-ganghwa.webp`, `society-scarcity.webp`, `society-democracy.webp`  
- 디지털 2개: `digital-plastic.webp`, `digital-fakenews.webp`  
- 모두 `public/images/` 에 저장하고, `lib/data.ts` 에서 각 스토리 `thumbnail` 이 위 경로를 가리키도록 되어 있음.

---

## 5. 요약 표

| 구분 | 파일/위치 | 사용 경로 (src) | 저장 경로 |
|------|-----------|-----------------|-----------|
| 분야별 (6종) | lib/data.ts (categoryStories) | 각 스토리 `thumbnail` (예: `/images/science-photosynthesis.webp`) | `public/images/{id}.webp` |
| 디지털 (2종) | lib/data.ts (digitalLiteracy) | 각 스토리 `thumbnail` (예: `/images/digital-plastic.webp`) | `public/images/{id}.webp` |

- **권장 크기**: 640×360 또는 800×450 px (16:9)  
- **권장 형식**: webp 또는 png
