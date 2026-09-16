import React from 'react';
import { DigitalPassTicket } from './DigitalPassTicket';
import { StampCollector } from './StampCollector';
import { SavedPlanList } from './SavedPlanList';
import { TravelPlan } from '../../types';

interface TravelPassViewProps {
  currentPlan: TravelPlan;
  savedPlans: TravelPlan[];
  onLoadSavedPlan: (plan: TravelPlan) => void;
  onDeleteSavedPlan: (id: string) => void;
}

export const TravelPassView: React.FC<TravelPassViewProps> = ({
  currentPlan,
  savedPlans,
  onLoadSavedPlan,
  onDeleteSavedPlan,
}) => {
  return (
    <div className="content-max-width" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem', paddingTop: '1rem' }}>
      {/* 1. Digital Pass Ticket */}
      <DigitalPassTicket
        passNumber="82-051-2026"
        travelerName="낭만 뚜벅이 여행자"
        accumulatedSavings={18500}
        activeDistrictName={currentPlan.district.name}
      />

      {/* 2. Stamp Collector */}
      <StampCollector />

      {/* 3. Saved Plans List */}
      <SavedPlanList
        plans={savedPlans}
        onLoadPlan={onLoadSavedPlan}
        onDeletePlan={onDeleteSavedPlan}
      />
    </div>
  );
};

export default TravelPassView;
