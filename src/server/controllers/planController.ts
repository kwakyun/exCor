import { planStorage } from '../storage/planStorage';
import { CreatePlanDto } from '../types';
import { ALLEY_DISTRICTS, SPOTS_DATA } from '../../data/busanAlleys';

export interface HttpResponse {
  status: number;
  data: any;
}

/**
 * 백엔드 여행 코스 컨트롤러
 */
export class PlanController {
  /**
   * POST /api/plans - 신규 코스 저장
   */
  public static async createPlan(body: CreatePlanDto, baseUrl: string): Promise<HttpResponse> {
    if (!body || !body.plan) {
      return {
        status: 400,
        data: { success: false, error: '유효한 여행 계획(plan) 데이터가 필요합니다.' },
      };
    }

    try {
      const entity = planStorage.savePlan(body);
      const shareUrl = `${baseUrl}/?plan=${entity.slug}`;

      return {
        status: 201,
        data: {
          success: true,
          slug: entity.slug,
          shareUrl,
          plan: entity.plan,
          message: '여행 코스가 성공적으로 저장되었습니다.',
        },
      };
    } catch (error: any) {
      return {
        status: 500,
        data: { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      };
    }
  }

  /**
   * GET /api/plans/:slug - 슬러그로 저장된 코스 조회
   */
  public static async getPlan(slug: string): Promise<HttpResponse> {
    if (!slug) {
      return {
        status: 400,
        data: { success: false, error: '코스 식별자(slug)가 필요합니다.' },
      };
    }

    const entity = planStorage.findBySlug(slug);
    if (!entity) {
      return {
        status: 404,
        data: { success: false, error: '해당 코스를 찾을 수 없습니다.' },
      };
    }

    return {
      status: 200,
      data: {
        success: true,
        slug: entity.slug,
        plan: entity.plan,
        likeCount: entity.likeCount,
        viewCount: entity.viewCount,
        authorNickname: entity.authorNickname,
        createdAt: entity.createdAt,
      },
    };
  }

  /**
   * POST /api/plans/:slug/like - 코스 좋아요 증가
   */
  public static async likePlan(slug: string): Promise<HttpResponse> {
    if (!slug) {
      return {
        status: 400,
        data: { success: false, error: '코스 식별자(slug)가 필요합니다.' },
      };
    }

    const likeCount = planStorage.incrementLike(slug);
    if (likeCount === null) {
      return {
        status: 404,
        data: { success: false, error: '해당 코스를 찾을 수 없습니다.' },
      };
    }

    return {
      status: 200,
      data: {
        success: true,
        slug,
        likeCount,
      },
    };
  }

  /**
   * GET /api/curations/popular - 인기 큐레이션 목록
   */
  public static async getPopularCurations(limit = 6): Promise<HttpResponse> {
    const curations = planStorage.getPopularCurations(limit);
    return {
      status: 200,
      data: {
        success: true,
        curations,
      },
    };
  }

  /**
   * GET /api/spots - 스팟 목록 필터링 조회
   */
  public static async getSpots(query: {
    districtId?: string;
    category?: string;
    maxPrice?: number;
  }): Promise<HttpResponse> {
    let spots = [...SPOTS_DATA];

    if (query.districtId && query.districtId !== 'all') {
      spots = spots.filter((s) => s.districtId === query.districtId);
    }
    if (query.category) {
      spots = spots.filter((s) => s.category === query.category);
    }
    if (query.maxPrice !== undefined && !isNaN(Number(query.maxPrice))) {
      spots = spots.filter((s) => s.price <= Number(query.maxPrice));
    }

    return {
      status: 200,
      data: {
        success: true,
        count: spots.length,
        spots,
      },
    };
  }

  /**
   * GET /api/districts - 5대 골목 권역 메타데이터 목록
   */
  public static async getDistricts(): Promise<HttpResponse> {
    return {
      status: 200,
      data: {
        success: true,
        districts: ALLEY_DISTRICTS,
      },
    };
  }
}
