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
        <svg className="tree-mini__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320">
          {/* Thin realistic trunk */}
          <path 
            className="tree-mini__trunk" 
            d="M145,320 C145,260 148,200 150,140 C152,200 155,260 155,320 Z" 
            fill="#8B6F47"
            opacity="0.85"
          />
          
          {/* Main branches appear at stage 2+ */}
          {computedStage >= 2 && (
            <>
              <path className="tree-mini__branch" d="M150,260 C125,240 100,220 80,200" stroke="#8B6F47" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path className="tree-mini__branch" d="M150,240 C175,220 200,200 220,180" stroke="#8B6F47" strokeWidth="5" strokeLinecap="round" fill="none" />
            </>
          )}
          
          {/* Secondary branches at stage 3+ */}
          {computedStage >= 3 && (
            <>
              <path className="tree-mini__branch" d="M150,200 C120,180 90,160 70,140" stroke="#8B6F47" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path className="tree-mini__branch" d="M150,180 C180,160 210,140 230,120" stroke="#8B6F47" strokeWidth="4" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Crown layers grow with stages */}
          <g className={`tree-mini__crown tree-mini__crown--stage${computedStage}`}>
            {/* Stage 1 - small crown */}
            <circle cx="150" cy="90" r="45" fill="#4CAF50" opacity="0.85" />
            <circle cx="120" cy="110" r="35" fill="#43A047" opacity="0.85" />
            <circle cx="180" cy="110" r="35" fill="#388E3C" opacity="0.85" />

            {/* Stage 2+ - expand crown */}
            {computedStage >= 2 && (
              <>
                <circle cx="100" cy="130" r="38" fill="#4CAF50" opacity="0.85" />
                <circle cx="200" cy="130" r="38" fill="#43A047" opacity="0.85" />
              </>
            )}

            {/* Stage 3+ - more spread */}
            {computedStage >= 3 && (
              <>
                <circle cx="80" cy="160" r="35" fill="#388E3C" opacity="0.85" />
                <circle cx="220" cy="160" r="35" fill="#4CAF50" opacity="0.85" />
                <circle cx="150" cy="50" r="42" fill="#43A047" opacity="0.85" />
              </>
            )}

            {/* Stage 4+ - fuller crown */}
            {computedStage >= 4 && (
              <>
                <circle cx="130" cy="40" r="40" fill="#2E7D32" opacity="0.85" />
                <circle cx="170" cy="40" r="40" fill="#4CAF50" opacity="0.85" />
              </>
            )}

            {/* Stage 5 - maximum crown */}
            {computedStage >= 5 && (
              <>
                <circle cx="110" cy="70" r="38" fill="#43A047" opacity="0.85" />
                <circle cx="190" cy="70" r="38" fill="#388E3C" opacity="0.85" />
              </>
            )}
          </g>

          {/* Golden fruits appear progressively */}
          {computedStage >= 2 && <circle cx="140" cy="100" r="6" fill="#FFD700" opacity="0.9" />}
          {computedStage >= 3 && <circle cx="160" cy="115" r="6" fill="#FFA500" opacity="0.9" />}
          {computedStage >= 4 && (
            <>
              <circle cx="120" cy="120" r="5" fill="#FFD700" opacity="0.9" />
              <circle cx="175" cy="90" r="6" fill="#FFA500" opacity="0.9" />
            </>
          )}
          {computedStage >= 5 && (
            <>
              <circle cx="100" cy="140" r="6" fill="#FFD700" opacity="0.9" />
              <circle cx="200" cy="145" r="5" fill="#FFA500" opacity="0.9" />
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
