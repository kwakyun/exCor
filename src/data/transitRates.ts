import { TransitCostModel, TransitType } from '../types';

export const TRANSIT_COST_MODELS: Record<TransitType, TransitCostModel> = {
  transit_walk: {
    type: 'transit_walk',
    label: '알뜰 뚜벅이 (대중교통 + 도보)',
    icon: 'Subway',
    cost: 3100, // 부산 지하철/버스 1회 환승 포함 2회 왕복 (1,550원 x 2)
    summary: '부산 도시철도 & 버스 환승 (왕복 약 3,100원)',
    description: '부산 도시철도와 시내버스를 타고 골목 입구까지 이동한 뒤, 골목 안에서는 여유롭게 걷는 코스입니다.',
  },
  comfort_taxi: {
    type: 'comfort_taxi',
    label: '편안 믹스 (대중교통 + 단거리 택시)',
    icon: 'Car',
    cost: 8500, // 대중교통 1회(1,550원) + 골목 진입 택시 기본/단거리 1회(약 6,950원)
    summary: '지하철 이동 후 오르막/해안가 택시 탑승 (약 8,500원)',
    description: '오르막길(영도 산복도로, 감천 등)이나 역에서 거리가 있는 골목까지 택시를 활용하여 체력을 아낍니다.',
  },
};
