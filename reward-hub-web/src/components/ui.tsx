import type { ReactNode } from 'react';
import { useEffect, useState, useRef } from 'react';

export function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="section-card">
      <div className="section-card__head">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'accent' | 'success' | 'warning' }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef<string | number>(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className={`stat-card ${tone} ${isAnimating ? 'points-update-glow' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
