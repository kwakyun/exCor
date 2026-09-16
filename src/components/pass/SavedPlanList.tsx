import React from 'react';
import { TravelPlan } from '../../types';
import { BookmarkCheck, ArrowRight, Trash2, Copy, Check } from 'lucide-react';

interface SavedPlanListProps {
  plans: TravelPlan[];
  onLoadPlan: (plan: TravelPlan) => void;
  onDeletePlan: (id: string) => void;
}

export const SavedPlanList: React.FC<SavedPlanListProps> = ({
  plans,
  onLoadPlan,
  onDeletePlan,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopySummary = (plan: TravelPlan) => {
    const text = `[부산 골목 밸런서 일정] ${plan.title} (예산: ₩${plan.preference.budget.toLocaleString()}, 지출: ₩${plan.costBreakdown.totalSpent.toLocaleString()})\n스팟: ${plan.items.map((i) => i.spot.name).join(' → ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(plan.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--color-surface-container-lowest)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(29, 53, 87, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookmarkCheck size={20} color="var(--color-primary)" />
        <h3 className="font-headline-sm" style={{ margin: 0 }}>
          내가 보관한 골목 여행 코스 ({plans.length}개)
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {plans.map((p) => (
          <div
            key={p.id}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-container-low)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              border: '1px solid rgba(29, 53, 87, 0.05)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge-pill badge-secondary">{p.district.name}</span>
                <span className="font-label-lg" style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
                  {p.title}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                <span>예산: ₩{p.preference.budget.toLocaleString()}</span>
                <span>·</span>
                <span>총 지출: ₩{p.costBreakdown.totalSpent.toLocaleString()}</span>
                <span>·</span>
                <span>스팟 {p.items.length}곳</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-surface"
                onClick={() => handleCopySummary(p)}
                style={{ padding: '6px 10px', fontSize: '12px' }}
                title="일정 요약 복사"
              >
                {copiedId === p.id ? <Check size={13} color="var(--color-primary)" /> : <Copy size={13} />}
                <span>{copiedId === p.id ? '복사됨' : '복사'}</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => onLoadPlan(p)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <span>플래너로 열기</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => onDeletePlan(p.id)}
                title="삭제"
                style={{ padding: '6px' }}
              >
                <Trash2 size={15} color="var(--color-outline)" />
              </button>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-on-surface-variant)' }}>
            <p className="font-body-sm" style={{ margin: 0 }}>
              아직 보관된 코스가 없습니다. 플래너에서 &apos;이 코스로 여행 확정하기&apos;를 누르면 이곳에 저장됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPlanList;
