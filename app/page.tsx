'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MapPin, Search, Shield, Bell, ArrowRight, CheckCircle, Package, Users, Zap, Star, ChevronRight, Lock, Smartphone } from 'lucide-react';

const stats = [
  { label: 'Items tracked',   value: '143+',    suffix: '' },
  { label: 'Items recovered', value: '89',       suffix: '' },
  { label: 'Active users',    value: '274',      suffix: '' },
  { label: 'Avg. resolution', value: '2.4',      suffix: ' days' },
];

const features = [
  { icon: Search,      color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)',   title: 'Smart Matching',      desc: 'Our algorithm automatically matches keywords, categories, and campus locations between lost and found posts — no manual searching needed.' },
  { icon: Shield,      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   title: 'Verified Claims',     desc: 'Every claim goes through a structured Q&A verification process. Only legitimate owners can recover their items.' },
  { icon: Bell,        color: '#22d3a5', bg: 'rgba(34,211,165,0.1)',   title: 'Instant Alerts',      desc: 'Get notified the moment a matching item is reported. Real-time updates keep you in the loop without constant checking.' },
  { icon: CheckCircle, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', title: 'Status Tracking',     desc: 'Follow your item through every stage — Posted, Matched, Claimed, Resolved — with full transparency.' },
  { icon: Lock,        color: '#f87171', bg: 'rgba(248,113,113,0.1)', title: 'University-Only',     desc: 'Exclusive to @bennett.edu.in accounts. Every user is a verified member of the campus community.' },
  { icon: Smartphone,  color: '#34d399', bg: 'rgba(52,211,153,0.1)',  title: 'Mobile Friendly',     desc: 'Access from any device. Report a found item the moment you pick it up, straight from your phone.' },
];

const steps = [
  { step: '01', title: 'Create your account',      desc: 'Sign up with your @bennett.edu.in email. Verified in seconds.',         icon: Users },
  { step: '02', title: 'Report the item',          desc: 'Fill in the details — title, category, location, date, and a photo.',   icon: Package },
  { step: '03', title: 'Get matched',              desc: 'Our system scans existing posts and notifies you of any matches.',       icon: Zap },
  { step: '04', title: 'Verify and collect',       desc: 'Prove ownership through our Q&A system and pick up your item.',         icon: CheckCircle },
];

const testimonials = [
  { name: 'Aayush Sharma',   role: 'CSE · Batch 2024',    text: 'Found my ID card through CampusConnect in less than 6 hours. Absolutely lifesaving before my exam.' },
  { name: 'Priya Nair',      role: 'ECE · Batch 2025',    text: 'I posted a found wallet and the owner was connected to me within a day. The verification process made it feel safe.' },
  { name: 'Rohan Mehta',     role: 'MBA · Batch 2023',    text: 'So much better than the WhatsApp groups. Everything is organised and I actually trust the platform.' },
];

const locations = ['Main Library', 'Cafeteria Block C', 'Sports Complex', 'Computer Lab 101', 'Lecture Hall B2', 'Hostel Block A', 'Parking Area', 'Gym'];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeLocation, setActiveLocation] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveLocation(l => (l + 1) % locations.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes locSwap {
          0%, 100% { opacity: 1; transform: translateY(0); }
          45% { opacity: 0; transform: translateY(-8px); }
          55% { opacity: 0; transform: translateY(8px); }
        }
        .fade-up { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .hero-float { animation: float 4s ease-in-out infinite; }
        .loc-swap { animation: locSwap 2s ease infinite; }
        .feature-card { transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
        .feature-card:hover { transform: translateY(-4px); border-color: var(--border-bright) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .step-card { transition: border-color 0.2s; }
        .step-card:hover { border-color: var(--accent) !important; }
        .testimonial-card { transition: transform 0.2s, border-color 0.2s; }
        .testimonial-card:hover { transform: translateY(-3px); border-color: var(--border-bright) !important; }
        .cta-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 0 32px var(--accent-glow); }
        .ghost-btn { transition: border-color 0.2s, color 0.2s; }
        .ghost-btn:hover { border-color: var(--border-bright) !important; color: var(--text-primary) !important; }
        .nav-scrolled { box-shadow: 0 4px 32px rgba(0,0,0,0.3); }
        .stat-num { font-variant-numeric: tabular-nums; }
      `}</style>

      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 900, background: 'radial-gradient(circle, rgba(79,110,247,0.07) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(34,211,165,0.05) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '-8%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 65%)' }} />
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header className={scrolled ? 'nav-scrolled' : ''}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', padding: '0 40px', height: 64, background: scrolled ? 'rgba(13,15,20,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(24px)' : 'none', borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`, transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={17} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>
            Campus<span style={{ color: 'var(--accent)' }}>Connect</span>
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center', marginRight: 32 }}>
          {['Features', 'How it works', 'Stats'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 600, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              {l}
            </a>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login" className="ghost-btn"
            style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 600, fontSize: 13 }}>
            Log in
          </Link>
          <Link href="/register" className="btn-primary cta-btn" style={{ padding: '8px 18px', fontSize: 13 }}>
            Sign up free <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center' }}>

        {/* Badge */}
        <div className="fade-up delay-1" style={{ marginBottom: 24 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 99, padding: '7px 18px', fontFamily: 'Syne', fontSize: 11, fontWeight: 700, color: '#7b96f9', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
            Bennett University — Official Lost & Found Portal
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-up delay-2" style={{ fontFamily: 'Syne', fontSize: 'clamp(40px, 6.5vw, 80px)', fontWeight: 800, lineHeight: 1.03, letterSpacing: '-0.03em', marginBottom: 12, maxWidth: 900 }}>
          Stop losing things.
        </h1>
        <h1 className="fade-up delay-3" style={{ fontFamily: 'Syne', fontSize: 'clamp(40px, 6.5vw, 80px)', fontWeight: 800, lineHeight: 1.03, letterSpacing: '-0.03em', marginBottom: 28, maxWidth: 900, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Start recovering them.
        </h1>

        <p className="fade-up delay-3" style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 540, lineHeight: 1.75, marginBottom: 14 }}>
          CampusConnect replaces WhatsApp groups and notice boards with a centralized, verified lost & found platform built exclusively for Bennett University.
        </p>

        {/* Animated location tag */}
        <div className="fade-up delay-4" style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
          <MapPin size={13} color="var(--accent)" />
          <span>Items reported at</span>
          <span className="loc-swap" key={activeLocation} style={{ color: 'var(--accent-2)', fontWeight: 600, fontFamily: 'Syne' }}>
            {locations[activeLocation]}
          </span>
          <span>and more</span>
        </div>

        {/* CTAs */}
        <div className="fade-up delay-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
          <Link href="/register" className="btn-primary cta-btn" style={{ fontSize: 15, padding: '13px 30px' }}>
            Get started for free <ArrowRight size={16} />
          </Link>
          <Link href="/browse" className="ghost-btn"
            style={{ fontSize: 15, padding: '13px 30px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={15} /> Browse items
          </Link>
        </div>

        {/* Stats bar */}
        <div id="stats" className="fade-up delay-5 hero-float"
          style={{ display: 'flex', gap: 0, flexWrap: 'wrap', justifyContent: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', maxWidth: 640, width: '100%' }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ flex: 1, minWidth: 120, padding: '24px 20px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="stat-num" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 30, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 }}>
                {s.value}<span style={{ fontSize: 16, color: 'var(--accent)' }}>{s.suffix}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" style={{ position: 'relative', zIndex: 10, padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 14 }}>Why CampusConnect</span>
          <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Built for campus life,<br />not general classifieds.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Every feature is designed around the specific needs of a university lost & found system.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {features.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="card feature-card" style={{ padding: 28 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 10, padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-2)', marginBottom: 14 }}>How it works</span>
            <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>From report to recovery<br />in four steps.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            {steps.map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} className="step-card" style={{ position: 'relative', padding: '24px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 36, right: -7, width: 14, height: 1, background: 'var(--border)', display: 'none' }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 11, color: 'var(--accent)', letterSpacing: '0.05em' }}>{step}</span>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-glow)', border: '1px solid rgba(79,110,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color="var(--accent)" />
                  </div>
                </div>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATUS FLOW ────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '80px 40px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', fontSize: 11, fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 14 }}>Item lifecycle</span>
        <h2 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 40 }}>Track every stage, end to end.</h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
          {[
            { label: 'Posted',   color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)',   border: 'rgba(79,110,247,0.25)',  desc: 'Item reported' },
            { label: 'Matched',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)',  desc: 'Claim submitted' },
            { label: 'Claimed',  color: '#22d3a5', bg: 'rgba(34,211,165,0.1)',   border: 'rgba(34,211,165,0.25)', desc: 'Ownership verified' },
            { label: 'Resolved', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', desc: 'Item returned' },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '16px 20px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, minWidth: 110 }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 13, color: s.color, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px' }}>
                  <ChevronRight size={16} color="var(--border-bright)" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '80px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-2)', marginBottom: 14 }}>Student stories</span>
            <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em' }}>Real students. Real recoveries.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {testimonials.map(({ name, role, text }) => (
              <div key={name} className="card testimonial-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={13} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 18 }}>&quot;{text}&quot;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 12, color: '#fff', flexShrink: 0 }}>
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13 }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <MapPin size={28} color="#fff" />
          </div>
          <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Lost something?<br />Someone found it.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36 }}>
            Join 274 students already using CampusConnect to reunite people with their belongings.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary cta-btn" style={{ fontSize: 15, padding: '14px 32px' }}>
              Create free account <ArrowRight size={16} />
            </Link>
            <Link href="/browse" className="ghost-btn"
              style={{ fontSize: 15, padding: '14px 32px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              Browse without signing up
            </Link>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 18 }}>
            Requires a @bennett.edu.in email address · Free forever
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid var(--border)', padding: '32px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em' }}>
              Campus<span style={{ color: 'var(--accent)' }}>Connect</span>
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            © 2025 CampusConnect · Bennett University · Built by Nakul, Samarpit & Tanishq
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Features', 'How it works', 'Browse'].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}