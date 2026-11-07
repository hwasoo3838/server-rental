#!/bin/bash

# 개발 종료 후 점검 스크립트
# 목적: 변경사항, 테스트 결과, 커밋 상태 확인
# 실행: ./scripts/dev-end-check.sh

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
echo -e "${BOLD}${BLUE}║  ELLION GPU 개발 종료 - 최종 점검              ║${NC}"
echo -e "${BOLD}${BLUE}║  시간: $(date '+%Y-%m-%d %H:%M:%S')              ║${NC}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

cd "$PROJECT_PATH" || exit 1

# 1. 변경 파일 목록
log_header "1️⃣ 변경 파일 목록"

UNCOMMITTED=$(git status --porcelain)

if [ -z "$UNCOMMITTED" ]; then
    log_pass "미커밋 변경사항 없음 - 커밋 완료됨"
else
    log_warn "미커밋 변경사항 있음:"
    echo "$UNCOMMITTED" | sed 's/^/    /'
    echo ""
    log_info "커밋하려면:"
    echo "    git add ."
    echo "    git commit -m '메시지'"
fi

# 2. 변경사항 상세 내용
log_header "2️⃣ 변경사항 상세 내용"

if [ -n "$UNCOMMITTED" ]; then
    log_info "Modified/Added 파일:"
    echo "$UNCOMMITTED" | grep -E '^(M|A|\?\?)' | cut -d' ' -f2- | sed 's/^/    /'
else
    log_pass "추적할 변경사항 없음"
fi

# 3. 자동 테스트 실행
log_header "3️⃣ 자동 테스트 실행"

if [ -f "$PROJECT_PATH/tests/automated.test.js" ]; then
    echo ""
    if npm test 2>&1; then
        log_pass "모든 테스트 통과"
        TEST_RESULT="PASS"
    else
        log_fail "테스트 실패"
        TEST_RESULT="FAIL"
    fi
    echo ""
else
    log_warn "테스트 파일 없음: tests/automated.test.js"
    TEST_RESULT="SKIP"
fi

# 4. 커밋 상태 확인
log_header "4️⃣ 커밋 상태 확인"

STAGED=$(git diff --cached --name-only)

if [ -n "$STAGED" ]; then
    log_warn "Staged 파일 (커밋 대기 중):"
    echo "$STAGED" | sed 's/^/    /'
else
    log_pass "Staged 파일 없음"
fi

# 5. 최신 커밋 확인
log_header "5️⃣ 최신 커밋 확인"

LATEST=$(git log --oneline -1)
log_pass "최신 커밋: $LATEST"

# 6. 로컬/원격 비교
log_header "6️⃣ 로컬/원격 브랜치 비교"

git fetch origin > /dev/null 2>&1

LOCAL_COMMIT=$(git rev-parse main)
REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null || echo "")

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    log_pass "로컬과 원격이 동기화됨"
else
    log_warn "로컬과 원격이 다릅니다"
    
    COMMITS_BEHIND=$(git rev-list --count origin/main..main 2>/dev/null || echo "0")
    COMMITS_AHEAD=$(git rev-list --count main..origin/main 2>/dev/null || echo "0")
    
    if [ "$COMMITS_AHEAD" -gt 0 ]; then
        log_warn "원격이 $COMMITS_AHEAD 커밋 앞에 있습니다"
        log_info "git pull origin main 실행"
    fi
    
    if [ "$COMMITS_BEHIND" -gt 0 ]; then
        log_warn "로컬이 $COMMITS_BEHIND 커밋 앞에 있습니다"
        log_info "git push origin main 실행"
    fi
fi

# 최종 결과
log_header "📊 개발 종료 결과"

echo ""
log_result "변경사항: $(if [ -z "$UNCOMMITTED" ]; then echo "없음"; else echo "있음"; fi)"
log_result "테스트 결과: $TEST_RESULT"
log_result "로컬/원격: $(if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then echo "동기화됨"; else echo "다름"; fi)"

echo ""

if [ -n "$UNCOMMITTED" ] && [ "$TEST_RESULT" = "PASS" ]; then
    log_warn "⚠️  미커밋 변경사항이 있습니다"
    echo "다음 명령어로 커밋하세요:"
    echo "    git add ."
    echo "    git commit -m '(GPU-XXX) 작업 설명'"
    echo "    git push origin main"
elif [ "$TEST_RESULT" = "FAIL" ]; then
    log_fail "❌ 테스트 실패 - 배포 금지"
    echo "테스트를 통과한 후 커밋하세요."
elif [ -z "$UNCOMMITTED" ] && [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    log_pass "✅ 모든 변경사항이 GitHub에 커밋됨"
    echo "안전하게 다른 작업을 시작할 수 있습니다."
fi

echo ""
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════╝${NC}\n"
