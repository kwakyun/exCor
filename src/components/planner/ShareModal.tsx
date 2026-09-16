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
          })\n   - ${item.spot.signature || item.spot.summary}`
      ),
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💡 로컬 꿀팁: ${plan.district.localTip}`,
      `✨ 생성: 부산 골목 밸런서 (Busan Alley Balancer)`,
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
        className="modal-dialog"
        id="share-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-fixed)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share2 size={18} />
            </span>
            <div>
              <h3 className="font-headline-sm" style={{ margin: 0 }}>
                여행 코스 & 예산 내역 공유
              </h3>
              <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                친구와 간편하게 공유할 수 있는 맞춤 일정표
              </span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            id="close-share-modal-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* Short link box */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-low)',
            border: '1.5px solid rgba(29, 53, 87, 0.08)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-label-sm"
              style={{
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 700,
              }}
            >
              <Sparkles size={14} />
              온라인 공유 링크 (슬러그: {shareSlug || '생성 중...'})
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value={shareUrl || (isSaving ? '서버에 저장 중...' : '')}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '13px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-outline-variant)',
                backgroundColor: 'var(--color-surface-container-lowest)',
                color: 'var(--color-on-surface)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              className="btn-surface"
              id="copy-share-url-btn"
              onClick={handleCopyLink}
              disabled={!shareUrl}
              style={{ padding: '0 14px', whiteSpace: 'nowrap' }}
            >
              {copiedLink ? <Check size={15} color="var(--color-primary)" /> : <LinkIcon size={15} />}
              <span>{copiedLink ? '복사됨' : '링크 복사'}</span>
            </button>
          </div>
        </div>

        <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
          카카오톡이나 인스타그램 DM으로 바로 전송할 수 있는 텍스트 포맷입니다.
        </p>

        {/* Text preview */}
        <pre
          style={{
            backgroundColor: 'var(--color-surface-container-high)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            fontSize: '12px',
            lineHeight: 1.55,
            color: 'var(--color-on-surface)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            maxHeight: '220px',
            overflowY: 'auto',
            fontFamily: 'inherit',
            border: '1px solid rgba(29, 53, 87, 0.06)',
          }}
          id="share-itinerary-text"
        >
          {itineraryText}
        </pre>

        <button
          type="button"
          className="btn-primary"
          id="copy-itinerary-clipboard-btn"
          onClick={handleCopyText}
          style={{ width: '100%', padding: '12px' }}
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

export default ShareModal;
