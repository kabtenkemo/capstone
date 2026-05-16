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
  // Determine stage (1..maxStages)
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

        <div className={`tree-mini__scene tree-mini__scene--${Math.max(0, Math.min(3, computedStage - 1))}`}>
        <img
          src={`/tree/${computedStage}.png`}
          alt={`Tree stage ${computedStage}`}
          style={{
              maxWidth: '92%',
              maxHeight: '260px',
            height: 'auto',
              width: 'auto'
          }}
        />
      </div>

      <div className="tree-mini__footer">
        <p>Progress to next stage</p>
      </div>

      <div style={{ marginTop: 10 }} className="tree-mini__bar">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
};

export default Tree;
