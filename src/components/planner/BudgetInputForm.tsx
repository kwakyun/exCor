import React from 'react';
import { DistrictId, TransitType, TravelPreference, TravelTheme } from '../../types';
import { ALLEY_DISTRICTS } from '../../data/busanAlleys';
import { TRANSIT_COST_MODELS } from '../../data/transitRates';
import { Coins, Sparkles, Train, Car, Compass } from 'lucide-react';

interface BudgetInputFormProps {
  preference: TravelPreference;
  onChange: (pref: TravelPreference) => void;
  onSubmit: () => void;
}

const PRESET_BUDGETS = [
  { label: '3만 알뜰', value: 30000 },
  { label: '5만 실속', value: 50000 },
  { label: '7만 여유', value: 70000 },
  { label: '10만 플렉스', value: 100000 },
];

const THEMES: { id: TravelTheme; label: string }[] = [
  { id: 'all', label: '🌟 전체 테마' },
  { id: 'cafe_dessert', label: '☕ 감성 카페' },
  { id: 'local_food', label: '🍜 로컬 미식' },
  { id: 'retro_culture', label: '📚 레트로 역사' },
  { id: 'ocean_healing', label: '🌊 오션 힐링' },
];

export const BudgetInputForm: React.FC<BudgetInputFormProps> = ({
  preference,
  onChange,
  onSubmit,
}) => {
  const handleBudgetChange = (value: number) => {
    onChange({ ...preference, budget: value });
  };

  const handleTransitChange = (transitType: TransitType) => {
    onChange({ ...preference, transitType });
  };

  const handleThemeChange = (theme: TravelTheme) => {
    onChange({ ...preference, theme });
  };

  const handleDistrictChange = (districtId: DistrictId | 'all') => {
    onChange({ ...preference, districtId });
  };

  return (
    <section className="form-card animate-fade-in" id="budget-input-form">
      <div className="form-header-title">
        <Coins size={18} color="var(--color-primary)" />
        <span>여행 예산 & 스타일 설정</span>
      </div>

      {/* 1. 예산 슬라이더 & 프리셋 */}
      <div className="budget-display-section">
        <div className="budget-amount-label">1인 여행 총 예산</div>
        <div className="budget-amount-value" id="budget-value-display">
          {preference.budget.toLocaleString()}
          <span className="budget-amount-currency">원</span>
        </div>

        <div className="slider-container">
          <input
            type="range"
            id="budget-range-slider"
            className="custom-slider"
            min={20000}
            max={120000}
            step={5000}
            value={preference.budget}
            onChange={(e) => handleBudgetChange(Number(e.target.value))}
            aria-label="여행 예산 슬라이더"
          />
        </div>

        <div className="preset-chips">
          {PRESET_BUDGETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              id={`preset-btn-${preset.value}`}
              className={`chip-btn ${preference.budget === preset.value ? 'active' : ''}`}
              onClick={() => handleBudgetChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 이동 수단 선택 */}
      <div className="form-row">
        <label className="form-label">교통 수단 선호</label>
        <div className="transit-toggle-group">
          <button
            type="button"
            id="transit-walk-toggle"
            className={`transit-card-btn ${
              preference.transitType === 'transit_walk' ? 'active' : ''
            }`}
            onClick={() => handleTransitChange('transit_walk')}
          >
            <div className="transit-card-title">
              <Train size={15} color="var(--cost-transit)" />
              <span>{TRANSIT_COST_MODELS.transit_walk.label}</span>
            </div>
            <div className="transit-card-sub">도시철도 & 버스 환승</div>
            <div className="transit-card-cost">
              {TRANSIT_COST_MODELS.transit_walk.cost.toLocaleString()}원 배분
            </div>
          </button>

          <button
            type="button"
            id="transit-taxi-toggle"
            className={`transit-card-btn ${
              preference.transitType === 'comfort_taxi' ? 'active' : ''
            }`}
            onClick={() => handleTransitChange('comfort_taxi')}
          >
            <div className="transit-card-title">
              <Car size={15} color="#e07a5f" />
              <span>{TRANSIT_COST_MODELS.comfort_taxi.label}</span>
            </div>
            <div className="transit-card-sub">대중교통 + 골목 단거리 택시</div>
            <div className="transit-card-cost">
              {TRANSIT_COST_MODELS.comfort_taxi.cost.toLocaleString()}원 배분
            </div>
          </button>
        </div>
      </div>

      {/* 3. 테마 선택 */}
      <div className="form-row">
        <label className="form-label">여행 테마</label>
        <div className="theme-chips-scroll" id="theme-chips-container">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              id={`theme-chip-${theme.id}`}
              className={`theme-chip ${preference.theme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 골목 권역 선택 */}
      <div className="form-row">
        <label className="form-label" htmlFor="district-select-box">
          목표 골목 권역
        </label>
        <select
          id="district-select-box"
          className="district-select"
          value={preference.districtId}
          onChange={(e) => handleDistrictChange(e.target.value as DistrictId | 'all')}
        >
          <option value="all">🎯 전체 골목 중 예산에 맞는 최적 코스 자동 추천</option>
          {ALLEY_DISTRICTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.emoji} {d.name} ({d.recommendedBudgetMin.toLocaleString()}~
              {d.recommendedBudgetMax.toLocaleString()}원)
            </option>
          ))}
        </select>
      </div>

      {/* 5. 제출 버튼 */}
      <button
        type="button"
        id="submit-plan-btn"
        className="cta-button"
        onClick={onSubmit}
      >
        <Compass size={18} />
        <span>내 예산으로 골목 코스 설계하기</span>
        <Sparkles size={16} />
      </button>
    </section>
  );
};
