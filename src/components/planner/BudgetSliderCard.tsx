import React from 'react';
import { Bus, Coffee, Ticket, Sparkles, HeartHandshake, Map } from 'lucide-react';

export interface BudgetRatios {
  transit: number;
  food: number;
  activity: number;
}

interface BudgetSliderCardProps {
  totalBudget: number;
  onChangeBudget: (newBudget: number) => void;
  ratios: BudgetRatios;
  onChangeRatios: (newRatios: BudgetRatios) => void;
  autoBalance: boolean;
  onToggleAutoBalance: (enabled: boolean) => void;
  onOpenElevationMap: () => void;
}

const QUICK_BUDGETS = [
  { label: '₩3만', value: 30000 },
  { label: '₩5만', value: 50000 },
  { label: '₩7만', value: 70000 },
  { label: '₩10만', value: 100000 },
  { label: '₩15만', value: 150000 },
  { label: '₩20만', value: 200000 },
];

export const BudgetSliderCard: React.FC<BudgetSliderCardProps> = ({
  totalBudget,
  onChangeBudget,
  ratios,
  onChangeRatios,
  autoBalance,
  onToggleAutoBalance,
  onOpenElevationMap,
}) => {
  // Normalize ratios to ensure total = 100% visually
  const sum = ratios.transit + ratios.food + ratios.activity;
  const normTransit = sum > 0 ? Math.round((ratios.transit / sum) * 100) : 20;
  const normFood = sum > 0 ? Math.round((ratios.food / sum) * 100) : 50;
  const normActivity = Math.max(0, 100 - normTransit - normFood);

  // Computed KRW amounts based on ratios
  const amtTransit = Math.round((totalBudget * (normTransit / 100)) / 100) * 100;
  const amtFood = Math.round((totalBudget * (normFood / 100)) / 100) * 100;
  const amtActivity = Math.max(0, totalBudget - amtTransit - amtFood);

  const handleSliderChange = (key: keyof BudgetRatios, val: number) => {
    const updated = { ...ratios, [key]: val };
    onChangeRatios(updated);
  };

  return (
    <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title & Badge */}
      <div className="bento-card-header" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary)',
            }}
          />
          <h2 className="font-headline-sm" style={{ margin: 0 }}>
            1일 골목 예산 설정
          </h2>
        </div>
        <span className="badge-pill badge-primary">동백패스 호환</span>
      </div>

      {/* Currency Input & Quick Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-container-low)',
            padding: '8px 14px',
            border: '1.5px solid rgba(29, 53, 87, 0.1)',
          }}
        >
          <span
            className="font-headline-md"
            style={{ color: 'var(--color-primary)', fontWeight: 800, paddingRight: '6px' }}
          >
            ₩
          </span>
          <input
            type="number"
            className="font-headline-md tabular-nums"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              textAlign: 'right',
              color: 'var(--color-on-surface)',
              fontWeight: 700,
            }}
            value={totalBudget}
            min={20000}
            max={500000}
            step={5000}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) onChangeBudget(val);
            }}
          />
        </div>

        {/* Quick Budget Chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', flexWrap: 'wrap' }}>
          {QUICK_BUDGETS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`budget-chip ${totalBudget === chip.value ? 'active' : ''}`}
              onClick={() => onChangeBudget(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Tri-Ratio Gauge Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            예산 배분 밸런스 비율
          </span>
          <span
            className="font-label-sm"
            style={{ color: 'var(--color-primary)', fontWeight: 700 }}
          >
            100% 최적화 완료
          </span>
        </div>

        <div className="tri-gauge-container">
          <div
            className="tri-gauge-segment tri-gauge-transit"
            style={{ width: `${normTransit}%` }}
            title={`교통 ${normTransit}%`}
          />
          <div
            className="tri-gauge-segment tri-gauge-food"
            style={{ width: `${normFood}%` }}
            title={`식음료 ${normFood}%`}
          />
          <div
            className="tri-gauge-segment tri-gauge-activity"
            style={{ width: `${normActivity}%` }}
            title={`체험 ${normActivity}%`}
          />
        </div>

        {/* Gauge Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--pillar-transit)',
              }}
            />
            <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              교통 <b style={{ color: 'var(--color-on-surface)' }}>{normTransit}%</b>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--pillar-food)',
              }}
            />
            <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              식음료 <b style={{ color: 'var(--color-on-surface)' }}>{normFood}%</b>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--pillar-activity)',
              }}
            />
            <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              체험 <b style={{ color: 'var(--color-on-surface)' }}>{normActivity}%</b>
            </span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--color-surface-container-high)' }} />

      {/* Tri-Slider Controllers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Slider 1: Transit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-secondary-fixed)',
                  color: 'var(--color-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bus size={14} />
              </span>
              <span className="font-label-lg" style={{ color: 'var(--color-on-surface)' }}>
                교통비 (Transit)
              </span>
            </div>
            <span
              className="font-label-lg tabular-nums"
              style={{ color: 'var(--color-secondary)', fontWeight: 700 }}
            >
              ₩{amtTransit.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            className="stitch-range-slider slider-transit"
            min={5}
            max={50}
            value={ratios.transit}
            onChange={(e) => handleSliderChange('transit', parseInt(e.target.value, 10))}
          />
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
            마을버스 산복도로 환승, 영도 흰여울 해안 도보, 송도 셔틀
          </p>
        </div>

        {/* Slider 2: Food & Cafe */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-primary-fixed)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Coffee size={14} />
              </span>
              <span className="font-label-lg" style={{ color: 'var(--color-on-surface)' }}>
                식비 & 카페 (Food & Cafe)
              </span>
            </div>
            <span
              className="font-label-lg tabular-nums"
              style={{ color: 'var(--color-primary)', fontWeight: 700 }}
            >
              ₩{amtFood.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            className="stitch-range-slider slider-food"
            min={20}
            max={80}
            value={ratios.food}
            onChange={(e) => handleSliderChange('food', parseInt(e.target.value, 10))}
          />
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
            초량 불백 노포, 영도 바다뷰 핸드드립, 부평 깡통야시장 씨앗호떡
          </p>
        </div>

        {/* Slider 3: Activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-tertiary-fixed)',
                  color: 'var(--color-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ticket size={14} />
              </span>
              <span className="font-label-lg" style={{ color: 'var(--color-on-surface)' }}>
                입장료 & 골목체험 (Activities)
              </span>
            </div>
            <span
              className="font-label-lg tabular-nums"
              style={{ color: 'var(--color-tertiary)', fontWeight: 700 }}
            >
              ₩{amtActivity.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            className="stitch-range-slider slider-activity"
            min={5}
            max={60}
            value={ratios.activity}
            onChange={(e) => handleSliderChange('activity', parseInt(e.target.value, 10))}
          />
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
            감천 골목 목공방 체험, 보수동 책방 북큐레이션, 모노레일 스탬프
          </p>
        </div>
      </div>

      {/* Auto-Balance Toggle & Partner Discount Badge */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface-container-low)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="font-label-md" style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>
                골목 동선 자동 재조정 (AI Auto-Balance)
              </span>
              <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                비율 변동 시 가장 가까운 로컬 명소로 교체
              </span>
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoBalance}
              onChange={(e) => onToggleAutoBalance(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: autoBalance ? 'var(--color-primary)' : 'var(--color-surface-container-highest)',
                borderRadius: '22px',
                transition: '300ms',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '""',
                  height: '16px',
                  width: '16px',
                  left: autoBalance ? '21px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '300ms',
                }}
              />
            </span>
          </label>
        </div>

        {/* Partner Discount Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(255, 221, 182, 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartHandshake size={18} color="var(--color-tertiary)" />
            <span className="font-label-sm" style={{ color: 'var(--color-on-tertiary-fixed)', fontWeight: 700 }}>
              골목 상생 스탬프 할인 혜택 (-15%) 자동 활성화됨
            </span>
          </div>
          <span className="badge-pill badge-tertiary">적용중</span>
        </div>
      </div>

      {/* Mini Map Trigger Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface-container-low)',
          border: '1px solid rgba(29, 53, 87, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-container-high)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <Map size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="font-label-md" style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>
              부산 산복도로 도보 특화 맵
            </span>
            <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              경사도 12% 이하 무장애 데크 우선 코스
            </span>
          </div>
        </div>
        <button
          type="button"
          className="btn-surface"
          onClick={onOpenElevationMap}
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          고도 지도 열기
        </button>
      </div>
    </div>
  );
};

export default BudgetSliderCard;
