import React from 'react';
import { Footprints, Utensils, Camera, PiggyBank } from 'lucide-react';
import { DistrictId, TravelTheme } from '../../types';

export type PersonaType = 'walker' | 'gourmet' | 'retro' | 'frugal';

export interface PersonaConfig {
  id: PersonaType;
  title: string;
  subtitle: string;
  budget: number;
  districtId: DistrictId | 'all';
  theme: TravelTheme;
  ratios: {
    transit: number;
    food: number;
    activity: number;
  };
}

export const PERSONA_CONFIGS: Record<PersonaType, PersonaConfig> = {
  walker: {
    id: 'walker',
    title: '뚜벅이 힐링러',
    subtitle: '도보 & 마을버스',
    budget: 45000,
    districtId: 'yeongdo',
    theme: 'ocean_healing',
    ratios: { transit: 20, food: 50, activity: 30 },
  },
  gourmet: {
    id: 'gourmet',
    title: '미식 탐험가',
    subtitle: '노포 & 감성카페',
    budget: 60000,
    districtId: 'jeonpo',
    theme: 'cafe_dessert',
    ratios: { transit: 15, food: 65, activity: 20 },
  },
  retro: {
    id: 'retro',
    title: '레트로 출사러',
    subtitle: '감천·초량 필카길',
    budget: 50000,
    districtId: 'bosu',
    theme: 'retro_culture',
    ratios: { transit: 20, food: 45, activity: 35 },
  },
  frugal: {
    id: 'frugal',
    title: '가성비 알뜰러',
    subtitle: '로컬 착한가게',
    budget: 30000,
    districtId: 'bosu',
    theme: 'local_food',
    ratios: { transit: 25, food: 55, activity: 20 },
  },
};

interface PersonaPresetGroupProps {
  activePersona: PersonaType | null;
  onSelectPersona: (config: PersonaConfig) => void;
}

export const PersonaPresetGroup: React.FC<PersonaPresetGroupProps> = ({
  activePersona,
  onSelectPersona,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        추천 여행자 페르소나
      </span>
      <div className="persona-preset-grid" id="personaPresetGroup">
        {/* 1. 뚜벅이 힐링러 */}
        <button
          type="button"
          className={`persona-card ${activePersona === 'walker' ? 'active' : ''}`}
          onClick={() => onSelectPersona(PERSONA_CONFIGS.walker)}
        >
          <div className="persona-icon-box" style={{ backgroundColor: 'var(--color-secondary-fixed)', color: 'var(--color-secondary)' }}>
            <Footprints size={18} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="font-label-md" style={{ color: 'var(--color-on-surface)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              뚜벅이 힐링러
            </div>
            <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px' }}>
              도보 & 마을버스
            </div>
          </div>
        </button>

        {/* 2. 미식 탐험가 */}
        <button
          type="button"
          className={`persona-card ${activePersona === 'gourmet' ? 'active' : ''}`}
          onClick={() => onSelectPersona(PERSONA_CONFIGS.gourmet)}
        >
          <div className="persona-icon-box" style={{ backgroundColor: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}>
            <Utensils size={18} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="font-label-md" style={{ color: 'var(--color-on-surface)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              미식 탐험가
            </div>
            <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px' }}>
              노포 & 감성카페
            </div>
          </div>
        </button>

        {/* 3. 레트로 출사러 */}
        <button
          type="button"
          className={`persona-card ${activePersona === 'retro' ? 'active' : ''}`}
          onClick={() => onSelectPersona(PERSONA_CONFIGS.retro)}
        >
          <div className="persona-icon-box" style={{ backgroundColor: 'var(--color-tertiary-fixed)', color: 'var(--color-tertiary)' }}>
            <Camera size={18} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="font-label-md" style={{ color: 'var(--color-on-surface)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              레트로 출사러
            </div>
            <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px' }}>
              감천·초량 필카길
            </div>
          </div>
        </button>

        {/* 4. 가성비 알뜰러 */}
        <button
          type="button"
          className={`persona-card ${activePersona === 'frugal' ? 'active' : ''}`}
          onClick={() => onSelectPersona(PERSONA_CONFIGS.frugal)}
        >
          <div className="persona-icon-box" style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface-variant)' }}>
            <PiggyBank size={18} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="font-label-md" style={{ color: 'var(--color-on-surface)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              가성비 알뜰러
            </div>
            <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px' }}>
              로컬 착한가게
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PersonaPresetGroup;
