import React from 'react';
import { CourseItem, SpotCategory } from '../../types';
import {
  Train,
  Utensils,
  Coffee,
  Ticket,
  Cookie,
  ExternalLink,
  RefreshCw,
  Footprints,
} from 'lucide-react';

interface SpotCardProps {
  item: CourseItem;
  onOpenSwap: (item: CourseItem) => void;
}

const CATEGORY_CONFIG: Record<
  SpotCategory,
  { label: string; tagClass: string; icon: React.ReactNode }
> = {
  transit: {
    label: '교통·이동',
    tagClass: 'tag-transit',
    icon: <Train size={12} />,
  },
  food: {
    label: '골목 식사',
    tagClass: 'tag-food',
    icon: <Utensils size={12} />,
  },
  cafe: {
    label: '카페·디저트',
    tagClass: 'tag-cafe',
    icon: <Coffee size={12} />,
  },
  admission: {
    label: '문화·체험',
    tagClass: 'tag-admission',
    icon: <Ticket size={12} />,
  },
  snack: {
    label: '골목 간식',
    tagClass: 'tag-snack',
    icon: <Cookie size={12} />,
  },
};

export const SpotCard: React.FC<SpotCardProps> = ({ item, onOpenSwap }) => {
  const { spot, category, cost, timeSlot, alternativeSpots, walkingDistanceNote } = item;
  const config = CATEGORY_CONFIG[category];

  return (
    <div className="spot-card" id={`spot-card-${spot.id}`}>
      {/* Top bar */}
      <div className="spot-top-bar">
        <span className="spot-time-pill">{timeSlot}</span>
        <span className={`category-tag ${config.tagClass}`}>
          {config.icon}
          <span style={{ marginLeft: 4 }}>{config.label}</span>
        </span>
      </div>

      {/* Spot name & summary */}
      <div>
        <h3 className="spot-name">{spot.name}</h3>
        <p className="spot-summary">{spot.summary}</p>
      </div>

      {/* Signature & Price */}
      <div className="spot-signature-box">
        <span className="spot-signature-label">{spot.signature}</span>
        <span className="spot-price-tag">
          {spot.isFree || cost === 0 ? '무료' : `${cost.toLocaleString()}원`}
        </span>
      </div>

      {/* Walking distance indicator */}
      {walkingDistanceNote && (
        <div className="spot-walking-note">
          <Footprints size={13} />
          <span>{walkingDistanceNote}</span>
        </div>
      )}

      {/* Tags */}
      {spot.tags && spot.tags.length > 0 && (
        <div className="spot-tags">
          {spot.tags.map((tag) => (
            <span key={tag} className="spot-tag-item">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Links & Swap Button */}
      <div className="spot-actions">
        {spot.naverSearchUrl && (
          <a
            href={spot.naverSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-link-btn"
            id={`naver-map-btn-${spot.id}`}
            title="네이버 지도에서 보기"
          >
            <span>네이버 지도</span>
            <ExternalLink size={12} />
          </a>
        )}

        {spot.kakaoSearchUrl && (
          <a
            href={spot.kakaoSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-link-btn"
            id={`kakao-map-btn-${spot.id}`}
            title="카카오맵에서 보기"
          >
            <span>카카오맵</span>
            <ExternalLink size={12} />
          </a>
        )}

        {alternativeSpots && alternativeSpots.length > 0 && (
          <button
            type="button"
            className="swap-btn"
            id={`swap-spot-btn-${spot.id}`}
            onClick={() => onOpenSwap(item)}
            title="이 골목의 다른 장소로 교체하기"
          >
            <RefreshCw size={12} />
            <span>장소 변경 ({alternativeSpots.length})</span>
          </button>
        )}
      </div>
    </div>
  );
};
