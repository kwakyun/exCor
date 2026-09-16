import React from 'react';
import { Logo } from '../common/Logo';
import { QrCode, Sparkles, ShieldCheck } from 'lucide-react';

interface DigitalPassTicketProps {
  passNumber?: string;
  travelerName?: string;
  accumulatedSavings?: number;
  activeDistrictName?: string;
}

export const DigitalPassTicket: React.FC<DigitalPassTicketProps> = ({
  passNumber = '82-051-2026',
  travelerName = '낭만 뚜벅이 여행자',
  accumulatedSavings = 18500,
  activeDistrictName = '영도 & 초량 산복도로',
}) => {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%)',
        border: '2px solid rgba(216, 106, 72, 0.25)',
        boxShadow: 'var(--shadow-lg)',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
      className="ticket-card"
    >
      {/* Decorative Stamp Seal in background */}
      <div
        style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-20px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          border: '4px dashed rgba(157, 62, 32, 0.1)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-15deg)',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(157, 62, 32, 0.15)', textTransform: 'uppercase' }}>
          Busan Alley Certified
        </span>
      </div>

      {/* Ticket Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <Logo height={32} />
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-fixed)',
            color: 'var(--color-primary)',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Sparkles size={13} />
          <span>PASS #{passNumber}</span>
        </div>
      </div>

      {/* Dashed divider */}
      <div style={{ width: '100%', borderBottom: '1.5px dashed var(--color-outline-variant)' }} />

      {/* Ticket Body Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <span className="font-label-sm" style={{ color: 'var(--color-secondary)' }}>
              여행자 명의
            </span>
            <h4 className="font-headline-sm" style={{ margin: '2px 0 0 0', color: 'var(--color-on-surface)' }}>
              {travelerName}
            </h4>
          </div>

          <div>
            <span className="font-label-sm" style={{ color: 'var(--color-secondary)' }}>
              이용 활성 골목
            </span>
            <p className="font-body-md" style={{ fontWeight: 600, color: 'var(--color-on-surface)', margin: '2px 0 0 0' }}>
              {activeDistrictName}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
            <ShieldCheck size={14} />
            <span>동백전 캐시백 & 동백패스 자동 연동</span>
          </div>
        </div>

        {/* Savings & QR Box */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-xl)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            border: '1px solid rgba(29, 53, 87, 0.08)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              골목패스 누적 절약액
            </span>
            <span className="font-headline-lg tabular-nums" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
              ₩{accumulatedSavings.toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-tertiary)', fontWeight: 700 }}>
              상생 제휴 15% 감면 적용
            </span>
          </div>

          <div
            style={{
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrCode size={54} color="var(--color-secondary-dark)" />
          </div>
        </div>
      </div>

      {/* Ticket Footer / Barcode decoration */}
      <div
        style={{
          paddingTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--color-on-surface-variant)',
        }}
      >
        <span>현장 결제 시 바코드 제시 시 제휴 혜택 즉시 반영</span>
        <span style={{ fontFamily: 'monospace', letterSpacing: '2px', fontWeight: 700 }}>
          ||| | |||| | || ||| | |||
        </span>
      </div>
    </div>
  );
};

export default DigitalPassTicket;
