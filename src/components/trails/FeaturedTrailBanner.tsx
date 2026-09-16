import React from 'react';
import { CuratedTrail } from '../../data/curatedTrails';
import { BookmarkPlus, MapPin, Bus, Clock, Coins } from 'lucide-react';

interface FeaturedTrailBannerProps {
  trail: CuratedTrail;
  onOpenInPlanner: (trail: CuratedTrail) => void;
  onOpenMap: (trail: CuratedTrail) => void;
}

export const FeaturedTrailBanner: React.FC<FeaturedTrailBannerProps> = ({
  trail,
  onOpenInPlanner,
  onOpenMap,
}) => {
  return (
    <section
      style={{
        borderRadius: 'var(--radius-2xl)',
        backgroundColor: 'var(--color-surface-container-high)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(29, 53, 87, 0.08)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          alignItems: 'stretch',
        }}
        id="featured-banner-grid"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '0',
          }}
          className="featured-responsive-layout"
        >
          {/* Editorial Story Column */}
          <div
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                <span className="badge-pill badge-primary">이번 주 밸런서 추천</span>
                <span className="badge-pill badge-secondary">영도구 로컬 큐레이션</span>
                <span style={{ fontSize: '12px', color: 'var(--color-tertiary)', fontWeight: 600 }}>
                  🌅 {trail.recommendedTime || '노을 골든아워 추천'}
                </span>
              </div>

              <h2 className="font-headline-lg" style={{ color: 'var(--color-on-surface)', margin: 0 }}>
                {trail.title} <br />
                <span style={{ color: 'var(--color-primary)' }}>{trail.subtitle}</span>
              </h2>

              <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6, margin: 0, maxWidth: '640px' }}>
                {trail.description}
              </p>
            </div>

            {/* Transport & Budget Intel Mini Panel */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                border: '1px solid rgba(29, 53, 87, 0.06)',
              }}
            >
              <div>
                <span className="font-label-sm" style={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bus size={13} /> 환승 팁
                </span>
                <p className="font-body-sm" style={{ fontWeight: 600, color: 'var(--color-on-surface)', margin: '2px 0 0 0' }}>
                  {trail.transitTip || '영도 5번 버스 75광장 하차'}
                </p>
              </div>

              <div>
                <span className="font-label-sm" style={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> 소요 시간
                </span>
                <p className="font-body-sm" style={{ fontWeight: 600, color: 'var(--color-on-surface)', margin: '2px 0 0 0' }}>
                  {trail.duration} ({trail.distance})
                </p>
              </div>

              <div>
                <span className="font-label-sm" style={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Coins size={13} /> 1인 권장 밸런스 예산
                </span>
                <p className="font-headline-sm tabular-nums" style={{ color: 'var(--color-primary)', fontWeight: 800, margin: '2px 0 0 0' }}>
                  ₩{trail.budget.toLocaleString()}{' '}
                  <span style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 400 }}>(가성비 98%)</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onOpenInPlanner(trail)}
                style={{ padding: '10px 18px' }}
              >
                <BookmarkPlus size={18} />
                <span>이 코스로 플래너 열기</span>
              </button>

              <button
                type="button"
                className="btn-surface"
                onClick={() => onOpenMap(trail)}
                style={{ padding: '10px 16px', backgroundColor: 'var(--color-surface-container-lowest)' }}
              >
                <MapPin size={16} />
                <span>상세 동선 지도 보기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTrailBanner;
