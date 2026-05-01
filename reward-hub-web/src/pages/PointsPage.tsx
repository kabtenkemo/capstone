import { FormEvent, useEffect, useState } from 'react';
import { SectionCard } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { PointHistoryEntry, StudentOption } from '../types';

export function PointsPage() {
  const { profile, role, childProfile } = useAuth();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'add' | 'deduct'>('add');
  const [history, setHistory] = useState<PointHistoryEntry[]>([]);
  const [allHistory, setAllHistory] = useState<PointHistoryEntry[]>([]);
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
    if (profile?.userId && !studentId) {
      if (role === 'Parent' && childProfile) {
        setStudentId(childProfile.userId.toString());
      } else {
        setStudentId(profile.userId.toString());
      }
    }
  }, [profile, role, childProfile, studentId]);

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
      setStudentId('');
      return;
    }

    if (!visibleStudents.some((student) => String(student.userId) === studentId)) {
      setStudentId(String(visibleStudents[0].userId));
    }
  }, [visibleStudents, studentId]);

  const refresh = async (targetStudentId: number) => {
    setDataLoading(true);

    try {
      const [studentHistory, globalHistory] = await Promise.all([
        api.historyByStudent(targetStudentId),
        api.historyAll().catch(() => [])
      ]);

      setHistory(studentHistory);
      setAllHistory(globalHistory);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) {
      return;
    }

    void refresh(Number(studentId)).catch((err) => {
      setError(err instanceof Error ? err.message : 'Could not load student history');
      setDataLoading(false);
    });
  }, [studentId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      setError('');
      const payload = {
        studentId: Number(studentId),
        amount: Number(amount),
        reason
      };

      if (action === 'add') {
        await api.addPoints(payload);
        setMessage('Points added successfully');
      } else {
        await api.deductPoints(payload);
        setMessage('Points deducted successfully');
      }

      await refresh(payload.studentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stacked-layout">
      <SectionCard
        title="Manage Points"
        subtitle="Add or deduct points using the backend PointRequest model"
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
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)} required>
              <option value="" disabled>Select a student</option>
              {visibleStudents.map((student) => (
                <option key={student.userId} value={student.userId}>
                  {student.username}{student.className ? ` - ${student.className}` : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="two-columns">
            <label>
              <span>Amount</span>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" required />
            </label>

            <label>
              <span>Action</span>
              <div className="segmented-control">
                <button type="button" className={action === 'add' ? 'segmented active' : 'segmented'} onClick={() => setAction('add')}>
                  Add
                </button>
                <button type="button" className={action === 'deduct' ? 'segmented active' : 'segmented'} onClick={() => setAction('deduct')}>
                  Deduct
                </button>
              </div>
            </label>
          </div>

          <label>
            <span>Reason</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} required />
          </label>

          {error ? <div className="form-error">{error}</div> : null}
          {message ? <div className="form-success">{message}</div> : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Saving...' : action === 'add' ? 'Submit add request' : 'Submit deduct request'}
          </button>
        </form>
      </SectionCard>

      <div className="dashboard-grid">
        <SectionCard title="Student History" subtitle="History for the selected student">
          {dataLoading ? <p className="muted-text">Loading history...</p> : null}
          <div className="compact-list">
            {history.map((item) => (
              <div key={item.historyId} className="list-row">
                <div>
                  <strong>{item.reason}</strong>
                  <p>{item.teacherName} · {new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span className={item.amount >= 0 ? 'positive' : 'negative'}>{item.amount >= 0 ? `+${item.amount}` : item.amount}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Latest Activity" subtitle="Global history endpoint">
          {dataLoading ? <p className="muted-text">Loading activity...</p> : null}
          <div className="compact-list">
            {allHistory.slice(0, 6).map((item) => (
              <div key={item.historyId} className="list-row">
                <div>
                  <strong>{item.reason}</strong>
                  <p>{item.teacherName} · {new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span className={item.amount >= 0 ? 'positive' : 'negative'}>{item.amount >= 0 ? `+${item.amount}` : item.amount}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
