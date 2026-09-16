import React from 'react';
import { CourseItem } from '../../types';
import { SpotCard } from './SpotCard';

interface CourseTimelineProps {
  items: CourseItem[];
  onOpenSwap: (item: CourseItem) => void;
}

const STEP_COLORS: Record<string, string> = {
  transit: 'var(--cost-transit)',
  food: 'var(--cost-food)',
  cafe: '#d63384',
  admission: 'var(--cost-admission)',
  snack: 'var(--cost-buffer)',
};

export const CourseTimeline: React.FC<CourseTimelineProps> = ({ items, onOpenSwap }) => {
  return (
    <div className="timeline-container" id="course-timeline-list">
      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginTop: 8 }}>
        🗺️ 골목 밀착 추천 코스 타임라인
      </h2>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const color = STEP_COLORS[item.category] || 'var(--color-primary)';

        return (
          <div className="timeline-step" key={item.spot.id || item.order}>
            <div className="step-indicator-wrapper">
              <div
                className="step-circle"
                style={{ backgroundColor: color }}
              >
                {item.order}
              </div>
              {!isLast && <div className="step-line" />}
            </div>

            <SpotCard item={item} onOpenSwap={onOpenSwap} />
          </div>
        );
      })}
    </div>
  );
};
