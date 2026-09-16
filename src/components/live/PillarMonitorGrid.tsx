import React from 'react';
import { Bus, Utensils, Ticket, Footprints, PiggyBank, Sparkles } from 'lucide-react';

interface PillarMonitorGridProps {
  transitSpent: number;
  transitTarget: number;
  foodSpent: number;
  foodTarget: number;
  activitySpent: number;
  activityTarget: number;
}

export const PillarMonitorGrid: React.FC<PillarMonitorGridProps> = ({
  transitSpent,
  transitTarget,
  foodSpent,
  foodTarget,
  activitySpent,
  activityTarget,
}) => {
  const pTransit = transitTarget > 0 ? Math.min(100, Math.round((transitSpent / transitTarget) * 100)) : 0;
  const pFood = foodTarget > 0 ? Math.min(100, Math.round((foodSpent / foodTarget) * 100)) : 0;
  const pAct = activityTarget > 0 ? Math.min(100, Math.round((activitySpent / activityTarget) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="font-headline-md" style={{ margin: 0 }}>
          카테고리별 실시간 지출 모니터링
        </h3>
        <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          실시간 추천 골목길 알림 활성화됨
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-gutter)',
        }}
      >
        {/* Pillar 1: Transit */}
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid rgba(29, 53, 87, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-secondary-fixed)',
                    color: 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bus size={18} />
                </span>
                <div>
                  <h4 className="font-headline-sm" style={{ margin: 0, fontSize: '16px' }}>
                    교통비
                  </h4>
                  <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                    버스 · 마을버스 · 지하철
                  </span>
                </div>
              </div>
              <span className="badge-pill badge-secondary">예산 여유</span>
            </div>

            <div style={{ paddingTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="font-headline-md tabular-nums" style={{ color: 'var(--color-secondary)', fontWeight: 800 }}>
                  ₩{transitSpent.toLocaleString()}
                </span>
                <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  목표 ₩{transitTarget.toLocaleString()}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--color-surface-container)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '6px' }}>
                <div style={{ height: '100%', width: `${pTransit}%`, backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-full)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                <span>{pTransit}% 소진</span>
                <span style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                  잔여 ₩{Math.max(0, transitTarget - transitSpent).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Tip Card */}
          <div
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-container)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary)' }}>
              <Footprints size={14} />
              <span>실시간 골목 팁</span>
            </div>
            <p className="font-body-sm" style={{ color: 'var(--color-on-surface)', lineHeight: 1.45, margin: 0 }}>
              남은 저녁 일정은 <strong>남포동 → 보수동 책방골목</strong> 도보 12분 산책 구간입니다. 대중교통 없이 <strong>교통비 ₩0원으로 방어</strong> 가능합니다!
            </p>
          </div>
        </div>

        {/* Pillar 2: Food */}
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid rgba(29, 53, 87, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-fixed)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Utensils size={18} />
                </span>
                <div>
                  <h4 className="font-headline-sm" style={{ margin: 0, fontSize: '16px' }}>
                    식비 · 로컬 미식
                  </h4>
                  <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                    골목 카페 · 노포 맛집
                  </span>
                </div>
              </div>
              <span
                className="badge-pill"
                style={{
                  backgroundColor: 'var(--color-error-container)',
                  color: 'var(--color-on-error-container)',
                  fontWeight: 800,
                }}
              >
                주의 필요
              </span>
            </div>

            <div style={{ paddingTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="font-headline-md tabular-nums" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                  ₩{foodSpent.toLocaleString()}
                </span>
                <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  목표 ₩{foodTarget.toLocaleString()}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--color-surface-container)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '6px' }}>
                <div style={{ height: '100%', width: `${pFood}%`, backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-full)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                <span>{pFood}% 소진</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  잔여 ₩{Math.max(0, foodTarget - foodSpent).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Recovery Tip Card */}
          <div
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 219, 209, 0.4)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
              <PiggyBank size={14} />
              <span>밸런스 복구 추천</span>
            </div>
            <p className="font-body-sm" style={{ color: 'var(--color-on-surface)', lineHeight: 1.45, margin: 0 }}>
              흰여울 오션뷰 카페 추가 결제로 ₩15,000 초과 페이스입니다. 저녁은 <strong>자갈치 가성비 고등어구이 백반(₩7,000)</strong>으로 맛과 지출을 조화롭게 맞춰보세요.
            </p>
          </div>
        </div>

        {/* Pillar 3: Activity */}
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid rgba(29, 53, 87, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-tertiary-fixed)',
                    color: 'var(--color-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ticket size={18} />
                </span>
                <div>
                  <h4 className="font-headline-sm" style={{ margin: 0, fontSize: '16px' }}>
                    입장료 · 골목 체험
                  </h4>
                  <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                    모노레일 · 공방 · 전시
                  </span>
                </div>
              </div>
              <span className="badge-pill badge-tertiary">예산 풍족</span>
            </div>

            <div style={{ paddingTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="font-headline-md tabular-nums" style={{ color: 'var(--color-tertiary)', fontWeight: 800 }}>
                  ₩{activitySpent.toLocaleString()}
                </span>
                <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  목표 ₩{activityTarget.toLocaleString()}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--color-surface-container)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '6px' }}>
                <div style={{ height: '100%', width: `${pAct}%`, backgroundColor: 'var(--color-tertiary)', borderRadius: 'var(--radius-full)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                <span>{pAct}% 소진</span>
                <span style={{ fontWeight: 700, color: 'var(--color-tertiary)' }}>
                  잔여 ₩{Math.max(0, activityTarget - activitySpent).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Leisure Tip Card */}
          <div
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-container)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-tertiary)' }}>
              <Sparkles size={14} />
              <span>여유 자금 골목 제안</span>
            </div>
            <p className="font-body-sm" style={{ color: 'var(--color-on-surface)', lineHeight: 1.45, margin: 0 }}>
              초량 무료 이바구길 모노레일 이용 덕에 ₩35,000 잔여! <strong>흰여울 문화마을 독립영화 상영관(₩9,000)</strong> 관람을 일정에 추가할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillarMonitorGrid;
