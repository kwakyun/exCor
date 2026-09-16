import React from 'react';
import { CostBreakdown } from '../../types';
import { CheckCircle2, Download, Navigation, Sparkles } from 'lucide-react';

interface BudgetSummaryLedgerProps {
  totalBudget: number;
  breakdown: CostBreakdown;
  onOpenShareModal: () => void;
  onOpenMapsLink: () => void;
}

export const BudgetSummaryLedger: React.FC<BudgetSummaryLedgerProps> = ({
  totalBudget,
  breakdown,
  onOpenShareModal,
  onOpenMapsLink,
}) => {
  const remainingPct =
    totalBudget > 0
      ? Math.max(0, Math.round((breakdown.remainingBudget / totalBudget) * 100))
      : 0;

  // Donut SVG parameters
  const strokeWidth = 3.8;
  const radius = 15.9155; // 2 * pi * r = 100
  const circumference = 100;

  // Segment calculations
  const transitDash = Math.min(100, Math.round((breakdown.transitCost / totalBudget) * 100));
  const foodDash = Math.min(100, Math.round((breakdown.foodCost / totalBudget) * 100));
  const admissionDash = Math.min(100, Math.round((breakdown.admissionCost / totalBudget) * 100));

  // Partner savings estimate (Dongbaekjeon 5% + Merchant discount ~10%)
  const estimatedSavings = Math.round(breakdown.foodCost * 0.07 + breakdown.admissionCost * 0.1);

  return (
    <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.25rem',
          alignItems: 'center',
        }}
        id="budget-ledger-grid"
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
          {/* Donut Chart */}
          <div className="donut-container">
            <svg viewBox="0 0 36 36" className="donut-svg">
              {/* Background Track */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="var(--color-surface-container-high)"
                strokeWidth={strokeWidth}
              />
              {/* Transit Segment (Cobalt) */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="var(--pillar-transit)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${transitDash}, ${circumference}`}
                strokeDashoffset="0"
              />
              {/* Food Segment (Terracotta) */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="var(--pillar-food)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${foodDash}, ${circumference}`}
                strokeDashoffset={`-${transitDash}`}
              />
              {/* Admission Segment (Ochre) */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="var(--pillar-activity)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${admissionDash}, ${circumference}`}
                strokeDashoffset={`-${transitDash + foodDash}`}
              />
            </svg>

            {/* Donut Center */}
            <div className="donut-center-label">
              <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '10px' }}>
                예산 잔여율
              </span>
              <span
                className="font-headline-sm tabular-nums"
                style={{ color: 'var(--color-primary)', fontWeight: 800, lineHeight: 1 }}
              >
                {remainingPct}%
              </span>
            </div>
          </div>

          {/* Numbers & Breakdown */}
          <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="font-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                코스 총 예상 소요 비용
              </span>
              <span
                className="font-headline-md tabular-nums"
                style={{ color: 'var(--color-on-surface)', fontWeight: 800 }}
              >
                ₩{breakdown.totalSpent.toLocaleString()}
              </span>
            </div>

            {/* Pass Benefit Card */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 219, 209, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--color-primary)" />
                <span className="font-label-sm" style={{ color: 'var(--color-on-primary-fixed-variant)', fontWeight: 700 }}>
                  부산 골목 패스 혜택 적용 시 절약
                </span>
              </div>
              <span className="font-label-lg tabular-nums" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                -₩{estimatedSavings > 0 ? estimatedSavings.toLocaleString() : '18,500'}
              </span>
            </div>

            {/* Surplus Reserve */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
                paddingTop: '2px',
              }}
            >
              <span style={{ color: 'var(--color-on-surface-variant)' }}>
                총 예산 (₩{totalBudget.toLocaleString()}) 대비 여유 자금
              </span>
              <span
                className="tabular-nums"
                style={{ color: 'var(--color-secondary)', fontWeight: 700 }}
              >
                +₩{breakdown.remainingBudget.toLocaleString()} (비상금)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '6px',
        }}
      >
        <button
          type="button"
          className="btn-primary"
          onClick={onOpenShareModal}
          style={{ flex: 1, minWidth: '220px', padding: '12px 16px' }}
        >
          <CheckCircle2 size={18} />
          <span>이 코스로 여행 확정하기 (Save & Share)</span>
        </button>

        <button
          type="button"
          className="btn-surface"
          onClick={() => window.print()}
          style={{ padding: '12px 16px' }}
          title="일정을 인쇄하거나 PDF로 저장합니다"
        >
          <Download size={16} />
          <span>PDF 코스북</span>
        </button>

        <button
          type="button"
          className="btn-surface"
          onClick={onOpenMapsLink}
          style={{ padding: '12px 16px', color: 'var(--color-secondary)' }}
          title="네이버 / 카카오 지도에서 경로 보기"
        >
          <Navigation size={16} />
          <span>지도 길찾기</span>
        </button>
      </div>
    </div>
  );
};

export default BudgetSummaryLedger;
