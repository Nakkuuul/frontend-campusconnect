'use client';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { userService } from '../../lib/services/user.service';
import { itemService } from '../../lib/services/item.service';
import { claimsService } from '../../lib/services/claims.service';
import { authService } from '../../lib/services/auth.service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Hash, Shield, Edit3, CheckCircle, Clock,
  XCircle, Package, ArrowRight, LogOut, Camera, Save, X,
} from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  enrollment: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Item {
  _id: string;
  type: 'lost' | 'found';
  title: string;
  category: string;
  status: string;
  date: string;
  location: string;
}

interface Claim {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  itemId: { title: string; category: string };
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getRoleColor(role: string) {
  switch (role) {
    case 'faculty': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' };
    case 'staff':   return { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' };
    default:        return { color: 'var(--accent)', bg: 'var(--accent-glow)', border: 'rgba(79,110,247,0.25)' };
  }
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | string; color: string }) {
  return (
    <div style={{ flex: 1, padding: '16px 20px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [items, setItems]       = useState<Item[]>([]);
  const [claims, setClaims]     = useState<Claim[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'claims'>('posts');

  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editForm, setEditForm] = useState({ name: '', role: 'student' });

  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [user, myItems, myClaims] = await Promise.all([
          userService.getProfile(),
          itemService.getMy(),
          claimsService.getMy(),
        ]);
        setProfile(user);
        setItems(myItems);
        setClaims(myClaims);
        setEditForm({ name: user.name, role: user.role });
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleSave = async () => {
    setNameError('');
    if (!editForm.name.trim()) { setNameError('Name is required.'); return; }
    if (!/^[A-Za-z]+(?:\s[A-Za-z]+)+$/.test(editForm.name.trim())) {
      setNameError('Enter first and last name (letters only).'); return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const updated = await userService.updateProfile(editForm);
      setProfile(updated);
      setEditing(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setSaveError(e.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />
        <style>{`
          @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
          .skeleton { background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 400px 100%; animation: shimmer 1.4s ease infinite; border-radius: 8px; }
        `}</style>
        <main style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 48px' }}>
          <div className="card" style={{ padding: 32, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 22, width: '40%', marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ flex: 1, height: 80, borderRadius: 12 }} />)}
          </div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  const roleStyle   = getRoleColor(profile.role);
  const joinedDate  = new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const approvedClaims = claims.filter(c => c.status === 'approved').length;
  const pendingClaims  = claims.filter(c => c.status === 'pending').length;

  const categoryEmoji: Record<string, string> = {
    Electronics: '💻', Documents: '📄', Accessories: '👜',
    Stationery: '✏️', 'ID/Cards': '🪪', Clothing: '👕', Keys: '🔑', Other: '📦',
  };

  const claimStatusCfg = {
    approved: { label: 'Approved', icon: CheckCircle, color: 'var(--accent-2)', bg: 'rgba(34,211,165,0.1)' },
    pending:  { label: 'Pending',  icon: Clock,       color: '#f59e0b',          bg: 'rgba(245,158,11,0.1)' },
    rejected: { label: 'Rejected', icon: XCircle,     color: '#ef4444',          bg: 'rgba(239,68,68,0.1)' },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .tab-btn { transition: all 0.2s; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; padding: 8px 18px; border-radius: 8px; border: none; background: transparent; }
        .tab-btn.active { background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border); }
        .tab-btn:not(.active) { color: var(--text-muted); }
        .tab-btn:not(.active):hover { color: var(--text-secondary); }
        .item-row { transition: border-color 0.15s, background 0.15s; }
        .item-row:hover { border-color: var(--border-bright) !important; background: var(--bg-card-hover) !important; }
        .edit-form { animation: slideDown 0.25s ease; }
        .save-btn { transition: opacity 0.2s, transform 0.15s; }
        .save-btn:hover { transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; cursor: pointer; }
        .avatar-wrap:hover .avatar-overlay { opacity: 1; }
      `}</style>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 48px' }}>

        {/* ── Profile card ── */}
        <div className="card fade-up" style={{ padding: 32, marginBottom: 20, overflow: 'hidden', position: 'relative' }}>

          {/* Top accent stripe */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

              {/* Avatar */}
              <div className="avatar-wrap" style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 26, color: '#fff', border: '3px solid var(--bg)', boxShadow: '0 0 0 2px var(--border)' }}>
                  {getInitials(profile.name)}
                </div>
                <div className="avatar-overlay">
                  <Camera size={18} color="#fff" />
                </div>
              </div>

              {/* Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>{profile.name}</h1>
                  {profile.isVerified && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent-2)', background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.25)', borderRadius: 99, padding: '2px 8px', fontWeight: 700, fontFamily: 'Syne' }}>
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: roleStyle.bg, border: `1px solid ${roleStyle.border}`, color: roleStyle.color, fontWeight: 700, fontFamily: 'Syne', textTransform: 'capitalize' }}>
                    {profile.role}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Joined {joinedDate}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {!editing ? (
                <>
                  <button className="btn-ghost" onClick={() => { setEditing(true); setEditForm({ name: profile.name, role: profile.role }); }}
                    style={{ padding: '8px 14px', fontSize: 13 }}>
                    <Edit3 size={13} /> Edit profile
                  </button>
                  <button onClick={handleLogout}
                    style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontFamily: 'Syne', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LogOut size={13} /> Sign out
                  </button>
                </>
              ) : (
                <button className="btn-ghost" onClick={() => { setEditing(false); setSaveError(''); setNameError(''); }}
                  style={{ padding: '8px 12px' }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="edit-form" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 18 }}>Edit Profile</h3>

              {saveError && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <X size={13} /> {saveError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div>
                  <label className="label" htmlFor="edit-name">Full Name</label>
                  <input id="edit-name" className="input" type="text" value={editForm.name}
                    onChange={e => { setEditForm(f => ({ ...f, name: e.target.value })); setNameError(''); }}
                    style={{ borderColor: nameError ? '#e53935' : undefined }} />
                  {nameError && <p style={{ fontSize: 11, color: '#e53935', marginTop: 4 }}>⚠ {nameError}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="edit-role">Role</label>
                  <select id="edit-role" className="input" value={editForm.role}
                    onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="staff">Administrative Staff</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" onClick={() => { setEditing(false); setSaveError(''); setNameError(''); }}
                  style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button className="btn-primary save-btn" onClick={handleSave} disabled={saving}
                  style={{ flex: 2, justifyContent: 'center', padding: '11px' }}>
                  {saving
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                        Saving…
                      </span>
                    : <><Save size={14} /> Save changes</>
                  }
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </button>
              </div>
            </div>
          )}

          {/* Account info rows */}
          {!editing && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { icon: Mail,   label: 'Email',      value: profile.email,      muted: false },
                { icon: Hash,   label: 'Enrollment', value: profile.enrollment, muted: false, mono: true },
                { icon: User,   label: 'Role',       value: profile.role.charAt(0).toUpperCase() + profile.role.slice(1), muted: false },
                { icon: Shield, label: 'Status',     value: profile.isVerified ? 'Verified account' : 'Email not verified', muted: !profile.isVerified },
              ].map(({ icon: Icon, label, value, muted, mono }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} color="var(--text-muted)" />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    <span style={{ fontSize: 13, color: muted ? 'var(--text-muted)' : 'var(--text-primary)', fontFamily: mono ? 'monospace' : undefined, letterSpacing: mono ? '0.04em' : undefined }}>
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="fade-up" style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatCard icon={Package}     label="Total Posts"      value={items.length}     color="var(--accent)" />
          <StatCard icon={CheckCircle} label="Claims Approved"  value={approvedClaims}   color="var(--accent-2)" />
          <StatCard icon={Clock}       label="Pending Claims"   value={pendingClaims}     color="#f59e0b" />
        </div>

        {/* ── Tabs ── */}
        <div className="card fade-up" style={{ overflow: 'hidden' }}>
          {/* Tab header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
                My Posts <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>{items.length}</span>
              </button>
              <button className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`} onClick={() => setActiveTab('claims')}>
                My Claims <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>{claims.length}</span>
              </button>
            </div>
            {activeTab === 'posts' ? (
              <Link href="/report" className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}>+ New post</Link>
            ) : (
              <Link href="/claims" className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>View all</Link>
            )}
          </div>

          {/* Posts tab */}
          {activeTab === 'posts' && (
            <div>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No posts yet</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Report a lost or found item to get started.</p>
                  <Link href="/report" className="btn-primary" style={{ margin: '0 auto' }}>Report an item</Link>
                </div>
              ) : (
                <div>
                  {items.slice(0, 8).map((item, i) => {
                    const isLost  = item.type === 'lost';
                    const accent  = isLost ? '#f97316' : '#22d3a5';
                    const statusColors: Record<string, string> = {
                      posted: '#4f6ef7', matched: '#f59e0b', claimed: '#22d3a5', resolved: '#94a3b8',
                    };
                    return (
                      <Link key={item._id} href={`/item/${item._id}`}
                        className="item-row"
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none', background: 'transparent' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: isLost ? 'rgba(239,68,68,0.08)' : 'rgba(34,211,165,0.08)', border: `1px solid ${isLost ? 'rgba(239,68,68,0.18)' : 'rgba(34,211,165,0.18)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                          {categoryEmoji[item.category] || '📦'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: 10, fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accent }}>
                              {isLost ? '● Lost' : '● Found'}
                            </span>
                          </div>
                          <p style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.location} · {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, background: `${statusColors[item.status]}18`, border: `1px solid ${statusColors[item.status]}30`, color: statusColors[item.status], fontWeight: 700, fontFamily: 'Syne', textTransform: 'capitalize' }}>
                            {item.status}
                          </span>
                          <ArrowRight size={13} color="var(--text-muted)" />
                        </div>
                      </Link>
                    );
                  })}
                  {items.length > 8 && (
                    <div style={{ padding: '14px 20px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                      <Link href="/browse" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, fontFamily: 'Syne', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        View all {items.length} posts <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Claims tab */}
          {activeTab === 'claims' && (
            <div>
              {claims.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No claims yet</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Found something that belongs to you? Submit a claim.</p>
                  <Link href="/claims" className="btn-primary" style={{ margin: '0 auto' }}>Browse found items</Link>
                </div>
              ) : (
                <div>
                  {claims.slice(0, 8).map((claim, i) => {
                    const cfg = claimStatusCfg[claim.status];
                    const Icon = cfg.icon;
                    return (
                      <Link key={claim._id} href="/claims"
                        className="item-row"
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < claims.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none', background: 'transparent' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={18} color={cfg.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {claim.itemId?.title || 'Unknown Item'}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            Submitted {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.color}28`, color: cfg.color, fontWeight: 700, fontFamily: 'Syne' }}>
                            {cfg.label}
                          </span>
                          <ArrowRight size={13} color="var(--text-muted)" />
                        </div>
                      </Link>
                    );
                  })}
                  {claims.length > 8 && (
                    <div style={{ padding: '14px 20px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                      <Link href="/claims" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, fontFamily: 'Syne', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        View all {claims.length} claims <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}