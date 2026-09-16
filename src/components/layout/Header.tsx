import React from 'react';
import { Logo } from '../common/Logo';
import { Wallet, PlusCircle, Compass, Activity, Ticket, Sparkles } from 'lucide-react';

export type ActiveTab = 'planner' | 'trails' | 'live' | 'pass';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  totalBudget: number;
  onResetCourse: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  totalBudget,
  onResetCourse,
}) => {
  return (
    <>
      <header className="header-root">
        <div className="header-container">
          {/* Logo & Sub-tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            <button
              type="button"
              className="header-brand"
              onClick={() => onSelectTab('planner')}
              title="부산 골목 밸런서 홈으로 이동"
            >
              <Logo height={38} />
            </button>
            <span
              className="badge-pill badge-secondary"
              style={{ display: 'none' }}
              id="header-subtag"
            >
              골목 여행 맞춤 설계기
            </span>
          </div>

          {/* Desktop 4-Tab Navigation */}
          <nav className="header-nav" aria-label="메인 내비게이션">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
              onClick={() => onSelectTab('planner')}
            >
              맞춤 밸런서 설계
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'trails' ? 'active' : ''}`}
              onClick={() => onSelectTab('trails')}
            >
              골목 코스 탐색
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => onSelectTab('live')}
            >
              실시간 예산 피드백
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'pass' ? 'active' : ''}`}
              onClick={() => onSelectTab('pass')}
            >
              나의 여행 패스
            </button>
          </nav>

          {/* Header Right Actions */}
          <div className="header-actions">
            {/* Total Budget Capsule */}
            <div className="header-budget-badge" title="현재 설정된 총 여행 예산">
              <Wallet size={16} color="var(--color-tertiary)" />
              <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                총 예산
              </span>
              <span
                className="font-label-lg tabular-nums"
                style={{ color: 'var(--color-primary)', fontWeight: 700 }}
              >
                ₩{totalBudget.toLocaleString()}
              </span>
            </div>

            {/* New Course CTA Button */}
            <button
              type="button"
              className="btn-primary"
              onClick={onResetCourse}
              style={{ padding: '8px 14px', fontSize: '13px' }}
              title="조건을 재설정하고 새 코스를 추천받습니다"
            >
              <PlusCircle size={16} />
              <span style={{ display: 'inline' }}>새 코스 시작</span>
            </button>

            {/* Traveler Profile Avatar */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                border: '2px solid var(--color-primary-fixed)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="내 여행자 프로필 (MZ 뚜벅이 여행자)"
              onClick={() => onSelectTab('pass')}
            >
              <img
                src="/images/avatar_traveler.png"
                alt="여행자 프로필"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  // Fallback to avatar UI if image not yet loaded
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav-bar" aria-label="모바일 하단 내비게이션">
        <button
          type="button"
          className={`mobile-nav-item ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => onSelectTab('planner')}
        >
          <Sparkles size={18} />
          <span>맞춤 설계</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-item ${activeTab === 'trails' ? 'active' : ''}`}
          onClick={() => onSelectTab('trails')}
        >
          <Compass size={18} />
          <span>코스 탐색</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-item ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => onSelectTab('live')}
        >
          <Activity size={18} />
          <span>실시간 피드백</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-item ${activeTab === 'pass' ? 'active' : ''}`}
          onClick={() => onSelectTab('pass')}
        >
          <Ticket size={18} />
          <span>여행 패스</span>
        </button>
      </nav>
    </>
  );
};

export default Header;
