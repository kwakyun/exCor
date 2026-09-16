import React from 'react';
import { Sparkles, Lightbulb, Heart, ArrowRight } from 'lucide-react';

interface InspirationCardProps {
  onExploreStop?: () => void;
}

export const InspirationCard: React.FC<InspirationCardProps> = ({ onExploreStop }) => {
  return (
    <div className="spotlight-card">
      <div className="spotlight-media">
        <img
          src="/images/spotlight_flowerpot.png"
          alt="초량 168계단 옆 숨은 화분 꽃길"
          className="spotlight-img"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            color: 'var(--color-primary)',
            fontSize: '11px',
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Sparkles size={13} />
          <span>밸런서 추천 1순위 스팟</span>
        </div>
      </div>

      <div className="spotlight-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="font-label-sm" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
              동구 초량동 산복도로 샛길
            </span>
            <span
              className="badge-pill"
              style={{
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-tertiary)',
                fontWeight: 700,
              }}
            >
              도보 0원
            </span>
          </div>

          <h3 className="font-headline-sm" style={{ color: 'var(--color-on-surface)', margin: 0, fontWeight: 700 }}>
            초량 168계단 옆 숨은 화분 꽃길
          </h3>

          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6, margin: 0 }}>
            주민들이 손수 가꾼 항아리 화분과 파스텔톤 시멘트 담벼락이 어우러진 조용한 골목.
            모노레일을 타기 전 천천히 오르며 부산 원도심과 북항 바다를 한눈에 담기 좋습니다.
          </p>
        </div>

        {/* Local Alley Keeper Tip Pill */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-container-low)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            border: '1px solid rgba(29, 53, 87, 0.05)',
          }}
        >
          <Lightbulb size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0, fontSize: '12px' }}>
            <strong style={{ color: 'var(--color-on-surface)' }}>골목 지킴이 Tip: </strong>
            오전 10시~11시 사이 햇살이 골목 계단을 사선으로 비출 때 사진이 가장 따뜻하게 나옵니다.
          </p>
        </div>

        {/* Bottom ratings & action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-tertiary)' }}>
            <Heart size={14} fill="var(--color-tertiary)" />
            <span className="font-label-sm" style={{ fontWeight: 700 }}>
              여행자 만족도 98%
            </span>
          </div>

          <button
            type="button"
            className="btn-surface"
            onClick={onExploreStop}
            style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--color-primary)' }}
          >
            <span>정류장 상세보기</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspirationCard;
