import React, { useState, useEffect } from 'react';
import { TravelPlan } from '../../types';
import { PlanApiClient } from '../../services/planApi';
import { X, Copy, Check, Share2, Link as LinkIcon, Sparkles } from 'lucide-react';

interface ShareModalProps {
  plan: TravelPlan | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ plan, onClose }) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // 모달 오픈 시 백엔드 API에 코스 저장 및 고유 슬러그 발급
  useEffect(() => {
    if (!plan) return;

    let isMounted = true;
    setIsSaving(true);

    PlanApiClient.savePlan(plan)
      .then((res) => {
        if (isMounted && res.success) {
          setShareSlug(res.slug);
          setShareUrl(res.shareUrl);
        }
      })
      .catch((err) => console.error('코스 저장 오류:', err))
      .finally(() => {
        if (isMounted) setIsSaving(false);
      });

    return () => {
      isMounted = false;
    };
  }, [plan]);

  if (!plan) return null;

  const generateItineraryText = () => {
    const lines = [
      `[부산 골목 밸런서] ${plan.title}`,
      `📍 대상 골목: ${plan.district.name}`,
      `🚇 교통 안내: ${plan.district.subwayStation}`,
      `💰 총 예산: ${plan.preference.budget.toLocaleString()}원`,
      shareUrl ? `🔗 일정 바로보기: ${shareUrl}` : '',
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
    ].filter(Boolean);
    return lines.join('\n');
  };

  const itineraryText = generateItineraryText();

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(itineraryText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setCopiedText(true);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
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

        {/* 백엔드 연동 고유 단축 링크 카드 */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Sparkles size={14} />
              백엔드 저장 완료 (공유 슬러그: {shareSlug || '생성 중...'})
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              readOnly
              value={shareUrl || (isSaving ? '서버에 저장 중...' : '')}
              style={{
                flex: 1,
                padding: '8px 10px',
                fontSize: 13,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
              }}
            />
            <button
              type="button"
              className="bar-btn-secondary"
              id="copy-share-url-btn"
              onClick={handleCopyLink}
              disabled={!shareUrl}
              style={{ padding: '0 12px', whiteSpace: 'nowrap' }}
            >
              {copiedLink ? <Check size={16} /> : <LinkIcon size={16} />}
              <span>{copiedLink ? '복사됨' : '링크 복사'}</span>
            </button>
          </div>
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
          onClick={handleCopyText}
        >
          {copiedText ? (
            <>
              <Check size={18} />
              <span>전체 일정 복사 완료!</span>
            </>
          ) : (
            <>
              <Copy size={18} />
              <span>전체 일정 텍스트 복사하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
