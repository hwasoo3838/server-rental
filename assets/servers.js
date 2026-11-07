/* ============================================================
   Ellion Bare Metal - 설정 + 서버 기본 데이터
   - 가격 / 상태 / 문구는 Google Sheet("servers" 탭)에서 실시간으로 덮어씁니다.
   - 시트에 접근할 수 없을 때는 이 파일의 값이 그대로 보입니다(폴백).
   ============================================================ */

window.ELGRIM_CONFIG = {
  // 연락 메일 기본값(폴백). 시트 config 탭의 contact_email 이 있으면 그 값이 우선합니다.
  // 화면 표시 / mailto / 요청 메일 수신이 모두 시트 값을 따르므로 평소에는 시트만 고치면 됩니다.
  contactEmail: "help@elliongpu.com",

  // (1) 이메일 발송: FormSubmit (무료, 백엔드 불필요). {email} 자리에 시트의 notify_email → contact_email 순으로 들어감.
  //     수신 주소가 바뀌면 그 주소로 첫 제출 때 "Activate form" 메일이 1회 오고, 승인해야 이후 메일이 전달됩니다.
  mailEndpoint: "",

  // (2) Google Apps Script 웹앱 URL. 가격 읽기(GET ?action=servers) + 로그 적재(POST) 모두 이 주소.
  logEndpoint: "https://script.google.com/macros/s/AKfycbwVd1C7xAuDyleSRXUtSRBUyxbDHAeyKx-M0ygCc_kIOVXLC50HP4hzUPdexzZj9riW1A/exec",

  // 로그 읽기/쓰기 보호용 공유키 (Code.gs 의 SHARED_KEY 와 동일)
  logKey: "elgrim-x0c35u7c1ci4w5u9",

  // 시트 가격 캐시 시간(초). 시트 수정 후 이 시간 안에는 이전 값이 보일 수 있음.
  cacheSeconds: 120,

  // USD 가격이 시트에 비어 있을 때 KRW → USD 환산에 쓰는 기본 환율 (시트 config 탭 fx_usd_krw 가 있으면 그 값 우선)
  fxUsdKrw: 1400,

  replyWithin: { ko: "24시간", en: "24 hours" },
};

/* Catalog statuses: "available" | "reserve" | "soldout" | "on-request" */
window.SERVERS = [
   
  {
    id: "ellion-xeon-gold-6154-dual",
    accent: "ai",
    catLabel: "CPU · Bare Metal",
    catLabelKo: "CPU · 베어메탈",
    name: { ko: "듀얼 제온 베어메탈 서버", en: "Dual Xeon Bare Metal Server" },
    location: { ko: "KR · 다우IDC", en: "KR · Korea IDC" },
    status: "available",
    availability: "available",
    tagline: {
      ko: "가상화, 데이터베이스, CPU 집약형 워크로드를 위한 듀얼 프로세서 베어메탈 서버입니다.",
      en: "Dedicated dual-processor bare metal server for virtualization, databases, and CPU-intensive workloads.",
    },
    specs: [
      { k: "CPU", kKo: "CPU", ko: "Intel Xeon Gold 6154 × 2", en: "Intel Xeon Gold 6154 × 2" },
      { k: "Cores / Threads", kKo: "코어 / 스레드", ko: "36코어 / 72스레드", en: "36 Cores / 72 Threads" },
      { k: "CPU Frequency", kKo: "CPU 주파수", ko: "기본 3.0 GHz / 터보 3.7 GHz", en: "3.0 GHz Base / 3.7 GHz Turbo" },
      { k: "GPU", kKo: "GPU", ko: "전용 GPU 없음", en: "No dedicated GPU" },
      { k: "RAM", kKo: "메모리", ko: "251 GiB", en: "251 GiB" },
      { k: "Storage", kKo: "저장장치", ko: "447 GB + 1.8 TB 논리 볼륨", en: "447 GB + 1.8 TB logical volumes" },
      { k: "Network Interfaces", kKo: "네트워크 인터페이스", ko: "2 × 10GbE + 2 × 1GbE", en: "2 × 10GbE + 2 × 1GbE" },
      { k: "Internet Bandwidth", kKo: "인터넷 대역폭", ko: "제공 조건은 신청 시 안내", en: "Allocation details confirmed on request" },
      { k: "Access", kKo: "접속 방식", ko: "Linux / SSH 제공 여부 신청 시 확인", en: "Linux / SSH availability confirmed on request" },
      { k: "OS", kKo: "운영체제", ko: "설치 버전 신청 시 확인", en: "Installed version confirmed on request" },
    ],
    availability: "available",
    lastVerifiedAt: null,
    priceKrw: 290000,
    priceUsd: 185,
    priceNote: { ko: "월 임대료", en: "Monthly rental" },

    os: ["Ubuntu 24.04 LTS"],
    ctaType: "request",
  },

  {
    id: "elgrim-gfx-a4000",
    accent: "gpu",
    catLabel: "GPU · Bare Metal",
    catLabelKo: "GPU · 베어메탈",
    name: { ko: "RTX A4000 GPU 서버", en: "RTX A4000 GPU Server" },
    location: { ko: "KR · 국내 IDC", en: "KR · Seoul IDC" },
    status: "on-request",
    availability: "on-request",
    tagline: {
      ko: "AI 개발, 추론, 렌더링, 컴퓨터 비전 및 GPU 연산을 위한 전용 GPU 서버입니다.",
      en: "Dedicated GPU server for AI development, inference, rendering, computer vision, and GPU computing.",
    },
    specs: [
      { k: "CPU", kKo: "CPU", ko: "AMD EPYC 7642", en: "AMD EPYC 7642" },
      { k: "Cores / Threads", kKo: "코어 / 스레드", ko: "48코어 / 96스레드", en: "48 Cores / 96 Threads" },
      { k: "CPU Frequency", kKo: "CPU 주파수", ko: "기본 2.3 GHz / 터보 3.3 GHz", en: "2.3 GHz Base / 3.3 GHz Turbo" },
      { k: "GPU", kKo: "GPU", ko: "NVIDIA RTX A4000", en: "NVIDIA RTX A4000" },
      { k: "GPU Memory", kKo: "GPU 메모리", ko: "16 GB GDDR6", en: "16 GB GDDR6" },
      { k: "RAM", kKo: "메모리", ko: "251 GB DDR4 ECC", en: "251 GB DDR4 ECC" },
      { k: "Storage", kKo: "저장장치", ko: "3.5 TB 시스템 디스크 + 14.6 TB 데이터 논리 볼륨", en: "3.5 TB system disk + 14.6 TB data logical volume" },
      { k: "Network Interfaces", kKo: "네트워크 인터페이스", ko: "제공 사양 신청 시 확인", en: "Interface details confirmed on request" },
      { k: "Internet Bandwidth", kKo: "인터넷 대역폭", ko: "제공 조건은 신청 시 안내", en: "Allocation details confirmed on request" },
      { k: "IPv4", kKo: "IPv4", ko: "전용 IPv4 제공 여부 신청 시 확인", en: "Dedicated IPv4 availability confirmed on request" },
      { k: "Access", kKo: "접속 방식", ko: "Root / SSH 제공 범위 신청 시 확인", en: "Root / SSH access confirmed on request" },
    ],
    lastVerifiedAt: null,
    priceKrw: null,
    priceUsd: null,
    priceNote: { ko: "월 임대료 · 신청 시 확인", en: "Monthly rental · confirmed on request" },
    os: ["Ubuntu 24.04 LTS", "Ubuntu 22.04 LTS", "Debian 12", "Rocky Linux 9", "Proxmox VE 8", "Windows Server (ask)"],
    ctaType: "request",
  },
  {
    id: "ellion-web-db-6140",
    accent: "ai",
    catLabel: "CPU · Web & Database",
    catLabelKo: "CPU · 웹·데이터베이스",
    name: { ko: "웹·데이터베이스 서버", en: "Web & Database Server" },
    location: { ko: "KR · 다우IDC", en: "KR · Korea IDC" },
    status: "on-request",
    availability: "on-request",
    tagline: {
      ko: "웹사이트, 비즈니스 애플리케이션, 데이터베이스, Docker 컨테이너 및 개발 환경을 위한 전용 서버입니다.",
      en: "Dedicated server for websites, business applications, databases, Docker containers, and development environments.",
    },
    specs: [
      { k: "CPU", kKo: "CPU", ko: "Intel Xeon Gold 6140", en: "Intel Xeon Gold 6140" },
      { k: "Cores / Threads", kKo: "코어 / 스레드", ko: "18코어 / 36스레드", en: "18 Cores / 36 Threads" },
      { k: "CPU Frequency", kKo: "CPU 주파수", ko: "기본 2.3 GHz / 터보 3.7 GHz", en: "2.3 GHz Base / 3.7 GHz Turbo" },
      { k: "Mainboard", kKo: "메인보드", ko: "Supermicro X11DPU Rev 1.10", en: "Supermicro X11DPU Rev 1.10" },
      { k: "GPU", kKo: "GPU", ko: "전용 GPU 없음", en: "No dedicated GPU" },
      { k: "RAM", kKo: "메모리", ko: "125 GiB", en: "125 GiB" },
      { k: "Storage", kKo: "저장장치", ko: "OS 약 898 GB + 데이터 약 1.6 TB 볼륨", en: "Approx. 898 GB OS + 1.6 TB data volumes" },
      { k: "Network Interfaces", kKo: "네트워크 인터페이스", ko: "제공 사양 신청 시 확인", en: "Interface details confirmed on request" },
      { k: "Internet Bandwidth", kKo: "인터넷 대역폭", ko: "제공 조건은 신청 시 안내", en: "Allocation details confirmed on request" },
      { k: "Access", kKo: "접속 방식", ko: "Linux / SSH 제공 여부 신청 시 확인", en: "Linux / SSH availability confirmed on request" },
    ],
    lastVerifiedAt: null,
    priceKrw: 150000,
    priceUsd: 107,
    priceNote: { ko: "월 임대료", en: "Monthly rental" },
    os: ["Ubuntu 24.04 LTS"],
    ctaType: "request",
  },
 {
    id: "elgrim-mi325x-8",
    accent: "ai",
    catLabel: "AI · 8x MI325X",
    name: { ko: "AI 가속 서버 · MI325X ×8", en: "AI Accelerator Server · 8× MI325X" },
    location: { ko: "KR · 국내 IDC", en: "KR · Seoul IDC" },
    status: "reserve",
    eta: { ko: "입고 예정", en: "Arriving soon" },
    tagline: {
      ko: "GIGABYTE G893-ZX1-AAX2에 MI325X 8장을 올린 노드로, 큰 LLM 학습과 추론용입니다. 입고되면 예약 순서대로 연락드립니다.",
      en: "Reserve an AMD Instinct MI325X 8-GPU bare metal server featuring 2TB total HBM3E GPU memory, dual AMD EPYC 9555 processors, and 2.3TB DDR5 RAM. Designed for large language model training, AI inference, deep learning, and enterprise AI workloads. Planned configuration based on the GIGABYTE G893-ZX1-AAX2 platform. Hardware availability and deployment dates are subject to confirmation.",

    },
    specs: [
      { k: "Platform", ko: "GIGABYTE G893-ZX1-AAX2", en: "GIGABYTE G893-ZX1-AAX2" },
      { k: "GPU", ko: "AMD Instinct MI325X ×8 · 256GB HBM3E each (총 2 TB)", en: "AMD Instinct MI325X ×8 · 256 GB HBM3E each (2 TB total)" },
      { k: "CPU", ko: "AMD EPYC 9555 ×2 · 총 128코어 / 256스레드", en: "AMD EPYC 9555 ×2 · 128 cores / 256 threads" },
      { k: "RAM", ko: "96 GB DDR5 ×24 = 2,304 GB", en: "96 GB DDR5 ×24 = 2,304 GB" },
      { k: "Storage", ko: "NVMe 960GB M.2 ×2 (OS) + NVMe 3.84TB ×8 (30.7 TB)", en: "NVMe 960 GB M.2 ×2 (OS) + NVMe 3.84 TB ×8 (30.7 TB)" },
      { k: "Network", ko: "ConnectX-7 200GbE 2-port + 400G ×8 (GPU 패브릭)", en: "ConnectX-7 200GbE 2-port + 8× 400G (GPU fabric)" },
    ],
    priceKrw: null,
    priceUsd: null,
    priceNote: { ko: "GPU 단위 분할 임대 협의 가능", en: "Per-GPU split rental negotiable" },
    os: ["Ubuntu 24.04 LTS + ROCm", "Ubuntu 22.04 LTS + ROCm", "RHEL 9 (ask)"],
    ctaType: "reserve",
  },
  {
    id: "elgrim-rtx4090",
    accent: "gpu",
    catLabel: "GPU · RTX 4090",
    name: { ko: "GPU 서버 · RTX 4090", en: "GPU Server · RTX 4090" },
    location: { ko: "KR · 국내 IDC", en: "KR · Seoul IDC" },
    status: "reserve",
    eta: { ko: "입고 예정", en: "Arriving soon" },
    tagline: {
      ko: "RTX 4090 한 장에 16코어, 메모리 128GB 구성입니다. 추론이나 개발용으로 쓰기 좋습니다.",
      en: "One RTX 4090 with 16 cores and 128 GB of RAM. Suits inference and development work.",
    },
    specs: [
      { k: "GPU", ko: "NVIDIA GeForce RTX 4090 24GB GDDR6X (Ada Lovelace)", en: "NVIDIA GeForce RTX 4090 24 GB GDDR6X (Ada Lovelace)" },
      { k: "Host", ko: "16 Core · 128 GB RAM", en: "16 cores · 128 GB RAM" },
      { k: "Use", ko: "추론 · 개발", en: "Inference · Development" },
      { k: "Access", ko: "Root / SSH", en: "Root / SSH" },
    ],
    priceKrw: 700000, // 시트 price_krw 가 우선
    priceUsd: null,
    priceNote: { ko: "월 단위 · 예약 순서대로 배정", en: "Monthly · assigned in reservation order" },
    os: ["Ubuntu 24.04 LTS", "Ubuntu 22.04 LTS", "Debian 12", "Rocky Linux 9", "Windows Server (ask)"],
    ctaType: "reserve",
  },
  {
    id: "elgrim-l40s-6000ada",
    accent: "gpu",
    catLabel: "GPU · 48GB Ada",
    name: { ko: "GPU 서버 · L40S / RTX 6000 Ada", en: "GPU Server · L40S / RTX 6000 Ada" },
    location: { ko: "KR · 국내 IDC", en: "KR · Seoul IDC" },
    status: "reserve",
    eta: { ko: "입고 예정", en: "Arriving soon" },
    tagline: {
      ko: "VRAM 48GB인 L40S 또는 RTX 6000 Ada 한 장에 32코어, 메모리 256GB 구성입니다. 추론과 그래픽 작업, 렌더링에 씁니다.",
      en: "One 48 GB L40S or RTX 6000 Ada with 32 cores and 256 GB of RAM, for inference, graphics and rendering.",
    },
    specs: [
      { k: "GPU", ko: "NVIDIA L40S 또는 RTX 6000 Ada 48GB GDDR6 ECC (Ada Lovelace)", en: "NVIDIA L40S or RTX 6000 Ada 48 GB GDDR6 ECC (Ada Lovelace)" },
      { k: "Host", ko: "32 Core · 256 GB RAM", en: "32 cores · 256 GB RAM" },
      { k: "Use", ko: "추론 · 그래픽 · 렌더", en: "Inference · Graphics · Rendering" },
      { k: "Access", ko: "Root / SSH", en: "Root / SSH" },
    ],
    priceKrw: 1500000, // 시트 price_krw 가 우선
    priceUsd: null,
    priceNote: { ko: "월 단위 · 예약 순서대로 배정", en: "Monthly · assigned in reservation order" },
    os: ["Ubuntu 24.04 LTS", "Ubuntu 22.04 LTS", "Debian 12", "Rocky Linux 9", "Proxmox VE 8", "Windows Server (ask)"],
    ctaType: "reserve",
  },
];
