import { useEffect, useState } from 'react';
import { SectionCard } from '../components/ui';
import { api } from '../lib/api';
import type { LeaderboardEntry } from '../types';

export function LeaderboardPage() {
  const [items, setItems] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.leaderboard();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <SectionCard title="Leaderboard" subtitle="Top 10 students from the live API">
      {loading ? <p className="muted-text">Loading leaderboard...</p> : null}
      {error ? <div className="form-error">{error}</div> : null}
      <div className="leaderboard-grid">
        {items.map((item, index) => (
          <article key={`${item.username}-${index}`} className="leaderboard-card">
            <div className="rank-pill">#{index + 1}</div>
            <h3>{item.username}</h3>
            <p>{item.levelName ?? 'No level'}</p>
            <strong>{item.points} points</strong>
            <span>{item.classId !== null && item.classId !== undefined ? `Class ${item.classId}` : 'No class'}</span>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
