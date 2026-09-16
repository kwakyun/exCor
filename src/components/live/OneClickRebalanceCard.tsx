import React from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

interface OneClickRebalanceCardProps {
  onApplyRebalance: () => void;
  isApplied: boolean;
}

export const OneClickRebalanceCard: React.FC<OneClickRebalanceCardProps> = ({
  onApplyRebalance,
  isApplied,
}) => {
  return (
    <div
      id="rebalance-section"
      style={{
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--color-surface-container-high)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid rgba(29, 53, 87, 0.08)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            fontSize: '11px',
            fontWeight: 800,
          }}
        >
          <Sparkles size={13} />
          <span>AI 알고리즘 실시간 예산 재배분 제안</span>
        </div>

        {isApplied && (
          <span className="badge-pill badge-primary">
            <Check size={12} /> 재배분 적용 완료
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem',
          alignItems: 'center',
        }}
        id="rebalance-content-grid"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h3 className="font-headline-md" style={{ margin: 0 }}>
            남은 저녁 예산 밸런스 1클릭 복구 플랜
          </h3>
          <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.55, margin: 0 }}>
            점심 식비 초과분 ₩15,000을 도보로 아낀 <strong style={{ color: 'var(--color-secondary)' }}>교통비 ₩8,000</strong>과 미사용된{' '}
            <strong style={{ color: 'var(--color-tertiary)' }}>체험비 ₩7,000</strong>에서 자동 교차 상쇄하여 전체 1일 예산 오버 없이 완벽하게 복구합니다.
          </p>
        </div>

        {/* 3 Adjustment Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-container-lowest)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(29, 53, 87, 0.08)',
            }}
          >
            <span className="badge-pill badge-secondary">교통</span>
            <span className="font-label-md" style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
              -₩8,000 이관
            </span>
          </div>

          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-container-lowest)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(29, 53, 87, 0.08)',
            }}
          >
            <span className="badge-pill badge-tertiary">체험</span>
            <span className="font-label-md" style={{ color: 'var(--color-tertiary)', fontWeight: 700 }}>
              -₩7,000 이관
            </span>
          </div>

          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-container-lowest)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(29, 53, 87, 0.08)',
            }}
          >
            <span className="badge-pill badge-primary">식비</span>
            <span className="font-label-md" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              +₩15,000 증액 보전
            </span>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onApplyRebalance}
            style={{ padding: '10px 18px', marginLeft: 'auto' }}
          >
            {isApplied ? (
              <>
                <Check size={16} />
                <span>재배분 완료</span>
              </>
            ) : (
              <>
                <span>추천안 1클릭 적용</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OneClickRebalanceCard;
