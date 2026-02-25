# Vercel 배포 가이드 – tto-dockk 통합 및 최신 코드 배포

## 1. Vercel 프로젝트 재연결 (Link)

현재 로컬 폴더를 **tto-dockk** 프로젝트에 다시 연결하려면, 먼저 Vercel CLI로 로그인한 뒤 `link`를 실행합니다.

### 1-1. Vercel 로그인 (최초 1회)

터미널에서 프로젝트 루트(`tto-dock2`)로 이동한 후:

```bash
npx vercel login
```

브라우저가 열리면 Vercel 계정으로 로그인합니다. (GitHub/이메일 등)

### 1-2. tto-dockk 프로젝트에 연결

로그인 후 같은 폴더에서:

```bash
npx vercel link
```

- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → 본인 Vercel 계정(팀 또는 개인) 선택
- **Link to existing project?** → **Y** (Yes)
- **What’s the name of your existing project?** → **tto-dockk** 입력 후 Enter

연결이 끝나면 `.vercel/project.json`에 `tto-dockk` 프로젝트 정보가 저장됩니다.

---

## 2. 프로덕션 빌드 및 강제 배포

연결이 완료된 상태에서, 최신 코드(86문장 합산, 퀴즈 레이아웃 등)를 **운영(Production)** 환경에 바로 배포하려면:

```bash
npx vercel --prod
```

- 현재 브랜치의 코드로 빌드 후 **Production** URL에 배포됩니다.
- 배포가 끝나면 터미널에 Production URL이 출력됩니다 (예: `https://tto-dockk.vercel.app`).

---

## 3. Git과 Vercel 연동 확인 (git push 시 자동 배포)

앞으로 **git push만 해도 tto-dockk로 자동 배포**되게 하려면, Vercel 대시보드에서 Git 저장소 연결을 확인합니다.

### 3-1. Vercel 대시보드 접속

1. [vercel.com](https://vercel.com) 로그인
2. **Dashboard** → 프로젝트 목록에서 **tto-dockk** 클릭

### 3-2. Git 연결 설정 확인

1. **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Git** 선택
3. 다음을 확인:
   - **Connected Git Repository**: 사용 중인 GitHub 저장소가 연결되어 있는지 (예: `amylee075-collab/tto-dock`)
   - **Production Branch**: `main` (또는 배포하고 싶은 기본 브랜치)로 설정되어 있는지

### 3-3. Git 저장소가 아직 연결되지 않은 경우

1. **Connect Git Repository** 클릭
2. **GitHub** 선택 후, 해당 저장소(`tto-dock` 등) 선택
3. **Import** 후, Production Branch를 `main`으로 설정

이후 `main`(또는 설정한 브랜치)에 `git push`하면 **tto-dockk** 프로젝트가 자동으로 다시 배포됩니다.

---

## 4. 불필요한 프로젝트(tto-dockk-vx5v) 삭제 안내

배포가 성공한 뒤, 더 이상 쓰지 않는 **tto-dockk-vx5v** 프로젝트를 Vercel에서 안전하게 지우는 방법입니다.

### 4-1. 삭제 전 확인

- **tto-dockk** 한 프로젝트만 사용할 것인지 확인
- tto-dockk-vx5v의 URL을 북마크/링크로 쓰고 있다면, tto-dockk URL로 교체할 것인지 확인

### 4-2. Vercel 대시보드에서 프로젝트 삭제

1. [vercel.com](https://vercel.com) → **Dashboard**
2. **tto-dockk-vx5v** 프로젝트 카드 클릭
3. 상단 **Settings** 탭 클릭
4. 왼쪽 맨 아래 **Delete Project** (또는 **Danger Zone** 내 **Delete Project**) 클릭
5. 프로젝트 이름(예: `tto-dockk-vx5v`)을 정확히 입력하라는 확인란에 입력
6. **Delete** 버튼으로 최종 삭제

삭제 후에는 해당 프로젝트의 URL은 더 이상 동작하지 않으며, 복구할 수 없습니다.

---

## 요약 체크리스트

- [ ] `npx vercel login` 실행 후 로그인
- [ ] `npx vercel link` 실행 후 **tto-dockk** 선택해 연결
- [ ] `npx vercel --prod` 실행해 최신 코드 운영 배포
- [ ] Vercel 대시보드 → tto-dockk → Settings → Git 에서 저장소 연결 및 Production Branch(`main`) 확인
- [ ] (선택) tto-dockk-vx5v 프로젝트 삭제
