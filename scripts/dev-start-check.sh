#!/bin/bash

# 개발 시작 전 점검 스크립트
# 목적: Git 상태와 요구사항 확인
# 실행: ./scripts/dev-start-check.sh

export TERM=xterm-256color
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# 로그 함수
log_pass() { echo -e "${GREEN}✅${NC} $1"; }
log_fail() { echo -e "${RED}❌${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠️${NC}  $1"; }
log_info() { echo -e "${BLUE}ℹ️${NC}  $1"; }
log_header() { echo -e "\n${BOLD}${BLUE}$1${NC}"; }
log_result() { echo -e "${BOLD}$1${NC}"; }

# 프로젝트 경로
PROJECT_PATH="/home/ellion/ellion-workspace/projects/gpu-rental-global"

# 시작
clear
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║  ELLION GPU 개발 시작 - 환경 점검              ║${NC}"
echo -e "${BOLD}${BLUE}║  시간: $(date '+%Y-%m-%d %H:%M:%S')              ║${NC}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

# 1. 프로젝트 경로 확인
log_header "1️⃣ 프로젝트 경로 확인"

if [ -d "$PROJECT_PATH" ]; then
    log_pass "프로젝트 디렉토리 존재: $PROJECT_PATH"
else
    log_fail "프로젝트 디렉토리 없음: $PROJECT_PATH"
    exit 1
fi

if [ -d "$PROJECT_PATH/.git" ]; then
    log_pass "Git 저장소 확인됨"
else
    log_fail "Git 저장소 없음"
    exit 1
fi

cd "$PROJECT_PATH" || exit 1
log_pass "프로젝트 경로 이동 완료"

# 2. GitHub 저장소 연결 확인
log_header "2️⃣ GitHub 저장소 연결 확인"

REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -n "$REMOTE_URL" ]; then
    log_pass "원격 저장소: $REMOTE_URL"
else
    log_fail "원격 저장소 설정 없음"
    exit 1
fi

# 3. 현재 브랜치 확인
log_header "3️⃣ 현재 브랜치 확인"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log_pass "현재 브랜치: $CURRENT_BRANCH"

# 4. 최신 커밋 확인
log_header "4️⃣ 최신 커밋 확인"

LATEST_COMMIT=$(git log --oneline -1)
log_pass "최신 커밋: $LATEST_COMMIT"

# 5. 미커밋 변경사항 확인
log_header "5️⃣ 미커밋 변경사항 확인"

UNCOMMITTED=$(git status --porcelain)

if [ -z "$UNCOMMITTED" ]; then
    log_pass "미커밋 변경사항 없음"
else
    log_warn "미커밋 변경사항 있음"
    echo "$UNCOMMITTED" | sed 's/^/    /'
fi

# 6. 문서 확인
log_header "6️⃣ 개발 기준 문서 확인"

if [ -f "$PROJECT_PATH/docs/REQUIREMENTS.md" ]; then
    log_pass "요구사항: docs/REQUIREMENTS.md"
else
    log_warn "요구사항 문서 없음"
fi

if [ -f "$PROJECT_PATH/docs/CHANGELOG.md" ]; then
    log_pass "변경이력: docs/CHANGELOG.md"
else
    log_warn "변경이력 문서 없음"
fi

# 7. 테스트 확인
log_header "7️⃣ 자동 테스트 확인"

if [ -f "$PROJECT_PATH/tests/automated.test.js" ]; then
    log_pass "자동 테스트: tests/automated.test.js"
else
    log_warn "자동 테스트 파일 없음"
fi

# 최종 결과
log_header "📊 점검 결과"

log_result "✅ 개발 시작 준비 완료"
echo "모든 점검을 완료했습니다. 작업을 시작하세요."
echo ""

echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════╝${NC}\n"
