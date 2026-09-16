import React from 'react';
import { Search, Compass, PiggyBank, Banknote, Tag } from 'lucide-react';

interface TrailSearchFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedBudgetFilter: 'all' | 'under50k' | 'under100k' | 'under200k';
  onSelectBudgetFilter: (filter: 'all' | 'under50k' | 'under100k' | 'under200k') => void;
  selectedThemeTag: string | null;
  onSelectThemeTag: (tag: string | null) => void;
  totalCoursesCount: number;
}

export const TrailSearchFilter: React.FC<TrailSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedBudgetFilter,
  onSelectBudgetFilter,
  selectedThemeTag,
  onSelectThemeTag,
  totalCoursesCount,
}) => {
  const THEME_TAGS = [
    { label: '바다 조망 계단길', emoji: '🌊' },
    { label: '레트로 빈티지 서점', emoji: '📚' },
    { label: '트렌디 카페골목', emoji: '☕' },
    { label: '로컬 노포 미식', emoji: '🍲' },
    { label: '골목 벽화 & 예술', emoji: '🎨' },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid rgba(29, 53, 87, 0.06)',
      }}
    >
      {/* Search Bar & Quick Stats */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
        id="trail-search-wrapper"
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          {/* Search Input */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              minWidth: '240px',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-secondary)',
              }}
            />
            <input
              type="text"
              placeholder="골목 이름, 동네(영도, 초량, 보수동, 전포, 해리단길), 취향 태그 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-container-low)',
                border: '1.5px solid transparent',
                fontSize: '14px',
                fontFamily: 'inherit',
                color: 'var(--color-on-surface)',
                outline: 'none',
                transition: 'all var(--transition-fast)',
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'var(--color-surface-container-lowest)';
                e.target.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'var(--color-surface-container-low)';
                e.target.style.borderColor = 'transparent';
              }}
            />
          </div>

          {/* Quick Counter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="badge-pill badge-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Compass size={14} />
              <span>등록 코스 <strong>{totalCoursesCount}개</strong></span>
            </span>

            <span
              className="badge-pill badge-tertiary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <PiggyBank size={14} />
              <span>동백전 캐시백 최대 7%</span>
            </span>
          </div>
        </div>

        {/* Tier 1: Budget Range Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)', fontSize: '12px', fontWeight: 700 }}>
            <Banknote size={14} />
            <span style={{ textTransform: 'uppercase' }}>예산대 필터</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              className={`budget-chip ${selectedBudgetFilter === 'all' ? 'active' : ''}`}
              onClick={() => onSelectBudgetFilter('all')}
            >
              전체 코스
            </button>
            <button
              type="button"
              className={`budget-chip ${selectedBudgetFilter === 'under50k' ? 'active' : ''}`}
              onClick={() => onSelectBudgetFilter('under50k')}
            >
              5만원 이하 당일치기
            </button>
            <button
              type="button"
              className={`budget-chip ${selectedBudgetFilter === 'under100k' ? 'active' : ''}`}
              onClick={() => onSelectBudgetFilter('under100k')}
            >
              10만원 골목 낭만
            </button>
            <button
              type="button"
              className={`budget-chip ${selectedBudgetFilter === 'under200k' ? 'active' : ''}`}
              onClick={() => onSelectBudgetFilter('under200k')}
            >
              20만원 풀패키지 1박2일
            </button>
          </div>
        </div>

        {/* Tier 2: Theme Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)', fontSize: '12px', fontWeight: 700 }}>
            <Tag size={14} />
            <span style={{ textTransform: 'uppercase' }}>골목 테마</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {THEME_TAGS.map((t) => (
              <button
                key={t.label}
                type="button"
                className={`budget-chip ${selectedThemeTag === t.label ? 'active' : ''}`}
                onClick={() => onSelectThemeTag(selectedThemeTag === t.label ? null : t.label)}
              >
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailSearchFilter;
