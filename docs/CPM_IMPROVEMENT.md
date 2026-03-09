# CPM 알고리즘 개선 요약

## 1. 현재 알고리즘의 구조적 문제 진단

### 1.1 왜 5문장에서 CPM이 급등하는가

- **분자(글자 수)의 계단식 증가**  
  `getCharsCountUntilActiveIndex(sentences, centerIndex)`는 **0번 ~ centerIndex 문장까지의 누적 글자 수**를 사용한다.  
  문장을 하나씩 클릭할 때마다 분자가 한 번에 큰 폭으로 늘어나고, 분모(경과 시간)는 1초 단위로만 조금씩 늘어나기 때문에, **문장을 넘기는 순간 raw CPM이 순간적으로 크게 뛰는 구조**다.

- **Gate 조건이 짧은 글에서 너무 빨리 열림**  
  기존: `경과 시간 >= 8초 AND 읽은 문장 수 >= 5`.  
  700~900자 짧은 글에서는 5문장이면 이미 300~500자 이상을 “읽은 것”으로 집계되고, 8초만 지나도 gate가 열린다.  
  이때 **아직 스무딩이 충분히 쌓이지 않은 상태**에서 **raw에 가까운 값이 첫 노출**되면 1000 CPM대로 튀어 보인다.

- **measuring 중에는 스무딩만 하고 노출은 0**  
  내부적으로는 `smoothedRef`가 갱신되지만, **ready 전환 직후 첫 노출 시** “직전 노출값”이 0이어서 `MAX_FIRST_DISPLAY_CPM` 등으로만 한 번 막고, 그다음 틱부터는 **그때의 raw에 가깝게 스무딩된 값**이 쓰인다.  
  짧은 글에서 5문장·8초 도달 시점의 raw가 이미 매우 크기 때문에, **첫 노출 상한을 넘지 않더라도 곧바로 다음 업데이트에서 큰 값으로 올라가는** 문제가 있다.

- **문장 수 중심 gate**  
  “5문장”은 지문마다 문장 길이가 달라서 **실제 읽은 글자 수와 불일치**할 수 있다.  
  짧은 문장 5개면 200자일 수도 있고, 긴 문장 5개면 500자일 수도 있어, **같은 “5문장”이라도 raw CPM 편차가 크다**.

### 1.2 현재 로직이 UX 문제를 만드는 부분

| 요소 | 문제 |
|------|------|
| **raw 공식** | `총 글자 수 / 경과 시간` → 문장 경계에서 분자만 크게 늘어나 순간 고속으로 계산됨 |
| **Gate** | 8초 + 5문장으로 짧은 글에서 너무 빨리 “ready” 전환, 관측 구간 짧음 |
| **첫 노출** | measuring 동안 쌓인 스무딩을 활용하더라도, 전환 직후 raw가 크면 다음 틱에서 급상승 |
| **연타/훑기** | 문장당 체류 시간을 보지 않아 0.3초 만에 다음 문장으로 가도 “읽은 것”으로 인정 → 비현실적 고속 CPM |
| **CPM_CAP 1200** | 초등학생 기준으로 과대 추정값이 그대로 노출될 여지 |
| **티어** | 701+ “매우 빠름”이 상한 없이 적용되어, 1000대도 같은 라벨로 노출 |

---

## 2. 개선 설계안

### 2.1 로직 변경 요약

- **노출 Gate**  
  - **시간**: `MIN_ELAPSED_SEC_FOR_DISPLAY` 15초 (8초 → 15초).  
  - **글자 수**: `MIN_CHARS_FOR_DISPLAY` 450자 도입.  
  - “문장 수 >= N” 조건 제거, **경과 시간 + 읽은 글자 수**만으로 ready 전환.

- **계산 안정화**  
  - measuring 중에도 **항상** `smoothedRef`를 raw로 업데이트.  
  - ready 전환 **첫 노출**은 **항상 스무딩된 값**을 사용하고, `MAX_FIRST_DISPLAY_CPM`으로 상한.  
  - 이후 노출은 기존처럼 `lastDisplayedRef` ± `MAX_DELTA_PER_UPDATE`로 제한.

- **문장 체류시간(dwell) 보정**  
  - 문장 전환 시 “이전 문장에 머문 시간”을 계산.  
  - `실제 체류 < MIN_DWELL_MS`(예: 800ms)이면 **MIN_DWELL만큼**으로 보정해 누적.  
  - **보정된 누적 시간**으로 raw CPM 계산 → 연타/훑기 시 분모가 작아지지 않아 CPM이 비정상적으로 커지지 않음.

- **CPM 상한**  
  - 초등 3~6학년 서비스 기준으로 **CPM_CAP = 850** (공통 상한).  
  - 지문 난이도별 상한은 추후 데이터 보면 조정 가능.

- **티어**  
  - 구간은 유지 (300 / 500 / 700), 상한 850 반영 시 “매우 빠름”은 701~850.

### 2.2 state/ref/파생값 정리

| 이름 | 용도 |
|------|------|
| `startTimeRef` | 첫 문장 클릭 시각 |
| `lastEnterTimeRef` | 현재 문장에 들어온 시각 (dwell 계산용) |
| `prevCenterIndexRef` | 이전 centerIndex (문장 전환 감지) |
| `effectiveTimeRef` | 누적 보정 시간(초). 문장별 max(실제 체류, MIN_DWELL_SEC) 합 |
| `smoothedRef` | 스무딩된 CPM (measuring 중에도 갱신) |
| `lastDisplayedRef` | 직전에 노출한 CPM (delta 제한용) |
| `cpm` / `status` | 노출용 state ("measuring" \| "ready") |
| 파생 | `totalChars`, `readCount`, `effectiveSec`(보정 시간 기반 raw) |

### 2.3 Gate·스무딩·dwell·cap 정책

- **Gate**: `elapsedSec >= 15 && totalChars >= 450` → `ready`.  
- **스무딩**: 항상 `smoothed = prev * (1 - w) + raw * w`, 초반 문장 수 적을 때 `w` 작게.  
- **Dwell**: 문장 전환 시 `effectiveTimeRef += max(dwellSec, MIN_DWELL_SEC)`; raw는 `totalChars * 60 / effectiveSec`.  
- **Cap**: raw·노출 모두 `Math.min(..., CPM_CAP)` (850).  
- **첫 노출**: `lastDisplayedRef === 0`이면 `min(rounded, MAX_FIRST_DISPLAY_CPM)`.

---

## 3. 실제 코드 수정안

현재 적용된 코드는 `lib/hooks/useCPM.ts` **권장 개선 버전**이다.  
아래 “5. 최소 수정 버전”과 비교해 필요 시 롤백 또는 혼합 적용 가능.

---

## 4. 검증 시나리오

| 케이스 | 기대 동작 |
|--------|-----------|
| **A. 700~900자 지문, 1~4문장 읽는 중** | `status === "measuring"`, `cpm === 0`. 15초 미만 또는 450자 미만이면 ready 안 됨. |
| **B. 5문장 진입 직후** | 450자·15초 미만이면 여전히 measuring. 450자·15초 넘는 시점에 ready 전환 시 **첫 노출은 스무딩값 + MAX_FIRST_DISPLAY_CPM(480) 이하**, 이후에도 delta 제한으로 급등 없음. |
| **C. 문장 연타/훑기** | 문장당 0.8초 미만이면 MIN_DWELL(0.8초)로 보정되어 effectiveTime이 커지고, raw CPM이 낮게 나와 비현실적 고속이 억제됨. |
| **D. 천천히 정독** | 문장당 체류가 길어 effectiveTime이 실제에 가깝고, 스무딩·delta 제한으로 “차근차근”~“안정적” 구간이 안정적으로 유지됨. |
| **E. 1000~1500자 긴 글** | 450자·15초 gate로 초반 급등 없이, 구간이 길어져도 동일한 dwell·스무딩·cap으로 850 이하에서 티어 표시. |

---

## 5. 추천 파라미터

| 항목 | 값 | 비고 |
|------|-----|------|
| **MIN_ELAPSED_SEC_FOR_DISPLAY** | 15 | 8→15초로 초반 노출 지연 |
| **MIN_CHARS_FOR_DISPLAY** | 450 | 글자 수 gate로 짧은 글도 안정 |
| **MIN_ELAPSED_SEC_FOR_CALC** | 1 | 1초 미만은 계산 생략 |
| **MIN_DWELL_MS** | 800 | 문장당 최소 0.8초로 연타 보정 |
| **SMOOTH_WEIGHT_NEW** | 0.1 | 기존과 동일 |
| **EARLY_SMOOTH_WEIGHT_NEW** | 0.04 | 초반 안정화 |
| **EARLY_SENTENCE_THRESHOLD** | 8 | 8문장 미만은 초반 스무딩 |
| **MAX_DELTA_PER_UPDATE** | 25 | 노출값 출렁임 제한 |
| **MAX_FIRST_DISPLAY_CPM** | 480 | ready 직후 첫 노출 상한 |
| **CPM_CAP** | 850 | 초등학생용 전체 상한 |
| **티어** | ≤300 / 301~500 / 501~700 / 701+ | 700~1500자·초등 3~6 기준 유지 |

---

## 6. 최소 수정 버전 vs 권장 개선 버전

### 6.1 최소 수정 버전 (급등만 완화)

**목표**: 기존 구조(문장 수 gate, 경과 시간만)를 유지하면서, 5문장 진입 시 1000대 급등만 줄인다.

- **Gate**: `MIN_ELAPSED_SEC_FOR_DISPLAY = 12`, `MIN_SENTENCES_FOR_DISPLAY = 6` (기존 8초+5문장보다 여유).
- **CPM_CAP**: `1200 → 900`.
- **MAX_FIRST_DISPLAY_CPM**: `500` 유지 또는 `450`으로 소폭 강화.
- **첫 노출 로직**: ready 전환 시 **반드시** `smoothedRef.current`(스무딩값)를 사용하고, `min(rounded, MAX_FIRST_DISPLAY_CPM)` 적용. (이미 현재 코드와 동일하게 적용 가능.)
- **Dwell 보정·글자 수 gate·15초**: 도입하지 않음.

적용 시: 위 상수만 바꾸고, gate 조건은 `sec >= 12 && readCount >= 6` 유지.  
첫 노출을 “스무딩값 + 상한”으로만 해도 급등이 상당 부분 완화된다.

### 6.2 권장 개선 버전 (현재 적용)

**목표**: 초반 급등 방지 + 연타/훑기 억제 + 짧은 글 안정화.

- **Gate**: 15초 + **450자** (문장 수 조건 제거).
- **Dwell 보정**: 문장당 최소 0.8초 적용, `effectiveTimeRef`로 raw 계산.
- **스무딩**: measuring 중에도 계속 갱신, ready 첫 노출은 스무딩값 + MAX_FIRST_DISPLAY_CPM.
- **CPM_CAP**: 850.
- **티어**: 기존 구간 유지, 상한 850 반영.

현재 `lib/hooks/useCPM.ts`가 이 버전이다.  
배포 후 로그/피드백 보면서 `MIN_CHARS_FOR_DISPLAY`, `MIN_DWELL_MS`, `CPM_CAP`만 미세 조정하면 된다.
