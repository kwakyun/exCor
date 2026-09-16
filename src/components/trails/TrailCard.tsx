import React from 'react';
import { CuratedTrail } from '../../data/curatedTrails';
import { Scale, ArrowRight, Clock, Footprints } from 'lucide-react';

interface TrailCardProps {
  trail: CuratedTrail;
  isCompared: boolean;
  onToggleCompare: (trail: CuratedTrail) => void;
  onOpenInPlanner: (trail: CuratedTrail) => void;
}

export const TrailCard: React.FC<TrailCardProps> = ({
  trail,
  isCompared,
  onToggleCompare,
  onOpenInPlanner,
}) => {
  const sum = trail.breakdown.transit + trail.breakdown.food + trail.breakdown.activity;
  const pTransit = sum > 0 ? Math.round((trail.breakdown.transit / sum) * 100) : 10;
  const pFood = sum > 0 ? Math.round((trail.breakdown.food / sum) * 100) : 65;
  const pAct = Math.max(0, 100 - pTransit - pFood);

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(29, 53, 87, 0.06)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
      className="trail-card-hover"
    >
      {/* Media Banner */}
      <div style={{ position: 'relative', height: '180px', backgroundColor: 'var(--color-surface-container)', overflow: 'hidden' }}>
        <img
          src={trail.image}
          alt={trail.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <span
          className="badge-pill"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            color: 'var(--color-primary)',
            fontWeight: 700,
          }}
        >
          {trail.subtitle || '부산 골목'}
        </span>

        <span
          className="badge-pill badge-secondary"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
          }}
        >
          {trail.difficulty}
        </span>
      </div>

      {/* Body Content */}
      <div
        style={{
          padding: '1.25rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h4
            className="font-headline-sm"
            style={{ margin: 0, color: 'var(--color-on-surface)', fontWeight: 700, fontSize: '17px' }}
          >
            {trail.title}
          </h4>

          <p
            className="font-body-sm"
            style={{
              color: 'var(--color-on-surface-variant)',
              margin: 0,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {trail.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--color-on-surface-variant)', paddingTop: '2px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {trail.duration}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Footprints size={13} /> {trail.distance}
            </span>
          </div>
        </div>

        {/* Budget Breakdown Block */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-lg)',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="font-label-sm" style={{ color: 'var(--color-secondary)' }}>
              총 소요 예상
            </span>
            <span className="font-label-lg tabular-nums" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
              ₩{trail.budget.toLocaleString()}
            </span>
          </div>

          {/* Mini 3-pillar gauge */}
          <div style={{ width: '100%', height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface-container-highest)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ height: '100%', width: `${pTransit}%`, backgroundColor: 'var(--pillar-transit)' }} title={`교통비 ₩${trail.breakdown.transit.toLocaleString()}`} />
            <div style={{ height: '100%', width: `${pFood}%`, backgroundColor: 'var(--pillar-food)' }} title={`식비 ₩${trail.breakdown.food.toLocaleString()}`} />
            <div style={{ height: '100%', width: `${pAct}%`, backgroundColor: 'var(--pillar-activity)' }} title={`체험비 ₩${trail.breakdown.activity.toLocaleString()}`} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
            <span>교통 {(trail.breakdown.transit / 1000).toFixed(1)}천</span>
            <span>식비 {(trail.breakdown.food / 1000).toFixed(1)}천</span>
            <span>체험 {(trail.breakdown.activity / 1000).toFixed(1)}천</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '2px' }}>
          <button
            type="button"
            className="btn-surface"
            onClick={() => onToggleCompare(trail)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              color: isCompared ? 'var(--color-primary)' : 'var(--color-secondary)',
              borderColor: isCompared ? 'var(--color-primary)' : 'transparent',
            }}
          >
            <Scale size={13} />
            <span>{isCompared ? '비교 중' : '비교함'}</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => onOpenInPlanner(trail)}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <span>플래너 적용</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default TrailCard;
