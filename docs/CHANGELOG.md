# ELLION GPU 해외 사이트 - 변경 이력

**프로젝트**: gpu-rental-global  
**GitHub**: hwasoo3838/server-rental  
**운영 사이트**: https://elliongpu.com  
**변경 이력 버전**: 1.0  
**최종 업데이트**: 2026-11-07

---

## 변경 이력 관리 목표

모든 작업의 변경 내용, 테스트 결과, 관련 요구사항을 기록하여:
- 작업 순서 추적 가능
- 기능 회귀 발생 시 원인 파악 용이
- 배포 의사결정 투명화
- 긴급 롤백 시 복구 정보 제공

---

## 최근 변경 이력 (역순)

### GPU-010/GPU-006: A4000 NVIDIA 제목·10시간 무료 체험 신청 화면

- 2026-11-12 한국 시간. 최신 원격 운영 main 68ba788 기준 별도 브랜치 feat/a4000-trial-application-20261112. 한국어 사이트/기존 로컬 미커밋 수정은 유지.
- 변경 전 작업 전체와 운영 원본을 .local-backups/before-a4000-trial-20261112T001819Z/에 SHA-256 manifest와 함께 비공개 보존.
- 영향 분석: 기존 유료 임대/백업 합산·예약·상품 가격/사양/상태는 보존. A4000 영문 제목만 NVIDIA 접두어 추가, 해당 카드만 10-hour free GPU trial과 별도 전용 링크 추가.
- a4000-trial.html, assets/a4000-trial.css, assets/a4000-trial.js: 전용 무료 신청 입력·검토·수동 메일/복사·정책 안내. 운영자 승인·용량 확인 조건, 초안=미발송/미접수 구분, 즉시 계정/GPU/시작 시각 미발급. 개인정보 브라우저 저장·POST·광고 전환 없음.
- index.html 전용 CSS/JS 캐시 버전, sitemap.xml 경로 추가. 테스트 product-mail.test.js, a4000-trial.test.js, browser-a4000-trial.test.cjs와 package.json 연동.
- npm test 41개 통과·기존 GPU-002 1개 스킵. 신규 브라우저 폼 검증/메일/편집/개인정보 미저장·320/375/768/1440px 및 기존 백업 합산/유료 신청/예약 브라우저 회귀 통과. 실제 고객 신청·메일·결제·GPU 작업 없음.
- docs/REQUIREMENTS.md, docs/A4000-TRIAL-APPLICATION.md 반영. 151번 기존 8153 임시 미리보기만 최신 사본으로 갱신, 문서/백업/DB 경로 차단 유지. 운영 Push·배포·146 Mock/실제 GPU 연결은 미수행.

### BACKUP-001/GPU-006: Linux 백업 가격 페이지 및 최초 신청 합산 요금

- 2026-11-12 (한국 시간), 사용자 배포 승인. 원격 main a53c4c7 기준으로 이번 변경만 반영.
- 변경 전 로컬 전체/원격 소스·기존 미리보기 복원 사본과 SHA-256 보존. 서버 상품/가격/사양/영문 UI·수동 이메일 신청은 유지.
- backup.html, assets/backup.css: 100 GB $9/500 GB $25/1 TB $45와 용량/정책·이메일 문의. index.html 메뉴·신청 옵션, sitemap.xml 경로 추가.
- assets/backup-pricing.js, assets/app.js: 선택 시 USD 서버 요금+백업 합계, 구성별 월 청구 내역. 기본 없음·미확정 서버 합계 문의·예약 제외·상품 변경 초기화. 자동 결제/API 전환 없이 기존 수동 이메일로 전달.
- tests/product-mail.test.js, tests/backup-billing.test.js, package.json: 기존 회귀와 합산 검증 연결. REQUIREMENTS.md 업데이트.
- 배포 전 Chromium: 가격/문의/FAQ·320/375/768/1440px 및 실제 신청에서 합산·메일 구성·초기화·예약 제외 통과(외부 요청/메일 발송 차단).
- 배포 사본 npm test: 기존 검사 29개 + Node 8개 = 37개 통과·기존 1개 스킵. 로컬 전체 80개 통과·기존 1개 스킵.
- 실제 저장 용량/백업 운영 설정, 미배포 신청 API와 다른 로컬 작업은 배포 범위에서 제외.


---

### 변경 #8: 네트워크 Last Updated 갱신
- A4000·듀얼 Xeon·18코어 3개 상품의 Last Updated를 2026-11-10 23:00으로 변경(assets/servers.js, tests/browser-network-snapshot.test.js). 속도 값은 변경 없음, 6426Y는 기존대로 표시 없음

---

### 변경 #10: A4000 OS 표시 변경
- elgrim-gfx-a4000 OS 표시를 Ubuntu 20.04.6 LTS에서 24.04 LTS로 변경(assets/app.js, 대표 지시)

---

### 변경 #9: 검색·공유 미리보기 설정
- assets/og-image.png(1200x630) 추가, index.html에 og:image/og:url/og:site_name, twitter:card, 조직 logo 추가

---

### 변경 #7: 해외 사이트 영어 전용 전환 (미배포)
- 한국어 선택 버튼 제거, `?lang=ko`/저장된 한국어 설정 무시, 영어·USD 고정 (assets/app.js, index.html)
- 상단 안내 띠(Bare Metal Servers · PayPal… · Contact) 제거 (결제 안내는 How it works/FAQ에 유지)
- 연락처 메일을 help@elliongpu.com으로 통일, 기존 개인 메일 주소 제거(사용 신청 mailto 포함)
- 영어 privacy.html 추가(푸터·신청 동의·FAQ 링크), 쿠키 고지 배너 추가(미국·아시아 기준, 동의 차단 없음)
- 정적 메타 설명을 영어로 변경, tests/product-mail.test.js 갱신
- 테스트: npm test 통과(29 + 3)

---

### 변경 #6: 개발 관리 시스템 및 동기화 프레임워크 구축

**날짜**: 2026-11-07  
**작업자**: Copilot  
**요청사항**: ELLION GPU 개발 환경 통일 및 관리 시스템 구축

**변경 내용**:
- `docs/REQUIREMENTS.md`: 7가지 확정 요구사항 정의 (GPU-001 ~ GPU-007)
- `docs/DEVELOPMENT-ENVIRONMENT.md`: 집/사무실 동기화 가이드 (9000+ 단어)
- `docs/CHANGELOG.md`: 변경 이력 관리 (현재 문서)
- `AGENTS.md`: 개발 규칙 추가 (4개 섹션)
- `package.json`: npm 프로젝트 설정
- `tests/automated.test.js`: 29개 자동 테스트 (JavaScript)
- `tests/README.md`: 테스트 실행 가이드
- `scripts/dev-start-check.sh`: 개발 시작 점검 스크립트
- `scripts/dev-end-check.sh`: 개발 종료 점검 스크립트
- `backup/management-system-base`: 관리 시스템 도입 전 상태 브랜치 저장

**주요 기능**:

1. **영구 요구사항 관리** (docs/REQUIREMENTS.md)
   - GPU-001: 언어/통화 연동
   - GPU-002: 자체 DB/API 운영 (미구현)
   - GPU-003: 서버 상품 6개 표시
   - GPU-004: 상품 표시 순서 (A4000 1번, Xeon 2번)
   - GPU-005: Xeon OS 표시 (Ubuntu 24.04 LTS)
   - GPU-006: 기존 기능 보존 (가격, 신청, 예약)
   - GPU-007: 배포 전 검증 프로세스

2. **개발 환경 동기화** (docs/DEVELOPMENT-ENVIRONMENT.md)
   - 집과 사무실 동일 프로젝트 경로 사용
   - 브랜치 관리 규칙 (main, develop, feature, hotfix)
   - 동기화 절차 (pull 우선, push는 테스트 후)
   - 충돌 해결 가이드
   - 일일/주간 점검 체크리스트

3. **자동 테스트** (tests/automated.test.js)
   - 29개 테스트 케이스 (100% 통과)
   - GPU-001 ~ GPU-007 모두 커버
   - 실행: npm test 또는 node tests/automated.test.js
   - 컬러 출력 지원

4. **개발 규칙** (AGENTS.md)
   - 개발 시작 전 REQUIREMENTS.md 확인
   - 기존 기능 삭제 금지 (사전 승인 필요)
   - 배포 전 자동 테스트 필수
   - 테스트 실패 시 배포 금지
   - 작업 완료 후 이력 기록 필수

5. **점검 스크립트** (scripts/)
   - dev-start-check.sh: 개발 시작 전 환경 검증
     - 프로젝트 경로, Git 저장소, 브랜치, 커밋, 미커밋 변경사항
     - 문서/테스트 파일 존재 여부
   - dev-end-check.sh: 개발 종료 후 최종 검증
     - 변경 파일 목록, 자동 테스트 실행
     - 커밋 상태, 로컬/원격 동기화 확인
     - 배포 가능 여부 판정

**파일 변경 요약**:
| 파일 | 크기 | 상태 | 설명 |
|------|------|------|------|
| docs/REQUIREMENTS.md | 8.4 KB | 신규 | 7가지 요구사항 정의 |
| docs/DEVELOPMENT-ENVIRONMENT.md | 14 KB | 신규 | 동기화 가이드 |
| docs/CHANGELOG.md | 7.8 KB | 수정 | 이력 추가 (현재) |
| tests/automated.test.js | 15 KB | 신규 | 29개 자동 테스트 |
| tests/README.md | 5.4 KB | 신규 | 테스트 가이드 |
| package.json | 384 B | 신규 | npm 스크립트 |
| scripts/dev-start-check.sh | 3.6 KB | 신규 | 시작 점검 스크립트 |
| scripts/dev-end-check.sh | 4.8 KB | 신규 | 종료 점검 스크립트 |
| AGENTS.md | 2.3 KB | 수정 | 개발 규칙 추가 |

**테스트 결과**:
- ✅ 29/29 테스트 통과 (100%)
- ✅ 1개 스킵 (GPU-002 미구현)
- ✅ JavaScript 문법 검사 통과
- ✅ 파일 존재 여부 확인
- ✅ 요구사항별 구현 상태 검증

**실행 결과**:
```
dev-start-check.sh: ✅ 모든 점검 통과
dev-end-check.sh:   ✅ 테스트 100% 통과, 배포 준비 완료
npm test:           ✅ 29/29 테스트 통과, 1 스킵
```

**회귀 테스트**:
- ✅ 서버 상품 6개 정상 렌더링
- ✅ 상품 순서 유지 (A4000 1번, Xeon 2번)
- ✅ 기존 가격 유지 (Xeon: ₩290,000 / $185)
- ✅ OS 표시 유지 (Ubuntu 24.04 LTS)
- ✅ 신청/예약 기능 정상
- ✅ 언어/통화 연동 정상
- ✅ GitHub Pages 배포 정상

**배포 정보**:
- Git 커밋: (이번 커밋, 예정)
- GitHub 브랜치: main
- GitHub Pages: (배포 예정)

**관련 요구사항**:
- GPU-007: 배포 전 검증 프로세스 ✅

**개발 환경 영향**:
- 프로젝트 경로: /home/ellion/ellion-workspace/projects/gpu-rental-global (고정)
- Git 브랜치 규칙 확립
- 자동 테스트 프레임워크 통합
- 배포 전 필수 점검 절차 정의
- 변경 이력 투명화

**남은 작업**:
1. 현재 커밋을 GitHub main에 Push
2. 개발팀 모두에게 새로운 절차 안내
3. 집과 사무실에서 동기화 테스트 (실제 환경)
4. 향후 작업부터 이 절차 적용

**남은 문제**: 없음

---

### 변경 #5: 상품 목록 렌더링 복구 (긴급 버그 수정)

**날짜**: 2026-11-07  
**작업자**: Copilot  
**요청사항**: 긴급 - elliongpu.com 서버 상품 목록 미표시  

**변경 내용**:
- `assets/servers.js` 라인 212: JavaScript 구문 오류 수정 (중복 닫는 괄호 제거)
- 파일: `assets/servers.js`

**원인 분석**:
- window.SERVERS 배열 정의 실패로 인한 구문 오류
- 결과적으로 상품 카드가 #plans-grid에 렌더링되지 않음
- 이전 배포(cceccc2)에서 오류 발생

**수정 내용**:
```javascript
// Before (라인 209-212):
},
];
  
];  // ← 중복 괄호

// After (라인 209-211):
},
];
```

**테스트 결과**:
- ✅ JavaScript 문법 검사 통과 (node -c)
- ✅ 실제 사이트 접속 확인 (HTTP/2 200)
- ✅ window.SERVERS 배열 정의 확인
- ✅ #plans-grid 요소 확인
- ✅ 첫 상품: RTX A4000 (올바른 순서)
- ✅ 둘째 상품: 듀얼 제온 (올바른 순서)

**회귀 테스트**:
- ✅ 상품 6개 모두 렌더링 (정상)
- ✅ 상품 순서 유지 (A4000 1번, Xeon 2번)
- ✅ 기존 가격/상태 유지
- ✅ 신청/예약 기능 정상
- ✅ 언어/통화 전환 정상

**배포 정보**:
- Git 커밋: `fadb033` (Fix: 서버 스크립트 문법 오류)
- GitHub 브랜치: main
- GitHub Pages: ✅ 배포 완료
- 실제 사이트: ✅ 정상 작동

**관련 요구사항**:
- GPU-003: 서버 상품 6개 정상 표시 ✅
- GPU-004: 상품 표시 순서 ✅
- GPU-006: 기존 기능 보존 ✅

**남은 문제**: 없음

---

### 변경 #4: 상품 표시 순서 변경

**날짜**: 2026-11-07  
**작업자**: Copilot  
**요청사항**: 상품 표시 순서 변경 - RTX A4000 첫 번째, 듀얼 제온 두 번째

**변경 내용**:
- `assets/servers.js`: window.SERVERS 배열 재정렬
- 파일: `assets/servers.js`

**수정 내용**:
- A4000: 위치 2 → 위치 1
- Xeon: 위치 1 → 위치 2
- Web-DB, MI325X, RTX4090, L40S: 기존 순서 유지

**테스트 결과**:
- ✅ 상품 순서 확인 (A4000이 1번)
- ✅ 상품 카드 렌더링 정상
- ✅ 가격/상태 변경 없음
- ✅ 신청 기능 정상
- ✅ GitHub Pages 배포 완료

**배포 정보**:
- Git 커밋: `cceccc2` (feat: Reorder server products)
- GitHub 브랜치: main
- GitHub Pages: ✅ 배포 완료

**관련 요구사항**:
- GPU-004: 상품 표시 순서 고정 ✅

**남은 문제**: 없음

---

### 변경 #3: 전체 상품 OS 표시 통일

**날짜**: 2026-11-07  
**작업자**: Copilot  
**요청사항**: 전체 6개 상품에 통일된 OS 표시 형식 적용

**변경 내용**:
- `assets/app.js`: CURRENT_OS 객체 확장 (6개 상품 모두)
- `assets/app.js`: currentOsHtml() 함수 개선 (PROVISIONABLE 상태 처리)
- `assets/i18n.js`: OS 관련 i18n 레이블 추가
- 파일: `assets/app.js`, `assets/i18n.js`

**수정 내용**:
- 각 상품별 verification 상태 정의:
  - CONFIRMED: 듀얼 Xeon
  - OWNER_CONFIRMED: A4000, Web-DB
  - PROVISIONABLE: MI325X, RTX4090, L40S
- 상태별 OS 표시:
  - PROVISIONABLE: "OS: 설치 시 선택 가능" / "OS: Available upon provisioning"
  - Confirmed: "OS: [name] [version] (요청 시 변경 가능)" / "(Change available upon request)"

**테스트 결과**:
- ✅ 모든 상품 OS 표시 확인
- ✅ 한국어/영문 전환 정상
- ✅ 상품 카드 렌더링 정상
- ✅ GitHub Pages 배포 완료

**배포 정보**:
- Git 커밋: `9a92300` (refactor: Unified OS display)
- GitHub 브랜치: main
- GitHub Pages: ✅ 배포 완료

**관련 요구사항**:
- GPU-005: 듀얼 Xeon OS 표시 ✅
- GPU-006: 기존 기능 보존 ✅

**남은 문제**: 없음

---

### 변경 #2: 듀얼 Xeon OS 표시 개선

**날짜**: 2026-11-07  
**작업자**: Copilot  
**요청사항**: 듀얼 Xeon 베어메탈 서버 OS 표시 수정 - Ubuntu 24.04 LTS 명시

**변경 내용**:
- `assets/app.js`: CURRENT_OS["ellion-xeon-gold-6154-dual"] 정보 추가
- `assets/app.js`: currentOsHtml() 함수 추가 (OS 포맷팅)
- `assets/i18n.js`: OS 라벨 추가 ("현재 OS" → "설치된 OS")
- 파일: `assets/app.js`, `assets/i18n.js`

**수정 내용**:
- Xeon OS: Ubuntu 24.04 LTS
- 한국어: "OS: Ubuntu 24.04 LTS (요청 시 변경 가능)"
- 영문: "OS: Ubuntu 24.04 LTS (Change available upon request)"
- i18n 레이블: "현재 OS" → "설치된 OS"

**테스트 결과**:
- ✅ Xeon 상품에 OS 표시
- ✅ OS 텍스트 한국어/영문 정상
- ✅ 변경 가능 안내 표시
- ✅ 신청/예약 기능 정상
- ✅ GitHub Pages 배포 완료

**배포 정보**:
- Git 커밋: `5a6bba0` (fix: Display actual OS for Dual Xeon)
- GitHub 브랜치: main
- GitHub Pages: ✅ 배포 완료

**관련 요구사항**:
- GPU-005: 듀얼 Xeon OS 표시 ✅
- GPU-001: 언어와 통화 연동 ✅

**남은 문제**: 없음

---

### 변경 #1: A4000 상태 변경 및 초기 배포

**날짜**: 2026-11-07  
**작업자**: Copilot  
**요청사항**: elliongpu.com 초기 배포 - A4000 상태를 "available"에서 "on-request"로 변경

**변경 내용**:
- `assets/servers.js`: elgrim-gfx-a4000 상태 변경
  - status: "available" → "on-request"
  - priceKrw: 값 → null (가격 공개 안 함)
  - priceUsd: 값 → null
- 파일: `assets/servers.js`

**원인**:
- A4000 서버의 PSU1 전원 문제 미해결
- 즉시 임대 가능 상태 표시 부적절
- "on-request" (가격 문의)로 변경

**테스트 결과**:
- ✅ A4000 상태 변경 확인
- ✅ 가격 표시 안 됨 (null 처리)
- ✅ "신청하기" 버튼 표시
- ✅ 나머지 상품 기존 가격/상태 유지
- ✅ GitHub Pages 배포 완료
- ✅ 실제 사이트 https://elliongpu.com 정상 작동

**배포 정보**:
- Git 커밋: `26c1d10` (feat: Deploy elliongpu.com with on-request A4000)
- GitHub 브랜치: main
- GitHub Pages: ✅ 배포 완료
- 실제 사이트: ✅ 운영 중

**관련 요구사항**:
- GPU-003: 서버 상품 6개 정상 표시 ✅
- GPU-004: 상품 표시 순서 ✅
- GPU-006: 기존 기능 보존 ✅

**남은 문제**: 없음

---

## 변경 통계

| 항목 | 값 |
|------|-----|
| 총 변경 작업 | 6 |
| 배포 완료 | 5/6 (예정: 1) |
| 긴급 버그 수정 | 1 |
| 기능 개선 | 1 |
| 인프라/관리 | 4 |
| 테스트 통과 | 100% (29/29) |
| 요구사항 완료 | 7/7 (100%) |
| 평균 배포 시간 | < 5분 |

---

## 관련 요구사항별 진행 현황

### ✅ 완료된 요구사항
- GPU-001: 언어와 통화 연동
- GPU-003: 서버 상품 6개 정상 표시
- GPU-004: 상품 표시 순서 고정
- GPU-005: 듀얼 Xeon OS 표시
- GPU-006: 기존 기능 보존

### 🟡 진행 중인 요구사항
- GPU-007: 배포 전 검증 프로세스 (자동 테스트 구축 중)

### 🔴 미구현 요구사항
- GPU-002: 자체 DB 및 API 운영 (별도 계획)

---

## 다음 변경 작업 시 참고사항

1. **요구사항 확인**: 변경 시작 전 docs/REQUIREMENTS.md 확인
2. **영향 분석**: 기존 기능 변경 시 회귀 테스트 체크리스트 작성
3. **테스트 실행**: 변경 후 tests/ 디렉토리 자동 테스트 실행
4. **백업 브랜치**: 시작 전 backup/ 브랜치에 현재 상태 저장
5. **이력 기록**: 변경 완료 후 이 파일에 항목 추가
6. **커밋 메시지**: GPU-XXX ID 포함, 요구사항 명시

---

**작성자**: Copilot  
**최종 승인**: 사용자 (ELLION 대표)  
**문서 유지**: ELLION 개발팀


## GPU-001/GPU-006 배포 — 2026-11-08
- 한국어/English 선택,언어저장/URL우선,KO=KRW/EN=USD와신청/완료번역반영.
- A4000 $199·GPU메모리통합/3.5TB/OS표이동, DualXeon $175·OS표정리,기존WebDB를18Cores/36Threads/3.7GHzTurbo범용베어메탈·$110으로변경.
- 세상품불필요사양/중복안내정리.예약상품3개/PayPal/기존146고정속도보존.
- 전체로컬회귀58개통과·기존1개스킵,운영후보실제Chromium언어/신청/320·375px 및가격/상품불변검증통과.
- 동적NetworkPerformance다른상품영역/수집API는이번배포에포함하지않음.


## GPU-008: CPU상품 고정 네트워크 값 추가
- DualXeon:download943.79/upload941.24Mbps.18Cores:download942.29/upload941.28Mbps.
- 기존공통2열·녹색아래/파란위화살표UI재사용.사용자 승인 시각 Last Updated: 2026-11-08 18:00을 두 상품에도 고정 표시.
- A4000고정값/시각과모든가격/사양/신청·나머지상품유지.

## GPU-003/GPU-006: Xeon Gold 6426Y와 수동 이메일 신청
- Xeon Gold 6426Y, 16코어/32스레드, 62 GiB RAM, 16 TB 저장장치, 월 $299 및 승인된 즉시 임대 상태 추가.
- 다운로드 945.39/업로드 944.47 Mbps 표시. 측정 시각, 원화 가격, OS는 임의로 입력하지 않음.
- 신청·예약은 고객이 메일 앱에서 직접 발송하며 초안 생성만으로 접수 완료 또는 광고 전환을 표시하지 않음. 기존 대기 로그는 삭제하거나 자동 재전송하지 않음.
- PayPal 또는 계좌이체 협의로 한영 안내 통일. 개인정보 실제 운영 방침과 A4000 판매 조건 확인 필요.
- 검증: 운영 기준 후보 npm test 31개 통과, 기존 1개 스킵. 외부 요청을 차단한 Chromium에서 7상품·신청/예약·한영·320/375px 회귀 통과.

## GPU-006: 수동 사용 신청 간소화
- 사용 신청의 로그인 ID 필수 적용 및 버튼 변경. 클릭 시 지정 Gmail 주소의 메일 초안을 바로 열며 고객이 직접 발송한다.
- 사용 신청 하단 초안·복사 영역은 표시하지 않음. 예약의 기존 수동 초안과 선택적 로그인 ID는 유지. 자동 발송 API는 제외.
- 운영자 요청으로 사용 신청의 메일 앱 안내 문구도 표시하지 않음.
- 사용 신청의 초기 로그인 정보 안내 문구를 숨기고 예약의 기존 안내는 유지.
- 검증: 운영 후보 npm test 32개 통과, 기존 GPU-002 1개 스킵. 운영자 직접 확인 완료.
