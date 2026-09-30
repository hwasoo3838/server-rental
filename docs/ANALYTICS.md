# 방문자 통계 (Google Analytics 4)

| 항목 | 값 |
| --- | --- |
| GA 계정 | Ellion (hwasoo3838@gmail.com) |
| GA4 속성 | elliongpu.com (속성 ID `556804121`) |
| 웹 데이터 스트림 | https://elliongpu.com |
| 측정 ID | `G-0S428L9EKF` |
| 보고 시간대 / 통화 | 대한민국 (GMT+09:00) / KRW |
| 대시보드 | Looker Studio "Ellion 방문자 대시보드" (GA4 커넥터) |
| 대시보드 페이지 | `/dashboard/` (Looker Studio 임베드) |

## 구성

- `assets/analytics.js` : gtag 로더 + 커스텀 이벤트 (index.html 에서 `servers.js` 다음, `app.js` 앞에 로드)
- `dashboard/index.html` : Looker Studio 보고서 임베드 페이지 (noindex)
- `servers.js` 의 `ELGRIM_CONFIG.analyticsId` 에 다른 측정 ID 를 넣으면 덮어씁니다.

## 수집 이벤트

기본(향상된 측정): `page_view`, `scroll`, `click`(이탈 링크) 등.
커스텀: `open_request_form`, `generate_lead`, `language_change`, `currency_change`, `filter_status`, `sort_change`, `nav_click`.
폼 입력값(이메일, 이름, 메시지)은 전송하지 않습니다. DNT(Do Not Track) 브라우저는 수집하지 않습니다.

## GA4 에서 확인할 것

- 실시간: GA4 > 보고서 > 실시간 (방문 직후 즉시 표시)
- 접속자 정보: 보고서 > 사용자 > 인구통계 세부정보(국가/도시), 기술(기기/브라우저), 획득(유입 경로)
- 전환: 관리 > 이벤트 에서 `generate_lead` 를 "주요 이벤트"로 표시하면 신청 수가 전환으로 집계됩니다.

## 주의

- 사이트는 Elgrim-2025/server-rental 저장소(GitHub Pages, CNAME elliongpu.com)에서 서비스됩니다. 이 태그가 실제 elliongpu.com 에 적용되려면 해당 저장소에도 같은 변경이 반영되어야 합니다.
- 개인정보처리방침에 GA4 사용(쿠키, 방문 통계 수집)을 명시하는 것을 권장합니다.
