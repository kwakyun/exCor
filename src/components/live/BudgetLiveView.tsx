import React, { useState } from 'react';
import { LiveStatusStrip } from './LiveStatusStrip';
import { OverallPaceCard } from './OverallPaceCard';
import { PillarMonitorGrid } from './PillarMonitorGrid';
import { OneClickRebalanceCard } from './OneClickRebalanceCard';
import { QuickExpenseModal, ExpenseRecord } from './QuickExpenseModal';
import { TravelPlan } from '../../types';
import { Clock, Trash2, Receipt } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BudgetLiveViewProps {
  plan: TravelPlan;
}

const INITIAL_EXPENSES: ExpenseRecord[] = [
  { id: '1', category: 'transit', title: '부산역 → 영도 시내버스 환승', amount: 1550, time: '09:40' },
  { id: '2', category: 'food', title: '초량 연탄 불백 2인분 + 된장', amount: 22000, time: '12:15' },
  { id: '3', category: 'cafe', title: '영도 오션뷰 핸드드립 & 디저트 세트', amount: 18500, time: '14:20' },
  { id: '4', category: 'admission', title: '흰여울 바다향 원두 드립백 만들기', amount: 20000, time: '15:30' },
  { id: '5', category: 'food', title: '절영해안 갓잡은 소라·해삼 한접시', amount: 25000, time: '16:45' },
];

export const BudgetLiveView: React.FC<BudgetLiveViewProps> = ({ plan }) => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRebalanced, setIsRebalanced] = useState(false);

  // Targets based on active plan or defaults
  const totalBudget = plan.preference.budget || 200000;
  const transitTarget = isRebalanced ? 27000 : 35000;
  const foodTarget = isRebalanced ? 125000 : 110000;
  const activityTarget = isRebalanced ? 48000 : 55000;

  // Real-time calculations
  const transitSpent = expenses
    .filter((e) => e.category === 'transit')
    .reduce((sum, e) => sum + e.amount, 0);

  const foodSpent = expenses
    .filter((e) => e.category === 'food' || e.category === 'cafe' || e.category === 'snack')
    .reduce((sum, e) => sum + e.amount, 0);

  const activitySpent = expenses
    .filter((e) => e.category === 'admission')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSpent = transitSpent + foodSpent + activitySpent;

  const handleAddExpense = (record: ExpenseRecord) => {
    setExpenses([record, ...expenses]);
    try {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#9d3e20', '#485f84', '#815200'],
      });
    } catch {
      // ignore
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const handleApplyRebalance = () => {
    setIsRebalanced(true);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#9d3e20', '#ffdbd1', '#bd5535'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* 1. Live Dynamic Status Strip */}
      <LiveStatusStrip onOpenAddExpense={() => setIsModalOpen(true)} />

      <div className="content-max-width" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 2. Overall Pace Card */}
        <OverallPaceCard
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          foodSpent={foodSpent}
          transitSpent={transitSpent}
          activitySpent={activitySpent}
          onScrollToRebalance={() => {
            const el = document.getElementById('rebalance-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. Three Pillar Monitoring Grid */}
        <PillarMonitorGrid
          transitSpent={transitSpent}
          transitTarget={transitTarget}
          foodSpent={foodSpent}
          foodTarget={foodTarget}
          activitySpent={activitySpent}
          activityTarget={activityTarget}
        />

        {/* 4. One-Click AI Rebalancing Card */}
        <OneClickRebalanceCard
          isApplied={isRebalanced}
          onApplyRebalance={handleApplyRebalance}
        />

        {/* 5. Live Expenses History Table */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(29, 53, 87, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={18} color="var(--color-primary)" />
              <h4 className="font-headline-sm" style={{ margin: 0 }}>
                오늘의 실시간 지출 내역 ({expenses.length}건)
              </h4>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsModalOpen(true)}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              + 새 지출 추가
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {expenses.map((exp) => (
              <div
                key={exp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-surface-container-low)',
                  border: '1px solid rgba(29, 53, 87, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    className="badge-pill"
                    style={{
                      backgroundColor:
                        exp.category === 'transit'
                          ? 'var(--color-secondary-fixed)'
                          : exp.category === 'admission'
                          ? 'var(--color-tertiary-fixed)'
                          : 'var(--color-primary-fixed)',
                      color:
                        exp.category === 'transit'
                          ? 'var(--color-secondary)'
                          : exp.category === 'admission'
                          ? 'var(--color-tertiary)'
                          : 'var(--color-primary)',
                      fontWeight: 700,
                    }}
                  >
                    {exp.category === 'transit' ? '교통' : exp.category === 'admission' ? '체험' : '식음료'}
                  </span>

                  <div>
                    <div className="font-label-md" style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>
                      {exp.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                      <Clock size={11} /> {exp.time}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="font-label-lg tabular-nums" style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
                    ₩{exp.amount.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => handleDeleteExpense(exp.id)}
                    title="지출 삭제"
                    style={{ padding: '4px' }}
                  >
                    <Trash2 size={14} color="var(--color-outline)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Expense Modal */}
      <QuickExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
};

export default BudgetLiveView;
