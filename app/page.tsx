'use client';
import Link from 'next/link';
import { MapPin, Search, Shield, Bell, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Background mesh */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, background: 'radial-gradient(circle, rgba(79,110,247,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(34,211,165,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
            Campus<span style={{ color: 'var(--accent)' }}>Connect</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/register" className="btn-primary">Sign up free</Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <div className="animate-fadeUp" style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.25)',
            borderRadius: 99, padding: '6px 16px',
            fontFamily: 'Syne', fontSize: 12, fontWeight: 600, color: '#7b96f9',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Bennett University — Official Portal
          </span>
        </div>

        <h1 className="animate-fadeUp stagger-1" style={{ fontFamily: 'Syne', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24, maxWidth: 800 }}>
          Stop losing things.<br />
          <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Start recovering them.
          </span>
        </h1>

        <p className="animate-fadeUp stagger-2" style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 520, lineHeight: 1.7, marginBottom: 40 }}>
          CampusConnect replaces WhatsApp groups and notice boards with a centralized, secure lost & found system built exclusively for your campus.
        </p>

        <div className="animate-fadeUp stagger-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/register" className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
            Get started <ArrowRight size={16} />
          </Link>
          <Link href="/browse" className="btn-ghost" style={{ fontSize: 15, padding: '12px 28px' }}>
            Browse items <Search size={16} />
          </Link>
        </div>

        {/* Stats bar */}
        <div className="animate-fadeUp stagger-4" style={{
          marginTop: 64, display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center',
          padding: '24px 48px', background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 16,
        }}>
          {[
            { label: 'Items tracked', value: '143+' },
            { label: 'Items recovered', value: '89' },
            { label: 'Active users', value: '274' },
            { label: 'Avg. resolution', value: '2.4 days' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 10, padding: '80px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Why CampusConnect?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Built for campus life, not general classifieds.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { icon: Search, color: 'var(--accent)', title: 'Smart Matching', desc: 'Automatically matches keywords, categories, and locations between lost and found posts.' },
            { icon: Shield, color: '#f59e0b', title: 'Claim Verification', desc: 'Ownership verified through Q&A and evidence. No fraudulent claims.' },
            { icon: Bell, color: 'var(--accent-2)', title: 'Real-time Alerts', desc: 'Instant notifications when a matching item is reported on campus.' },
            { icon: CheckCircle, color: '#a78bfa', title: 'Status Tracking', desc: 'Follow your item from Posted → Matched → Claimed → Resolved.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="card" style={{ padding: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid var(--border)', padding: '20px 40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        © 2025 CampusConnect · Bennett University · Built by Nakul, Samarpit & Tanishq
      </footer>
    </div>
  );
}
