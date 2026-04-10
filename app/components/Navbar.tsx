'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, Plus, LayoutDashboard, MapPin, LogOut, CheckCircle } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/browse',    label: 'Browse',    icon: Search },
  { href: '/report',    label: 'Report',    icon: Plus },
  { href: '/claims',    label: 'Claims',    icon: CheckCircle },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(13,15,20,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      height: '60px',
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      gap: '0',
    }}>
      {/* Logo */}
      <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginRight: 32 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MapPin size={16} color="#fff" />
        </div>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Campus<span style={{ color: 'var(--accent)' }}>Connect</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              textDecoration: 'none',
              fontFamily: 'Syne', fontWeight: 600, fontSize: 13,
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              background: active ? 'var(--bg-card)' : 'transparent',
              border: active ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}>
              <Icon size={14} color={active ? 'var(--accent)' : 'var(--text-muted)'} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Notification bell */}
        <button style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
        }}>
          <Bell size={15} color="var(--text-secondary)" />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent)',
            border: '1.5px solid var(--bg)',
          }} />
        </button>

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'linear-gradient(135deg, #4f6ef7 0%, #22d3a5 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: '#fff',
          cursor: 'pointer',
        }}>
          NT
        </div>

        {/* Logout */}
        <Link href="/" style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'transparent', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <LogOut size={14} color="var(--text-muted)" />
        </Link>
      </div>
    </nav>
  );
}
