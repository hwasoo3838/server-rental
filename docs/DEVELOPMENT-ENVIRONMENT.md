# ELLION GPU 개발 환경 운영 기준

**프로젝트**: gpu-rental-global (ELLION 해외 GPU 임대 사이트)  
**GitHub**: hwasoo3838/server-rental  
**운영 원칙**: 집과 사무실에서 동일한 환경 유지  
**작성일**: 2026-11-07  
**버전**: 1.0

---

## 🎯 개발 환경 관리 목표

집과 사무실의 개발 환경을 완벽하게 동기화하여:
- 작업 장소에 관계없이 일관된 개발 경험 제공
- 실수로 인한 코드 손실 방지
- Git 상태 관리 자동화
- 배포 전 안전 검사 자동화

---

## 📍 프로젝트 경로

### 151번 서버 (통일된 위치)

```
/home/ellion/ellion-workspace/projects/gpu-rental-global
```

**주의**: 다른 위치에 프로젝트를 복제하지 마세요.
항상 이 경로를 사용하세요.

---

## 🔗 GitHub 저장소 연결

### 저장소 정보
```
저장소명: server-rental
소유자: hwasoo3838
URL: https://github.com/hwasoo3838/server-rental.git
브랜치: main (기본 브랜치)
```

### 원격 저장소 확인
```bash
cd /home/ellion/ellion-workspace/projects/gpu-rental-global
git remote -v
```

**기대 결과**:
```
origin	https://github.com/hwasoo3838/server-rental.git (fetch)
origin	https://github.com/hwasoo3838/server-rental.git (push)
```

---

## 📊 현재 Git 상태

### 브랜치 구조
```
* main (현재 브랜치)
  ├─ 최신 커밋: fadb033
  └─ 상태: origin/main과 동기화됨

  backup/management-system-base
  └─ 목적: 롤백용 백업 (변경 금지)

  remotes/origin/main
  └─ GitHub 원격 브랜치
```

### 최신 커밋
```
fadb033 Fix: 서버 스크립트 문법 오류(중복된 괄호 제거) - 상품 목록 렌더링 복구
cceccc2 feat: Reorder server products with A4000 as primary offering
9a92300 refactor: Unified OS display format for all server products
5a6bba0 fix: Display actual OS for Dual Xeon server with changeable note
26c1d10 feat: Deploy elliongpu.com with on-request status for A4000 GPU server
```

### 미커밋 변경사항

| 파일/폴더 | 상태 | 설명 |
|---------|------|------|
| AGENTS.md | M (수정) | 개발 관리 규칙 추가 |
| docs/CHANGELOG.md | ?? (신규) | 변경 이력 기록 |
| docs/REQUIREMENTS.md | ?? (신규) | 7개 요구사항 정의 |
| package.json | ?? (신규) | npm 테스트 스크립트 |
| tests/automated.test.js | ?? (신규) | 29개 자동 테스트 |
| tests/README.md | ?? (신규) | 테스트 가이드 |

**중요**: 이 파일들은 GitHub에 아직 커밋되지 않았습니다.

---

## 🔄 집과 사무실에서 작업하는 방법

### 시나리오 1: 집에서 작업 후 사무실에서 계속하기

#### 집에서 (퇴근 전)
```bash
cd /home/ellion/ellion-workspace/projects/gpu-rental-global

# 1단계: 현재 상태 확인
./scripts/dev-start-check.sh

# 2단계: 작업 완료 후 변경사항 확인
./scripts/dev-end-check.sh

# 3단계: 변경사항 커밋 (선택사항)
git add .
git commit -m "작업 내용 설명"

# 4단계: 변경사항 푸시
git push origin main
```

#### 사무실에서 (출근 후)
```bash
cd /home/ellion/ellion-workspace/projects/gpu-rental-global

# 1단계: 원격 저장소에서 최신 변경사항 가져오기
git pull origin main

# 2단계: 현재 상태 확인
./scripts/dev-start-check.sh

# 3단계: 작업 시작
```

### 시나리오 2: 커밋 전에 다른 장소에서 작업하기

#### 집에서 작업 중
```bash
cd /home/ellion/ellion-workspace/projects/gpu-rental-global

# 변경사항 확인
git status

# 미커밋 변경사항이 있으면:
# → 1️⃣ 커밋 후 push (권장)
# → 2️⃣ 또는 stash 후 다른 장소에서 복구
```

#### 사무실에서 집의 변경사항 가져오기
```bash
cd /home/ellion/ellion-workspace/projects/gpu-rental-global

# Option 1: 커밋된 변경사항만 가져오기 (권장)
git pull origin main

# Option 2: 커밋되지 않은 변경사항도 가져오기
git stash pop  # 이전에 stash한 내용 적용
```

---

## ⚠️ 주의사항

### ❌ 절대 하지 말아야 할 것

1. **프로젝트 경로 변경**
   - ❌ 다른 폴더에 새로 clone하기
   - ✅ 항상 `/home/ellion/ellion-workspace/projects/gpu-rental-global` 사용

2. **강제 커밋/푸시**
   - ❌ `git push --force`
   - ✅ 충돌이 있으면 먼저 pull 후 merge

3. **미커밋 변경사항 무시**
   - ❌ 변경사항 확인 없이 다른 코드 pull
   - ✅ 항상 `git status` 확인 후 commit 또는 stash

4. **백업 브랜치 삭제**
   - ❌ `git branch -d backup/management-system-base`
   - ✅ 롤백 필요 시 `git checkout backup/management-system-base`

### ✅ 항상 해야 할 것

1. **작업 시작 전**
   ```bash
   ./scripts/dev-start-check.sh  # Git 상태, 요구사항 확인
   ```

2. **작업 완료 후**
   ```bash
   ./scripts/dev-end-check.sh  # 변경사항, 테스트 결과 확인
   npm test  # 자동 테스트 실행
   ```

3. **커밋 전**
   ```bash
   git diff  # 실제 변경 내용 확인
   git status  # 모든 변경 파일 확인
   ```

4. **푸시 전**
   ```bash
   git log origin/main..main  # 로컬에만 있는 커밋 확인
   git push origin main --dry-run  # dry-run으로 확인
   ```

---

## 🛠️ 개발 워크플로우

### 단계별 작업 프로세스

```
1️⃣ 작업 시작 (집 또는 사무실)
   └─ ./scripts/dev-start-check.sh (Git 상태 확인)
   └─ git pull origin main (최신 코드 가져오기, 필요 시)

2️⃣ 개발 작업
   └─ 코드 수정/작성
   └─ 기능 개발
   └─ 테스트

3️⃣ 작업 완료 (자동 테스트 실행)
   └─ npm test (모든 자동 테스트 실행)
   └─ 테스트 결과 확인

4️⃣ 변경사항 커밋
   └─ git add . (변경 파일 스테이징)
   └─ git commit -m "..." (커밋 메시지: GPU-XXX ID 포함)

5️⃣ 변경사항 푸시
   └─ git push origin main (GitHub에 업로드)

6️⃣ 배포 (필요 시)
   └─ GitHub Pages 자동 빌드 (1-5분)
   └─ https://elliongpu.com 확인

7️⃣ 다른 장소에서 계속 작업 (선택사항)
   └─ git pull origin main (최신 코드 다시 가져오기)
   └─ ./scripts/dev-start-check.sh (새로운 환경에서 확인)
```

---

## 📋 점검 스크립트 사용법

### dev-start-check.sh (개발 시작 시)

**목적**: 개발 시작 전 환경 상태 확인

**실행**:
```bash
./scripts/dev-start-check.sh
```

**확인 항목**:
- ✅ 프로젝트 경로 확인
- ✅ Git 저장소 연결 상태
- ✅ 현재 브랜치 (main)
- ✅ 원격/로컬 브랜치 동기화 상태
- ✅ 미커밋 변경사항 확인
- ✅ 요구사항 문서 (REQUIREMENTS.md) 확인
- ✅ 변경 이력 (CHANGELOG.md) 확인
- ⚠️ 경고: 미커밋 변경이 있으면 알림
- ⚠️ 경고: 로컬과 원격이 다르면 알림

**기대 결과**:
```
✅ 개발 시작 준비 완료
모든 점검 통과, 안전하게 시작할 수 있습니다.
```

### dev-end-check.sh (개발 종료 시)

**목적**: 개발 완료 후 상태 최종 확인

**실행**:
```bash
./scripts/dev-end-check.sh
```

**확인 항목**:
- ✅ 변경 파일 목록
- ✅ 변경사항 상세 내용 (git diff)
- ✅ 자동 테스트 결과 (npm test)
- ✅ 커밋 상태 (staged/unstaged)
- ✅ 미커밋 변경사항 요약
- ⚠️ 경고: 테스트 실패 시 알림
- ⚠️ 경고: 커밋하지 않은 변경이 있으면 알림

**기대 결과**:
```
✅ 개발 종료 확인 완료
변경사항 커밋 준비됨, git commit 실행 가능합니다.
```

---

## 🔀 분기 관리 규칙

### 사용 중인 브랜치

| 브랜치 | 목적 | 수정 권한 | 주의사항 |
|--------|------|---------|---------|
| `main` | 운영 브랜치 | ✅ 승인 후 | GitHub Pages 배포됨 |
| `backup/management-system-base` | 롤백용 백업 | ❌ 금지 | 절대 수정하지 말 것 |

### 브랜치 생성 규칙

**새로운 기능 개발 시**:
```bash
# (아직 필요 없음 - 현재는 main만 사용)
git checkout -b feature/기능명
git push origin feature/기능명
```

**버그 수정 시**:
```bash
# (아직 필요 없음 - 현재는 main만 사용)
git checkout -b bugfix/버그명
git push origin bugfix/버그명
```

---

## 🚨 충돌 해결 가이드

### 상황 1: 같은 파일을 양쪽에서 수정

#### 집에서 수정
```bash
# index.html 수정 후 커밋
git add index.html
git commit -m "Fix: index.html 수정"
git push origin main
```

#### 사무실에서 같은 파일 수정
```bash
# 사무실에서도 index.html 수정 중
git status  # "both modified" 경고 표시
git pull origin main  # 충돌 발생!

# 충돌 해결 방법:
# 1. index.html 열기
# 2. <<<< HEAD, ====, >>>> main 부분 찾기
# 3. 불필요한 부분 삭제, 필요한 부분만 유지
# 4. 충돌 마크 제거

git add index.html
git commit -m "Resolve: merge conflict in index.html"
git push origin main
```

### 상황 2: 원격에서 pull하기 전에 미커밋 변경사항이 있는 경우

```bash
git status  # "nothing to commit, working tree clean" 이 아님

# 옵션 1: 변경사항 임시 저장 (권장)
git stash
git pull origin main
git stash pop

# 옵션 2: 변경사항 폐기 (주의)
git checkout .
git pull origin main
```

---

## 💾 커밋 메시지 규칙

### 형식
```
<타입>(<요구사항ID>): <간단한 설명>

<상세 설명>
<(선택사항) 관련 파일>
<(선택사항) 참고 링크>
```

### 예시

```
feat(GPU-004): Reorder server products - A4000 first, Xeon second

- 상품 배열 재정렬
- A4000: 위치 2 → 위치 1
- Xeon: 위치 1 → 위치 2
- 나머지 상품 순서 유지

파일: assets/servers.js
커밋: cceccc2
```

### 타입

| 타입 | 설명 | 예 |
|------|------|-----|
| `feat` | 새 기능 | GPU-004 상품 순서 변경 |
| `fix` | 버그 수정 | 구문 오류 복구 |
| `refactor` | 코드 리팩토링 | OS 표시 통일 |
| `docs` | 문서 변경 | REQUIREMENTS.md 추가 |
| `test` | 테스트 추가/수정 | 자동 테스트 29개 추가 |
| `chore` | 설정/빌드/의존성 | package.json 추가 |

---

## 📱 집과 사무실 동기화 체크리스트

### 일일 체크리스트

**매일 아침 (출근 직후)**
- [ ] 프로젝트 경로 확인: `/home/ellion/ellion-workspace/projects/gpu-rental-global`
- [ ] `./scripts/dev-start-check.sh` 실행
- [ ] `git pull origin main` 실행 (필요 시)

**작업 중**
- [ ] 정기적으로 `git status` 확인
- [ ] 커밋할 변경사항 정리

**퇴근 전**
- [ ] `./scripts/dev-end-check.sh` 실행
- [ ] `git commit` 및 `git push` (변경사항이 있으면)
- [ ] 테스트 결과 확인

### 주간 체크리스트

**매주 월요일 (주간 시작)**
- [ ] `git log --oneline -10` (최근 커밋 확인)
- [ ] `docs/CHANGELOG.md` 검토 (지난주 변경사항)

**매주 금요일 (주간 종료)**
- [ ] 모든 미커밋 변경사항 커밋 및 푸시
- [ ] `npm test` 실행 (모든 테스트 통과 확인)
- [ ] 운영 사이트 상태 확인 (필요 시)

---

## 🔐 보안 및 백업

### 데이터 손실 방지

1. **로컬 백업**
   ```bash
   # 정기적으로 로컬 코드 백업
   tar czf ~/backup/gpu-rental-$(date +%Y%m%d).tar.gz \
     /home/ellion/ellion-workspace/projects/gpu-rental-global
   ```

2. **GitHub 백업**
   ```bash
   # 모든 변경사항을 GitHub에 푸시 (권장)
   git push origin main
   ```

3. **브랜치 백업**
   ```bash
   # 현재 상태를 백업 브랜치에 저장
   git branch backup/work-$(date +%Y%m%d) main
   git push origin backup/work-$(date +%Y%m%d)
   ```

### 롤백 방법

**특정 커밋으로 복구**
```bash
git reset --hard 커밋ID
git push origin main --force  # (주의: 다른 사람과 공유하는 경우 금지)
```

**백업 브랜치에서 복구**
```bash
git checkout backup/management-system-base
git log --oneline -1  # 어느 지점인지 확인
```

---

## 📞 문제 해결 가이드

### 문제: "fatal: not a git repository"

**원인**: 프로젝트 경로 오류  
**해결**:
```bash
cd /home/ellion/ellion-workspace/projects/gpu-rental-global
git status  # 정상 작동 확인
```

### 문제: "Your branch is behind origin/main"

**원인**: 원격 저장소의 최신 변경사항을 받지 못함  
**해결**:
```bash
git pull origin main
./scripts/dev-start-check.sh  # 재확인
```

### 문제: "CONFLICT (content merge): ... Merge made by..."

**원인**: 같은 파일을 양쪽에서 수정한 충돌  
**해결**: 위의 "충돌 해결 가이드" 참조

### 문제: "nothing added to commit"

**원인**: 변경사항이 없음  
**해결**:
```bash
git status  # 실제 상태 확인
# 변경사항이 있으면 git add 실행
# 변경사항이 없으면 새로운 작업 시작
```

---

## 🔗 관련 문서

- **요구사항 관리**: docs/REQUIREMENTS.md
- **변경 이력**: docs/CHANGELOG.md
- **개발 규칙**: AGENTS.md
- **자동 테스트**: tests/README.md
- **프로젝트 구조**: README.md

---

## ✅ 정리

### 핵심 원칙

1. **통일된 경로**: `/home/ellion/ellion-workspace/projects/gpu-rental-global`
2. **자동 점검**: 작업 시작/종료 시 스크립트 실행
3. **정기적 푸시**: 매일 변경사항을 GitHub에 푸시
4. **테스트 우선**: 배포 전 반드시 `npm test` 실행
5. **문서 유지**: CHANGELOG.md, REQUIREMENTS.md 업데이트

### 작업 흐름

```
집에서 작업 → 커밋 & 푸시
         ↓
사무실에서 풀 & 계속 작업
         ↓
작업 완료 → 커밋 & 푸시
         ↓
집에서 풀 & 배포 검증
```

---

**최종 승인**: 사용자 (ELLION 대표)  
**작성자**: Copilot  
**작성일**: 2026-11-07  
**버전**: 1.0
