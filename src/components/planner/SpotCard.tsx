import React from 'react';
import { CourseItem, SpotCategory } from '../../types';
import { RefreshCw, ExternalLink, MapPin, Tag, Award } from 'lucide-react';

interface SpotCardProps {
  item: CourseItem;
  onOpenSwap: (item: CourseItem) => void;
}

const CATEGORY_MAP: Record<
  SpotCategory,
  { label: string; badgeClass: string; nodeColor: string; pinRing: string }
> = {
  transit: {
    label: '교통 · 도보',
    badgeClass: 'badge-secondary',
    nodeColor: 'var(--pillar-transit)',
    pinRing: 'var(--color-secondary-fixed)',
  },
  food: {
    label: '식비 · 노포',
    badgeClass: 'badge-primary',
    nodeColor: 'var(--pillar-food)',
    pinRing: 'var(--color-primary-fixed)',
  },
  cafe: {
    label: '감성 카페',
    badgeClass: 'badge-primary',
    nodeColor: 'var(--pillar-food)',
    pinRing: 'var(--color-primary-fixed)',
  },
  admission: {
    label: '체험 · 문화',
    badgeClass: 'badge-tertiary',
    nodeColor: 'var(--pillar-activity)',
    pinRing: 'var(--color-tertiary-fixed)',
  },
  snack: {
    label: '야시장 간식',
    badgeClass: 'badge-teal',
    nodeColor: 'var(--color-accent-teal)',
    pinRing: 'var(--color-accent-teal-fixed)',
  },
};

export const SpotCard: React.FC<SpotCardProps> = ({ item, onOpenSwap }) => {
  const catConfig = CATEGORY_MAP[item.category] || CATEGORY_MAP.food;
  const spot = item.spot;

  return (
    <div className="timeline-item-wrapper">
      {/* Node Pin on the timeline line */}
      <div
        className="timeline-node-pin"
        style={{
          backgroundColor: catConfig.nodeColor,
          boxShadow: `0 0 0 3px ${catConfig.pinRing}`,
        }}
      />

      <div className="timeline-card">
        {/* Card Top: Time, Category, Title & Price */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="font-label-sm" style={{ color: catConfig.nodeColor, fontWeight: 700 }}>
              {item.timeSlot}
            </span>
            <span className={`badge-pill ${catConfig.badgeClass}`}>{catConfig.label}</span>
            <h4
              className="font-headline-sm"
              style={{ margin: 0, color: 'var(--color-on-surface)', fontWeight: 600, fontSize: '16px' }}
            >
              {spot.name}
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="font-label-lg tabular-nums"
              style={{ color: catConfig.nodeColor, fontWeight: 800, fontSize: '15px' }}
            >
              ₩{item.cost.toLocaleString()}
            </span>

            {/* Swap spot button */}
            {item.alternativeSpots && item.alternativeSpots.length > 0 && (
              <button
                type="button"
                className="btn-surface"
                onClick={() => onOpenSwap(item)}
                style={{ padding: '4px 8px', fontSize: '11px', borderRadius: 'var(--radius-sm)' }}
                title="이 스팟을 다른 추천 스팟으로 교체합니다"
              >
                <RefreshCw size={12} />
                <span>교체</span>
              </button>
            )}
          </div>
        </div>

        {/* Spot Summary & Signature */}
        <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
          {spot.summary}
        </p>

        {/* Signature highlight */}
        {spot.signature && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-secondary-dark)' }}>
            <Tag size={13} color="var(--color-primary)" />
            <span>
              <strong>대표 포인트:</strong> {spot.signature}
            </span>
          </div>
        )}

        {/* Card Footer: Address/Tips & External links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            borderTop: '1px solid rgba(29, 53, 87, 0.05)',
            paddingTop: '6px',
            marginTop: '2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
            <MapPin size={13} color="var(--color-tertiary)" />
            <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {spot.address || spot.tip || '도보 5분 거리'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {spot.tags && spot.tags.includes('로컬노포') && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                }}
              >
                <Award size={13} />
                로컬 인증
              </span>
            )}

            {spot.naverSearchUrl && (
              <a
                href={spot.naverSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  color: 'var(--color-secondary)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
                title="네이버 지도에서 보기"
              >
                <span>지도</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotCard;
