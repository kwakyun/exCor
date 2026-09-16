import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="app-header" id="app-header">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <Compass size={22} />
        </div>
        <div>
          <h1 className="brand-title">부산 골목 밸런서</h1>
          <p className="brand-subtitle">교통비·식비·입장료 맞춤 여행 설계기</p>
        </div>
      </div>
      <div className="header-badge" id="header-badge">
        <Sparkles size={13} />
        <span>MVP Beta</span>
      </div>
    </header>
  );
};
