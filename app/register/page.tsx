'use client';
import Link from 'next/link';
import { useState } from 'react';
import { MapPin, Eye, EyeOff, ArrowRight, CheckCircle, User, Hash, Mail, Lock } from 'lucide-react';
import { authService } from '../../lib/services/auth.service';

const ENROLLMENT_REGEX = /^[A-Z]\d{2}[A-Z]+[A-Z]\d{4}$/;
const NAME_REGEX       = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
const EMAIL_DOMAIN     = '@bennett.edu.in';

function validate(field: string, value: string): string {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Full name is required.';
      if (!NAME_REGEX.test(value.trim())) return 'Enter first and last name (letters only).';
      return '';
    case 'enrollment':
      if (!value.trim()) return 'Enrollment number is required.';
      if (!ENROLLMENT_REGEX.test(value.trim())) return 'Format must be like S24CSEU0193.';
      return '';
    case 'email':
      if (!value.trim()) return 'University email is required.';
      if (!value.toLowerCase().endsWith(EMAIL_DOMAIN)) return 'Must be a @bennett.edu.in address.';
      if (!/^[^\s@]+@bennett\.edu\.in$/.test(value.toLowerCase())) return 'Enter a valid @bennett.edu.in email.';
      return '';
    case 'password':
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters.';
      return '';
    default:
      return '';
  }
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#22d3a5'];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < score ? colors[score - 1] : 'var(--border)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: score > 0 ? colors[score - 1] : 'var(--text-muted)' }}>
        {score > 0 ? labels[score - 1] : ''} {score === 4 ? '— great password!' : score > 0 ? '— try adding numbers or symbols' : ''}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const [showPass, setShowPass]               = useState(false);
  const [step, setStep]                       = useState(1);
  const [loading, setLoading]                 = useState(false);
  const [apiError, setApiError]               = useState('');
  const [form, setForm]                       = useState({ name: '', email: '', enrollment: '', password: '', role: 'student' });
  const [touched, setTouched]                 = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [shake, setShake]                     = useState(false);

  const errors: Record<string, string> = {
    name:       validate('name',       form.name),
    enrollment: validate('enrollment', form.enrollment),
    email:      validate('email',      form.email),
    password:   validate('password',   form.password),
  };

  const isStep1Valid = !errors.name && !errors.enrollment;
  const isStep2Valid = !errors.email && !errors.password;

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };
  const handleBlur   = (field: string) => setTouched(t => ({ ...t, [field]: true }));
  const showError    = (field: string) => (touched[field] || submitAttempted) && errors[field];

  const isFieldValid = (field: string, value: string) =>
    touched[field] && !validate(field, value) && value.length > 0;

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isStep1Valid) { triggerShake(); return; }
    setSubmitAttempted(false);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isStep2Valid) { triggerShake(); return; }
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const borderColor = (field: string, value: string) => {
    if (showError(field)) return '#e53935';
    if (isFieldValid(field, value)) return '#22d3a5';
    return undefined;
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
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .shake { animation: shake 0.6s ease; }
        .step-in { animation: stepIn 0.3s ease forwards; }
        .slide-down { animation: slideDown 0.2s ease; }
        .field-hint { font-size: 11px; margin-top: 5px; display: flex; align-items: center; gap: 4px; }
        .input-icon-wrap { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .input-padded { padding-left: 38px !important; }
        .role-option {
          flex: 1; padding: 12px 8px; border: 1px solid var(--border); border-radius: 8px;
          background: transparent; cursor: pointer; text-align: center;
          transition: all 0.2s; font-family: 'Syne', sans-serif; font-size: 13px;
          color: var(--text-muted);
        }
        .role-option.selected {
          border-color: var(--accent); background: rgba(79,110,247,0.08);
          color: var(--text-primary);
        }
        .role-option:hover:not(.selected) { border-color: var(--border-bright); color: var(--text-secondary); }
        .continue-btn {
          width: 100%; justify-content: center; padding: 13px;
          font-size: 15px; transition: opacity 0.2s, transform 0.1s;
        }
        .continue-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(34,211,165,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="animate-fadeUp" style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <MapPin size={24} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Join the CampusConnect community</p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ flex: 1, height: 3, borderRadius: 99, background: s <= step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.4s' }} />
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Step {step} of 2 — {step === 1 ? 'Personal Info' : 'Account Setup'}
            </p>
          </div>
        )}

        <div className={`card ${shake ? 'shake' : ''}`} style={{ padding: 32 }}>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleStep1} noValidate className="step-in">
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 22 }}>Tell us about yourself</h3>

              {/* Full Name */}
              <div style={{ marginBottom: 16 }}>
                <label className="label" htmlFor="name">Full Name</label>
                <div className="input-icon-wrap">
                  <User size={14} color="var(--text-muted)" className="input-icon" />
                  <input id="name" className="input input-padded" type="text" placeholder="Nakul Thakur"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onBlur={() => handleBlur('name')}
                    autoComplete="name"
                    style={{ borderColor: borderColor('name', form.name) }} />
                </div>
                {showError('name')
                  ? <p className="field-hint slide-down" style={{ color: '#e53935' }}><span>⚠</span> {errors.name}</p>
                  : isFieldValid('name', form.name)
                    ? <p className="field-hint" style={{ color: '#22d3a5' }}><CheckCircle size={11} /> Looks good</p>
                    : <p className="field-hint" style={{ color: 'var(--text-muted)' }}>Enter your first and last name</p>
                }
              </div>

              {/* Enrollment */}
              <div style={{ marginBottom: 16 }}>
                <label className="label" htmlFor="enrollment">Enrollment Number</label>
                <div className="input-icon-wrap">
                  <Hash size={14} color="var(--text-muted)" className="input-icon" />
                  <input id="enrollment" className="input input-padded" type="text" placeholder="S24CSEU0193"
                    value={form.enrollment}
                    onChange={e => setForm(f => ({ ...f, enrollment: e.target.value.toUpperCase() }))}
                    onBlur={() => handleBlur('enrollment')}
                    style={{ fontFamily: 'monospace', letterSpacing: '0.05em', borderColor: borderColor('enrollment', form.enrollment) }} />
                </div>
                {showError('enrollment')
                  ? <p className="field-hint slide-down" style={{ color: '#e53935' }}><span>⚠</span> {errors.enrollment}</p>
                  : isFieldValid('enrollment', form.enrollment)
                    ? <p className="field-hint" style={{ color: '#22d3a5' }}><CheckCircle size={11} /> Valid enrollment number</p>
                    : <p className="field-hint" style={{ color: 'var(--text-muted)' }}>Format: S24CSEU0193</p>
                }
              </div>

              {/* Role selector */}
              <div style={{ marginBottom: 26 }}>
                <label className="label">I am a</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { value: 'student', label: 'Student', emoji: '🎓' },
                    { value: 'faculty', label: 'Faculty', emoji: '👨‍🏫' },
                    { value: 'staff',   label: 'Staff',   emoji: '🏢' },
                  ].map(r => (
                    <button key={r.value} type="button"
                      className={`role-option ${form.role === r.value ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, role: r.value }))}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{r.emoji}</div>
                      <div style={{ fontWeight: 600 }}>{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary continue-btn">
                Continue <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate className="step-in">
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 22 }}>Set up your account</h3>

              {apiError && (
                <div className="slide-down" style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#f87171', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 15 }}>⚠</span> {apiError}
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label className="label" htmlFor="email">University Email</label>
                <div className="input-icon-wrap">
                  <Mail size={14} color="var(--text-muted)" className="input-icon" />
                  <input id="email" className="input input-padded" type="email" placeholder="you@bennett.edu.in"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    onBlur={() => handleBlur('email')}
                    autoComplete="email"
                    style={{ borderColor: borderColor('email', form.email) }} />
                </div>
                {showError('email')
                  ? <p className="field-hint slide-down" style={{ color: '#e53935' }}><span>⚠</span> {errors.email}</p>
                  : isFieldValid('email', form.email)
                    ? <p className="field-hint" style={{ color: '#22d3a5' }}><CheckCircle size={11} /> Valid university email</p>
                    : <p className="field-hint" style={{ color: 'var(--text-muted)' }}>Must be your @bennett.edu.in address</p>
                }
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label className="label" htmlFor="password">Password</label>
                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                  <Lock size={14} color="var(--text-muted)" className="input-icon" />
                  <input id="password" className="input input-padded" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    onBlur={() => handleBlur('password')}
                    autoComplete="new-password"
                    style={{ paddingRight: 44, borderColor: borderColor('password', form.password) }}
                    minLength={8} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
                  </button>
                </div>
                {showError('password') && (
                  <p className="field-hint slide-down" style={{ color: '#e53935' }}><span>⚠</span> {errors.password}</p>
                )}
                <PasswordStrength password={form.password} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-ghost"
                  onClick={() => { setSubmitAttempted(false); setApiError(''); setStep(1); }}
                  style={{ flex: 1, justifyContent: 'center' }}>
                  Back
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '13px' }} disabled={loading}>
                  {loading
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                        Creating…
                      </span>
                    : 'Create account'
                  }
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="step-in" style={{ textAlign: 'center', padding: '24px 0' }}>
              <div className="animate-float" style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,211,165,0.12)', border: '2px solid rgba(34,211,165,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={34} color="var(--accent-2)" />
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>You&apos;re in!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 6 }}>Welcome to CampusConnect, {form.name.split(' ')[0]}!</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>Your account has been created successfully.</p>
              <Link href="/dashboard" className="btn-primary" style={{ justifyContent: 'center', padding: '13px 32px' }}>
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