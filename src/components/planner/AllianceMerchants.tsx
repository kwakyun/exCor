import React from 'react';
import { ALLIANCE_MERCHANTS } from '../../data/curatedTrails';
import { ChevronRight, Store } from 'lucide-react';

export const AllianceMerchants: React.FC = () => {
  return (
    <div
      style={{
        marginTop: '2.5rem',
        padding: '1.5rem',
        borderRadius: 'var(--radius-2xl)',
        backgroundColor: 'var(--color-surface-container-low)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        border: '1px solid rgba(29, 53, 87, 0.06)',
      }}
    >
      {/* Alliance Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span
            className="font-label-sm"
            style={{
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              fontWeight: 800,
              letterSpacing: '0.05em',
            }}
          >
            Busan Alley Balancer Alliance
          </span>
          <h3 className="font-headline-md" style={{ margin: 0, color: 'var(--color-on-surface)' }}>
            부산 골목 밸런서와 함께하는 상생 제휴점
          </h3>
        </div>

        <button
          type="button"
          className="btn-surface"
          style={{ fontSize: '13px', color: 'var(--color-primary)', border: 'none', background: 'transparent' }}
          onClick={() => alert('부산 5대 골목상권 142개 소상공인 매장에서 동백전 및 골목패스 할인이 제공됩니다.')}
        >
          <span>제휴 상점 전체 142곳 안내</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-gutter)',
        }}
      >
        {ALLIANCE_MERCHANTS.map((merch) => (
          <div
            key={merch.id}
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-surface-container-lowest)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              border: '1px solid rgba(29, 53, 87, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge-pill badge-secondary">{merch.district}</span>
              <span
                className="badge-pill badge-primary"
                style={{ fontWeight: 800 }}
              >
                {merch.benefit}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={15} color="var(--color-primary)" />
              <h4
                className="font-label-lg"
                style={{
                  margin: 0,
                  color: 'var(--color-on-surface)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {merch.name}
              </h4>
            </div>

            <p
              className="font-body-sm"
              style={{
                color: 'var(--color-on-surface-variant)',
                margin: 0,
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {merch.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllianceMerchants;
