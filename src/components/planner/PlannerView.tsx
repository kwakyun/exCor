import React, { useState } from 'react';
import { CourseItem, TravelPlan, TravelPreference } from '../../types';
import { PersonaPresetGroup, PersonaType, PersonaConfig } from './PersonaPresetGroup';
import { BudgetSliderCard, BudgetRatios } from './BudgetSliderCard';
import { InspirationCard } from './InspirationCard';
import { CourseTimeline } from './CourseTimeline';
import { BudgetSummaryLedger } from './BudgetSummaryLedger';
import { AllianceMerchants } from './AllianceMerchants';
import { SwapSpotModal } from './SwapSpotModal';
import { ShareModal } from './ShareModal';
import { ElevationMapModal } from '../common/ElevationMapModal';
import { Ticket } from 'lucide-react';

interface PlannerViewProps {
  plan: TravelPlan;
  preference: TravelPreference;
  onChangePreference: (pref: TravelPreference) => void;
  onRefreshPlan: () => void;
  onSwapSpot: (itemOrder: number, newSpotId: string) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  plan,
  preference,
  onChangePreference,
  onRefreshPlan,
  onSwapSpot,
}) => {
  const [activePersona, setActivePersona] = useState<PersonaType | null>('walker');
  const [ratios, setRatios] = useState<BudgetRatios>({ transit: 20, food: 50, activity: 30 });
  const [autoBalance, setAutoBalance] = useState(true);

  // Modals state
  const [isElevationMapOpen, setIsElevationMapOpen] = useState(false);
  const [swapItem, setSwapItem] = useState<CourseItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Handle persona preset selection
  const handleSelectPersona = (config: PersonaConfig) => {
    setActivePersona(config.id);
    setRatios(config.ratios);
    onChangePreference({
      ...preference,
      budget: config.budget,
      districtId: config.districtId,
      theme: config.theme,
    });
  };

  // Handle budget amount update
  const handleChangeBudget = (newBudget: number) => {
    setActivePersona(null);
    onChangePreference({
      ...preference,
      budget: newBudget,
    });
  };

  // Open maps link
  const handleOpenMaps = () => {
    const query = encodeURIComponent(`부산 ${plan.district.name} 여행`);
    window.open(`https://map.naver.com/v5/search/${query}`, '_blank');
  };

  return (
    <div className="ambient-glow-wrapper">
      {/* Subtle Ambient Glow Canvas */}
      <div className="ambient-blob-primary" />
      <div className="ambient-blob-secondary" />
      <div className="ambient-blob-tertiary" />

      <div className="content-max-width" style={{ position: 'relative', zIndex: 1, paddingBottom: '3rem' }}>
        {/* Top Editorial Pill & Stamp Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '1.25rem',
            paddingTop: '1rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface-container-high)',
              color: 'var(--color-on-surface-variant)',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
              }}
              className="animate-ping-slow"
            />
            <span>2024 산복도로·바닷마을 실시간 물가 지수 반영 중</span>
          </div>

          {/* Nostalgic Busan Ticket Stamp Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-container-lowest)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid rgba(29, 53, 87, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary)' }}>
              <Ticket size={16} color="var(--color-primary)" />
              <span>BUSAN ALLEY PASS #82-051</span>
            </div>
            <span style={{ color: 'var(--color-outline-variant)' }}>|</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-tertiary)' }}>
              동백전 5% 적립
            </span>
          </div>
        </div>

        {/* Hero Header Text Block & Persona Preset Group */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--spacing-gutter)',
            alignItems: 'end',
            marginBottom: '2rem',
          }}
          id="planner-hero-grid"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 'var(--spacing-gutter)',
              alignItems: 'end',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 className="font-display-lg" style={{ color: 'var(--color-on-surface)', margin: 0 }}>
                골목의 숨결과 지갑의 밸런스를 맞추는 <br />
                <span style={{ color: 'var(--color-primary)' }}>나만의 부산 골목 여행</span>
              </h1>
              <p
                className="font-body-lg"
                style={{
                  color: 'var(--color-on-surface-variant)',
                  maxWidth: '720px',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                교통비·식비·입장료를 원하는 비율로 밀고 당기면, 부산 언덕 계단과 바닷바람 사이 숨겨진 로컬
                스팟과 최적 도보 동선이 실시간으로 리밸런싱됩니다.
              </p>
            </div>

            {/* Persona Preset Buttons */}
            <PersonaPresetGroup
              activePersona={activePersona}
              onSelectPersona={handleSelectPersona}
            />
          </div>
        </div>

        {/* MAIN INTERACTIVE GRID: LEFT BALANCER CONTROLLER / RIGHT LIVE ITINERARY & SUMMARY */}
        <div className="planner-main-grid">
          {/* LEFT COLUMN: BUDGET BALANCER ENGINE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <BudgetSliderCard
              totalBudget={preference.budget}
              onChangeBudget={handleChangeBudget}
              ratios={ratios}
              onChangeRatios={setRatios}
              autoBalance={autoBalance}
              onToggleAutoBalance={setAutoBalance}
              onOpenElevationMap={() => setIsElevationMapOpen(true)}
            />
          </div>

          {/* RIGHT COLUMN: LIVE GENERATED COURSE & SPOTLIGHT & BUDGET SUMMARY */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Inspiration Spotlight Card */}
            <InspirationCard onExploreStop={() => setIsElevationMapOpen(true)} />

            {/* Live Timeline Stops */}
            <CourseTimeline
              items={plan.items}
              onOpenSwap={(item) => setSwapItem(item)}
              onRefreshCourse={onRefreshPlan}
            />

            {/* Final Live Balance & Savings Summary Card */}
            <BudgetSummaryLedger
              totalBudget={preference.budget}
              breakdown={plan.costBreakdown}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenMapsLink={handleOpenMaps}
            />
          </div>
        </div>

        {/* Local Merchants Alliance Mini Grid */}
        <AllianceMerchants />
      </div>

      {/* Modals */}
      <ElevationMapModal
        isOpen={isElevationMapOpen}
        onClose={() => setIsElevationMapOpen(false)}
      />

      <SwapSpotModal
        item={swapItem}
        onClose={() => setSwapItem(null)}
        onSelectNewSpot={onSwapSpot}
      />

      {isShareModalOpen && (
        <ShareModal
          plan={plan}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PlannerView;
