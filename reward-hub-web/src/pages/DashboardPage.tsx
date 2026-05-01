import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { CommentEntry, LeaderboardEntry, PointHistoryEntry } from '../types';
import { SectionCard, StatCard } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { profile, role, childProfile } = useAuth();
  const displayProfile = role === 'Parent' && childProfile ? childProfile : profile;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentHistory, setRecentHistory] = useState<PointHistoryEntry[]>([]);
  const [recentComments, setRecentComments] = useState<CommentEntry[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isManagementRole = role === 'Admin' || role === 'Teacher';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const leaderboardResult = await api.leaderboard();
        setLeaderboard(leaderboardResult);

        if (displayProfile?.userRole === 'Student') {
          const [history, comments] = await Promise.all([
            api.historyByStudent(displayProfile.userId),
            api.commentsByStudent(displayProfile.userId)
          ]);

          setRecentHistory(history.slice(0, 5));
          setRecentComments(comments.slice(0, 5));
          setStudentCount(0);
        } else if (role === 'Parent' && displayProfile) {
          const [history, comments] = await Promise.all([
            api.historyByStudent(displayProfile.userId),
            api.commentsByStudent(displayProfile.userId)
          ]);

          setRecentHistory(history.slice(0, 5));
          setRecentComments(comments.slice(0, 5));
          setStudentCount(0);
        } else if (isManagementRole) {
          const [history, comments, students] = await Promise.all([
            api.historyAll(),
            api.commentsAll(),
            api.students()
          ]);

          setRecentHistory(history.slice(0, 8));
          setRecentComments(comments.slice(0, 6));
          setStudentCount(students.length);
        } else {
          setRecentHistory([]);
          setRecentComments([]);
          setStudentCount(0);
        }
      } catch {
        setLeaderboard([]);
        setRecentHistory([]);
        setRecentComments([]);
        setStudentCount(0);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [displayProfile, isManagementRole, role]);

  return (
    <div className="stacked-layout">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Everything you need to monitor Reward Hub activity.</h2>
          <p>
            {displayProfile ? `Logged in as ${displayProfile.username}.` : 'Loading profile data.'} The current role is {role ?? 'unknown'}.
          </p>
        </div>

        <div className="stats-grid">
          <StatCard label="Points" value={displayProfile?.points ?? 0} tone="success" />
          <StatCard label="Level" value={displayProfile?.level ?? 'No level'} tone="accent" />
          <StatCard label="Class" value={displayProfile?.className ?? 'No class'} tone="warning" />
          {isManagementRole ? <StatCard label="Students" value={studentCount} tone="default" /> : null}
        </div>
      </section>

      <div className="dashboard-grid">
        <SectionCard title={role === 'Parent' ? 'Child Ranking Context' : 'Top Students'} subtitle={role === 'Parent' ? 'How your child compares in the leaderboard' : 'Live leaderboard from the API'}>
          <div className="compact-list">
            {leaderboard.slice(0, 5).map((item, index) => (
              <div key={`${item.username}-${index}`} className="list-row">
                <div>
                  <strong>#{index + 1} {item.username}</strong>
                  <p>{item.levelName ?? 'No level'} {item.classId !== null && item.classId !== undefined ? `· Class ${item.classId}` : ''}</p>
                </div>
                <span>{item.points} pts</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={displayProfile?.userRole === 'Student' ? 'My Comments' : role === 'Parent' ? 'Child Comments' : 'Recent Comments'} subtitle={displayProfile?.userRole === 'Student' ? 'Comments linked to your account' : role === 'Parent' ? 'Comments linked to your child' : 'Latest comments across the system'}>
          {recentComments.length ? (
            <div className="compact-list">
              {recentComments.map((item) => (
                <div key={item.commentId} className="comment-card">
                  <div>
                    <strong>{item.authorName}</strong>
                    <p>{item.targetStudentName ?? 'Unknown target'} · {new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <span>{item.content}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-text">No comments available.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Recent Activity" subtitle={role === 'Parent' ? 'Your child point history' : displayProfile?.userRole === 'Student' ? 'Your point history' : 'System point history'}>
        {recentHistory.length ? (
          <div className="compact-list">
            {recentHistory.map((item) => (
              <div key={item.historyId} className="list-row">
                <div>
                  <strong>{item.reason}</strong>
                  <p>{item.teacherName} · {new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span className={item.amount >= 0 ? 'positive' : 'negative'}>{item.amount >= 0 ? `+${item.amount}` : item.amount}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted-text">No personal history loaded for this role.</p>
        )}
      </SectionCard>
    </div>
  );
}
