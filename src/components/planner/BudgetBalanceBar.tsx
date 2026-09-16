import React from 'react';
import { CostBreakdown } from '../../types';
import { Train, Utensils, Ticket, Coins, Info } from 'lucide-react';

interface BudgetBalanceBarProps {
  breakdown: CostBreakdown;
  budget: number;
  insight: string;
}

export const BudgetBalanceBar: React.FC<BudgetBalanceBarProps> = ({
  breakdown,
  budget,
  insight,
}) => {
  return (
    <section className="balance-card animate-fade-in" id="budget-balance-section">
      <div className="balance-header">
        <h2 className="balance-title">📊 3대 비용 예산 밸런서</h2>
        <div className="balance-total-spent">
          총 지출 <span className="balance-total-highlight">{breakdown.totalSpent.toLocaleString()}원</span> / {budget.toLocaleString()}원
        </div>
      </div>

      {/* 3-Pillar Segmented Bar */}
      <div className="segmented-bar" id="segmented-gauge-bar" role="progressbar" aria-label="예산 분할 게이지">
        <div
          className="segment segment-transit"
          style={{ width: `${breakdown.transitPercent}%` }}
          title={`교통비: ${breakdown.transitCost.toLocaleString()}원 (${breakdown.transitPercent}%)`}
        />
        <div
          className="segment segment-food"
          style={{ width: `${breakdown.foodPercent}%` }}
          title={`식비/디저트: ${breakdown.foodCost.toLocaleString()}원 (${breakdown.foodPercent}%)`}
        />
        <div
          className="segment segment-admission"
          style={{ width: `${breakdown.admissionPercent}%` }}
          title={`입장/체험비: ${breakdown.admissionCost.toLocaleString()}원 (${breakdown.admissionPercent}%)`}
        />
        <div
          className="segment segment-buffer"
          style={{ width: `${breakdown.bufferPercent}%` }}
          title={`골목 비상금: ${breakdown.remainingBudget.toLocaleString()}원 (${breakdown.bufferPercent}%)`}
        />
      </div>

      {/* 4분할 디테일 타일 */}
      <div className="cost-grid" id="cost-detail-grid">
        <div className="cost-tile cost-tile-transit" id="tile-transit">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
            <Train size={14} color="var(--cost-transit)" />
          </div>
          <span className="cost-tile-name">교통비</span>
          <span className="cost-tile-value">{breakdown.transitCost.toLocaleString()}원</span>
          <span className="cost-tile-pct">{breakdown.transitPercent}%</span>
        </div>

        <div className="cost-tile cost-tile-food" id="tile-food">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
            <Utensils size={14} color="var(--cost-food)" />
          </div>
          <span className="cost-tile-name">식비·카페</span>
          <span className="cost-tile-value">{breakdown.foodCost.toLocaleString()}원</span>
          <span className="cost-tile-pct">{breakdown.foodPercent}%</span>
        </div>

        <div className="cost-tile cost-tile-admission" id="tile-admission">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
            <Ticket size={14} color="var(--cost-admission)" />
          </div>
          <span className="cost-tile-name">입장·체험</span>
          <span className="cost-tile-value">{breakdown.admissionCost.toLocaleString()}원</span>
          <span className="cost-tile-pct">{breakdown.admissionPercent}%</span>
        </div>

        <div className="cost-tile cost-tile-buffer" id="tile-buffer">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
            <Coins size={14} color="#d97706" />
          </div>
          <span className="cost-tile-name">골목 비상금</span>
          <span className="cost-tile-value">{breakdown.remainingBudget.toLocaleString()}원</span>
          <span className="cost-tile-pct">{breakdown.bufferPercent}%</span>
        </div>
      </div>

      {/* 인사이트 안내 */}
      <div className="insight-box" id="budget-insight-box">
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>{insight}</span>
      </div>
    </section>
  );
};
