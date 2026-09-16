import React from 'react';
import { AlleyDistrict } from '../../types';
import { Navigation, Lightbulb } from 'lucide-react';

interface DistrictHeroBannerProps {
  district: AlleyDistrict;
}

export const DistrictHeroBanner: React.FC<DistrictHeroBannerProps> = ({ district }) => {
  return (
    <div
      className="district-banner animate-fade-in"
      id="district-hero-banner"
      style={{
        background: `linear-gradient(135deg, ${district.accentColor}, #1e293b)`,
      }}
    >
      <div className="district-badge">{district.badge}</div>
      <h2 className="district-name">
        {district.emoji} {district.name}
      </h2>
      <p className="district-tagline">{district.tagline}</p>

      <div className="district-subway" id="district-subway-info">
        <Navigation size={15} style={{ flexShrink: 0 }} />
        <span>{district.subwayStation}</span>
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 12,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 6,
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '8px 12px',
          borderRadius: 8,
          backdropFilter: 'blur(4px)',
        }}
      >
        <Lightbulb size={15} color="#ffd166" style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong>로컬 꿀팁:</strong> {district.localTip}
        </span>
      </div>
    </div>
  );
};
