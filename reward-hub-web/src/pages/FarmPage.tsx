import React from 'react';
import { SectionCard } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { Tree } from '../components/Tree';

export function FarmPage() {
  const { profile, childProfile, role } = useAuth();
  const displayProfile = role === 'Parent' && childProfile ? childProfile : profile;
  const points = displayProfile?.points ?? 0;

  const pointsPerStage = 100;
  const stagesPerTree = 5;
  const pointsPerTree = pointsPerStage * stagesPerTree;

  const completedTrees = Math.floor(points / pointsPerTree);
  const currentTreePoints = points % pointsPerTree;
  const currentTreeStage = Math.floor(currentTreePoints / pointsPerStage) + 1;

  // Render a responsive grid of trees: completed trees are full (max stage),
  // plus the current tree showing its progress. Cap total displayed trees for layout.
  const maxTrees = 12;
  const treesToShow = Math.min(maxTrees, completedTrees + 1);

  const trees = Array.from({ length: treesToShow }).map((_, idx) => {
    if (idx < completedTrees) {
      return { stage: stagesPerTree, points: stagesPerTree * pointsPerStage };
    }

    // current tree
    return { stage: currentTreeStage, points: currentTreePoints };
  });

  return (
    <div>
      <SectionCard title="Farm" subtitle="Grow a forest by earning points - 100 points per stage">
        <p className="muted-text">Total points: {points} · Trees: {treesToShow}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 12 }}>
          {trees.map((t, i) => (
            <div key={i}>
              <Tree points={t.points} pointsPerStage={pointsPerStage} maxStages={stagesPerTree} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default FarmPage;
