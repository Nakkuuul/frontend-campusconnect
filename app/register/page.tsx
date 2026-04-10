'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MapPin, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { authService } from '../../lib/services/auth.service';

const ENROLLMENT_REGEX = /^[A-Z]\d{2}[A-Z]+[A-Z]\d{4}$/;
const NAME_REGEX       = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
const EMAIL_DOMAIN     = '@bennett.edu.in';

function validate(field: string, value: string): string {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Full name is required.';
      if (!NAME_REGEX.test(value.trim())) return 'Enter your full name (first and last name, letters only).';
      return '';
    case 'enrollment':
      if (!value.trim()) return 'Enrollment number is required.';
      if (!ENROLLMENT_REGEX.test(value.trim())) return 'Format must be like S24CSEU0193.';
      return '';
    case 'email':
      if (!value.trim()) return 'University email is required.';
      if (!value.toLowerCase().endsWith(EMAIL_DOMAIN)) return 'Must be a @bennett.edu.in address.';
      if (!/^[^\s@]+@bennett\.edu\.in$/.test(value.toLowerCase())) return 'Enter a valid @bennett.edu.in email address.';
      return '';
    case 'password':
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters.';
      return '';
    default:
      return '';
  }
}

const errorStyle: React.CSSProperties = { fontSize: 11, color: '#e53935', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 };
const hintStyle: React.CSSProperties  = { fontSize: 11, color: 'var(--text-muted)', marginTop: 5 };

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass]         = useState(false);
  const [step, setStep]                 = useState(1);
  const [loading, setLoading]           = useState(false);
  const [apiError, setApiError]         = useState('');
  const [form, setForm]                 = useState({ name: '', email: '', enrollment: '', password: '', role: 'student' });
  const [touched, setTouched]           = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors: Record<string, string> = {
    name:       validate('name',       form.name),
    enrollment: validate('enrollment', form.enrollment),
    email:      validate('email',      form.email),
    password:   validate('password',   form.password),
  };

  const showError = (field: string) => (touched[field] || submitAttempted) && errors[field];
  const handleBlur = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (errors.name || errors.enrollment) return;
    setSubmitAttempted(false);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (errors.email || errors.password) return;
    setLoading(true);
    setApiError('');
    try {
      await authService.register({
        name:       form.name,
        email:      form.email,
        enrollment: form.enrollment,
        password:   form.password,
        role:       form.role as 'student' | 'faculty' | 'staff',
      });
      setStep(3);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 16 }}>
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      {showError(id)
        ? <p style={errorStyle}><span style={{ fontSize: 13 }}>⚠</span> {errors[id]}</p>
        : hint ? <p style={hintStyle}>{hint}</p> : null}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(34,211,165,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="animate-fadeUp" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MapPin size={24} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Join the CampusConnect community</p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />
            ))}
          </div>
        )}

        <div className="card" style={{ padding: 32 }}>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleStep1} noValidate>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Personal Info</h3>

              <Field id="name" label="Full Name" hint="Enter your first and last name.">
                <input id="name" className="input" type="text" placeholder="Nakul Thakur"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onBlur={() => handleBlur('name')}
                  style={{ width: '100%', borderColor: showError('name') ? '#e53935' : undefined }} />
              </Field>

              <Field id="enrollment" label="Enrollment Number" hint="Format: S24CSEU0193">
                <input id="enrollment" className="input" type="text" placeholder="S24CSEU0193"
                  value={form.enrollment}
                  onChange={e => setForm(f => ({ ...f, enrollment: e.target.value.toUpperCase() }))}
                  onBlur={() => handleBlur('enrollment')}
                  style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '0.04em', borderColor: showError('enrollment') ? '#e53935' : undefined }} />
              </Field>

              <div style={{ marginBottom: 24 }}>
                <label className="label" htmlFor="role">Role</label>
                <select id="role" className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ width: '100%' }}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Administrative Staff</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Continue <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Account Setup</h3>

              {/* API-level error (e.g. email already exists) */}
              {apiError && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#f87171' }}>
                  {apiError}
                </div>
              )}

              <Field id="email" label="University Email" hint="Must be your @bennett.edu.in address.">
                <input id="email" className="input" type="email" placeholder="you@bennett.edu.in"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  onBlur={() => handleBlur('email')}
                  style={{ width: '100%', borderColor: showError('email') ? '#e53935' : undefined }} />
              </Field>

              <Field id="password" label="Password">
                <div style={{ position: 'relative' }}>
                  <input id="password" className="input" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    onBlur={() => handleBlur('password')}
                    style={{ width: '100%', paddingRight: 44, borderColor: showError('password') ? '#e53935' : undefined }}
                    minLength={8} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
                  </button>
                </div>
              </Field>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => { setSubmitAttempted(false); setApiError(''); setStep(1); }} style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
                  {loading ? 'Creating…' : 'Create account'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="animate-float" style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,211,165,0.12)', border: '1px solid rgba(34,211,165,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={30} color="var(--accent-2)" />
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>You're in!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Account created. You're now signed in.</p>
              <Link href="/dashboard" className="btn-primary" style={{ justifyContent: 'center', padding: '12px 28px' }}>
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {step < 3 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}