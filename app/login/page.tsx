'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MapPin, Eye, EyeOff, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../lib/services/auth.service';

const EMAIL_REGEX = /^[^\s@]+@bennett\.edu\.in$/i;

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass]           = useState(false);
  const [form, setForm]                   = useState({ email: '', password: '' });
  const [touched, setTouched]             = useState({ email: false, password: false });
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [error, setError]                 = useState('');
  const [shake, setShake]                 = useState(false);
  const [rememberMe, setRememberMe]       = useState(false);

  // Email not verified state
  const [notVerified, setNotVerified]     = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending]         = useState(false);
  const [resent, setResent]               = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cc_remembered_email');
    if (saved) { setForm(f => ({ ...f, email: saved })); setRememberMe(true); }
  }, []);

  const fieldErrors = {
    email:    touched.email    && !EMAIL_REGEX.test(form.email)   ? 'Must be a @bennett.edu.in address.' : '',
    password: touched.password && form.password.length < 8        ? 'Password must be at least 8 characters.' : '',
  };

  const isFormValid = EMAIL_REGEX.test(form.email) && form.password.length >= 8;

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };

  const inputBorderColor = (field: 'email' | 'password') => {
    if (!touched[field]) return 'var(--border)';
    if (fieldErrors[field]) return '#e53935';
    if (field === 'email' && EMAIL_REGEX.test(form.email)) return '#22d3a5';
    if (field === 'password' && form.password.length >= 8) return '#22d3a5';
    return 'var(--border)';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) { triggerShake(); return; }

    setLoading(true);
    setError('');
    setNotVerified(false);

    try {
      await authService.login(form);
      if (rememberMe) localStorage.setItem('cc_remembered_email', form.email);
      else localStorage.removeItem('cc_remembered_email');
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 900);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: { code?: string; email?: string } } } };
      const code  = e.response?.data?.errors?.code;
      const msg   = e.response?.data?.message || 'Login failed. Please try again.';

      if (code === 'EMAIL_NOT_VERIFIED') {
        // Show dedicated unverified banner instead of generic error
        setNotVerified(true);
        setUnverifiedEmail(e.response?.data?.errors?.email || form.email);
      } else {
        setError(msg);
        triggerShake();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: unverifiedEmail }),
      });
      setResent(true);
    } catch {
      // silently ignore
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(6px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(4px)} 75%{transform:translateX(-2px)} 90%{transform:translateX(2px)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes successPulse { 0%{box-shadow:0 0 0 0 rgba(34,211,165,0.4)} 70%{box-shadow:0 0 0 10px rgba(34,211,165,0)} 100%{box-shadow:0 0 0 0 rgba(34,211,165,0)} }
        .shake{animation:shake 0.6s ease}
        .slide-down{animation:slideDown 0.2s ease}
        .field-hint{font-size:11px;margin-top:5px;display:flex;align-items:center;gap:4px}
      `}</style>

      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,110,247,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="animate-fadeUp" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MapPin size={24} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>
            Campus<span style={{ color: 'var(--accent)' }}>Connect</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Sign in with your university email</p>
        </div>

        <div className={`card ${shake ? 'shake' : ''}`} style={{ padding: 32 }}>

          {/* ── Success state ── */}
          {success && (
            <div className="slide-down" style={{ textAlign: 'center', padding: '12px 0 20px' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(34,211,165,0.12)', border: '1px solid rgba(34,211,165,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', animation: 'successPulse 1s ease' }}>
                <CheckCircle size={26} color="#22d3a5" />
              </div>
              <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Signed in!</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Redirecting to dashboard…</p>
            </div>
          )}

          {/* ── Email not verified banner ── */}
          {!success && notVerified && (
            <div className="slide-down" style={{ padding: '16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📧</span>
                <div>
                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: '#fbbf24', marginBottom: 4 }}>Email not verified</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Check your inbox at <strong style={{ color: 'var(--text-primary)' }}>{unverifiedEmail}</strong> and click the verification link before signing in.
                  </p>
                </div>
              </div>
              {resent ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34d399' }}>
                  <CheckCircle size={12} /> Verification email resent — check your inbox!
                </div>
              ) : (
                <button onClick={handleResend} disabled={resending}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', fontSize: 12, color: '#fbbf24', fontFamily: 'Syne', fontWeight: 600 }}>
                  <RefreshCw size={11} style={resending ? { animation: 'spin 0.8s linear infinite' } : {}} />
                  {resending ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          {/* ── Form ── */}
          {!success && (
            <form onSubmit={handleSubmit} noValidate>

              {/* Generic error */}
              {error && (
                <div className="slide-down" style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15 }}>⚠</span> {error}
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label className="label" htmlFor="email">University Email</label>
                <input id="email" className="input" type="email" placeholder="you@bennett.edu.in"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  autoComplete="email"
                  style={{ borderColor: inputBorderColor('email') }} required />
                {touched.email && fieldErrors.email && (
                  <p className="field-hint" style={{ color: '#e53935' }}><span>⚠</span> {fieldErrors.email}</p>
                )}
                {touched.email && !fieldErrors.email && form.email && (
                  <p className="field-hint" style={{ color: '#22d3a5' }}><CheckCircle size={11} /> Looks good</p>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <button type="button" style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0, fontFamily: 'Syne' }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input id="password" className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, password: true }))}
                    autoComplete="current-password"
                    style={{ paddingRight: 44, borderColor: inputBorderColor('password') }} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    {showPass ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="field-hint" style={{ color: '#e53935' }}><span>⚠</span> {fieldErrors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <input type="checkbox" id="remember" checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--accent)' }} />
                <label htmlFor="remember" style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                  Remember my email
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }} disabled={loading}>
                {loading
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Signing in…
                    </span>
                  : <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      Sign in <ArrowRight size={16} />
                    </span>
                }
              </button>
            </form>
          )}

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          Only @bennett.edu.in emails are accepted
        </p>
      </div>
    </div>
  );
}