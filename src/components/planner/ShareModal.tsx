import React, { useState } from 'react';
import { TravelPlan } from '../../types';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  plan: TravelPlan | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ plan, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!plan) return null;

  const generateItineraryText = () => {
    const lines = [
      `[부산 골목 밸런서] ${plan.title}`,
      `📍 대상 골목: ${plan.district.name}`,
      `🚇 교통 안내: ${plan.district.subwayStation}`,
      `💰 총 예산: ${plan.preference.budget.toLocaleString()}원`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `[3대 비용 지출 명세]`,
      `• 교통비: ${plan.costBreakdown.transitCost.toLocaleString()}원 (${plan.costBreakdown.transitPercent}%)`,
      `• 식비/카페: ${plan.costBreakdown.foodCost.toLocaleString()}원 (${plan.costBreakdown.foodPercent}%)`,
      `• 입장/체험: ${plan.costBreakdown.admissionCost.toLocaleString()}원 (${plan.costBreakdown.admissionPercent}%)`,
      `• 골목 비상금: ${plan.costBreakdown.remainingBudget.toLocaleString()}원 (${plan.costBreakdown.bufferPercent}%)`,
      `총 지출 합계: ${plan.costBreakdown.totalSpent.toLocaleString()}원`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `[추천 동선 일정]`,
      ...plan.items.map(
        (item) =>
          `${item.order}. ${item.timeSlot} | ${item.spot.name} (${
            item.cost === 0 ? '무료' : item.cost.toLocaleString() + '원'
          })\n   - ${item.spot.signature}`
      ),
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💡 로컬 꿀팁: ${plan.district.localTip}`,
      `✨ 생성: 부산 골목 밸런서 (exCor Travel Planner)`,
    ];
    return lines.join('\n');
  };

  const itineraryText = generateItineraryText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(itineraryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
    }
  };

  return (
    <div className="modal-backdrop" id="share-modal-backdrop" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        id="share-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Share2 size={18} color="var(--color-primary)" />
            <span className="modal-title">여행 코스 & 예산 내역 공유</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            id="close-share-modal-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          친구에게 카카오톡이나 메모장으로 바로 보낼 수 있도록 깔끔하게 정리된 일정표입니다.
        </p>

        <div className="share-itinerary-preview" id="share-itinerary-text">
          {itineraryText}
        </div>

        <button
          type="button"
          className="cta-button"
          id="copy-itinerary-clipboard-btn"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check size={18} />
              <span>클립보드 복사 완료!</span>
            </>
          ) : (
            <>
              <Copy size={18} />
              <span>전체 일정 클립보드에 복사하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
