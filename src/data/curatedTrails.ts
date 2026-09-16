import { DistrictId } from '../types';

export interface CuratedTrail {
  id: string;
  districtId: DistrictId;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  budget: number;
  breakdown: {
    transit: number;
    food: number;
    activity: number;
  };
  duration: string;
  distance: string;
  difficulty: string;
  badge: string;
  healthScore: number;
  tags: string[];
  recommendedTime?: string;
  transitTip?: string;
}

export interface AllianceMerchant {
  id: string;
  district: string;
  name: string;
  benefit: string;
  benefitType: 'discount' | 'gift' | 'voucher';
  description: string;
}

export const CURATED_TRAILS: CuratedTrail[] = [
  {
    id: 'trail-yeongdo',
    districtId: 'yeongdo',
    title: '영도 흰여울 & 깡깡이예술마을',
    subtitle: '오션 파노라마 & 철선 골목 산책',
    description:
      '파도가 발밑에서 부서지는 절벽 계단길을 따라 걷다 근대 조선 산업의 발상지 깡깡이마을 골목으로 이어지는 이색 도보 코스. 소상공인 독립 카페와 해녀 김밥을 즐겨보세요.',
    image:
      'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80',
    budget: 49500,
    breakdown: {
      transit: 4000,
      food: 32000,
      activity: 13500,
    },
    duration: '3시간 40분',
    distance: '7.2km',
    difficulty: '완경사 도보',
    badge: '오션뷰 1위',
    healthScore: 9.8,
    tags: ['바다조망', '절영해안', '영화촬영지', '골든아워'],
    recommendedTime: '노을 골든아워 추천 (17:20)',
    transitTip: '영도 5번 버스 타고 75광장 하차 후 내리막길 시작',
  },
  {
    id: 'trail-choryang',
    districtId: 'bosu',
    title: '초량 이바구길 & 산복도로 레트로 코스',
    subtitle: '168계단 모노레일과 노포 불백 반상',
    description:
      '168계단 무료 모노레일과 명란브랜드 연구소, 산복도로 야경 전망대까지 이어지는 정통 부산 근현대 골목 도보 여행.',
    image:
      'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80',
    budget: 42000,
    breakdown: {
      transit: 4500,
      food: 28500,
      activity: 9000,
    },
    duration: '3시간 20분',
    distance: '4.8km',
    difficulty: '계단 약간 (모노레일 이용)',
    badge: '레트로 출사 1위',
    healthScore: 9.6,
    tags: ['산복도로', '168계단', '불백노포', '모노레일'],
    recommendedTime: '오전 10:00 (사선 채광)',
    transitTip: '동구 1-1 마을버스 환승 시 언덕 위 이바구공작소 바로 접근',
  },
  {
    id: 'trail-jeonpo',
    districtId: 'jeonpo',
    title: '전포 카페거리 & 공구골목 힙스터 투어',
    subtitle: '철물골목 속 숨겨진 스페셜티 커피의 향연',
    description:
      '과거 기계 공구상과 목재소가 밀집했던 골목이 전국구 감성 카페와 핸드메이드 소품숍의 성지로 거듭난 트렌디 핫플레이스.',
    image:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    budget: 54000,
    breakdown: {
      transit: 3100,
      food: 35000,
      activity: 15900,
    },
    duration: '4시간',
    distance: '3.5km',
    difficulty: '평지 도보',
    badge: 'MZ 취향저격',
    healthScore: 9.5,
    tags: ['스페셜티커피', '감성인테리어', '소품샵투어', '디저트'],
    recommendedTime: '오후 13:30 (카페 한산 시간대)',
    transitTip: '전포역 7번 출구 도보 2분으로 대중교통 최적',
  },
  {
    id: 'trail-bosu',
    districtId: 'bosu',
    title: '남포 보수동 책방골목 & 부평깡통야시장',
    subtitle: '헌책의 숲과 4대 스트리트 미식',
    description:
      '70년 역사의 헌책방 계단 골목에서 보물 같은 초판본을 찾고, 저녁에는 부평 깡통야시장에서 비빔당면과 물떡을 맛보는 정통 노포 코스.',
    image:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    budget: 38000,
    breakdown: {
      transit: 3100,
      food: 26000,
      activity: 8900,
    },
    duration: '3시간 30분',
    distance: '4.0km',
    difficulty: '평지 도보',
    badge: '가성비 1위',
    healthScore: 9.7,
    tags: ['헌책방', '비빔당면', '야시장', '물떡'],
    recommendedTime: '오후 16:00 (책방 둘러본 후 야시장 오픈 연계)',
    transitTip: '자갈치역 3번 출구에서 보수동 방향 도보 7분',
  },
  {
    id: 'trail-haeridan',
    districtId: 'haeridan',
    title: '해리단길 & 옛 기차역 철길 산책길',
    subtitle: '7080 주택가 감성 다이닝 & 구움과자',
    description:
      '기차가 멈춘 폐선로 뒤편, 옛 단독주택들을 감각적으로 개조한 수제 버거와 에그타르트, 그린웨이 도보길을 함께 누립니다.',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    budget: 58000,
    breakdown: {
      transit: 3100,
      food: 38000,
      activity: 16900,
    },
    duration: '3시간 40분',
    distance: '5.1km',
    difficulty: '평지 도보',
    badge: '브런치 명소',
    healthScore: 9.4,
    tags: ['주택개조', '브런치', '철길그린웨이', '구움과자'],
    recommendedTime: '오전 11:30 (브런치 오픈런)',
    transitTip: '해운대역 4번 출구에서 철길 건널목 방향 도보 2분',
  },
  {
    id: 'trail-mangmi',
    districtId: 'mangmi',
    title: '망미단길 & F1963 복합문화거리',
    subtitle: '와이어 공장의 변신과 대나무 숲길 힐링',
    description:
      '수영 고가도로 하부 비콘그라운드와 주택가 독립서점, 옛 와이어 공장을 재생한 F1963 예술 공간을 잇는 문화 산책.',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    budget: 46000,
    breakdown: {
      transit: 3100,
      food: 28000,
      activity: 14900,
    },
    duration: '3시간 30분',
    distance: '4.5km',
    difficulty: '평지 도보',
    badge: '문화예술 1위',
    healthScore: 9.6,
    tags: ['도시재생', '독립출판', 'F1963', '비콘그라운드'],
    recommendedTime: '오후 14:00 (전시 관람 후 테라로사 티타임)',
    transitTip: '망mi역 2번 출구에서 수영강변 방면 도보',
  },
];

export const ALLIANCE_MERCHANTS: AllianceMerchant[] = [
  {
    id: 'merch-1',
    district: '동구 초량동',
    name: '초량 168 수제 모나카 쉼터',
    benefit: '10% 즉시할인',
    benefitType: 'discount',
    description: '산복도로 언덕 주민 어르신들이 빚는 바삭한 팥 모나카와 시원한 미숫가루',
  },
  {
    id: 'merch-2',
    district: '영도구 영선동',
    name: '흰여울 파도소리 북카페',
    benefit: '드립백 증정',
    benefitType: 'gift',
    description: '절벽 바다를 마주하며 읽는 부산 로컬 독립출판물과 수평선 풍경',
  },
  {
    id: 'merch-3',
    district: '사하구 감천동',
    name: '감천 언덕 목공방 어린왕자',
    benefit: '체험료 15% 감면',
    benefitType: 'discount',
    description: '친환경 폐목재를 업사이클링하여 만드는 바다 엽서 거치대 원데이 클래스',
  },
  {
    id: 'merch-4',
    district: '중구 보수동',
    name: '보수동 책방골목 아카이브서점',
    benefit: '도서교환권 증정',
    benefitType: 'voucher',
    description: '70년 역사의 헌책방 거리에서 발견하는 1970년대 빈티지 잡지와 문학 초판본',
  },
];
