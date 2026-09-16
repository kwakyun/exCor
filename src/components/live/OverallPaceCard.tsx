import React from 'react';
import { Gauge, ShieldCheck, SunMedium, ArrowRight } from 'lucide-react';

interface OverallPaceCardProps {
  totalBudget: number;
  totalSpent: number;
  foodSpent: number;
  transitSpent: number;
  activitySpent: number;
  onScrollToRebalance: () => void;
}

export const OverallPaceCard: React.FC<OverallPaceCardProps> = ({
  totalBudget,
  totalSpent,
  foodSpent,
  transitSpent,
  activitySpent,
  onScrollToRebalance,
}) => {
  const remaining = Math.max(0, totalBudget - totalSpent);
  const remainingPct = totalBudget > 0 ? ((remaining / totalBudget) * 100).toFixed(1) : '0';
  const spentPct = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0';

  // Segment widths relative to total budget
  const wFood = totalBudget > 0 ? (foodSpent / totalBudget) * 100 : 40;
  const wTransit = totalBudget > 0 ? (transitSpent / totalBudget) * 100 : 10;
  const wAct = totalBudget > 0 ? (activitySpent / totalBudget) * 100 : 12;

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-2xl)',
        backgroundColor: 'var(--color-surface-container-lowest)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(29, 53, 87, 0.08)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
        id="overall-pace-grid"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
          }}
          className="pace-responsive-grid"
        >
          {/* Left Column: Numbers & Multi-segmented Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
                  부산 골목 스마트 밸런서 현황
                </span>
                <h2 className="font-headline-lg" style={{ margin: '2px 0 0 0', color: 'var(--color-on-surface)' }}>
                  총 지출 밸런스 페이스
                </h2>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface-variant)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Gauge size={15} color="var(--color-primary)" />
                <span>목표 대비 안정 속도 권역</span>
              </div>
            </div>

            {/* Total Balance Figures */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '12px' }}>
              <span
                className="font-display-lg tabular-nums"
                style={{ color: 'var(--color-primary)', fontWeight: 800, letterSpacing: '-0.02em' }}
              >
                ₩{totalSpent.toLocaleString()}
              </span>
              <span className="font-headline-md" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 400 }}>
                / ₩{totalBudget.toLocaleString()} 목표
              </span>
              <span
                className="badge-pill"
                style={{
                  backgroundColor: 'var(--color-secondary-fixed)',
                  color: 'var(--color-on-secondary-fixed)',
                  fontWeight: 800,
                  fontSize: '13px',
                  padding: '6px 10px',
                }}
              >
                잔여 ₩{remaining.toLocaleString()} ({remainingPct}%)
              </span>
            </div>

            {/* Multi-segmented Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  height: '14px',
                  width: '100%',
                  backgroundColor: 'var(--color-surface-container)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  display: 'flex',
                  gap: '2px',
                  padding: '2px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${wFood}%`,
                    backgroundColor: 'var(--pillar-food)',
                    borderTopLeftRadius: 'var(--radius-full)',
                    borderBottomLeftRadius: 'var(--radius-full)',
                    transition: 'width 500ms ease',
                  }}
                  title={`식비 지출: ₩${foodSpent.toLocaleString()}`}
                />
                <div
                  style={{
                    height: '100%',
                    width: `${wTransit}%`,
                    backgroundColor: 'var(--pillar-transit)',
                    transition: 'width 500ms ease',
                  }}
                  title={`교통비 지출: ₩${transitSpent.toLocaleString()}`}
                />
                <div
                  style={{
                    height: '100%',
                    width: `${wAct}%`,
                    backgroundColor: 'var(--pillar-activity)',
                    transition: 'width 500ms ease',
                  }}
                  title={`체험비 지출: ₩${activitySpent.toLocaleString()}`}
                />
                <div
                  style={{
                    height: '100%',
                    flex: 1,
                    backgroundColor: 'var(--color-surface-container-high)',
                    borderTopRightRadius: 'var(--radius-full)',
                    borderBottomRightRadius: 'var(--radius-full)',
                  }}
                  title="잔여 예산"
                />
              </div>

              {/* Bar Legend */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'var(--color-on-surface-variant)',
                  paddingTop: '2px',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--pillar-food)' }} />
                    식비 ₩{(foodSpent / 1000).toFixed(0)}k
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--pillar-transit)' }} />
                    교통 ₩{(transitSpent / 1000).toFixed(0)}k
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--pillar-activity)' }} />
                    문화체험 ₩{(activitySpent / 1000).toFixed(0)}k
                  </span>
                </div>

                <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>
                  총 {spentPct}% 소진됨
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Smart Health Insight */}
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-surface-container)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              border: '1px solid rgba(29, 53, 87, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                }}
              >
                <ShieldCheck size={16} />
                스마트 밸런스 진단
              </span>
              <span className="badge-pill badge-secondary">안전 (A-)</span>
            </div>

            <p className="font-body-md" style={{ color: 'var(--color-on-surface)', lineHeight: 1.55, margin: 0 }}>
              <strong style={{ color: 'var(--color-primary)' }}>식비 지출 페이스가 약간 높지만</strong>,
              영도 마을버스 환승과 도보 산책으로 <strong style={{ color: 'var(--color-secondary)' }}>교통비 ₩8,000을 세이브</strong>하여
              전체 여정의 지출 리듬은 매우 안정적입니다!
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '4px',
                fontSize: '12px',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <SunMedium size={14} color="var(--color-tertiary)" />
                영도 흰여울 골목 쾌적 도보 날씨
              </span>

              <button
                type="button"
                onClick={onScrollToRebalance}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span>추천 리밸런싱</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallPaceCard;
