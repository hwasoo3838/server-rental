# Ellion Bare Metal (elliongpu.com)

Ellion(엘리온, 구 ELGRIM) GPU 서버를 베어메탈로 임대하는 정적 사이트. 백엔드 없이 GitHub Pages 에서 동작하고,
가격/상태는 Google Sheet 에서 실시간으로 읽어옵니다.

```
server-rental/
├── index.html            # 단일 페이지 (KO/EN, KRW/USD 토글)
├── CNAME                 # elliongpu.com
├── assets/
│   ├── style.css         # ufostack.com 디자인 토큰 차용
│   ├── i18n.js           # 모든 UI 문구 ko / en
│   ├── servers.js        # 설정 + 서버 스펙(폴백 데이터). 엔드포인트/키 이미 입력됨
│   └── app.js            # 렌더링, 토글, 시트 로드, 전송 로직
└── apps-script/Code.gs   # 배포된 Apps Script 원본 (참고용, 이미 배포 완료)
```

## 연결된 Google 리소스 (이미 생성·배포됨)

| 항목 | 값 |
|---|---|
| 스프레드시트 | https://docs.google.com/spreadsheets/d/1GuotX0HCkdlWDwI3TW4UgNEDc6eI4Xq4OAMqI0urJwk/edit |
| Apps Script 프로젝트 | https://script.google.com/u/0/home/projects/1OD-O2C60rltU2iLgiDcTXg9oMioWWW2tI_xM5bPZl8otLTPdqnHpGnv5/edit |
| 웹앱 URL | `servers.js` 의 `logEndpoint` (버전 5, 액세스: 모든 사용자) |
| 계정 | lgodl3512@gmail.com |

### 시트 탭

**servers** — 가격·상태·문구. 여기만 고치면 사이트에 반영됩니다 (브라우저 캐시 최대 2분, "새로고침" 버튼은 즉시).

| 열 | 의미 |
|---|---|
| `id` | 서버 식별자. `servers.js` 의 id 와 같아야 함 (바꾸지 말 것) |
| `status` | 드롭다운: `available` 즉시 사용 가능 / `reserve` 입고 예정·예약 / `soldout` 사용 중 |
| `price_krw` | 원화 월 가격 (숫자만). 비우면 "가격 문의" |
| `price_usd` | 달러 월 가격. 비우면 KRW ÷ `fx_usd_krw` 로 자동 환산해 `≈` 표시 |
| `name_ko` / `name_en` | 카드 제목 |
| `price_note_ko` / `price_note_en` | 가격 아래 한 줄 메모 |
| `eta_ko` / `eta_en` | 위치 옆 표시 (예: 입고 예정 / Arriving soon) |

**config** — `fx_usd_krw` 환율, `reply_within_ko/en` 회신 목표 시간, `contact_email`.

- `contact_email`은 사이트 메일 표시와 예약 초안의 수신 주소에 사용됩니다.
- `notify_email` 및 FormSubmit 설정은 현재 수동 이메일 신청 흐름에서 사용되지 않습니다.
- `servers.js` 의 `contactEmail` 과 `index.html` 의 주소는 시트를 못 읽을 때만 쓰는 폴백입니다.

**logs** — 기존 사용 요청 / 예약 로그. 현재 수동 이메일 신청은 이 시트에 자동으로 추가되지 않습니다.

### API

```
GET  {logEndpoint}?action=servers                      공개. 가격/상태/설정 JSON
GET  {logEndpoint}?action=logs&key=KEY                 로그 JSON (최신순)
GET  {logEndpoint}?action=logs&key=KEY&type=reserve&status=new&limit=50
POST {logEndpoint}   body: JSON(key 포함)              logs 에 한 줄 append
```

`KEY` 는 `servers.js` 의 `logKey` (= Code.gs 의 `SHARED_KEY`).

## 전송 흐름

| 버튼 | 대상 | 동작 |
|---|---|---|
| 사용 요청하기 / Request access | 상품 신청 | 로그인 ID 필수; 지정 Gmail 주소의 메일 앱을 열어 고객이 직접 발송 |
| 예약하기 / Reserve | 예약 신청 | 메일 초안 준비 후 고객이 메일 앱에서 직접 발송 |

- 초안은 발송이나 접수를 보장하지 않는다. 메일 앱이 없으면 사용 신청은 `help@elliongpu.com`으로 직접 문의하고 예약은 표시된 내용을 복사해 이메일로 보낸다.
- 현재 신청은 자동으로 Sheets에 기록되지 않으며 메일 초안은 광고 전환으로 집계하지 않는다. 이전에 브라우저에 남은 미전송 로그도 삭제하거나 자동 재전송하지 않는다.
- 예약 수신 주소는 시트 `contact_email`, 읽지 못하면 `servers.js`의 `contactEmail`을 사용한다. 사용 신청도 같은 주소를 사용한다.
- 개인정보 보관·삭제 및 제3자 처리 방침을 확인하고 정식 안내를 마련한 후 오픈해야 한다.

## 언어 / 통화

- 헤더의 `KO | EN`, `KRW ₩ | USD $` 토글. localStorage 에 저장.
- URL 로 강제: `?lang=en&cur=USD` (링크 공유용).
- 기본값: 브라우저 언어가 en 이면 EN + USD, 아니면 KO + KRW.
- 문구 수정은 `assets/i18n.js`, 스펙 문구는 `assets/servers.js` (ko/en 쌍).

## GitHub Pages 배포

1. 이 폴더 내용을 레포 루트에 커밋 → Settings → Pages → Branch `main` / root
2. `CNAME` 은 `elliongpu.com` (2026-09-28 `servers.elgrim.kr` 에서 변경). DNS 는 Cloudflare(Hwasoo3838 계정) `elliongpu.com` 존: apex A 185.199.108~111.153 / AAAA 2606:50c0:8000~8003::153, `www` CNAME → `elgrim-2025.github.io`, 모두 프록시, SSL Full + 항상 HTTPS
3. HTTPS 는 Cloudflare Universal SSL 이 처리 (프록시 상태에서는 GitHub 의 Enforce HTTPS 는 꺼져 있어도 정상)

## Apps Script 코드 수정 시

편집기에서 저장 후 **배포 → 배포 관리 → 수정 → 버전: 새 버전 → 배포**. 새 버전을 만들지 않으면 `/exec` 에 반영되지 않습니다. URL 은 그대로 유지됩니다.

## 참고

- 개인정보 수집 동의 체크박스 포함. 운영 전 개인정보처리방침 페이지 권장.
- 서버 임대는 통신판매업 신고 대상이 될 수 있음. 결제 붙이기 전 사업자등록/통신판매업 신고 확인.
