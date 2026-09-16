import React from 'react';

interface LogoProps {
  className?: string;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', height = 40 }) => {
  const width = (height / 60) * 240;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 60"
      fill="none"
      height={height}
      width={width}
      className={className}
      aria-label="부산 골목 밸런서 로고"
      role="img"
    >
      <rect x="4" y="8" width="44" height="44" rx="12" fill="#9d3e20" />
      <path d="M16 38L24 18L32 38H28L26 33H22L20 38H16Z" fill="#FDFBF7" />
      <circle cx="36" cy="18" r="4" fill="#F3A83B" />
      <path d="M12 42C18 40 30 40 40 42" stroke="#FDFBF7" strokeWidth="2" strokeLinecap="round" />
      <text
        x="58"
        y="32"
        fontFamily="'Epilogue', 'Pretendard', sans-serif"
        fontSize="20"
        fontWeight="800"
        fill="#1D3557"
        letterSpacing="-0.5px"
      >
        부산골목<tspan fill="#9d3e20">밸런서</tspan>
      </text>
      <text
        x="59"
        y="46"
        fontFamily="'Plus Jakarta Sans', 'Pretendard', sans-serif"
        fontSize="10"
        fontWeight="600"
        fill="#56423c"
        letterSpacing="0.5px"
      >
        BUSAN ALLEY BALANCER
      </text>
    </svg>
  );
};

export default Logo;
