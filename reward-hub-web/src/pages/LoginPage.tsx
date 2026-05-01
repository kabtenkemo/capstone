import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-panel hero-panel">
        <div className="hero-copy">
          <h1>Track class progress with fewer clicks and clearer roles.</h1>
          <p>
            Manage student points, comments, and progress tracking all in one place.
          </p>
          <div className="hero-features">
            <span>Role aware</span>
            <span>Class filtering</span>
            <span>Parent child view</span>
          </div>
        </div>
      </section>

      <section className="auth-panel form-panel">
        <div className="panel-head">
          <h2>Login to continue</h2>
          <p>Use one of the demo accounts on the left or your own database credentials.</p>
        </div>

        <form className="form-stack" onSubmit={submit}>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required />
          </label>

          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </div>
  );
}
