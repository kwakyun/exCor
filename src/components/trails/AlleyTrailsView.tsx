import React, { useState, useMemo } from 'react';
import { CURATED_TRAILS, CuratedTrail } from '../../data/curatedTrails';
import { TrailSearchFilter } from './TrailSearchFilter';
import { FeaturedTrailBanner } from './FeaturedTrailBanner';
import { TrailCard } from './TrailCard';
import { Scale, ArrowRight, X } from 'lucide-react';

interface AlleyTrailsViewProps {
  onApplyTrailToPlanner: (trail: CuratedTrail) => void;
}

export const AlleyTrailsView: React.FC<AlleyTrailsViewProps> = ({
  onApplyTrailToPlanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'under50k' | 'under100k' | 'under200k'>('all');
  const [themeTag, setThemeTag] = useState<string | null>(null);
  const [comparedTrails, setComparedTrails] = useState<CuratedTrail[]>([]);

  // Filtered trails logic
  const filteredTrails = useMemo(() => {
    return CURATED_TRAILS.filter((trail) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = trail.title.toLowerCase().includes(q);
        const matchSubtitle = trail.subtitle.toLowerCase().includes(q);
        const matchDesc = trail.description.toLowerCase().includes(q);
        const matchTags = trail.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSubtitle && !matchDesc && !matchTags) return false;
      }

      // Budget filter
      if (budgetFilter === 'under50k' && trail.budget > 50000) return false;
      if (budgetFilter === 'under100k' && trail.budget > 100000) return false;
      if (budgetFilter === 'under200k' && trail.budget > 200000) return false;

      // Theme tag
      if (themeTag && !trail.tags.includes(themeTag.replace(/^[^\s]+\s/, ''))) {
        // Tag partial match
        const cleaned = themeTag.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '');
        const hasTag = trail.tags.some((t) => t.includes(cleaned) || cleaned.includes(t));
        if (!hasTag) return false;
      }

      return true;
    });
  }, [searchQuery, budgetFilter, themeTag]);

  const handleToggleCompare = (trail: CuratedTrail) => {
    if (comparedTrails.some((t) => t.id === trail.id)) {
      setComparedTrails(comparedTrails.filter((t) => t.id !== trail.id));
    } else {
      if (comparedTrails.length >= 3) {
        alert('비교함에는 최대 3개 코스까지 담을 수 있습니다.');
        return;
      }
      setComparedTrails([...comparedTrails, trail]);
    }
  };

  const handleOpenMap = (trail: CuratedTrail) => {
    const q = encodeURIComponent(`부산 ${trail.title}`);
    window.open(`https://map.naver.com/v5/search/${q}`, '_blank');
  };

  const featuredTrail = CURATED_TRAILS[0];

  return (
    <div className="content-max-width" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem', paddingTop: '1rem' }}>
      {/* Top Filter & Search Station */}
      <TrailSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBudgetFilter={budgetFilter}
        onSelectBudgetFilter={setBudgetFilter}
        selectedThemeTag={themeTag}
        onSelectThemeTag={setThemeTag}
        totalCoursesCount={CURATED_TRAILS.length}
      />

      {/* Featured Spotlight Canvas */}
      {!searchQuery && budgetFilter === 'all' && !themeTag && (
        <FeaturedTrailBanner
          trail={featuredTrail}
          onOpenInPlanner={onApplyTrailToPlanner}
          onOpenMap={handleOpenMap}
        />
      )}

      {/* Curated Alley Courses Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge-pill badge-primary">테마별 맞춤 코스</span>
              <span className="font-label-sm" style={{ color: 'var(--color-secondary)' }}>
                실시간 데이터 갱신 완료 ({filteredTrails.length}개)
              </span>
            </div>
            <h3 className="font-headline-lg" style={{ margin: '4px 0 0 0', color: 'var(--color-on-surface)' }}>
              골목 구석구석 큐레이션
            </h3>
          </div>
        </div>

        {/* Course Cards Bento Grid */}
        <div className="trails-grid">
          {filteredTrails.map((trail) => (
            <TrailCard
              key={trail.id}
              trail={trail}
              isCompared={comparedTrails.some((t) => t.id === trail.id)}
              onToggleCompare={handleToggleCompare}
              onOpenInPlanner={onApplyTrailToPlanner}
            />
          ))}
        </div>

        {filteredTrails.length === 0 && (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
              검색 조건에 맞는 골목 코스가 없습니다. 검색어를 변경해보세요!
            </p>
          </div>
        )}
      </section>

      {/* Comparison Drawer (if any items selected) */}
      {comparedTrails.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            width: '90%',
            maxWidth: '680px',
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 18px',
            boxShadow: 'var(--shadow-lg)',
            border: '2px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={18} color="var(--color-primary)" />
            <span className="font-label-md" style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
              코스 비교함 ({comparedTrails.length}/3)
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {comparedTrails.map((t) => (
                <span key={t.id} className="badge-pill badge-secondary">
                  {t.title.split(' ')[0]} ₩{(t.budget / 1000).toFixed(0)}k
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={() => {
                const selected = comparedTrails[0];
                onApplyTrailToPlanner(selected);
              }}
            >
              <span>{comparedTrails[0].title.split(' ')[0]} 적용</span>
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setComparedTrails([])}
              title="비교함 비우기"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlleyTrailsView;
