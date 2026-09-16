import { TravelPlan } from '../types';
import { CreatePlanResponseDto, LikeResponseDto, PopularCurationsResponseDto } from '../server/types';

/**
 * 프론트엔드 - 백엔드 통신 API 클라이언트
 */
export class PlanApiClient {
  private static baseUrl = '';

  /**
   * 백엔드 서버에 여행 코스 저장 및 고유 공유 링크 발급
   */
  public static async savePlan(
    plan: TravelPlan,
    authorNickname = '부산 뚜벅이'
  ): Promise<CreatePlanResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, authorNickname }),
      });

      if (!response.ok) {
        throw new Error(`서버 응답 오류 (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.warn('백엔드 저장 실패, 로컬 Fallback 슬러그 생성:', error);
      // 오프라인/서버 미구동 환경을 위한 로컬 가상 Fallback
      const localSlug = `local-${Math.random().toString(36).substring(2, 7)}`;
      return {
        success: true,
        slug: localSlug,
        shareUrl: `${window.location.origin}/?plan=${localSlug}`,
        plan,
        message: '로컬 임시 링크로 생성되었습니다.',
      };
    }
  }

  /**
   * 슬러그로 저장된 코스 상세 정보 조회
   */
  public static async getPlanBySlug(slug: string): Promise<TravelPlan | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans/${slug}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.success ? data.plan : null;
    } catch (error) {
      console.error('코스 조회 실패:', error);
      return null;
    }
  }

  /**
   * 코스 좋아요(추천) 등록
   */
  public static async likePlan(slug: string): Promise<number | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans/${slug}/like`, {
        method: 'POST',
      });
      if (!response.ok) return null;
      const data: LikeResponseDto = await response.json();
      return data.success ? data.likeCount : null;
    } catch (error) {
      console.error('좋아요 요청 실패:', error);
      return null;
    }
  }

  /**
   * 인기 큐레이션 코스 목록 조회
   */
  public static async getPopularCurations(limit = 5): Promise<PopularCurationsResponseDto['curations']> {
    try {
      const response = await fetch(`${this.baseUrl}/api/curations/popular?limit=${limit}`);
      if (!response.ok) return [];
      const data: PopularCurationsResponseDto = await response.json();
      return data.success ? data.curations : [];
    } catch (error) {
      console.error('인기 큐레이션 조회 실패:', error);
      return [];
    }
  }
}
