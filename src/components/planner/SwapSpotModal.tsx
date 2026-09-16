import React from 'react';
import { CourseItem, Spot } from '../../types';
import { X, Check, RefreshCw } from 'lucide-react';

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
        className="modal-content animate-fade-in"
        id="swap-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={18} color="var(--color-primary)" />
            <span className="modal-title">다른 골목 스팟으로 교체</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            id="close-swap-modal-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          현재 선택된 <strong>{item.spot.name}</strong> 대신 방문할 수 있는 동일 골목 내 후보
          장소들입니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {item.alternativeSpots.map((alt: Spot) => {
            const priceDiff = alt.price - currentPrice;
            const diffText =
              priceDiff === 0
                ? '동일 금액'
                : priceDiff > 0
                ? `+${priceDiff.toLocaleString()}원`
                : `${priceDiff.toLocaleString()}원 절약`;

            const diffColor = priceDiff > 0 ? '#e17055' : '#00b894';

            return (
              <div
                key={alt.id}
                className="swap-item-card"
                id={`swap-option-${alt.id}`}
                onClick={() => {
                  onSelectNewSpot(item.order, alt.id);
                  onClose();
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                      {alt.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: '#edf2f7',
                        color: diffColor,
                        fontWeight: 700,
                      }}
                    >
                      {diffText}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {alt.signature}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: 'var(--color-primary)',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {alt.isFree || alt.price === 0 ? '무료' : `${alt.price.toLocaleString()}원`}
                  </div>
                  <button
                    type="button"
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'white',
                      background: 'var(--color-primary)',
                      padding: '4px 10px',
                      borderRadius: 4,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
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
