import React from 'react';

export interface TreeProps {
  points?: number;
  /** Explicit stage override (1-based). If provided, `points` is ignored. */
  stage?: number;
  /** Points required per stage */
  pointsPerStage?: number;
  /** Max stages per tree */
  maxStages?: number;
}

export const Tree: React.FC<TreeProps> = ({ points = 0, stage, pointsPerStage = 100, maxStages = 5 }) => {
  const computedStage = stage ? Math.max(1, Math.min(maxStages, stage)) : Math.max(1, Math.min(maxStages, Math.floor(points / pointsPerStage) + 1));
  const currentStageIndex = computedStage - 1;
  const stageStart = currentStageIndex * pointsPerStage;
  const stageEnd = (currentStageIndex + 1) * pointsPerStage;
  const progress = Math.max(0, Math.min(1, (points - stageStart) / Math.max(1, stageEnd - stageStart)));

  return (
    <div className="tree-mini">
      <div className="tree-mini__header">
        <h3>Growing Tree</h3>
        <div className="badge">{points} pts</div>
      </div>

      <div className="tree-mini__scene">
        <svg className="tree-mini__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 360">
          <defs>
            <filter id="tree-shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15" />
            </filter>
            <linearGradient id="trunk-gradient" x1="0%" y1="0%" x2="100%">
              <stop offset="0%" style={{ stopColor: '#6B4423', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#8B6F47', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#6B4423', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>

          {/* Shadow under tree */}
          <ellipse cx="160" cy="340" rx="80" ry="12" fill="rgba(0,0,0,0.08)" />

          {/* Strong trunk - grows with stage */}
          <path 
            className="tree-mini__trunk" 
            d={`M150,360 C148,${320 - computedStage * 12} 150,${240 - computedStage * 10} 160,${180 - computedStage * 15} C170,${240 - computedStage * 10} 172,${320 - computedStage * 12} 170,360 Z`}
            fill="url(#trunk-gradient)"
            filter="url(#tree-shadow)"
          />

          {/* Primary branches - strong and visible */}
          {computedStage >= 2 && (
            <>
              <path className="tree-mini__branch" d="M155,290 C120,270 90,250 60,230" stroke="#6B4423" strokeWidth="9" strokeLinecap="round" fill="none" filter="url(#tree-shadow)" />
              <path className="tree-mini__branch" d="M165,290 C200,270 230,250 260,230" stroke="#6B4423" strokeWidth="9" strokeLinecap="round" fill="none" filter="url(#tree-shadow)" />
            </>
          )}

          {/* Secondary branches */}
          {computedStage >= 3 && (
            <>
              <path className="tree-mini__branch" d="M155,240 C125,215 95,190 65,160" stroke="#6B4423" strokeWidth="7" strokeLinecap="round" fill="none" filter="url(#tree-shadow)" />
              <path className="tree-mini__branch" d="M165,240 C195,215 225,190 255,160" stroke="#6B4423" strokeWidth="7" strokeLinecap="round" fill="none" filter="url(#tree-shadow)" />
            </>
          )}

          {/* Tertiary branches */}
          {computedStage >= 4 && (
            <>
              <path className="tree-mini__branch" d="M155,190 C130,165 100,140 70,110" stroke="#6B4423" strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#tree-shadow)" />
              <path className="tree-mini__branch" d="M165,190 C190,165 220,140 250,110" stroke="#6B4423" strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#tree-shadow)" />
            </>
          )}

          {/* Dense foliage crown - expands beautifully */}
          <g className="tree-mini__crown" filter="url(#tree-shadow)">
            {/* Base crown - always visible */}
            <circle cx="160" cy="100" r="52" fill="#4CAF50" opacity="0.92" />
            <circle cx="125" cy="125" r="48" fill="#43A047" opacity="0.92" />
            <circle cx="195" cy="125" r="48" fill="#388E3C" opacity="0.92" />

            {/* Stage 2+ - side expansion */}
            {computedStage >= 2 && (
              <>
                <circle cx="95" cy="155" r="45" fill="#4CAF50" opacity="0.92" />
                <circle cx="225" cy="155" r="45" fill="#43A047" opacity="0.92" />
                <circle cx="160" cy="65" r="48" fill="#43A047" opacity="0.92" />
              </>
            )}

            {/* Stage 3+ - bottom expansion */}
            {computedStage >= 3 && (
              <>
                <circle cx="70" cy="180" r="42" fill="#388E3C" opacity="0.92" />
                <circle cx="250" cy="180" r="42" fill="#4CAF50" opacity="0.92" />
                <circle cx="130" cy="55" r="45" fill="#43A047" opacity="0.92" />
                <circle cx="190" cy="55" r="45" fill="#2E7D32" opacity="0.92" />
              </>
            )}

            {/* Stage 4+ - fuller crown */}
            {computedStage >= 4 && (
              <>
                <circle cx="110" cy="45" r="44" fill="#4CAF50" opacity="0.92" />
                <circle cx="210" cy="45" r="44" fill="#43A047" opacity="0.92" />
                <circle cx="50" cy="150" r="40" fill="#43A047" opacity="0.92" />
                <circle cx="270" cy="150" r="40" fill="#388E3C" opacity="0.92" />
              </>
            )}

            {/* Stage 5 - maximum crown */}
            {computedStage >= 5 && (
              <>
                <circle cx="160" cy="35" r="46" fill="#4CAF50" opacity="0.92" />
                <circle cx="85" cy="85" r="42" fill="#388E3C" opacity="0.92" />
                <circle cx="235" cy="85" r="42" fill="#4CAF50" opacity="0.92" />
                <circle cx="35" cy="130" r="40" fill="#2E7D32" opacity="0.92" />
                <circle cx="285" cy="130" r="40" fill="#43A047" opacity="0.92" />
              </>
            )}
          </g>

          {/* Golden fruits - more and better positioned */}
          {computedStage >= 2 && (
            <>
              <circle cx="150" cy="110" r="7" fill="#FFD700" opacity="0.95" filter="url(#tree-shadow)" />
              <circle cx="180" cy="135" r="6" fill="#FFA500" opacity="0.95" filter="url(#tree-shadow)" />
            </>
          )}
          {computedStage >= 3 && (
            <>
              <circle cx="130" cy="130" r="6" fill="#FFD700" opacity="0.95" filter="url(#tree-shadow)" />
              <circle cx="200" cy="105" r="7" fill="#FFA500" opacity="0.95" filter="url(#tree-shadow)" />
              <circle cx="110" cy="170" r="5" fill="#FFD700" opacity="0.95" filter="url(#tree-shadow)" />
            </>
          )}
          {computedStage >= 4 && (
            <>
              <circle cx="85" cy="150" r="6" fill="#FFD700" opacity="0.95" filter="url(#tree-shadow)" />
              <circle cx="215" cy="160" r="7" fill="#FFA500" opacity="0.95" filter="url(#tree-shadow)" />
              <circle cx="160" cy="65" r="5" fill="#FFD700" opacity="0.95" filter="url(#tree-shadow)" />
            </>
          )}
          {computedStage >= 5 && (
            <>
              <circle cx="120" cy="60" r="6" fill="#FFA500" opacity="0.95" filter="url(#tree-shadow)" />
              <circle cx="200" cy="60" r="6" fill="#FFD700" opacity="0.95" filter="url(#tree-shadow)" />
              <circle cx="230" cy="120" r="5" fill="#FFA500" opacity="0.95" filter="url(#tree-shadow)" />
            </>
          )}
        </svg>
      </div>

      <div className="tree-mini__footer">
        <p>Stage {computedStage} / {maxStages}</p>
      </div>

      <div style={{ marginTop: 10 }} className="tree-mini__bar">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
};

export default Tree;
