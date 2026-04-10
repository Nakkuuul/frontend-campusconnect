'use client';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import Link from 'next/link';
import { Package, CheckCircle, Clock, Users, Plus, TrendingUp, Bell, ArrowRight, Zap, RefreshCw, BellOff } from 'lucide-react';
import { dashboardService } from '../../lib/services/dashboard.service';
import { itemService } from '../../lib/services/item.service';
import { userService } from '../../lib/services/user.service';
import { authService } from '../../lib/services/auth.service';

interface Item {
  _id: string;
  id: string;
  type: 'lost' | 'found';
  title: string;
  category: string;
  location: string;
  date: string;
  status: 'posted' | 'matched' | 'claimed' | 'resolved';
  description: string;
  postedBy: string | { name: string };
  image?: string;
}

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}

interface RecoveryRate {
  category: string;
  rate: number;
}

function StatSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
      {[1,2,3,4].map(i => (
        <div key={i} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 26, width: 48, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: '80%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function getDaysAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

function getNotifIcon(type?: string) {
  switch (type) {
    case 'claim_update':  return '🔔';
    case 'item_match':    return '🎯';
    case 'item_resolved': return '✅';
    default:              return '📌';
  }
}

export default function DashboardPage() {
  const user = authService.getCurrentUser();

  const [stats, setStats]          = useState({ totalItems: 0, resolvedThisMonth: 0, pendingClaims: 0, activeUsers: 0 });
  const [myItems, setMyItems]      = useState<Item[]>([]);
  const [notifications, setNotifs] = useState<Notification[]>([]);
  const [recoveryRates, setRates]  = useState<RecoveryRate[]>([]);
  const [loading, setLoading]      = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [s, items, { notifications: notifs }, rates] = await Promise.all([
        dashboardService.getStats(),
        itemService.getMy(),
        userService.getNotifications(),
        dashboardService.getRecoveryRates(),
      ]);
      setStats(s);
      setMyItems(items.slice(0, 3));
      setNotifs(notifs);
      setRates(rates);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id: string) => {
    await userService.markRead(id);
    setNotifs(n => n.map(notif => notif._id === id ? { ...notif, read: true } : notif));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await userService.markAllRead();
    setNotifs(n => n.map(notif => ({ ...notif, read: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const statCards = [
    { icon: Package,     label: 'Total Items',         value: stats.totalItems,        color: 'var(--accent)',   bg: 'var(--accent-glow)',         trend: null },
    { icon: CheckCircle, label: 'Resolved This Month', value: stats.resolvedThisMonth, color: 'var(--accent-2)', bg: 'var(--accent-2-glow)',        trend: 'this month' },
    { icon: Clock,       label: 'Pending Claims',       value: stats.pendingClaims,     color: '#f59e0b',         bg: 'rgba(245,158,11,0.1)',        trend: null },
    { icon: Users,       label: 'Active Users',         value: stats.activeUsers,       color: '#a78bfa',         bg: 'rgba(167,139,250,0.1)',       trend: null },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .skeleton {
          background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius: 8px;
        }
        .stat-value { animation: countUp 0.5s ease forwards; }
        .notif-item { transition: background 0.15s, border-color 0.15s, transform 0.15s; }
        .notif-item:hover { transform: translateX(2px); }
        .action-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .action-btn:hover { transform: translateY(-2px); }
        .rate-bar { transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .refresh-icon { transition: transform 0.3s; }
        .refresh-icon.spinning { animation: spin 0.8s linear infinite; }
      `}</style>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 48px' }}>

        {/* Welcome header */}
        <div className="animate-fadeUp" style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Welcome back
            </p>
            <h1 style={{ fontFamily: 'Syne', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
              {user?.name || '—'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: 600, fontFamily: 'Syne' }}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.enrollment}</span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Bennett University</span>
            </div>
          </div>
          <button onClick={() => load(true)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}
            title="Refresh dashboard">
            <RefreshCw size={13} className={`refresh-icon ${refreshing ? 'spinning' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats row */}
        {loading ? <StatSkeleton /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {statCards.map(({ icon: Icon, label, value, color, bg, trend }, i) => (
              <div key={label} className={`card animate-fadeUp stagger-${i + 1}`}
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'default' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <div className="stat-value" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, lineHeight: 1, color: 'var(--text-primary)' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                  {trend && <div style={{ fontSize: 11, color: color, marginTop: 2 }}>{trend}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Quick actions */}
            <div className="card animate-fadeUp" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>Quick Actions</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>What would you like to do?</p>
                </div>
                <Zap size={16} color="var(--accent)" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { href: '/report?type=lost',  label: 'Report Lost',      cls: 'btn-primary', icon: '🔴' },
                  { href: '/report?type=found', label: 'Report Found',     cls: 'btn-success', icon: '🟢' },
                  { href: '/browse',            label: 'Browse All Items', cls: 'btn-ghost',   icon: '🔍' },
                  { href: '/claims',            label: 'My Claims',        cls: 'btn-ghost',   icon: '📋' },
                ].map(({ href, label, cls, icon }) => (
                  <Link key={href} href={href} className={`${cls} action-btn`} style={{ justifyContent: 'center', padding: '14px', gap: 8 }}>
                    <span style={{ fontSize: 15 }}>{icon}</span> {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* My Posts */}
            <div className="animate-fadeUp stagger-2">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>My Posts</h2>
                  {!loading && myItems.length > 0 && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Your {myItems.length} most recent posts</p>
                  )}
                </div>
                <Link href="/browse" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  View all <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[1,2,3].map(i => (
                    <div key={i} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
                        <div style={{ flex: 1 }}>
                          <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                          <div className="skeleton" style={{ height: 12, width: '40%' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : myItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 24px', border: '1px dashed var(--border)', borderRadius: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>No posts yet</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Lost something? Found something? Let the campus know.</p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <Link href="/report?type=lost" className="btn-ghost" style={{ fontSize: 13, padding: '8px 14px' }}>Report Lost</Link>
                    <Link href="/report?type=found" className="btn-primary" style={{ fontSize: 13, padding: '8px 14px' }}>Report Found</Link>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {myItems.map((item, i) => <ItemCard key={item._id} item={item} delay={i * 0.07} />)}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Notifications */}
            <div className="card animate-fadeUp stagger-1" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={15} color="var(--accent)" />
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 99, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} disabled={markingAll}
                    style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontFamily: 'Syne' }}>
                    {markingAll ? 'Marking…' : 'Mark all read'}
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {loading ? (
                  [1,2,3].map(i => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 10, width: '40%' }} />
                    </div>
                  ))
                ) : notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <BellOff size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>All caught up!</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className="notif-item" onClick={() => !n.read && handleMarkRead(n._id)}
                      style={{ padding: '10px 12px', borderRadius: 8, cursor: n.read ? 'default' : 'pointer',
                        background: n.read ? 'transparent' : 'rgba(79,110,247,0.06)',
                        border: `1px solid ${n.read ? 'var(--border)' : 'rgba(79,110,247,0.2)'}` }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{getNotifIcon(n.type)}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, color: n.read ? 'var(--text-muted)' : 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{getDaysAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recovery Rate */}
            <div className="card animate-fadeUp stagger-2" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={15} color="var(--accent-2)" />
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>Recovery Rate</h3>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>by category</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loading ? (
                  [1,2,3,4].map(i => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div className="skeleton" style={{ height: 12, width: 80 }} />
                        <div className="skeleton" style={{ height: 12, width: 30 }} />
                      </div>
                      <div className="skeleton" style={{ height: 5, borderRadius: 99 }} />
                    </div>
                  ))
                ) : recoveryRates.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No data yet</p>
                ) : (
                  recoveryRates.map(({ category, rate }) => (
                    <div key={category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{category}</span>
                        <span style={{ color: rate > 80 ? 'var(--accent-2)' : rate > 60 ? 'var(--accent)' : '#f59e0b', fontWeight: 700 }}>{rate}%</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                        <div className="rate-bar" style={{ height: '100%', width: `${rate}%`, borderRadius: 99,
                          background: rate > 80 ? 'var(--accent-2)' : rate > 60 ? 'var(--accent)' : '#f59e0b' }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}