import { useEffect, useState } from 'react';
import { SectionCard } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { CommentEntry } from '../types';

const treeStages = [
  {
    title: 'Seed',
    subtitle: 'The first roots appear.',
    crown: 'tree-stage--seed',
    fruits: 0
  },
  {
    title: 'Sprout',
    subtitle: 'Leaves are starting to show.',
    crown: 'tree-stage--sprout',
    fruits: 1
  },
  {
    title: 'Young Tree',
    subtitle: 'Branches stretch higher.',
    crown: 'tree-stage--young',
    fruits: 3
  },
  {
    title: 'Fruitful Tree',
    subtitle: 'The canopy is full and thriving.',
    crown: 'tree-stage--fruitful',
    fruits: 6
  }
];

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

const treeLeafLayouts: TreeLeaf[][] = [
  [
    { left: 42, top: 18, size: 0.78, rotate: -16, delay: 0 },
    { left: 55, top: 16, size: 0.72, rotate: 12, delay: 0.04 },
    { left: 35, top: 30, size: 0.58, rotate: 22, delay: 0.08 },
    { left: 62, top: 30, size: 0.56, rotate: -10, delay: 0.12 }
  ],
  [
    { left: 36, top: 16, size: 0.92, rotate: -18, delay: 0 },
    { left: 48, top: 12, size: 0.86, rotate: 8, delay: 0.04 },
    { left: 61, top: 15, size: 0.78, rotate: 18, delay: 0.08 },
    { left: 30, top: 27, size: 0.68, rotate: 14, delay: 0.12 },
    { left: 42, top: 31, size: 0.62, rotate: -12, delay: 0.16 },
    { left: 55, top: 29, size: 0.66, rotate: 10, delay: 0.2 },
    { left: 69, top: 28, size: 0.58, rotate: 20, delay: 0.24 }
  ],
  [
    { left: 32, top: 12, size: 1.02, rotate: -18, delay: 0 },
    { left: 44, top: 9, size: 0.96, rotate: 4, delay: 0.04 },
    { left: 56, top: 11, size: 0.9, rotate: 16, delay: 0.08 },
    { left: 68, top: 16, size: 0.84, rotate: 22, delay: 0.12 },
    { left: 27, top: 24, size: 0.76, rotate: -10, delay: 0.16 },
    { left: 39, top: 27, size: 0.74, rotate: 18, delay: 0.2 },
    { left: 51, top: 25, size: 0.8, rotate: -14, delay: 0.24 },
    { left: 63, top: 28, size: 0.72, rotate: 12, delay: 0.28 },
    { left: 74, top: 32, size: 0.66, rotate: -16, delay: 0.32 },
    { left: 34, top: 36, size: 0.62, rotate: 20, delay: 0.36 }
  ],
  [
    { left: 30, top: 10, size: 1.1, rotate: -18, delay: 0 },
    { left: 41, top: 8, size: 1.04, rotate: 4, delay: 0.04 },
    { left: 52, top: 10, size: 0.98, rotate: 16, delay: 0.08 },
    { left: 64, top: 13, size: 0.92, rotate: 22, delay: 0.12 },
    { left: 75, top: 18, size: 0.82, rotate: -10, delay: 0.16 },
    { left: 24, top: 22, size: 0.82, rotate: 14, delay: 0.2 },
    { left: 36, top: 24, size: 0.78, rotate: -16, delay: 0.24 },
    { left: 48, top: 23, size: 0.9, rotate: 8, delay: 0.28 },
    { left: 60, top: 25, size: 0.8, rotate: -12, delay: 0.32 },
    { left: 72, top: 28, size: 0.74, rotate: 12, delay: 0.36 },
    { left: 31, top: 34, size: 0.7, rotate: 20, delay: 0.4 },
    { left: 45, top: 36, size: 0.66, rotate: -8, delay: 0.44 },
    { left: 58, top: 34, size: 0.68, rotate: 18, delay: 0.48 },
    { left: 70, top: 36, size: 0.62, rotate: -14, delay: 0.52 }
  ]
];

function getTreeGrowth(level: string | null, points: number) {
  const normalizedLevel = normalizeLevel(level);
  const levelOrder = ['starter', 'bronze', 'silver', 'gold', 'platinum'];
  const levelIndex = levelOrder.findIndex((item) => item === normalizedLevel);
  const stage = Math.min(treeStages.length - 1, Math.max(0, levelIndex)); // Stage based on level
  
  // Points determine growth progress within current level
  const pointThresholds = [110, 220, 360, 520]; // Points per level
  const levelThreshold = pointThresholds[stage] || 520;
  const prevThreshold = stage > 0 ? pointThresholds[stage - 1] : 0;
  const pointsProgress = Math.min(1, Math.max(0, (points - prevThreshold) / (levelThreshold - prevThreshold)));
  const growth = 0.1 + pointsProgress * 0.9;
  const scale = 0.78 + pointsProgress * 0.58;
  const baseFruitCount = [0, 2, 4, 8][stage];
  const fruitCount = stage === 0 ? 0 : Math.min(12, baseFruitCount + Math.floor(pointsProgress * 2));

  return {
    stage: treeStages[stage],
    growth,
    scale,
    fruitCount
  };
}

function TreeVisualizer({ level, points }: { level: string | null; points: number }) {
  const tree = getTreeGrowth(level, points);

  return (
    <div className="tree-visualizer">
      <div className="tree-visualizer__header">
        <div>
          <p className="eyebrow">Growth Tree</p>
          <h3>{tree.stage.title}</h3>
        </div>
        <span className="badge subtle">{points} pts</span>
      </div>

      <div
        className={`tree-scene ${tree.stage.crown}`}
        style={{
          ['--tree-scale' as string]: tree.scale,
          ['--tree-growth' as string]: tree.growth
        }}
      >
        <div className="tree-orbit tree-orbit--left" />
        <div className="tree-orbit tree-orbit--right" />

        <div className="tree-canopy">
          {treeLeafLayouts[tree.stage === treeStages[0] ? 0 : tree.stage === treeStages[1] ? 1 : tree.stage === treeStages[2] ? 2 : 3].map((leaf, index) => (
            <span
              key={index}
              className="tree-leaf"
              style={{
                left: `${leaf.left}%`,
                top: `${leaf.top}%`,
                width: `${leaf.size * 58}px`,
                height: `${leaf.size * 44}px`,
                transform: `translate(-50%, -50%) rotate(${leaf.rotate}deg)`,
                animationDelay: `${leaf.delay}s`
              }}
            />
          ))}
          {Array.from({ length: tree.fruitCount }).map((_, index) => (
            <span key={index} className="tree-fruit" style={{ ['--fruit-delay' as string]: `${index * 0.08}s` }} />
          ))}
        </div>

        <div className="tree-trunk">
          <span className="tree-branch tree-branch--left" />
          <span className="tree-branch tree-branch--right" />
          <span className="tree-root tree-root--left" />
          <span className="tree-root tree-root--right" />
        </div>

        <div className="tree-soil" />
      </div>

      <div className="tree-visualizer__footer">
        <div>
          <strong>{tree.stage.subtitle}</strong>
          <p>
            Level: {level ?? 'No level'}
          </p>
        </div>
        <span className="badge">{tree.fruitCount} fruits</span>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { profile, role, childProfile, logout } = useAuth();
  const isParent = role === 'Parent';
  const visibleProfile = isParent && childProfile ? childProfile : profile;
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      if (!isParent || !childProfile) {
        setComments([]);
        return;
      }

      setLoadingComments(true);
      try {
        const childComments = await api.commentsByStudent(childProfile.userId);
        setComments(childComments.slice(0, 6));
      } catch {
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    void loadComments();
  }, [isParent, childProfile]);

  return (
    <div className="stacked-layout">
      <SectionCard
        title={isParent ? 'Child Profile' : 'Profile'}
        subtitle={isParent ? 'Points, level, and comments for your child' : 'Current authenticated user information'}
      >
        {visibleProfile ? (
          <div className="profile-layout">
            <div className="profile-card profile-card--summary">
              <div className="profile-row"><span>User</span><strong>{visibleProfile.username}</strong></div>
              <div className="profile-row"><span>Email</span><strong>{visibleProfile.email}</strong></div>
              <div className="profile-row"><span>Role</span><strong>{visibleProfile.userRole ?? role ?? 'Unknown'}</strong></div>
              <div className="profile-row"><span>Level</span><strong>{visibleProfile.level ?? 'No level'}</strong></div>
              <div className="profile-row"><span>Class</span><strong>{visibleProfile.className ?? 'No class'}</strong></div>
              <div className="profile-row"><span>Points</span><strong>{visibleProfile.points}</strong></div>
            </div>


          </div>
        ) : (
          <p className="muted-text">Profile data is unavailable.</p>
        )}

        <div className="profile-actions">
          <button type="button" className="ghost-button" onClick={logout}>
            Logout
          </button>
        </div>
      </SectionCard>

      {!isParent ? (
        <SectionCard title="Change Password" subtitle="Update your account password">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPasswordMessage(null);
              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
                return;
              }
              if (passwordForm.newPassword.length < 8) {
                setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
                return;
              }
              setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }}
            className="password-form"
          >
            <label>
              <span>Current Password</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter your current password"
                required
              />
            </label>
            <label>
              <span>New Password</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
                required
              />
            </label>
            <label>
              <span>Confirm New Password</span>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </label>
            {passwordMessage && (
              <p className={passwordMessage.type === 'success' ? 'form-success' : 'form-error'} style={{ margin: 0 }}>
                {passwordMessage.text}
              </p>
            )}
            <button type="submit" className="primary-button password-submit">
              Update Password
            </button>
          </form>
        </SectionCard>
      ) : null}

      {isParent ? (
        <SectionCard title="Child Comments" subtitle="The latest comments for your child">
          {loadingComments ? <p className="muted-text">Loading comments...</p> : null}
          <div className="compact-list">
            {comments.map((item) => (
              <div key={item.commentId} className="comment-card">
                <div>
                  <strong>{item.authorName}</strong>
                  <p>{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span>{item.content}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
