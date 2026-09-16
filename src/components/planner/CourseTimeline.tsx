import React from 'react';
import { CourseItem } from '../../types';
import { SpotCard } from './SpotCard';
import { Route, Clock, RotateCw } from 'lucide-react';

interface CourseTimelineProps {
  items: CourseItem[];
  onOpenSwap: (item: CourseItem) => void;
  onRefreshCourse?: () => void;
}

export const CourseTimeline: React.FC<CourseTimelineProps> = ({
  items,
  onOpenSwap,
  onRefreshCourse,
}) => {
  return (
    <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Timeline Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Route size={20} color="var(--color-primary)" />
          <h3 className="font-headline-sm" style={{ margin: 0, fontWeight: 700 }}>
            예산 맞춤형 실시간 추천 루트
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            총 {items.length}개 스팟 · 도보 코스
          </span>
          <span className="badge-pill badge-secondary">여유로운 페이스</span>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="timeline-track">
        <div className="timeline-line" />
        {items.map((item) => (
          <SpotCard key={item.order} item={item} onOpenSwap={onOpenSwap} />
        ))}
      </div>

      {/* Timeline Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '6px',
          borderTop: '1px solid var(--color-surface-container-high)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-on-surface-variant)', fontSize: '13px' }}>
          <Clock size={15} />
          <span>총 소요 예상 시간: 약 8시간 30분</span>
        </div>

        {onRefreshCourse && (
          <button
            type="button"
            className="btn-surface"
            onClick={onRefreshCourse}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <RotateCw size={13} />
            <span>루트 새로고침</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseTimeline;
