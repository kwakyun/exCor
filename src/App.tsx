import React, { useState, useEffect } from 'react';
import { CourseItem, TravelPlan, TravelPreference } from './types';
import { generateTravelPlan, swapSpotInPlan } from './services/budgetCalculator';
import { Header } from './components/layout/Header';
import { BudgetInputForm } from './components/planner/BudgetInputForm';
import { BudgetBalanceBar } from './components/planner/BudgetBalanceBar';
import { DistrictHeroBanner } from './components/planner/DistrictHeroBanner';
import { CourseTimeline } from './components/planner/CourseTimeline';
import { SwapSpotModal } from './components/planner/SwapSpotModal';
import { ShareModal } from './components/planner/ShareModal';
import confetti from 'canvas-confetti';
import { RotateCcw, Share2 } from 'lucide-react';
import './styles/globals.css';
import './styles/components.css';

export const App: React.FC = () => {
  const [preference, setPreference] = useState<TravelPreference>({
    budget: 50000,
    districtId: 'all',
    theme: 'all',
    transitType: 'transit_walk',
    partySize: 1,
  });

  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [swapItem, setSwapItem] = useState<CourseItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 초기 자동 계획 생성
  useEffect(() => {
    handleGeneratePlan();
  }, []);

  const handleGeneratePlan = () => {
    const newPlan = generateTravelPlan(preference);
    setPlan(newPlan);

    // 경쾌한 축하 이펙트
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#0a4da2', '#2b7de9', '#ff5e57', '#00b894'],
      });
    } catch {
      // ignore
    }
  };

  const handleSelectNewSpot = (itemOrder: number, newSpotId: string) => {
    if (!plan) return;
    const updated = swapSpotInPlan(plan, itemOrder, newSpotId);
    setPlan(updated);
  };

  return (
    <div className="app-container" id="app-root-container">
      <Header />

      <main className="content-wrapper" id="main-content">
        {/* 예산 및 스타일 설정 폼 */}
        <BudgetInputForm
          preference={preference}
          onChange={setPreference}
          onSubmit={handleGeneratePlan}
        />

        {plan && (
          <>
            {/* 3대 비용 시각화 게이지 */}
            <BudgetBalanceBar
              breakdown={plan.costBreakdown}
              budget={plan.preference.budget}
              insight={plan.savingsInsight}
            />

            {/* 골목 권역 배너 & 팁 */}
            <DistrictHeroBanner district={plan.district} />

            {/* 코스 타임라인 & 스팟 카드 */}
            <CourseTimeline
              items={plan.items}
              onOpenSwap={(item) => setSwapItem(item)}
            />
          </>
        )}
      </main>

      {/* 하단 플로팅 액션 바 */}
      {plan && (
        <aside className="bottom-bar" id="floating-bottom-bar">
          <div className="bottom-bar-inner">
            <button
              type="button"
              className="bar-btn-secondary"
              id="bottom-reroll-btn"
              onClick={handleGeneratePlan}
            >
              <RotateCcw size={15} />
              <span>새 코스 추천</span>
            </button>

            <button
              type="button"
              className="bar-btn-primary"
              id="bottom-share-btn"
              onClick={() => setIsShareModalOpen(true)}
            >
              <Share2 size={16} />
              <span>일정 요약 및 공유</span>
            </button>
          </div>
        </aside>
      )}

      {/* 스팟 변경 모달 */}
      <SwapSpotModal
        item={swapItem}
        onClose={() => setSwapItem(null)}
        onSelectNewSpot={handleSelectNewSpot}
      />

      {/* 일정 공유 모달 */}
      {isShareModalOpen && (
        <ShareModal
          plan={plan}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
