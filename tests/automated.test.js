/**
 * ELLION GPU 해외 사이트 - 자동 테스트
 * 
 * 목표:
 * - 요구사항별 기능 검증
 * - 회귀 테스트 (기존 기능 유지 확인)
 * - 배포 전 자동 검사
 * 
 * 실행: node tests/automated.test.js
 */

const fs = require('fs');
const path = require('path');

// 테스트 결과 카운터
let passed = 0;
let failed = 0;
let skipped = 0;

// 색상 출력 (터미널)
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  pass: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  skip: (msg) => console.log(`${colors.yellow}⏭️${colors.reset}  ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset}  ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`),
  result: (msg) => console.log(`${colors.bold}${msg}${colors.reset}`)
};

// 테스트 실행 헬퍼
function test(name, fn, shouldSkip = false) {
  try {
    if (shouldSkip) {
      log.skip(name);
      skipped++;
      return;
    }
    
    fn();
    log.pass(name);
    passed++;
  } catch (error) {
    log.fail(name);
    console.log(`        에러: ${error.message}`);
    failed++;
  }
}

// 어설션 함수들
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message} (기대: ${expected}, 실제: ${actual})`);
  }
}

function assertExists(obj, key, message) {
  if (!obj || !(key in obj)) {
    throw new Error(`${message} - 없음`);
  }
}

function assertGreater(actual, min, message) {
  if (actual <= min) {
    throw new Error(`${message} (기대: > ${min}, 실제: ${actual})`);
  }
}

// 파일 읽기 헬퍼
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// ============================================================
// 테스트 시작
// ============================================================

console.log(`${colors.bold}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║  ELLION GPU 해외 사이트 - 자동 테스트                     ║
║  테스트 시간: ${new Date().toLocaleString('ko-KR')}     ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

const basePath = path.join(__dirname, '..');

// ============================================================
// GPU-001: 언어와 통화 연동
// ============================================================

log.header('GPU-001: 언어와 통화 연동');

test('i18n.js 파일 존재', () => {
  assert(fileExists(path.join(basePath, 'assets/i18n.js')), 'i18n.js 파일이 없습니다');
});

test('한국어 텍스트 정의 확인', () => {
  const i18nContent = readFile(path.join(basePath, 'assets/i18n.js'));
  assert(i18nContent.includes('ko:'), '한국어(ko) 정의 없음');
});

test('영어 텍스트 정의 확인', () => {
  const i18nContent = readFile(path.join(basePath, 'assets/i18n.js'));
  assert(i18nContent.includes('en:'), '영어(en) 정의 없음');
});

test('가격 관련 i18n 레이블 존재', () => {
  const i18nContent = readFile(path.join(basePath, 'assets/i18n.js'));
  assert(i18nContent.includes('price') || i18nContent.includes('monthly'), '가격 레이블 없음');
});

test('통화 전환 로직 확인 (app.js)', () => {
  const appContent = readFile(path.join(basePath, 'assets/app.js'));
  assert(appContent.includes('USD') || appContent.includes('KRW'), '통화 정의 없음');
  assert(appContent.includes('currency'), '통화 변수 없음');
});

// ============================================================
// GPU-003: 서버 상품 6개 정상 표시
// ============================================================

log.header('GPU-003: 서버 상품 6개 정상 표시');

test('servers.js 파일 존재', () => {
  assert(fileExists(path.join(basePath, 'assets/servers.js')), 'servers.js 파일이 없습니다');
});

test('window.SERVERS 배열 정의', () => {
  const serversContent = readFile(path.join(basePath, 'assets/servers.js'));
  assert(serversContent.includes('window.SERVERS'), 'window.SERVERS 정의 없음');
});

test('상품 6개 ID 정의 확인', () => {
  const serversContent = readFile(path.join(basePath, 'assets/servers.js'));
  const requiredIds = [
    'elgrim-gfx-a4000',           // RTX A4000
    'ellion-xeon-gold-6154-dual', // 듀얼 Xeon
    'ellion-web-db-6140',         // Web-DB
    'elgrim-mi325x-8',            // MI325X
    'elgrim-rtx4090',             // RTX4090
    'elgrim-l40s-6000ada'         // L40S
  ];
  
  requiredIds.forEach(id => {
    assert(serversContent.includes(`"${id}"`), `상품 ID 없음: ${id}`);
  });
});

test('각 상품에 name 정의', () => {
  const serversContent = readFile(path.join(basePath, 'assets/servers.js'));
  const nameCount = (serversContent.match(/name:\s*{/g) || []).length;
  assertGreater(nameCount, 5, '상품 name 정의 부족');
});

test('각 상품에 가격 정보', () => {
  const serversContent = readFile(path.join(basePath, 'assets/servers.js'));
  assert(serversContent.includes('priceKrw'), 'priceKrw 없음');
  assert(serversContent.includes('priceUsd'), 'priceUsd 없음');
});

test('각 상품에 CTA 타입 정의', () => {
  const serversContent = readFile(path.join(basePath, 'assets/servers.js'));
  assert(serversContent.includes('ctaType'), 'ctaType 없음');
  assert(
    serversContent.includes('"request"') || serversContent.includes("'request'"),
    '신청 타입(request) 없음'
  );
  assert(
    serversContent.includes('"reserve"') || serversContent.includes("'reserve'"),
    '예약 타입(reserve) 없음'
  );
});

// ============================================================
// GPU-004: 상품 표시 순서 고정
// ============================================================

log.header('GPU-004: 상품 표시 순서 고정');

test('A4000이 상품 배열 첫 번째', () => {
  const serversContent = readFile(path.join(basePath, 'assets/servers.js'));
  
  // window.SERVERS = [ 찾기
  const startIdx = serversContent.indexOf('window.SERVERS = [');
  assert(startIdx >= 0, 'window.SERVERS = [ 찾을 수 없음');
  
  // 첫 번째 { ... } 블록 찾기
  const afterStart = serversContent.substring(startIdx + 18);
  const firstObjectStart = afterStart.indexOf('{');
  const firstObjectEnd = afterStart.indexOf('id:');
  
  const firstObject = afterStart.substring(firstObjectStart, firstObjectEnd + 50);
  assert(
    firstObject.includes('elgrim-gfx-a4000'),
    'A4000이 첫 번째 상품이 아닙니다'
  );
});

test('Xeon이 상품 배열 두 번째', () => {
  const serversContent = readFile(path.join(basePath, 'assets/servers.js'));
  
  // A4000 찾기
  const a4000Idx = serversContent.indexOf('elgrim-gfx-a4000');
  assert(a4000Idx >= 0, 'A4000을 찾을 수 없음');
  
  // A4000 이후의 다음 id: 찾기
  const afterA4000 = serversContent.substring(a4000Idx);
  const nextIdMatch = afterA4000.match(/id:\s*"([^"]+)"/);
  
  assert(nextIdMatch && nextIdMatch[1], '두 번째 상품 ID를 찾을 수 없음');
  assert(
    nextIdMatch[1] === 'ellion-xeon-gold-6154-dual',
    `Xeon이 두 번째가 아닙니다 (실제: ${nextIdMatch[1]})`
  );
});

// ============================================================
// GPU-005: 듀얼 Xeon OS 표시
// ============================================================

log.header('GPU-005: 듀얼 Xeon OS 표시');

test('CURRENT_OS 정의 (app.js)', () => {
  const appContent = readFile(path.join(basePath, 'assets/app.js'));
  assert(appContent.includes('CURRENT_OS'), 'CURRENT_OS 객체 없음');
});

test('Xeon OS: Ubuntu 24.04 LTS', () => {
  const appContent = readFile(path.join(basePath, 'assets/app.js'));
  assert(
    appContent.includes('ellion-xeon-gold-6154-dual') &&
    appContent.includes('24.04 LTS'),
    'Xeon OS가 Ubuntu 24.04 LTS가 아닙니다'
  );
});

test('Xeon OS 변경 가능 안내 (한국어)', () => {
  const appContent = readFile(path.join(basePath, 'assets/app.js'));
  const i18nContent = readFile(path.join(basePath, 'assets/i18n.js'));
  
  const hasKoChange = appContent.includes('요청 시 변경') || 
                      i18nContent.includes('요청 시 변경');
  assert(hasKoChange, '한국어 OS 변경 안내 없음');
});

test('Xeon OS 변경 가능 안내 (영어)', () => {
  const appContent = readFile(path.join(basePath, 'assets/app.js'));
  const i18nContent = readFile(path.join(basePath, 'assets/i18n.js'));
  
  const hasEnChange = appContent.includes('Change available') || 
                      i18nContent.includes('Change available');
  assert(hasEnChange, '영어 OS 변경 안내 없음');
});

// ============================================================
// GPU-006: 기존 기능 보존
// ============================================================

log.header('GPU-006: 기존 기능 보존');

test('기존 상품 가격 유지 (Xeon: ₩290,000)', () => {
  const serversContent = readFile(path.join(basePath, 'assets/servers.js'));
  assert(
    serversContent.includes('290000'),
    'Xeon 기존 가격(290000) 없음 - 가격이 변경됨'
  );
});

test('기존 상품 가격 유지 (Xeon: $185)', () => {
  const serversContent = readFile(path.join(basePath, 'assets/servers.js'));
  assert(
    serversContent.includes('185'),
    'Xeon USD 가격(185) 없음 - 가격이 변경됨'
  );
});

test('신청 기능 존재 (app.js)', () => {
  const appContent = readFile(path.join(basePath, 'assets/app.js'));
  assert(appContent.includes('form') || appContent.includes('Form'), '폼 요소 없음');
  assert(appContent.includes('submit') || appContent.includes('Submit'), '제출 기능 없음');
});

test('신청 폼 HTML 요소', () => {
  const htmlContent = readFile(path.join(basePath, 'index.html'));
  assert(htmlContent.includes('form') || htmlContent.includes('modal'), 'form/modal 요소 없음');
});

test('예약/신청 버튼 정의 (app.js)', () => {
  const appContent = readFile(path.join(basePath, 'assets/app.js'));
  assert(
    appContent.includes('ctaType') && 
    (appContent.includes('request') || appContent.includes('reserve')),
    '버튼 타입 정의 없음'
  );
});

// ============================================================
// GPU-007: 배포 전 검증 프로세스
// ============================================================

log.header('GPU-007: 배포 전 검증 프로세스');

test('REQUIREMENTS.md 존재', () => {
  assert(fileExists(path.join(basePath, 'docs/REQUIREMENTS.md')), 'REQUIREMENTS.md 없음');
});

test('REQUIREMENTS.md에 요구사항 정의', () => {
  const reqContent = readFile(path.join(basePath, 'docs/REQUIREMENTS.md'));
  assert(reqContent.includes('GPU-001'), 'GPU-001 요구사항 없음');
  assert(reqContent.includes('GPU-003'), 'GPU-003 요구사항 없음');
  assert(reqContent.includes('GPU-004'), 'GPU-004 요구사항 없음');
});

test('CHANGELOG.md 존재', () => {
  assert(fileExists(path.join(basePath, 'docs/CHANGELOG.md')), 'CHANGELOG.md 없음');
});

test('AGENTS.md에 개발 규칙 포함', () => {
  const agentsContent = readFile(path.join(basePath, 'AGENTS.md'));
  assert(agentsContent.includes('개발'), '개발 관련 내용 없음');
  assert(
    agentsContent.includes('테스트') || agentsContent.includes('test'),
    '테스트 규칙 없음'
  );
});

// ============================================================
// GPU-002: 자체 DB 및 API (미구현)
// ============================================================

log.header('GPU-002: 자체 DB 및 API 운영 (미구현)');

test('Google Sheets 의존성 확인', () => {
  const appContent = readFile(path.join(basePath, 'assets/app.js'));
  const hasGoogleSheets = appContent.includes('script.google.com') || 
                          appContent.includes('Google');
  
  if (hasGoogleSheets) {
    log.info('현재 Google Sheets 의존성이 있습니다 - GPU-002 구현 필요');
  }
  skipped++;
}, true); // 이 테스트는 실패로 간주하지 않음 (아직 구현되지 않음)

// ============================================================
// 기타 검사
// ============================================================

log.header('기타 검사');

test('서버 스크립트 문법 (JavaScript)', () => {
  const { execSync } = require('child_process');
  try {
    execSync(`node -c ${path.join(basePath, 'assets/servers.js')}`, { stdio: 'pipe' });
  } catch (e) {
    throw new Error('servers.js 구문 오류');
  }
});

test('앱 스크립트 문법 (JavaScript)', () => {
  const { execSync } = require('child_process');
  try {
    execSync(`node -c ${path.join(basePath, 'assets/app.js')}`, { stdio: 'pipe' });
  } catch (e) {
    throw new Error('app.js 구문 오류');
  }
});

test('i18n 스크립트 문법 (JavaScript)', () => {
  const { execSync } = require('child_process');
  try {
    execSync(`node -c ${path.join(basePath, 'assets/i18n.js')}`, { stdio: 'pipe' });
  } catch (e) {
    throw new Error('i18n.js 구문 오류');
  }
});

// ============================================================
// 테스트 결과 보고
// ============================================================

console.log(`\n${colors.bold}${colors.blue}${'═'.repeat(60)}${colors.reset}`);

const totalTests = passed + failed + skipped;
const passRate = totalTests > 0 ? ((passed / (totalTests - skipped)) * 100).toFixed(1) : 0;

log.result(`📊 테스트 결과`);
console.log(`   ${colors.green}✅ 통과: ${passed}${colors.reset}`);
console.log(`   ${colors.red}❌ 실패: ${failed}${colors.reset}`);
console.log(`   ${colors.yellow}⏭️  스킵: ${skipped}${colors.reset}`);
console.log(`   ${colors.blue}📈 통과율: ${passRate}%${colors.reset}`);

console.log(`\n${colors.bold}${colors.blue}${'═'.repeat(60)}${colors.reset}\n`);

if (failed === 0) {
  log.result(`✅ 모든 테스트 통과! 배포 가능합니다.`);
  process.exit(0);
} else {
  log.result(`❌ ${failed}개 테스트 실패 - 배포 전 수정 필요`);
  process.exit(1);
}
