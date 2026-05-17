// 강화도 가게/명소/프로그램 mock data
// "현재 시각" — 데모용 고정값 (토요일 14:30)
window.NOW = { day: '토', hour: 14, minute: 30, label: '토요일 14:30' };

// 한 주 영업시간을 일별 [open, close] 또는 null(휴무) 로 표현
// 주: 월=0, 화=1, 수=2, 목=3, 금=4, 토=5, 일=6
const wk = (m, tu, w, th, f, sa, su) => [m, tu, w, th, f, sa, su];

// area: 강화읍 / 온수리 / 그 외
// type: 카페 | 식사 | 체험 | 명소  (백엔드: cafe / restaurant / experience / attraction)
// initial: 사진 자리에 들어갈 한 글자(편집 디자인용)
// color: 사진 플레이스홀더 톤 (디자인용)
window.PLACES = [
  {
    id: 'yeonmijeong', name: '연미정', type: '명소', area: '강화읍',
    hours: wk(['09:00','18:00'], ['09:00','18:00'], ['09:00','18:00'], ['09:00','18:00'], ['09:00','18:00'], ['09:00','18:00'], ['09:00','18:00']),
    note: '일몰 후 진입 불가', free: true, walkOnly: false, transit: 'bus',
    tags: ['일몰명소', '한강 합수점', '500년 정자'],
    initial: '燕', color: '#5C7E4E', altColor: '#E8EEDA',
    blurb: '강화팔경 중 하나. 한강·임진강·예성강이 만나는 자리에 선 누각.',
    menu: null,
    extra: { busFromTerminal: '강화터미널 → 1번 (07/09/11/13/15/17시 출발)' },
  },
  {
    id: 'jocoffee', name: '조커피랩', type: '카페', area: '강화읍', priceRange: 'mid',
    hours: wk(null, ['11:00','19:00'], ['11:00','19:00'], ['11:00','19:00'], ['11:00','19:00'], ['10:00','20:00'], ['10:00','18:00']),
    note: '라스트오더 30분 전', free: false, walkOnly: false,
    tags: ['스페셜티', '로스터리', '실내'],
    initial: 'JO', color: '#7B5A3A', altColor: '#EFE4D4',
    blurb: '직접 로스팅한 원두로 내리는 드립커피. 카운터석에서 추출 과정을 본다.',
    menu: [
      { name: '오늘의 드립', price: '6,000', note: '에티오피아 예가체프' },
      { name: '에스프레소', price: '4,500' },
      { name: '플랫화이트', price: '5,500' },
      { name: '크림 라떼', price: '6,500', note: '시그니처' },
      { name: '바스크 치즈케이크', price: '7,000' },
    ],
  },
  {
    id: 'duchonga', name: '두촌가', type: '식사', area: '강화읍', priceRange: 'mid',
    hours: wk(['11:30','15:00'], ['11:30','15:00'], null, ['11:30','15:00'], ['11:30','15:00'], ['11:30','20:00'], ['11:30','20:00']),
    note: '브레이크 15–17시 · 재료 소진 시 마감', free: false, walkOnly: false,
    tags: ['한정식', '예약 권장', '소창'],
    initial: '杜', color: '#8B4A3B', altColor: '#F1DDD3',
    blurb: '강화 순무·소창·인삼을 쓰는 시골 한정식. 인분 단위로 미리 준비.',
    menu: [
      { name: '두촌 정식', price: '23,000', note: '1인 / 12찬' },
      { name: '약선 정식', price: '32,000', note: '예약 필수' },
      { name: '순무 막국수', price: '11,000' },
      { name: '인삼튀김', price: '14,000' },
    ],
  },
  {
    id: 'bookshopsijeom', name: '책방시점', type: '체험', area: '강화읍', priceRange: 'low',
    hours: wk(null, null, ['13:00','19:00'], ['13:00','19:00'], ['13:00','19:00'], ['12:00','20:00'], ['12:00','19:00']),
    note: '월·화 휴무', free: false, walkOnly: false,
    tags: ['독립출판', '시집', '낭독회'],
    initial: '時', color: '#3F5A6B', altColor: '#D9E2E8',
    blurb: '독립출판물과 시집 중심의 작은 책방. 매월 마지막 토요일 낭독회.',
    menu: null,
    program: { title: '11월 낭독회: 김복희 시인', date: '11/29 (토) 19:00' },
  },
  {
    id: 'francs', name: '프란쓰', type: '카페', area: '강화읍', priceRange: 'mid',
    hours: wk(['10:00','18:00'], ['10:00','18:00'], ['10:00','18:00'], null, ['10:00','18:00'], ['10:00','20:00'], ['10:00','19:00']),
    note: '베이커리 12시·15시 출시', free: false, walkOnly: false,
    tags: ['베이커리', '프랑스풍', '구도심'],
    initial: 'F', color: '#9C7B3F', altColor: '#F1E5CC',
    blurb: '구도심 한옥을 개조한 베이커리 카페. 오븐에서 막 나온 빵을 시간 맞춰 받는다.',
    menu: [
      { name: '깡파뉴', price: '6,500' },
      { name: '뺑 오 쇼콜라', price: '4,800' },
      { name: '프란쓰 라떼', price: '5,800', note: '브라운슈가' },
      { name: '치즈 타르트', price: '5,500' },
    ],
  },
  {
    id: 'belpang', name: '벨팡', type: '카페', area: '온수리', priceRange: 'mid',
    hours: wk(null, ['11:00','18:00'], ['11:00','18:00'], ['11:00','18:00'], ['11:00','18:00'], ['11:00','19:00'], ['11:00','18:00']),
    note: '재료 소진 시 조기 마감', free: false, walkOnly: false,
    tags: ['디저트', '온수리 시장 근처', '마당'],
    initial: 'B', color: '#A86B4E', altColor: '#F2DDD0',
    blurb: '온수리의 작은 디저트 가게. 마당이 있는 한옥, 계절 과일 타르트.',
    menu: [
      { name: '계절 타르트', price: '7,500', note: '오늘은 사과' },
      { name: '카눌레', price: '4,000' },
      { name: '드립커피', price: '5,500' },
      { name: '레몬 마들렌 (3개)', price: '6,000' },
    ],
  },
  {
    id: 'ddalgi', name: '딸기책방', type: '체험', area: '온수리', priceRange: 'low',
    hours: wk(['13:00','19:00'], ['13:00','19:00'], ['13:00','19:00'], ['13:00','19:00'], ['13:00','19:00'], null, null),
    closedToday: { reason: '사장님 가족 캠핑', until: '11/30 (일) 재오픈' },
    note: '오늘 임시 휴무', free: false, walkOnly: false,
    tags: ['그림책', '동네책방', '쿨한 사장님'],
    initial: '🍓', color: '#B04A5E', altColor: '#F2D7DD',
    blurb: '그림책과 어린이책 중심의 동네책방. 사장님이 자주 캠핑을 떠난다.',
    menu: null,
  },
  {
    id: 'manisan', name: '마니산 참성단', type: '명소', area: '그 외',
    hours: wk(['08:00','17:00'], ['08:00','17:00'], ['08:00','17:00'], ['08:00','17:00'], ['08:00','17:00'], ['08:00','17:00'], ['08:00','17:00']),
    note: '왕복 3시간 · 등산화 필수', free: false, walkOnly: false, transit: 'bus',
    tags: ['등산', '단군 제천단', '서해 조망'],
    initial: '摩', color: '#4B6648', altColor: '#DCE5D9',
    blurb: '강화의 최고봉(469m). 정상에서 단군이 하늘에 제를 올렸다는 참성단.',
    menu: null,
    extra: { busFromTerminal: '강화터미널 → 마니산 (08/10/12/14시)' },
  },
  {
    id: 'market', name: '강화 풍물시장', type: '명소', area: '강화읍',
    hours: wk(['09:00','19:00'], ['09:00','19:00'], ['09:00','19:00'], ['09:00','19:00'], ['09:00','19:00'], ['09:00','20:00'], ['09:00','19:00']),
    note: '2·7일 5일장(특별편성)', free: true, walkOnly: false,
    tags: ['전통시장', '순무김치', '소창'],
    initial: '市', color: '#7A5C2E', altColor: '#EDE0C2',
    blurb: '강화 순무·인삼·새우젓·소창. 2일·7일에는 노점이 크게 선다.',
    menu: null,
  },
  {
    id: 'gallery-bun', name: '갤러리 분', type: '명소', area: '강화읍', priceRange: 'low',
    hours: wk(null, ['11:00','18:00'], ['11:00','18:00'], ['11:00','18:00'], ['11:00','18:00'], ['11:00','19:00'], ['11:00','18:00']),
    note: '입장료 3,000원', free: false, walkOnly: false,
    tags: ['현대미술', '기획전', '소장품'],
    initial: '分', color: '#5C4E6B', altColor: '#E1DCE8',
    blurb: '작은 사립 갤러리. 현재 기획전 “섬, 안과 밖”.',
    menu: null,
    program: { title: '기획전: 섬, 안과 밖', date: '~ 12/14' },
  },
  {
    id: 'deorimi', name: '더리미', type: '카페', area: '그 외', priceRange: 'mid',
    hours: wk(null, null, ['12:00','19:00'], ['12:00','19:00'], ['12:00','19:00'], ['11:00','20:00'], ['11:00','19:00']),
    note: '바다 전망 · 차로만 접근', free: false, walkOnly: true,
    tags: ['오션뷰', '서해', '루프탑'],
    initial: '海', color: '#3A5E72', altColor: '#D5E0E8',
    blurb: '서해를 마주보는 루프탑 카페. 일몰 한 시간 전에 도착해야 자리가 있다.',
    menu: [
      { name: '아메리카노', price: '5,500' },
      { name: '소금 라떼', price: '6,500', note: '시그니처' },
      { name: '바스크 치즈케이크', price: '7,500' },
    ],
  },
  {
    id: 'minjeokdang', name: '민적당', type: '식사', area: '강화읍', priceRange: 'mid',
    hours: wk(['11:00','21:00'], ['11:00','21:00'], ['11:00','21:00'], null, ['11:00','21:00'], ['11:00','22:00'], ['11:00','21:00']),
    note: '브레이크 15–17시', free: false, walkOnly: false,
    tags: ['젓국갈비', '향토음식', '4인이상 예약'],
    initial: '民', color: '#6B3A3A', altColor: '#E8D5D5',
    blurb: '강화 향토음식 젓국갈비를 내는 노포. 새우젓 국물 베이스의 갈비탕.',
    menu: [
      { name: '젓국갈비', price: '15,000', note: '1인분' },
      { name: '굴밥 정식', price: '13,000' },
      { name: '강화 막걸리', price: '5,000' },
    ],
  },
];

// 프로그램/미션 — 가게가 아닌 일정형 콘텐츠
window.PROGRAMS = [
  {
    id: 'prog-1', title: '강화 인디시네마: 〈수영장〉', host: '갤러리 분',
    type: '프로그램', area: '강화읍',
    when: '토 19:00–21:30', day: '토', start: 19, end: 21.5,
    tags: ['상영회', '감독 GV'],
    blurb: '오정민 감독의 1990년대 강화 다큐. 상영 후 GV 1시간.',
    initial: '映', color: '#3F4A6B',
  },
  {
    id: 'prog-2', title: '영감모임 #11 — 섬과 거리',
    host: '책방시점', type: '프로그램', area: '강화읍',
    when: '토 16:00–18:00', day: '토', start: 16, end: 18,
    tags: ['낭독회', '소규모'],
    blurb: '월 1회 동네 창작자들이 모여 짧은 글을 낭독합니다. 누구나 청취 가능.',
    initial: '感', color: '#7A5C2E',
  },
  {
    id: 'prog-3', title: '온수리 야시장 — 한 달에 한 번',
    host: '온수리 일대', type: '프로그램', area: '온수리',
    when: '토 17:00–22:00', day: '토', start: 17, end: 22,
    tags: ['야시장', '먹거리'],
    blurb: '온수리 본점 거리를 따라 가게들이 노점을 차립니다. 11월 마지막 토요일.',
    initial: '夜', color: '#A86B4E',
  },
  {
    id: 'prog-4', title: '강화 순무김치 담그기 체험',
    host: '강화 풍물시장 2층', type: '체험', area: '강화읍',
    when: '토 14:00–16:00', day: '토', start: 14, end: 16,
    tags: ['체험', '예약필수', '3시간 코스'],
    blurb: '시장 안에서 한 시간 정도 진행. 만든 김치는 가지고 갑니다.',
    initial: '蕪', color: '#5C7E4E',
  },
];

// 영업 상태 계산
window.getOpenStatus = function(place, now) {
  if (!place || !place.hours) return { state: 'na', label: '시간 별도', detail: null };
  const dayIdx = ['월','화','수','목','금','토','일'].indexOf(now.day);
  if (place.closedToday) {
    return { state: 'closed-today', label: '오늘 임시휴무', detail: place.closedToday.reason };
  }
  const today = place.hours[dayIdx];
  if (!today) return { state: 'closed', label: '오늘 정기휴무', detail: null };
  const [open, close] = today;
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  const nowMin = now.hour * 60 + now.minute;
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;
  if (nowMin < openMin) {
    return { state: 'soon', label: '곧 영업', detail: `${open} 오픈` };
  }
  if (nowMin >= closeMin) {
    return { state: 'closed', label: '영업 종료', detail: `${close} 마감` };
  }
  // 임박: 마감 1시간 전
  if (closeMin - nowMin <= 60) {
    return { state: 'closing', label: '곧 마감', detail: `${close} 까지` };
  }
  return { state: 'open', label: '영업중', detail: `${close} 까지` };
};

// 찜한 곳 → 플래너 초기값
window.PLANNER_INITIAL = [
  { placeId: 'francs',       time: '10:30', memo: '갓 나온 깡파뉴 픽업' },
  { placeId: 'duchonga',     time: '12:00', memo: '예약 1234-5678 / 두촌 정식' },
  { placeId: 'prog-4',       time: '14:00', memo: '시장 2층 / 순무김치 체험' },
  { placeId: 'jocoffee',     time: '16:30', memo: '드립 한 잔' },
  { placeId: 'yeonmijeong',  time: '17:30', memo: '일몰 시각 17:18 — 늦기 전에!' },
];

// 자랑 피드
window.BRAGS = [
  { id: 'b1', user: '느린뚜벅이', placeId: 'yeonmijeong', when: '어제',
    text: '뚜벅이 일행 셋이서 1번 버스 타고 다녀옴. 정자에서 본 일몰이 진짜 별이었다.', color: '#5C7E4E' },
  { id: 'b2', user: 'jjeong', placeId: 'francs', when: '2일 전',
    text: '깡파뉴 받으려 15시 정각에 도착했는데 이미 줄. 다음엔 12시 타임에…', color: '#9C7B3F' },
  { id: 'b3', user: '강화10년차', placeId: 'belpang', when: '3일 전',
    text: '오늘 사과 타르트는 점심 전에 매진. 마당 자리에서 카눌레로 만족.', color: '#A86B4E' },
  { id: 'b4', user: 'P→J', placeId: 'duchonga', when: '5일 전',
    text: '예약 없이 갔다가 두 시간 기다림. 정식은 진짜였다. 다음엔 무조건 예약.', color: '#8B4A3B' },
];
