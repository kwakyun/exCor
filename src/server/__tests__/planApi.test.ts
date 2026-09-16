import { describe, it, expect, beforeEach } from 'vitest';
import { PlanController } from '../controllers/planController';
import { planStorage } from '../storage/planStorage';
import { generateTravelPlan } from '../../services/budgetCalculator';

describe('Backend Plan API & Controller Tests', () => {
  beforeEach(() => {
    planStorage.clear();
  });

  it('초기 시딩 데이터(5대 권역 대표 코스)가 정상 로드되어야 한다', async () => {
    const res = await PlanController.getPopularCurations(10);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.curations.length).toBeGreaterThanOrEqual(5);

    const jeonpo = await PlanController.getPlan('bsn-jeonpo50');
    expect(jeonpo.status).toBe(200);
    expect(jeonpo.data.plan.district.id).toBe('jeonpo');
    expect(jeonpo.data.likeCount).toBe(42);
  });

  it('새로운 여행 코스를 저장하면 고유 slug와 201 상태코드를 반환해야 한다', async () => {
    const dummyPlan = generateTravelPlan({
      budget: 45000,
      districtId: 'yeongdo',
      theme: 'ocean_healing',
      transitType: 'transit_walk',
      partySize: 1,
    });

    const res = await PlanController.createPlan(
      { plan: dummyPlan, authorNickname: '부산여행러' },
      'http://localhost:5173'
    );

    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.slug).toMatch(/^bsn-[a-z0-9]{5}$/);
    expect(res.data.shareUrl).toContain(`?plan=${res.data.slug}`);

    // 저장된 코스 조회
    const getRes = await PlanController.getPlan(res.data.slug);
    expect(getRes.status).toBe(200);
    expect(getRes.data.plan.preference.budget).toBe(45000);
    expect(getRes.data.authorNickname).toBe('부산여행러');
  });

  it('존재하지 않는 코스 조회 시 404를 반환해야 한다', async () => {
    const res = await PlanController.getPlan('bsn-nonexistent');
    expect(res.status).toBe(404);
    expect(res.data.success).toBe(false);
  });

  it('코스 좋아요(like) 호출 시 likeCount가 1 증가해야 한다', async () => {
    const initial = await PlanController.getPlan('bsn-bosu30');
    const initialLikes = initial.data.likeCount;

    const likeRes = await PlanController.likePlan('bsn-bosu30');
    expect(likeRes.status).toBe(200);
    expect(likeRes.data.likeCount).toBe(initialLikes + 1);

    const updated = await PlanController.getPlan('bsn-bosu30');
    expect(updated.data.likeCount).toBe(initialLikes + 1);
  });

  it('스팟 목록 필터링 API가 권역별/카테고리별로 정확히 작동해야 한다', async () => {
    // 전포 카페만 필터링
    const res = await PlanController.getSpots({ districtId: 'jeonpo', category: 'cafe' });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.spots.length).toBeGreaterThan(0);
    res.data.spots.forEach((spot: any) => {
      expect(spot.districtId).toBe('jeonpo');
      expect(spot.category).toBe('cafe');
    });
  });
});
