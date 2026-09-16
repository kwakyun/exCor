import { TravelPlan } from '../types';

/**
 * 서버에 저장되는 여행 코스 엔티티
 */
export interface SavedPlanEntity {
  id: string;
  slug: string; // 고유 단축 공유 식별자 (예: bsn-a8f2k)
  plan: TravelPlan;
  likeCount: number;
  viewCount: number;
  authorNickname?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 코스 저장 요청 DTO
 */
export interface CreatePlanDto {
  plan: TravelPlan;
  authorNickname?: string;
}

/**
 * 코스 저장 응답 DTO
 */
export interface CreatePlanResponseDto {
  success: boolean;
  slug: string;
  shareUrl: string;
  plan: TravelPlan;
  message?: string;
}

/**
 * 좋아요 응답 DTO
 */
export interface LikeResponseDto {
  success: boolean;
  slug: string;
  likeCount: number;
}

/**
 * 인기 큐레이션 목록 응답 DTO
 */
export interface PopularCurationsResponseDto {
  success: boolean;
  curations: Array<{
    slug: string;
    title: string;
    districtName: string;
    totalBudget: number;
    totalSpent: number;
    theme: string;
    likeCount: number;
    topSpots: string[];
    createdAt: string;
  }>;
}
