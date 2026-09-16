import React, { useState } from 'react';
import { Award, Check, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StampItem {
  id: string;
  district: string;
  name: string;
  emoji: string;
  isCollected: boolean;
  coupon: string;
}

const INITIAL_STAMPS: StampItem[] = [
  { id: 'stamp-1', district: '동구', name: '초량 168 모노레일', emoji: '🚡', isCollected: true, coupon: '수제 모나카 10% 할인' },
  { id: 'stamp-2', district: '영도구', name: '흰여울 해안터널', emoji: '🌊', isCollected: true, coupon: '드립백 원두 1팩 증정' },
  { id: 'stamp-3', district: '부산진구', name: '전포 공구카페거리', emoji: '☕', isCollected: false, coupon: '스페셜티 아메리카노 1+1' },
  { id: 'stamp-4', district: '중구', name: '보수동 헌책방 숲', emoji: '📚', isCollected: false, coupon: '빈티지 엽서 교환권' },
  { id: 'stamp-5', district: '수영구', name: '망미 F1963 숲길', emoji: '🎋', isCollected: false, coupon: '전시 관람 20% 감면' },
];

export const StampCollector: React.FC = () => {
  const [stamps, setStamps] = useState<StampItem[]>(INITIAL_STAMPS);

  const handleCollect = (id: string) => {
    setStamps(
      stamps.map((s) => (s.id === id ? { ...s, isCollected: true } : s))
    );

    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#9d3e20', '#815200', '#485f84'],
      });
    } catch {
      // ignore
    }
  };

  const collectedCount = stamps.filter((s) => s.isCollected).length;

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
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--color-primary)" />
            <h3 className="font-headline-sm" style={{ margin: 0 }}>
              부산 5대 골목 모바일 스탬프 북
            </h3>
          </div>
          <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            현장 방문 시 디지털 스탬프를 찍고 상생 쿠폰을 획득하세요
          </span>
        </div>

        <span
          className="badge-pill"
          style={{
            backgroundColor: 'var(--color-primary-fixed)',
            color: 'var(--color-primary)',
            fontWeight: 800,
            fontSize: '13px',
            padding: '6px 12px',
          }}
        >
          {collectedCount} / 5 스탬프 수집됨
        </span>
      </div>

      {/* Stamps Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
        }}
      >
        {stamps.map((stamp) => (
          <div
            key={stamp.id}
            style={{
              padding: '16px 12px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: stamp.isCollected
                ? 'rgba(255, 219, 209, 0.25)'
                : 'var(--color-surface-container-low)',
              border: stamp.isCollected
                ? '2px solid var(--color-primary)'
                : '1.5px dashed var(--color-outline-variant)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '8px',
              position: 'relative',
              transition: 'all var(--transition-fast)',
            }}
          >
            <span style={{ fontSize: '32px' }}>{stamp.emoji}</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="badge-pill badge-secondary" style={{ fontSize: '10px', margin: '0 auto' }}>
                {stamp.district}
              </span>
              <span className="font-label-md" style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
                {stamp.name}
              </span>
            </div>

            {stamp.isCollected ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '4px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--color-primary)',
                    fontWeight: 800,
                  }}
                >
                  <Check size={14} /> 스탬프 완료
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-secondary-dark)',
                    backgroundColor: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Gift size={11} color="var(--color-primary)" />
                  {stamp.coupon}
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="btn-surface"
                onClick={() => handleCollect(stamp.id)}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  marginTop: '4px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span>스탬프 찍기</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StampCollector;
