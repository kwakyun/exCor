import React, { useState } from 'react';
import { X, Plus, Utensils, Bus, Ticket } from 'lucide-react';
import { SpotCategory } from '../../types';

export interface ExpenseRecord {
  id: string;
  category: SpotCategory;
  title: string;
  amount: number;
  time: string;
}

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (record: ExpenseRecord) => void;
}

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [category, setCategory] = useState<SpotCategory>('food');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(8000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddExpense({
      id: `exp-${Date.now()}`,
      category,
      title: title.trim(),
      amount,
      time: timeStr,
    });

    setTitle('');
    setAmount(8000);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-fixed)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={18} />
            </span>
            <h3 className="font-headline-sm" style={{ margin: 0 }}>
              현장 간편 지출 기록
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Category Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              지출 카테고리
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                className={`budget-chip ${category === 'food' ? 'active' : ''}`}
                onClick={() => setCategory('food')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px' }}
              >
                <Utensils size={14} />
                <span>식비·카페</span>
              </button>

              <button
                type="button"
                className={`budget-chip ${category === 'transit' ? 'active' : ''}`}
                onClick={() => setCategory('transit')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px' }}
              >
                <Bus size={14} />
                <span>교통비</span>
              </button>

              <button
                type="button"
                className={`budget-chip ${category === 'admission' ? 'active' : ''}`}
                onClick={() => setCategory('admission')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px' }}
              >
                <Ticket size={14} />
                <span>체험·문화</span>
              </button>
            </div>
          </div>

          {/* Place/Memo Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              사용처 및 메모
            </label>
            <input
              type="text"
              placeholder="예: 흰여울 바다뷰 커피, 168 수제 모나카"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid rgba(29, 53, 87, 0.12)',
                backgroundColor: 'var(--color-surface-container-lowest)',
                fontSize: '14px',
                fontFamily: 'inherit',
                color: 'var(--color-on-surface)',
                outline: 'none',
              }}
            />
          </div>

          {/* Amount Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              지출 금액 (원)
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-container-low)',
                padding: '8px 14px',
                border: '1.5px solid rgba(29, 53, 87, 0.1)',
              }}
            >
              <span className="font-headline-sm" style={{ color: 'var(--color-primary)', fontWeight: 800, paddingRight: '6px' }}>
                ₩
              </span>
              <input
                type="number"
                value={amount}
                min={100}
                step={500}
                onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                required
                className="tabular-nums"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  textAlign: 'right',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-on-surface)',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          >
            <span>지출 추가 및 실시간 게이지 반영</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickExpenseModal;
