import { SavedPlanEntity, CreatePlanDto } from '../types';
import { generateTravelPlan } from '../../services/budgetCalculator';
import { DistrictId, TravelTheme } from '../../types';

/**
 * 인메모리 플랜 스토리지 (백엔드 영속성 계층)
 */
class PlanStorage {
  private plans: Map<string, SavedPlanEntity> = new Map();

  constructor() {
    this.seedInitialCurations();
  }

  /**
   * 고유 단축 슬러그 생성 (예: bsn-7k2p)
   */
  private generateSlug(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `bsn-${rand}`;
  }

  /**
   * 신규 여행 일정 저장
   */
  public savePlan(dto: CreatePlanDto): SavedPlanEntity {
    let slug = this.generateSlug();
    while (this.plans.has(slug)) {
      slug = this.generateSlug();
    }

    const now = new Date().toISOString();
    const entity: SavedPlanEntity = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      slug,
      plan: dto.plan,
      likeCount: 0,
      viewCount: 1,
      authorNickname: dto.authorNickname || '부산 뚜벅이',
      createdAt: now,
      updatedAt: now,
    };

    this.plans.set(slug, entity);
    return entity;
  }

  /**
   * 슬러그로 코스 조회 (조회수 1 증가)
   */
  public findBySlug(slug: string): SavedPlanEntity | null {
    const entity = this.plans.get(slug);
    if (!entity) return null;

    entity.viewCount += 1;
    return entity;
  }

  /**
   * 좋아요 수 증가
   */
  public incrementLike(slug: string): number | null {
    const entity = this.plans.get(slug);
    if (!entity) return null;

    entity.likeCount += 1;
    entity.updatedAt = new Date().toISOString();
    return entity.likeCount;
  }

  /**
   * 인기 큐레이션 목록 (좋아요 및 조회수 기준 정렬)
   */
  public getPopularCurations(limit = 6) {
    const all = Array.from(this.plans.values());
    return all
      .sort((a, b) => b.likeCount * 2 + b.viewCount - (a.likeCount * 2 + a.viewCount))
      .slice(0, limit)
      .map((item) => ({
        slug: item.slug,
        title: item.plan.title,
        districtName: item.plan.district.name,
        totalBudget: item.plan.preference.budget,
        totalSpent: item.plan.costBreakdown.totalSpent,
        theme: item.plan.preference.theme,
        likeCount: item.likeCount,
        topSpots: item.plan.items.slice(0, 3).map((i) => i.spot.name),
        createdAt: item.createdAt,
      }));
  }

  /**
   * 초기 인기 큐레이션 코스 시딩 (5대 골목 권역별 대표 예산 코스)
   */
  private seedInitialCurations() {
    const seeds: Array<{
      slug: string;
      budget: number;
      districtId: DistrictId;
      theme: TravelTheme;
      likeCount: number;
      nickname: string;
    }> = [
      {
        slug: 'bsn-jeonpo50',
        budget: 50000,
        districtId: 'jeonpo',
        theme: 'cafe_dessert',
        likeCount: 42,
        nickname: '전포디저트러버',
      },
      {
        slug: 'bsn-yeongdo40',
        budget: 40000,
        districtId: 'yeongdo',
        theme: 'ocean_healing',
        likeCount: 38,
        nickname: '흰여울바람',
      },
      {
        slug: 'bsn-haeridan60',
        budget: 60000,
        districtId: 'haeridan',
        theme: 'all',
        likeCount: 29,
        nickname: '해운대현지인',
      },
      {
        slug: 'bsn-bosu30',
        budget: 30000,
        districtId: 'bosu',
        theme: 'retro_culture',
        likeCount: 25,
        nickname: '레트로부산',
      },
      {
        slug: 'bsn-mangmi50',
        budget: 50000,
        districtId: 'mangmi',
        theme: 'local_food',
        likeCount: 19,
        nickname: '수영구탐험가',
      },
    ];

    seeds.forEach((s) => {
      const plan = generateTravelPlan({
        budget: s.budget,
        districtId: s.districtId,
        theme: s.theme,
        transitType: 'transit_walk',
        partySize: 1,
      });

      const now = new Date(Date.now() - Math.floor(Math.random() * 86400000 * 5)).toISOString();
      const entity: SavedPlanEntity = {
        id: `plan_seed_${s.slug}`,
        slug: s.slug,
        plan,
        likeCount: s.likeCount,
        viewCount: s.likeCount * 3 + 12,
        authorNickname: s.nickname,
        createdAt: now,
        updatedAt: now,
      };

      this.plans.set(s.slug, entity);
    });
  }

  /**
   * 테스트 및 초기화용 전체 리셋
   */
  public clear() {
    this.plans.clear();
    this.seedInitialCurations();
  }
}

export const planStorage = new PlanStorage();
