import React from 'react';
import { CourseItem, Spot } from '../../types';
import { X, Check, RefreshCw, Sparkles, MapPin } from 'lucide-react';

interface SwapSpotModalProps {
  item: CourseItem | null;
  onClose: () => void;
  onSelectNewSpot: (itemOrder: number, newSpotId: string) => void;
}

export const SwapSpotModal: React.FC<SwapSpotModalProps> = ({
  item,
  onClose,
  onSelectNewSpot,
}) => {
  if (!item) return null;

  const currentPrice = item.cost;

  return (
    <div className="modal-backdrop" id="swap-modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        id="swap-modal-dialog"
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
              <RefreshCw size={18} />
            </span>
            <div>
              <h3 className="font-headline-sm" style={{ margin: 0 }}>
                다른 골목 스팟으로 교체
              </h3>
              <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                예산과 동선에 맞춰 실시간 재계산됩니다
              </span>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            id="close-swap-modal-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-container-low)',
            fontSize: '13px',
            color: 'var(--color-on-surface-variant)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <span>
            현재 스팟 <strong style={{ color: 'var(--color-on-surface)' }}>{item.spot.name}</strong>(₩{currentPrice.toLocaleString()}) 대신 선택 가능한 추천 장소들입니다.
          </span>
        </div>

        {/* Alternative spots list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          {item.alternativeSpots.map((alt: Spot) => {
            const priceDiff = alt.price - currentPrice;
            const diffText =
              priceDiff === 0
                ? '동일 금액'
                : priceDiff > 0
                ? `+₩${priceDiff.toLocaleString()}`
                : `-₩${Math.abs(priceDiff).toLocaleString()} 절약`;

            const isSavings = priceDiff < 0;

            return (
              <div
                key={alt.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  border: '1.5px solid rgba(29, 53, 87, 0.08)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                className="timeline-card"
                onClick={() => {
                  onSelectNewSpot(item.order, alt.id);
                  onClose();
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="font-label-lg" style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
                      {alt.name}
                    </span>
                    <span
                      className="badge-pill"
                      style={{
                        backgroundColor: isSavings ? 'var(--color-accent-teal-fixed)' : 'rgba(255, 219, 209, 0.5)',
                        color: isSavings ? 'var(--color-accent-teal-dark)' : 'var(--color-primary)',
                        fontWeight: 700,
                      }}
                    >
                      {diffText}
                    </span>
                  </div>

                  <span className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px' }}>
                    {alt.signature || alt.summary}
                  </span>

                  {alt.address && (
                    <span style={{ fontSize: '11px', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} /> {alt.address}
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '12px' }}>
                  <div
                    className="font-headline-sm tabular-nums"
                    style={{ color: 'var(--color-primary)', fontWeight: 800 }}
                  >
                    {alt.isFree || alt.price === 0 ? '무료' : `₩${alt.price.toLocaleString()}`}
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      marginTop: '4px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <Check size={12} />
                    <span>선택</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SwapSpotModal;
