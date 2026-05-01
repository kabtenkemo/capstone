import { FormEvent, useEffect, useState } from 'react';
import { SectionCard } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { CommentEntry, StudentOption } from '../types';

export function CommentsPage() {
  const { profile, role, childProfile } = useAuth();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [globalComments, setGlobalComments] = useState<CommentEntry[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const list = await api.students();
        setStudents(list);
      } catch {
        setStudents([]);
      }
    };

    void loadStudents();
  }, []);

  useEffect(() => {
    if (students.length === 0) {
      return;
    }

    const defaultClassId = role === 'Parent' && childProfile
      ? students.find((student) => student.userId === childProfile.userId)?.classId?.toString() ?? ''
      : profile
        ? students.find((student) => student.userId === profile.userId)?.classId?.toString() ?? ''
        : '';

    if (!selectedClassId && defaultClassId) {
      setSelectedClassId(defaultClassId);
    }
  }, [students, role, profile, childProfile, selectedClassId]);

  const classOptions = Array.from(
    new Map(
      students
        .filter((student) => student.classId !== null)
        .map((student) => [student.classId as number, student.className ?? `Class ${student.classId}`])
    ).entries()
  ).map(([classId, className]) => ({ classId, className }));

  const visibleStudents = selectedClassId
    ? students.filter((student) => String(student.classId ?? '') === selectedClassId)
    : students;

  useEffect(() => {
    if (visibleStudents.length === 0) {
      setTargetUserId('');
      return;
    }

    if (!visibleStudents.some((student) => String(student.userId) === targetUserId)) {
      setTargetUserId(String(visibleStudents[0].userId));
    }
  }, [visibleStudents, targetUserId]);

  const refresh = async (studentId: number) => {
    setDataLoading(true);

    try {
      const [studentComments, allComments] = await Promise.all([
        api.commentsByStudent(studentId),
        api.commentsAll().catch(() => [])
      ]);

      setComments(studentComments);
      setGlobalComments(allComments);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!targetUserId) {
      return;
    }

    void refresh(Number(targetUserId)).catch((err) => {
      setError(err instanceof Error ? err.message : 'Could not load comments');
      setDataLoading(false);
    });
  }, [targetUserId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const payload = { targetUserId: Number(targetUserId), content };
      await api.addComment(payload);
      setMessage('Comment added successfully');
      await refresh(payload.targetUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stacked-layout">
      <SectionCard
        title="Comments"
        subtitle="Add comments and inspect student note history"
      >
        <form className="form-stack" onSubmit={submit}>
          <label>
            <span>Class</span>
            <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
              <option value="">All classes</option>
              {classOptions.map((classOption) => (
                <option key={classOption.classId} value={String(classOption.classId)}>
                  {classOption.className}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Student</span>
            <select value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)} required>
              <option value="" disabled>Select a student</option>
              {visibleStudents.map((student) => (
                <option key={student.userId} value={student.userId}>
                  {student.username}{student.className ? ` - ${student.className}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Comment</span>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} required />
          </label>

          {error ? <div className="form-error">{error}</div> : null}
          {message ? <div className="form-success">{message}</div> : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Saving...' : 'Add comment'}
          </button>
        </form>
      </SectionCard>

      <div className="dashboard-grid">
        <SectionCard title="Student Comments" subtitle="Filtered by the selected user">
          {dataLoading ? <p className="muted-text">Loading comments...</p> : null}
          <div className="compact-list">
            {comments.map((item) => (
              <div key={item.commentId} className="comment-card">
                <div>
                  <strong>{item.authorName}</strong>
                  <p>{item.authorRole ?? 'Unknown role'} · {new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span>{item.content}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Comments" subtitle="Global comments feed">
          {dataLoading ? <p className="muted-text">Loading comments feed...</p> : null}
          <div className="compact-list">
            {globalComments.slice(0, 6).map((item) => (
              <div key={item.commentId} className="comment-card">
                <div>
                  <strong>{item.authorName}</strong>
                  <p>{item.targetStudentName ?? 'Unknown target'} · {new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span>{item.content}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
