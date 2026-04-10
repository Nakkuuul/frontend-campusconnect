'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MapPin, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { authService } from '../../lib/services/auth.service';

const EMAIL_REGEX = /^[^\s@]+@bennett\.edu\.in$/i;

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass]   = useState(false);
  const [form, setForm]           = useState({ email: '', password: '' });
  const [touched, setTouched]     = useState({ email: false, password: false });
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const [shake, setShake]         = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Pre-fill email if remembered
  useEffect(() => {
    const saved = localStorage.getItem('cc_remembered_email');
    if (saved) { setForm(f => ({ ...f, email: saved })); setRememberMe(true); }
  }, []);

  const fieldErrors = {
    email:    touched.email    && !EMAIL_REGEX.test(form.email)   ? 'Must be a @bennett.edu.in address.' : '',
    password: touched.password && form.password.length < 8        ? 'Password must be at least 8 characters.' : '',
  };

  const isFormValid = EMAIL_REGEX.test(form.email) && form.password.length >= 8;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) { triggerShake(); return; }

    setLoading(true);
    setError('');
    try {
      await authService.login(form);
      if (rememberMe) localStorage.setItem('cc_remembered_email', form.email);
      else localStorage.removeItem('cc_remembered_email');
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 900);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Login failed. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const inputBorderColor = (field: 'email' | 'password') => {
    if (!touched[field]) return 'var(--border)';
    if (fieldErrors[field]) return '#e53935';
    if (field === 'email' && EMAIL_REGEX.test(form.email)) return '#22d3a5';
    if (field === 'password' && form.password.length >= 8) return '#22d3a5';
    return 'var(--border)';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,211,165,0.4); }
          70%  { box-shadow: 0 0 0 10px rgba(34,211,165,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,211,165,0); }
        }
        .shake { animation: shake 0.6s ease; }
        .slide-down { animation: slideDown 0.2s ease; }
        .input-enhanced {
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-enhanced:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(79,110,247,0.12);
        }
        .submit-btn {
          width: 100%;
          justify-content: center;
          padding: 13px;
          font-size: 15px;
          transition: opacity 0.2s, transform 0.1s;
        }
        .submit-btn:not(:disabled):hover { transform: translateY(-1px); }
        .submit-btn:not(:disabled):active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .remember-check { width: 15px; height: 15px; cursor: pointer; accent-color: var(--accent); }
        .field-hint { font-size: 11px; margin-top: 5px; display: flex; align-items: center; gap: 4px; animation: slideDown 0.2s ease; }
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

        {/* Card */}
        <div className={`card ${shake ? 'shake' : ''}`} style={{ padding: 32 }}>

          {/* Success state */}
          {success && (
            <div className="slide-down" style={{ textAlign: 'center', padding: '12px 0 20px' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(34,211,165,0.12)', border: '1px solid rgba(34,211,165,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', animation: 'successPulse 1s ease' }}>
                <CheckCircle size={26} color="#22d3a5" />
              </div>
              <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Signed in!</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Redirecting to dashboard…</p>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} noValidate>

              {/* API error banner */}
              {error && (
                <div className="slide-down" style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15 }}>⚠</span> {error}
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label className="label" htmlFor="email">University Email</label>
                <input
                  id="email"
                  className="input input-enhanced"
                  type="email"
                  placeholder="you@bennett.edu.in"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  autoComplete="email"
                  style={{ borderColor: inputBorderColor('email') }}
                  required
                />
                {touched.email && fieldErrors.email && (
                  <p className="field-hint" style={{ color: '#e53935' }}>
                    <span>⚠</span> {fieldErrors.email}
                  </p>
                )}
                {touched.email && !fieldErrors.email && form.email && (
                  <p className="field-hint" style={{ color: '#22d3a5' }}>
                    <CheckCircle size={11} /> Looks good
                  </p>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <button type="button" style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    className="input input-enhanced"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, password: true }))}
                    autoComplete="current-password"
                    style={{ paddingRight: 44, borderColor: inputBorderColor('password') }}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="field-hint" style={{ color: '#e53935' }}>
                    <span>⚠</span> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <input
                  type="checkbox"
                  id="remember"
                  className="remember-check"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                  Remember my email
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary submit-btn"
                disabled={loading}
              >
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

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </form>
          )}

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          Only @bennett.edu.in emails are accepted
        </p>
      </div>
    </div>
  );
}