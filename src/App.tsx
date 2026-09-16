import React, { useState, useEffect } from 'react';
import { TravelPlan, TravelPreference } from './types';
import { generateTravelPlan, swapSpotInPlan } from './services/budgetCalculator';
import { PlanApiClient } from './services/planApi';
import { Header, ActiveTab } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PlannerView } from './components/planner/PlannerView';
import { AlleyTrailsView } from './components/trails/AlleyTrailsView';
import { BudgetLiveView } from './components/live/BudgetLiveView';
import { TravelPassView } from './components/pass/TravelPassView';
import { CuratedTrail } from './data/curatedTrails';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';
import './styles/globals.css';
import './styles/components.css';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('planner');

  const [preference, setPreference] = useState<TravelPreference>({
    budget: 50000,
    districtId: 'all',
    theme: 'all',
    transitType: 'transit_walk',
    partySize: 1,
  });

  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<TravelPlan[]>([]);
  const [loadedFromSlug, setLoadedFromSlug] = useState<string | null>(null);

  // 초기 자동 계획 생성 및 저장된 플랜 로컬스토리지 불러오기
  useEffect(() => {
    // 1. 로컬스토리지 저장 플랜 복원
    try {
      const stored = localStorage.getItem('busan_alley_saved_plans');
      if (stored) {
        setSavedPlans(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // 2. 쿼리스트링 공유 슬러그 확인
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('plan');

    if (slug) {
      PlanApiClient.getPlanBySlug(slug).then((savedPlan) => {
        if (savedPlan) {
          setPlan(savedPlan);
          setPreference(savedPlan.preference);
          setLoadedFromSlug(slug);
          return;
        }
        handleGeneratePlan();
      });
    } else {
      handleGeneratePlan();
    }
  }, []);

  const handleGeneratePlan = (customPref?: TravelPreference) => {
    const targetPref = customPref || preference;
    const newPlan = generateTravelPlan(targetPref);
    setPlan(newPlan);

    // 저장 목록에 자동 보관 (중복 방지)
    setSavedPlans((prev) => {
      const exists = prev.some((p) => p.id === newPlan.id || p.title === newPlan.title);
      if (exists) return prev;
      const updated = [newPlan, ...prev].slice(0, 5);
      try {
        localStorage.setItem('busan_alley_saved_plans', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // 경쾌한 축하 색종이 이펙트
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#9d3e20', '#485f84', '#815200', '#457B9D'],
      });
    } catch {
      // ignore
    }
  };

  const handleResetCourse = () => {
    const defaultPref: TravelPreference = {
      budget: 50000,
      districtId: 'all',
      theme: 'all',
      transitType: 'transit_walk',
      partySize: 1,
    };
    setPreference(defaultPref);
    handleGeneratePlan(defaultPref);
    setActiveTab('planner');
  };

  const handleSelectNewSpot = (itemOrder: number, newSpotId: string) => {
    if (!plan) return;
    const updated = swapSpotInPlan(plan, itemOrder, newSpotId);
    setPlan(updated);
  };

  const handleApplyTrailToPlanner = (trail: CuratedTrail) => {
    const newPref: TravelPreference = {
      budget: trail.budget,
      districtId: trail.districtId,
      theme: 'all',
      transitType: 'transit_walk',
      partySize: 1,
    };
    setPreference(newPref);
    handleGeneratePlan(newPref);
    setActiveTab('planner');

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#9d3e20', '#d5e3ff', '#ffddb6'],
      });
    } catch {
      // ignore
    }
  };

  const handleDeleteSavedPlan = (id: string) => {
    const updated = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(updated);
    try {
      localStorage.setItem('busan_alley_saved_plans', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="app-container" id="app-root-container">
      {/* Universal Header with 4-Tab Navigation & Wallet Widget */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        totalBudget={preference.budget}
        onResetCourse={handleResetCourse}
      />

      <main className="main-content" id="main-content">
        {/* Shared URL Alert Banner */}
        {loadedFromSlug && activeTab === 'planner' && (
          <div className="content-max-width" style={{ paddingTop: '1rem' }}>
            <div
              style={{
                backgroundColor: 'rgba(157, 62, 32, 0.08)',
                border: '1.5px solid rgba(157, 62, 32, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: 'var(--color-primary)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <Sparkles size={16} />
                공유된 맞춤 골목 코스를 불러왔습니다 (코드: {loadedFromSlug})
              </span>
              <button
                type="button"
                onClick={() => {
                  setLoadedFromSlug(null);
                  window.history.replaceState({}, '', window.location.pathname);
                  handleResetCourse();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-on-surface-variant)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline',
                }}
              >
                내 조건으로 새로짜기
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: 맞춤 밸런서 설계 (Planner - stitch_/_1) */}
        {activeTab === 'planner' && plan && (
          <PlannerView
            plan={plan}
            preference={preference}
            onChangePreference={(newPref) => {
              setPreference(newPref);
              handleGeneratePlan(newPref);
            }}
            onRefreshPlan={() => handleGeneratePlan()}
            onSwapSpot={handleSelectNewSpot}
          />
        )}

        {/* Tab 2: 골목 코스 탐색 (Alley Trails - stitch_/_3) */}
        {activeTab === 'trails' && (
          <AlleyTrailsView onApplyTrailToPlanner={handleApplyTrailToPlanner} />
        )}

        {/* Tab 3: 실시간 예산 피드백 (Budget Live - stitch_/_2) */}
        {activeTab === 'live' && plan && (
          <BudgetLiveView plan={plan} />
        )}

        {/* Tab 4: 나의 여행 패스 (My Travel Pass) */}
        {activeTab === 'pass' && plan && (
          <TravelPassView
            currentPlan={plan}
            savedPlans={savedPlans}
            onLoadSavedPlan={(loadedPlan) => {
              setPlan(loadedPlan);
              setPreference(loadedPlan.preference);
              setActiveTab('planner');
            }}
            onDeleteSavedPlan={handleDeleteSavedPlan}
          />
        )}
      </main>

      {/* Busan Alley Balancer Footer */}
      <Footer />
    </div>
  );
};

export default App;
