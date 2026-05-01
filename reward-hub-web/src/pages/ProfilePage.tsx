import { useEffect, useState } from 'react';
import { SectionCard } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { CommentEntry } from '../types';

export function ProfilePage() {
  const { profile, role, childProfile, logout } = useAuth();
  const isParent = role === 'Parent';
  const visibleProfile = isParent && childProfile ? childProfile : profile;
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

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
          <div className="profile-card">
            <div className="profile-row"><span>User</span><strong>{visibleProfile.username}</strong></div>
            <div className="profile-row"><span>Email</span><strong>{visibleProfile.email}</strong></div>
            <div className="profile-row"><span>Role</span><strong>{visibleProfile.userRole ?? role ?? 'Unknown'}</strong></div>
            <div className="profile-row"><span>Level</span><strong>{visibleProfile.level ?? 'No level'}</strong></div>
            <div className="profile-row"><span>Class</span><strong>{visibleProfile.className ?? 'No class'}</strong></div>
            <div className="profile-row"><span>Points</span><strong>{visibleProfile.points}</strong></div>
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
