'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, Search, Plus, LayoutDashboard, MapPin, LogOut, CheckCircle, User, ChevronDown } from 'lucide-react';
import { authService } from '../../lib/services/auth.service';
import { userService } from '../../lib/services/user.service';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/browse',    label: 'Browse',    icon: Search },
  { href: '/report',    label: 'Report',    icon: Plus },
  { href: '/claims',    label: 'Claims',    icon: CheckCircle },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const user      = authService.getCurrentUser();

  const [unread, setUnread]           = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs]   = useState(false);
  const [notifs, setNotifs]           = useState<{ _id: string; message: string; read: boolean; createdAt: string }[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { notifications, unreadCount } = await userService.getNotifications();
        setNotifs(notifications.slice(0, 5));
        setUnread(unreadCount);
      } catch { /* silent */ }
    };
    fetchNotifs();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const handleMarkRead = async (id: string) => {
    await userService.markRead(id);
    setNotifs(n => n.map(notif => notif._id === id ? { ...notif, read: true } : notif));
    setUnread(u => Math.max(0, u - 1));
  };

  const getDaysAgo = useCallback((dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  }, []);

  return (
    <>
      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-dropdown { animation: dropDown 0.18s ease forwards; }
        .nav-link { transition: all 0.2s; }
        .nav-link:hover:not(.active) {
          color: var(--text-secondary) !important;
          background: rgba(255,255,255,0.04) !important;
          border-color: var(--border) !important;
        }
        .nav-icon-btn { transition: background 0.2s, border-color 0.2s; }
        .nav-icon-btn:hover { background: var(--bg-card-hover) !important; border-color: var(--border-bright) !important; }
        .notif-item { transition: background 0.15s; cursor: pointer; }
        .notif-item:hover { background: var(--bg-card-hover); }
        .profile-item { transition: background 0.15s; cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; font-size: 13px; color: var(--text-secondary); text-decoration: none; }
        .profile-item:hover { background: var(--bg-card-hover); color: var(--text-primary); }
        .profile-item.danger:hover { background: rgba(239,68,68,0.08); color: #f87171; }
        .report-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .report-btn:hover { transform: translateY(-1px); box-shadow: 0 0 20px var(--accent-glow); }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(13,15,20,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
        height: 60,
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 0,
      }}>

        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginRight: 28 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <MapPin size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            Campus<span style={{ color: 'var(--accent)' }}>Connect</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            const isReport = href === '/report';
            if (isReport) return (
              <Link key={href} href={href} className="report-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
                  fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
                  background: 'var(--accent)', color: '#fff', marginLeft: 4,
                }}>
                <Plus size={14} /> Report
              </Link>
            );
            return (
              <Link key={href} href={href} className={`nav-link ${active ? 'active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
                  fontFamily: 'Syne', fontWeight: 600, fontSize: 13,
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: active ? 'var(--bg-card)' : 'transparent',
                  border: `1px solid ${active ? 'var(--border)' : 'transparent'}`,
                }}>
                <Icon size={14} color={active ? 'var(--accent)' : 'var(--text-muted)'} />
                {label}
                {/* Active dot */}
                {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', marginLeft: 2 }} />}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Notification bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button className="nav-icon-btn"
              onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: showNotifs ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: `1px solid ${showNotifs ? 'var(--border-bright)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
              }}>
              <Bell size={15} color={showNotifs ? 'var(--accent)' : 'var(--text-secondary)'} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 16, height: 16, borderRadius: 99,
                  background: 'var(--accent)', color: '#fff',
                  fontSize: 9, fontWeight: 800, fontFamily: 'Syne',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid var(--bg)',
                }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifs && (
              <div className="nav-dropdown" style={{
                position: 'absolute', top: 44, right: 0,
                width: 320, background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 12,
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                overflow: 'hidden', zIndex: 200,
              }}>
                <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13 }}>Notifications</span>
                  {unread > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne' }}
                      onClick={async () => { await userService.markAllRead(); setNotifs(n => n.map(x => ({ ...x, read: true }))); setUnread(0); }}>
                      Mark all read
                    </span>
                  )}
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      All caught up! 🎉
                    </div>
                  ) : notifs.map(n => (
                    <div key={n._id} className="notif-item"
                      onClick={() => handleMarkRead(n._id)}
                      style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : 'rgba(79,110,247,0.04)' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.read ? 'transparent' : 'var(--accent)', flexShrink: 0, marginTop: 5 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, color: n.read ? 'var(--text-muted)' : 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 3 }}>{n.message}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{getDaysAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
                  <Link href="/dashboard" onClick={() => setShowNotifs(false)}
                    style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, fontFamily: 'Syne' }}>
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 8px 4px 4px', borderRadius: 10,
                background: showProfile ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: `1px solid ${showProfile ? 'var(--border-bright)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {/* Avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'linear-gradient(135deg, #4f6ef7, #22d3a5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne', fontWeight: 800, fontSize: 11, color: '#fff',
                flexShrink: 0,
              }}>
                {user?.name ? getInitials(user.name) : 'U'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 2 }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1, textTransform: 'capitalize' }}>
                  {user?.role || 'Student'}
                </p>
              </div>
              <ChevronDown size={12} color="var(--text-muted)"
                style={{ transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {/* Profile dropdown */}
            {showProfile && (
              <div className="nav-dropdown" style={{
                position: 'absolute', top: 44, right: 0,
                width: 220, background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 12,
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                padding: 8, zIndex: 200,
              }}>
                {/* User info header */}
                <div style={{ padding: '10px 14px 12px', marginBottom: 4, borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{user?.name || '—'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email || user?.enrollment}</p>
                </div>

                <Link href="/profile" className="profile-item" onClick={() => setShowProfile(false)}>
                  <User size={13} /> Profile
                </Link>
                <Link href="/claims" className="profile-item" onClick={() => setShowProfile(false)}>
                  <CheckCircle size={13} /> My Claims
                </Link>

                <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

                <button className="profile-item danger" onClick={handleLogout}
                  style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}