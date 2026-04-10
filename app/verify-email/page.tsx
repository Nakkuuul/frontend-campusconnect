'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, CheckCircle, XCircle, Loader, RefreshCw, ArrowRight } from 'lucide-react';
import api from '../../lib/api';

type State = 'verifying' | 'success' | 'expired' | 'error';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [state, setState]       = useState<State>('verifying');
  const [message, setMessage]   = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent]     = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token || !email) { setState('error'); setMessage('Invalid verification link. Please use the link from your email.'); return; }

      try {
        const { data } = await api.get(`/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`);

        // Store token and user — user is now verified
        localStorage.setItem('cc_token', data.data.token);
        localStorage.setItem('cc_user',  JSON.stringify(data.data.user));

        setState('success');
        setTimeout(() => router.push('/dashboard'), 2200);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string; errors?: { code?: string }[] } } };
        const code = e.response?.data?.errors?.[0]?.code || e.response?.data?.errors;
        const msg  = e.response?.data?.message || 'Verification failed.';

        if (code === 'TOKEN_EXPIRED' || msg.includes('expired')) {
          setState('expired');
        } else {
          setState('error');
        }
        setMessage(msg);
      }
    };

    verify();
  }, [token, email, router]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setResent(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setMessage(e.response?.data?.message || 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,110,247,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <MapPin size={24} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>
            Campus<span style={{ color: 'var(--accent)' }}>Connect</span>
          </h1>
        </div>

        <div className="card" style={{ padding: 36, textAlign: 'center' }}>

          {/* Verifying */}
          {state === 'verifying' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Loader size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Verifying your email…</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Just a moment while we confirm your account.</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          )}

          {/* Success */}
          {state === 'success' && (
            <>
              <div className="animate-float" style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,211,165,0.12)', border: '2px solid rgba(34,211,165,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={30} color="var(--accent-2)" />
              </div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Email verified!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 6 }}>Your account is now active.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Redirecting to dashboard…</p>
            </>
          )}

          {/* Expired */}
          {state === 'expired' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <XCircle size={28} color="#f59e0b" />
              </div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Link expired</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                This verification link has expired. Links are valid for 24 hours.
              </p>

              {resent ? (
                <div style={{ padding: '12px 16px', background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.2)', borderRadius: 10, fontSize: 13, color: '#34d399', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <CheckCircle size={14} /> New link sent — check your inbox!
                </div>
              ) : (
                <button className="btn-primary" onClick={handleResend} disabled={resending}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  {resending
                    ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Sending…</>
                    : <><RefreshCw size={14} /> Resend verification email</>
                  }
                </button>
              )}
            </>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <XCircle size={28} color="#ef4444" />
              </div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Verification failed</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                {message || 'This link is invalid or has already been used.'}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/register" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Register again</Link>
                <Link href="/login"    className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Sign in <ArrowRight size={14} />
                </Link>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          Need help? Contact your campus IT support.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}