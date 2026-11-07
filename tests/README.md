# ELLION GPU 해외 사이트 - 자동 테스트 가이드

**프로젝트**: gpu-rental-global  
**테스트 파일**: tests/automated.test.js  
**설정**: package.json

---

## 빠른 시작

### 테스트 실행

```bash
# 기본 명령어
npm test

# 또는 직접 실행
node tests/automated.test.js
```

### 기대 결과

```
✅ 모든 테스트 통과! 배포 가능합니다.
   ✅ 통과: 29
   ❌ 실패: 0
   📈 통과율: 100.0%
```

---

## 테스트 항목

### GPU-001: 언어와 통화 연동
- ✅ i18n.js 파일 존재
- ✅ 한국어 텍스트 정의
- ✅ 영어 텍스트 정의
- ✅ 가격 관련 i18n 레이블
- ✅ 통화 전환 로직 (app.js)

### GPU-003: 서버 상품 6개 정상 표시
- ✅ servers.js 파일 존재
- ✅ window.SERVERS 배열 정의
- ✅ 6개 상품 ID 정의 (A4000, Xeon, Web-DB, MI325X, RTX4090, L40S)
- ✅ 각 상품 name 정의
- ✅ 각 상품 가격 정보
- ✅ CTA 타입 정의 (request, reserve)

### GPU-004: 상품 표시 순서 고정
- ✅ A4000이 상품 배열 첫 번째
- ✅ Xeon이 상품 배열 두 번째

### GPU-005: 듀얼 Xeon OS 표시
- ✅ CURRENT_OS 정의 (app.js)
- ✅ Xeon OS: Ubuntu 24.04 LTS
- ✅ 변경 가능 안내 (한국어)
- ✅ 변경 가능 안내 (영어)

### GPU-006: 기존 기능 보존
- ✅ 기존 가격 유지 (Xeon: ₩290,000)
- ✅ 기존 가격 유지 (Xeon: $185)
- ✅ 신청 기능 (app.js)
- ✅ 신청 폼 HTML 요소
- ✅ 예약/신청 버튼 정의

### GPU-007: 배포 전 검증 프로세스
- ✅ REQUIREMENTS.md 존재
- ✅ 요구사항 정의 (GPU-001, GPU-003, GPU-004)
- ✅ CHANGELOG.md 존재
- ✅ AGENTS.md 개발 규칙

### 기타 검사
- ✅ JavaScript 구문 검사 (servers.js)
- ✅ JavaScript 구문 검사 (app.js)
- ✅ JavaScript 구문 검사 (i18n.js)

---

## 테스트 실패 시 해결

### 테스트 실패 예시 1: "상품 6개 ID 정의 확인 실패"
```
❌ 상품 6개 ID 정의 확인
   에러: 상품 ID 없음: elgrim-gfx-a4000
```

**원인**: assets/servers.js에 A4000 상품 ID가 없음  
**해결**: assets/servers.js를 열고 window.SERVERS 배열에 A4000 상품 정의 추가

```javascript
window.SERVERS = [
  {
    id: "elgrim-gfx-a4000",
    // ... 나머지 정의
  },
  // ...
];
```

### 테스트 실패 예시 2: "Xeon이 상품 배열 두 번째 실패"
```
❌ Xeon이 상품 배열 두 번째
   에러: Xeon이 두 번째가 아닙니다 (실제: ellion-web-db-6140)
```

**원인**: 상품 순서가 변경됨  
**해결**: assets/servers.js에서 window.SERVERS 배열 순서 조정
- [0] = elgrim-gfx-a4000 (RTX A4000)
- [1] = ellion-xeon-gold-6154-dual (듀얼 Xeon)
- [2] = ellion-web-db-6140 (Web-DB)
- ...

### 테스트 실패 예시 3: "JavaScript 구문 오류"
```
❌ 서버 스크립트 문법 (JavaScript)
   에러: servers.js 구문 오류
```

**원인**: assets/servers.js에 JavaScript 문법 오류 (따옴표 불일치, 괄호 누락 등)  
**해결**: 
```bash
# 문법 검사
node -c assets/servers.js

# 결과 예시:
# SyntaxError: Unexpected token ']' at line 212
```
파일을 열어 지정된 줄을 확인하고 구문 오류 수정

---

## 배포 체크리스트

배포 전 다음을 확인하세요:

### 자동 테스트
- [ ] npm test 실행 (모든 테스트 통과)
- [ ] 테스트 통과율 100%

### 회귀 테스트 (수동)
- [ ] 한국어 화면에서 상품 6개 표시
- [ ] 영어 화면에서 상품 6개 표시
- [ ] 상품 순서: A4000(1번), Xeon(2번)
- [ ] Xeon OS: Ubuntu 24.04 LTS (요청 시 변경 가능)
- [ ] 가격 표시 정상 (KRW/USD)
- [ ] 신청/예약 버튼 정상
- [ ] 모바일 화면 레이아웃 정상

### 코드 검사
- [ ] Git diff 검토 (변경 파일 확인)
- [ ] 민감 정보 포함 여부 확인 (API 키, 비밀번호 등)
- [ ] 기존 상품 데이터 변경 없음 확인

### 배포 승인
- [ ] 담당자 최종 승인
- [ ] CHANGELOG.md 업데이트 확인
- [ ] 커밋 메시지 작성 및 검토

---

## 테스트 개발 가이드

### 새 요구사항 테스트 추가

1. 테스트 섹션 추가
```javascript
log.header('GPU-008: 새 기능명');

test('새 테스트 항목 1', () => {
  // 테스트 로직
});

test('새 테스트 항목 2', () => {
  // 테스트 로직
});
```

2. 테스트 실행
```bash
npm test
```

3. 통과 확인 또는 수정

### 테스트 스킵 (미구현 기능)

테스트를 스킵하려면 세 번째 인자에 `true` 전달:
```javascript
test('구현되지 않은 기능', () => {
  // ...
}, true);  // ← 스킵 표시
```

---

## 자동화된 배포 프로세스

### GitHub Actions (향후 추가)

```yaml
name: Test and Deploy
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm test
      - run: npm run build (if needed)
```

---

## 트러블슈팅

### npm 설치 필요
```bash
# package.json이 없으면 생성
npm init -y

# 다시 테스트
npm test
```

### Node.js 버전 확인
```bash
node --version
# v16.0.0 이상 권장
```

### 스크립트 권한 문제
```bash
chmod +x tests/automated.test.js
npm test
```

---

## 참고 문서

- **요구사항 관리**: docs/REQUIREMENTS.md
- **변경 이력**: docs/CHANGELOG.md
- **개발 규칙**: AGENTS.md
- **제품 정보**: assets/servers.js
- **다국어 설정**: assets/i18n.js
- **앱 로직**: assets/app.js

---

**최종 업데이트**: 2026-11-07  
**작성자**: Copilot  
**문서 유지**: ELLION 개발팀
