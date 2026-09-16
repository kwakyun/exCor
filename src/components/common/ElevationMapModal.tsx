import React, { useState } from 'react';
import { X, Milestone, Accessibility, TrendingUp, Info } from 'lucide-react';

interface ElevationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ElevationMapModal: React.FC<ElevationMapModalProps> = ({ isOpen, onClose }) => {
  const [filterMode, setFilterMode] = useState<'gentle' | 'monorail' | 'all'>('gentle');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary-fixed)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Milestone size={20} />
            </span>
            <div>
              <h3 className="font-headline-sm" style={{ margin: 0 }}>
                부산 산복도로 도보 특화 고도 지도
              </h3>
              <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                경사도 12% 이하 무장애 데크 우선 코스 안내
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`budget-chip ${filterMode === 'gentle' ? 'active' : ''}`}
            onClick={() => setFilterMode('gentle')}
          >
            🌱 경사 12% 이하 완경사 (추천)
          </button>
          <button
            type="button"
            className={`budget-chip ${filterMode === 'monorail' ? 'active' : ''}`}
            onClick={() => setFilterMode('monorail')}
          >
            🚡 무료 모노레일·엘리베이터 환승로
          </button>
          <button
            type="button"
            className={`budget-chip ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            🗺️ 전체 골목 지름길 포함
          </button>
        </div>

        {/* Elevation Profile Visualizer */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-label-sm" style={{ color: 'var(--color-secondary-dark)', fontWeight: 700 }}>
              초량 ~ 산복도로 구간 고도 변화 (해발 15m → 112m)
            </span>
            <span className="badge-pill badge-primary">평균 경사도 7.8% (쾌적)</span>
          </div>

          {/* SVG Elevation Profile Chart */}
          <svg viewBox="0 0 500 140" style={{ width: '100%', height: '140px', overflow: 'visible' }}>
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9d3e20" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#9d3e20" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <line x1="0" y1="120" x2="500" y2="120" stroke="#ddc0b8" strokeDasharray="3 3" />
            <line x1="0" y1="70" x2="500" y2="70" stroke="#ddc0b8" strokeDasharray="3 3" />
            <line x1="0" y1="20" x2="500" y2="20" stroke="#ddc0b8" strokeDasharray="3 3" />

            {/* Area */}
            <path
              d="M 0 115 Q 120 110 200 65 T 380 35 L 500 25 L 500 120 L 0 120 Z"
              fill="url(#elevationGrad)"
            />
            {/* Elevation line */}
            <path
              d="M 0 115 Q 120 110 200 65 T 380 35 L 500 25"
              fill="none"
              stroke="#9d3e20"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Waypoints */}
            <circle cx="20" cy="115" r="5" fill="#485f84" />
            <text x="20" y="135" fontSize="10" fill="#56423c" textAnchor="middle">
              부산역
            </text>

            <circle cx="160" cy="85" r="5" fill="#815200" />
            <text x="160" y="75" fontSize="10" fill="#56423c" textAnchor="middle">
              이바구쉼터
            </text>

            <circle cx="280" cy="50" r="5" fill="#9d3e20" />
            <text x="280" y="40" fontSize="10" fill="#9d3e20" fontWeight="bold" textAnchor="middle">
              모노레일
            </text>

            <circle cx="480" cy="25" r="5" fill="#485f84" />
            <text x="460" y="18" fontSize="10" fill="#56423c" textAnchor="middle">
              산복도로 전망대
            </text>
          </svg>
        </div>

        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface-container)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
              <Accessibility size={16} />
              <span className="font-label-md" style={{ fontWeight: 700 }}>
                무장애 데크 통행로
              </span>
            </div>
            <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
              유모차, 캐리어, 어르신도 무리 없이 걸을 수 있는 나무 데크길 우선 배치
            </p>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface-container)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary)' }}>
              <TrendingUp size={16} />
              <span className="font-label-md" style={{ fontWeight: 700 }}>
                경사 회피 알고리즘
              </span>
            </div>
            <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
              계단 168개를 건너뛰고 무료 모노레일 탑승으로 체력 60% 절약
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-primary-fixed)',
            color: 'var(--color-on-primary-fixed-variant)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
          }}
        >
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>플래너에서 추천되는 모든 도보 코스는 이 고도 안전 필터가 기본 적용됩니다.</span>
        </div>

        <button className="btn-primary" onClick={onClose} style={{ width: '100%', marginTop: '4px' }}>
          확인 완료
        </button>
      </div>
    </div>
  );
};

export default ElevationMapModal;
