import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';

interface LiveStatusStripProps {
  onOpenAddExpense: () => void;
  tripTitle?: string;
  tripDay?: string;
}

export const LiveStatusStrip: React.FC<LiveStatusStripProps> = ({
  onOpenAddExpense,
  tripTitle = '2박 3일 부산 골목 낭만 투어',
  tripDay = 'Day 2 (영도 · 초량)',
}) => {
  return (
    <section
      style={{
        width: '100%',
        backgroundColor: 'var(--color-surface-container-low)',
        padding: '0.875rem 0',
        boxShadow: 'var(--shadow-sm)',
        borderBottom: '1px solid rgba(29, 53, 87, 0.06)',
      }}
    >
      <div
        className="content-max-width"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Left: LIVE pulse badge & Trip info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', position: 'relative', width: '12px', height: '12px' }}>
            <span
              style={{
                position: 'absolute',
                display: 'inline-flex',
                height: '100%',
                width: '100%',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                opacity: 0.75,
              }}
              className="animate-ping-slow"
            />
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                borderRadius: '50%',
                height: '12px',
                width: '12px',
                backgroundColor: 'var(--color-primary)',
              }}
            />
          </span>

          <span
            className="badge-pill"
            style={{
              backgroundColor: 'var(--color-primary-fixed)',
              color: 'var(--color-on-primary-fixed)',
              fontWeight: 800,
            }}
          >
            LIVE ON-AIR
          </span>

          <span className="font-headline-sm" style={{ margin: 0, fontSize: '15px' }}>
            현재 여행 중: <strong>{tripTitle}</strong>
          </span>

          <span className="badge-pill badge-secondary">{tripDay}</span>
        </div>

        {/* Right: Sync status & Quick expense trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            className="font-label-sm"
            style={{
              color: 'var(--color-on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw size={12} color="var(--color-tertiary)" />
            최근 동기화: 방금 전 (영도 흰여울길 입구)
          </span>

          <button
            type="button"
            className="btn-primary"
            onClick={onOpenAddExpense}
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            <Plus size={15} />
            <span>간편 지출 기록</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default LiveStatusStrip;
