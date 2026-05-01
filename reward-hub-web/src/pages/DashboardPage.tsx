import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { CommentEntry, LeaderboardEntry, PointHistoryEntry, StudentOption } from '../types';
import { SectionCard, StatCard } from '../components/ui';
import { useAuth } from '../context/AuthContext';

function normalizeLevel(level: string | null) {
  return (level ?? '').trim().toLowerCase();
}

type TreeLeaf = {
  left: number;
  top: number;
  size: number;
  rotate: number;
  delay: number;
};

const miniLeafLayouts: TreeLeaf[][] = [
  [
    { left: 43, top: 16, size: 0.72, rotate: -16, delay: 0 },
    { left: 55, top: 18, size: 0.66, rotate: 14, delay: 0.05 },
    { left: 35, top: 28, size: 0.58, rotate: 20, delay: 0.1 },
    { left: 63, top: 30, size: 0.54, rotate: -8, delay: 0.15 }
  ],
  [
    { left: 40, top: 14, size: 0.86, rotate: -18, delay: 0 },
    { left: 52, top: 11, size: 0.78, rotate: 8, delay: 0.05 },
    { left: 63, top: 18, size: 0.66, rotate: 16, delay: 0.1 },
    { left: 32, top: 26, size: 0.6, rotate: 22, delay: 0.15 },
    { left: 49, top: 32, size: 0.56, rotate: -12, delay: 0.2 },
    { left: 67, top: 30, size: 0.52, rotate: 18, delay: 0.25 }
  ],
  [
    { left: 37, top: 12, size: 0.96, rotate: -14, delay: 0 },
    { left: 49, top: 10, size: 0.9, rotate: 6, delay: 0.05 },
    { left: 61, top: 14, size: 0.82, rotate: 18, delay: 0.1 },
    { left: 29, top: 22, size: 0.68, rotate: 22, delay: 0.15 },
    { left: 42, top: 26, size: 0.66, rotate: -18, delay: 0.2 },
    { left: 55, top: 25, size: 0.7, rotate: 10, delay: 0.25 },
    { left: 69, top: 24, size: 0.62, rotate: 20, delay: 0.3 },
    { left: 34, top: 33, size: 0.58, rotate: 14, delay: 0.35 },
    { left: 58, top: 34, size: 0.56, rotate: -8, delay: 0.4 }
  ],
  [
    { left: 34, top: 10, size: 1.08, rotate: -16, delay: 0 },
    { left: 46, top: 8, size: 1.02, rotate: 4, delay: 0.05 },
    { left: 58, top: 10, size: 0.94, rotate: 16, delay: 0.1 },
    { left: 69, top: 15, size: 0.86, rotate: 20, delay: 0.15 },
    { left: 27, top: 20, size: 0.82, rotate: -10, delay: 0.2 },
    { left: 39, top: 23, size: 0.76, rotate: 18, delay: 0.25 },
    { left: 50, top: 22, size: 0.86, rotate: -12, delay: 0.3 },
    { left: 63, top: 24, size: 0.74, rotate: 14, delay: 0.35 },
    { left: 76, top: 28, size: 0.68, rotate: -18, delay: 0.4 },
    { left: 31, top: 31, size: 0.64, rotate: 22, delay: 0.45 },
    { left: 46, top: 34, size: 0.62, rotate: -6, delay: 0.5 },
    { left: 59, top: 33, size: 0.66, rotate: 16, delay: 0.55 }
  ]
];

function getStudentProgress(level: string | null, points: number) {
  const order = ['starter', 'bronze', 'silver', 'gold', 'platinum'];
  const index = order.findIndex((item) => item === normalizeLevel(level));
  const stage = Math.min(3, Math.max(0, index)); // Stage based on level
  const labels = ['Seed', 'Sprout', 'Young Tree', 'Fruitful Tree'];
  
  // Points determine progress within current level (0-100%)
  const pointThresholds = [110, 220, 360, 520]; // Points needed per level
  const levelThreshold = pointThresholds[stage] || 520;
  const prevThreshold = stage > 0 ? pointThresholds[stage - 1] : 0;
  const pointsProgress = Math.min(1, Math.max(0, (points - prevThreshold) / (levelThreshold - prevThreshold)));
  const percent = Math.round(8 + pointsProgress * 92);

  return {
    stage,
    label: labels[stage],
    fruits: [0, 2, 4, 8][stage],
    percent,
    scale: 0.78 + pointsProgress * 0.56
  };
}

function TreeMini({ level, points }: { level: string | null; points: number }) {
  const progress = getStudentProgress(level, points);

  return (
    <div className="tree-mini">
      <div className="tree-mini__header">
        <div>
          <p className="eyebrow">Student Mode</p>
          <h3>{progress.label}</h3>
        </div>
        <span className="badge subtle">{points} pts</span>
      </div>

      <div className={`tree-mini__scene tree-mini__scene--${progress.stage}`}>
        <div className="tree-mini__sky" />
        <div className="tree-mini__tree" style={{ ['--tree-scale' as string]: progress.scale }}>
          <span className="tree-mini__branch tree-mini__branch--left" />
          <span className="tree-mini__branch tree-mini__branch--right" />
          <span className="tree-mini__branch tree-mini__branch--top" />
          {miniLeafLayouts[progress.stage].map((leaf, index) => (
            <span
              key={index}
              className="tree-mini__leaf"
              style={{
                left: `${leaf.left}%`,
                top: `${leaf.top}%`,
                width: `${leaf.size * 46}px`,
                height: `${leaf.size * 34}px`,
                transform: `translate(-50%, -50%) rotate(${leaf.rotate}deg)`,
                animationDelay: `${leaf.delay}s`
              }}
            />
          ))}
        </div>
        <div className="tree-mini__fruits">
          {Array.from({ length: progress.fruits }).map((_, index) => (
            <span key={index} className="tree-mini__fruit" />
          ))}
        </div>
      </div>

      <div className="tree-mini__footer">
        <div className="tree-mini__bar">
          <span style={{ width: `${progress.percent}%` }} />
        </div>
        <p>{progress.percent}% to the next growth stage</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { profile, role, childProfile } = useAuth();
  const displayProfile = role === 'Parent' && childProfile ? childProfile : profile;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentHistory, setRecentHistory] = useState<PointHistoryEntry[]>([]);
  const [recentComments, setRecentComments] = useState<CommentEntry[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = role === 'Admin';
  const isTeacher = role === 'Teacher';
  const isManagementRole = isAdmin || isTeacher;
  const isStudent = displayProfile?.userRole === 'Student';
  const isParent = role === 'Parent';

  const classOptions = Array.from(
    new Map(
      students
        .filter((student) => student.classId !== null)
        .map((student) => [student.classId as number, student.className ?? `Class ${student.classId}`])
    ).entries()
  ).map(([classId, className]) => ({ classId, className }));

  const classLabel = classFilter ? classOptions.find((classOption) => String(classOption.classId) === classFilter)?.className ?? 'Selected class' : 'All classes';

  const visibleStudents = classFilter
    ? students.filter((student) => String(student.classId ?? '') === classFilter)
    : students;

  const visibleLeaderboard = classFilter
    ? leaderboard.filter((item) => String(item.classId ?? '') === classFilter)
    : leaderboard;

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const leaderboardResult = await api.leaderboard();
        setLeaderboard(leaderboardResult);

        if (isStudent && displayProfile) {
          const [history, comments] = await Promise.all([
            api.historyByStudent(displayProfile.userId),
            api.commentsByStudent(displayProfile.userId)
          ]);

          setRecentHistory(history.slice(0, 5));
          setRecentComments(comments.slice(0, 5));
          setStudentCount(0);
          setStudents([]);
          return;
        }

        if (isParent && displayProfile) {
          const [history, comments] = await Promise.all([
            api.historyByStudent(displayProfile.userId),
            api.commentsByStudent(displayProfile.userId)
          ]);

          setRecentHistory(history.slice(0, 5));
          setRecentComments(comments.slice(0, 5));
          setStudentCount(0);
          setStudents([]);
          return;
        }

        if (isManagementRole) {
          const [studentsResult] = await Promise.all([api.students()]);
          setStudents(studentsResult);
          setStudentCount(studentsResult.length);

          if (isTeacher && classFilter) {
            const [history, comments] = await Promise.all([
              api.historyByClass(Number(classFilter)),
              api.commentsByClass(Number(classFilter))
            ]);

            setRecentHistory(history.slice(0, 8));
            setRecentComments(comments.slice(0, 6));
          } else {
            const [history, comments] = await Promise.all([
              api.historyAll(),
              api.commentsAll()
            ]);

            setRecentHistory(history.slice(0, 8));
            setRecentComments(comments.slice(0, 6));
          }
          return;
        }

        setRecentHistory([]);
        setRecentComments([]);
        setStudents([]);
        setStudentCount(0);
      } catch {
        setLeaderboard([]);
        setRecentHistory([]);
        setRecentComments([]);
        setStudents([]);
        setStudentCount(0);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [classFilter, displayProfile, isManagementRole, isParent, isStudent]);

  useEffect(() => {
    if (isTeacher && !classFilter && classOptions.length > 0) {
      setClassFilter(String(classOptions[0].classId));
    }
  }, [classFilter, classOptions, isTeacher]);

  const visiblePoints = visibleLeaderboard.reduce((sum, item) => sum + item.points, 0);

  // Simple inline SVG chart helpers (no external deps)
  function MiniBarChart({ data, height = 120 }: { data: number[]; height?: number }) {
    const max = Math.max(...data, 1);
    const barWidth = 100 / data.length;
    return (
      <svg viewBox={`0 0 100 ${height}`} width="100%" height={height} preserveAspectRatio="none">
        {data.map((value, i) => {
          const h = (value / max) * (height - 20);
          return (
            <rect
              key={i}
              x={`${i * barWidth + 2}%`}
              y={height - h}
              width={`${barWidth - 4}%`}
              height={h}
              rx={4}
              fill="#d62828"
              opacity={0.9}
            />
          );
        })}
      </svg>
    );
  }

  function MiniLineChart({ points, height = 120 }: { points: number[]; height?: number }) {
    const max = Math.max(...points, 1);
    const step = 100 / Math.max(points.length - 1, 1);
    const path = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - (p / max) * (height - 20)}`)
      .join(' ');

    return (
      <svg viewBox={`0 0 100 ${height}`} width="100%" height={height} preserveAspectRatio="none">
        <path d={path} fill="none" stroke="#2b8a3e" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <div className="stacked-layout">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>
            {isAdmin ? 'School-wide analysis panel' : isTeacher ? 'Class analysis dashboard' : isParent ? 'Child overview dashboard' : 'Player progress dashboard'}
          </h2>
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

      {isManagementRole ? (
        <SectionCard
          title={isAdmin ? 'School Analysis' : 'Class Filter'}
          subtitle={isAdmin ? 'Overview of all students, classes, comments, and points' : 'Choose a class to inspect the full class dashboard'}
        >
          <div className="dashboard-filter-row">
            <label>
              <span>Class</span>
              <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                <option value="">All classes</option>
                {classOptions.map((classOption) => (
                  <option key={classOption.classId} value={String(classOption.classId)}>
                    {classOption.className}
                  </option>
                ))}
              </select>
            </label>

            <div className="dashboard-metric-strip">
              <div className="metric-chip">
                <span>Students</span>
                <strong>{classFilter ? visibleStudents.length : studentCount}</strong>
              </div>
              <div className="metric-chip">
                <span>Classes</span>
                <strong>{classOptions.length}</strong>
              </div>
              <div className="metric-chip">
                <span>Leaderboard</span>
                <strong>{visibleLeaderboard.length}</strong>
              </div>
              <div className="metric-chip">
                <span>Visible Points</span>
                <strong>{visiblePoints}</strong>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {isAdmin ? (
        <SectionCard title="Admin Analytics" subtitle="Quick visual summaries for administrators">
          <div className="analytics-grid">
            <div className="chart-card chart-card--points">
              <div className="chart-card__head">
                <div>
                  <p className="eyebrow">Top Students</p>
                  <h4>Points distribution</h4>
                </div>
                <span className="badge subtle">Top 5</span>
              </div>
              <MiniBarChart data={visibleLeaderboard.slice(0, 5).map((i) => i.points)} />
              <div className="chart-card__foot">
                {visibleLeaderboard.slice(0, 5).map((student, index) => (
                  <span key={student.username} className="chart-chip">
                    #{index + 1} {student.username}
                  </span>
                ))}
              </div>
            </div>

            <div className="chart-card chart-card--activity">
              <div className="chart-card__head">
                <div>
                  <p className="eyebrow">Activity</p>
                  <h4>Recent momentum</h4>
                </div>
                <span className="badge subtle">{recentHistory.length} records</span>
              </div>
              <MiniLineChart points={recentHistory.slice(0, 10).map((h) => Math.abs(h.amount))} />
              <div className="chart-card__foot">
                <span className="chart-summary">Incoming and outgoing point changes across the latest entries.</span>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {isStudent && displayProfile ? (
        <SectionCard title="Progress" subtitle="Your current points and level">
          <div className="stats-grid">
            <StatCard label="Points" value={displayProfile.points} tone="success" />
            <StatCard label="Level" value={displayProfile.level ?? 'No level'} tone="accent" />
            <StatCard label="Next goal" value={displayProfile.level ? 'Keep growing' : 'Get started'} tone="warning" />
          </div>
        </SectionCard>
      ) : null}

      {isParent && displayProfile ? (
        <SectionCard title="Child Profile" subtitle="Child name, points, level, and class">
          <div className="dashboard-parent-card">
            <div className="profile-card profile-card--summary">
              <div className="profile-row"><span>Child</span><strong>{displayProfile.username}</strong></div>
              <div className="profile-row"><span>Points</span><strong>{displayProfile.points}</strong></div>
              <div className="profile-row"><span>Level</span><strong>{displayProfile.level ?? 'No level'}</strong></div>
              <div className="profile-row"><span>Class</span><strong>{displayProfile.className ?? 'No class'}</strong></div>
            </div>

            <div className="dashboard-parent-card__notes">
              <StatCard label="Comments" value={recentComments.length} tone="accent" />
              <StatCard label="Recent history" value={recentHistory.length} tone="success" />
            </div>
          </div>
        </SectionCard>
      ) : null}

      <div className="dashboard-grid">
        <SectionCard
          title={isAdmin ? 'Top Students Across School' : isTeacher && classFilter ? `Filtered Ranking - ${classLabel}` : role === 'Parent' ? 'Child Ranking Context' : 'Top Students'}
          subtitle={isAdmin ? 'Live leaderboard for the full school' : isTeacher && classFilter ? 'Leaderboard items filtered to the selected class' : role === 'Parent' ? 'How your child compares in the leaderboard' : 'Live leaderboard from the API'}
        >
          <div className="compact-list">
            {visibleLeaderboard.slice(0, 5).map((item, index) => (
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

        <SectionCard
          title={isAdmin ? 'School Comments' : isTeacher && classFilter ? `Class Comments - ${classLabel}` : displayProfile?.userRole === 'Student' ? 'My Comments' : role === 'Parent' ? 'Child Comments' : 'Recent Comments'}
          subtitle={isAdmin ? 'Latest comments across the school' : isTeacher && classFilter ? 'Comments associated with the selected class' : displayProfile?.userRole === 'Student' ? 'Comments linked to your account' : role === 'Parent' ? 'Comments linked to your child' : 'Latest comments across the system'}
        >
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

      <SectionCard
        title={isAdmin ? 'School Activity' : isTeacher && classFilter ? `Class Activity - ${classLabel}` : 'Recent Activity'}
        subtitle={isAdmin ? 'System point history across the school' : isTeacher && classFilter ? 'Point history for the selected class' : role === 'Parent' ? 'Your child point history' : displayProfile?.userRole === 'Student' ? 'Your point history' : 'System point history'}
      >
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
