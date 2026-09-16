import React from 'react';
import { Logo } from '../common/Logo';
import { ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-surface-container-low)',
        borderTop: '1px solid rgba(29, 53, 87, 0.08)',
        paddingTop: '3rem',
        paddingBottom: '5rem', // Offset for mobile bottom nav
        marginTop: '4rem',
      }}
    >
      <div className="content-max-width" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '2rem',
          }}
        >
          {/* Brand Info */}
          <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Logo height={36} />
            <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
              부산 골목 밸런서는 뚜벅이 여행자가 정해진 예산 내에서 교통비, 식비, 입장료를 오차 없이
              역산 배분하여 부산 5대 골목상권(초량, 영도, 전포, 보수동, 망미)의 숨겨진 보물을 안전하고 여유롭게 누릴 수 있도록 돕는 스마트 여행 설계기입니다.
            </p>
          </div>

          {/* Partner & Data Info */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="font-label-md" style={{ color: 'var(--color-secondary-dark)', fontWeight: 700 }}>
                상생 & 정책 호환
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li className="font-body-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-on-surface-variant)' }}>
                  <ShieldCheck size={14} color="var(--color-primary)" />
                  동백전(부산 지역화폐) 5~7% 캐시백
                </li>
                <li className="font-body-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-on-surface-variant)' }}>
                  <HeartHandshake size={14} color="var(--color-secondary)" />
                  골목 상생 142개 제휴 상점 스탬프 할인
                </li>
                <li className="font-body-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-on-surface-variant)' }}>
                  <MapPin size={14} color="var(--color-tertiary)" />
                  동백패스(부산 대중교통 통합할인) 연동
                </li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="font-label-md" style={{ color: 'var(--color-secondary-dark)', fontWeight: 700 }}>
                데이터 출처
              </span>
              <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0, maxWidth: '240px', lineHeight: 1.5 }}>
                부산광역시 문화관광 공공데이터포털, 부산교통공사 운임 기준, 한국소비자원 참가격 외식 물가 데이터(2024)
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-surface-container-high)',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--color-on-surface-variant)',
            fontSize: '12px',
          }}
        >
          <span>© 2026 Busan Alley Balancer Project (exCor Team). All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>개인정보보호 및 위치기반서비스 준수</span>
            <span>·</span>
            <span>오픈소스 라이선스</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
