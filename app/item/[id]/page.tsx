'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { MapPin, Calendar, Tag, User, ArrowLeft, Shield, Share2, Flag, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { itemService } from '../../../lib/services/item.service';
import { claimsService } from '../../../lib/services/claims.service';
import { authService } from '../../../lib/services/auth.service';

const categoryEmoji: Record<string, string> = {
  Electronics: '💻', Documents: '📄', Accessories: '👜',
  Stationery: '✏️', 'ID/Cards': '🪪', Clothing: '👕', Keys: '🔑', Other: '📦',
};

interface Item {
  _id: string;
  type: 'lost' | 'found';
  title: string;
  category: string;
  location: string;
  date: string;
  status: string;
  description: string;
  postedBy?: { _id: string; name: string };
  image?: string;
}

function SkeletonLoader() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 48px' }}>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
          .skeleton {
            background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%);
            background-size: 400px 100%;
            animation: shimmer 1.4s ease infinite;
            border-radius: 8px;
          }
        `}</style>
        <div className="skeleton" style={{ height: 36, width: 80, marginBottom: 24 }} />
        <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: 4, background: 'var(--border)' }} />
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div className="skeleton" style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 28, width: '70%' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />)}
            </div>
            <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 80 }} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ItemDetailPage() {
  const { id }      = useParams();
  const router      = useRouter();
  const currentUser = authService.getCurrentUser();

  const [item, setItem]                 = useState<Item | null>(null);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [claimOpen, setClaimOpen]       = useState(false);
  const [claimSent, setClaimSent]       = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError]     = useState('');
  const [answer1, setAnswer1]           = useState('');
  const [answer2, setAnswer2]           = useState('');
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);
  const [copied, setCopied]             = useState(false);
  const [imageOpen, setImageOpen]       = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await itemService.getById(id as string);
        setItem(data);
        const related = await itemService.getAll({ category: data.category });
        setRelatedItems(related.items.filter((i: Item) => i._id !== data._id).slice(0, 2));
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleClaim = async () => {
    if (!answer1.trim() || !answer2.trim()) { setClaimError('Both answers are required.'); return; }
    setClaimLoading(true);
    setClaimError('');
    try {
      if (item) {
        await claimsService.submit({ itemId: item._id, answer1, answer2 });
        setClaimSent(true);
        setClaimOpen(false);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setClaimError(error.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — silently ignore
    }
  };

  const getDaysAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  };

  if (loading) return <SkeletonLoader />;

  if (notFound || !item) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={28} color="#ef4444" />
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20 }}>Item not found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>This item may have been removed or the link is incorrect.</p>
          <Link href="/browse" className="btn-primary" style={{ marginTop: 8 }}>Browse all items</Link>
        </div>
      </div>
    );
  }

  const isLost   = item.type === 'lost';
  const isOwner  = currentUser?._id === item.postedBy?._id;
  const canClaim = item.type === 'found' && item.status === 'posted' && !isOwner;
  const imageUrl = item.image
    ? (item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.image}`)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .slide-up { animation: slideUp 0.3s ease forwards; }
        .claim-box { transition: all 0.3s ease; }
        .detail-chip { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--bg); border-radius: 10px; border: 1px solid var(--border); transition: border-color 0.2s; }
        .detail-chip:hover { border-color: var(--border-bright); }
        .answer-field { resize: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .answer-field:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-glow); }
        .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; cursor: zoom-out; }
      `}</style>

      {/* Image lightbox */}
      {imageOpen && imageUrl && (
        <div className="lightbox" onClick={() => setImageOpen(false)}>
          <button onClick={() => setImageOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="#fff" />
          </button>
          <Image src={imageUrl} alt={item.title} width={900} height={600}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} />
        </div>
      )}

      {/* Share toast */}
      {copied && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 99, padding: '10px 20px', fontSize: 13, color: 'var(--text-primary)', zIndex: 100, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease' }}>
          <CheckCircle size={14} color="#22d3a5" /> Link copied to clipboard
        </div>
      )}

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 48px' }}>
        <button onClick={() => router.back()} className="btn-ghost" style={{ marginBottom: 24, padding: '8px 14px' }}>
          <ArrowLeft size={14} /> Back
        </button>

        {/* Main card */}
        <div className="card animate-fadeUp" style={{ overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: 4, background: isLost ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #22d3a5, #4f6ef7)' }} />

          <div style={{ padding: '28px 32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: isLost ? 'rgba(239,68,68,0.1)' : 'rgba(34,211,165,0.1)', border: `1px solid ${isLost ? 'rgba(239,68,68,0.2)' : 'rgba(34,211,165,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                  {categoryEmoji[item.category] || '📦'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.08em', color: isLost ? '#f97316' : '#22d3a5' }}>
                      ● {isLost ? 'Lost Item' : 'Found Item'}
                    </span>
                    <span className={`badge badge-${item.status}`}>{item.status}</span>
                  </div>
                  <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{item.title}</h1>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {getDaysAgo(item.date)}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn-ghost" onClick={handleShare} style={{ padding: '8px 12px', position: 'relative' }} title="Copy link">
                  <Share2 size={14} />
                </button>
                <button className="btn-ghost" style={{ padding: '8px 12px' }} title="Report item">
                  <Flag size={14} />
                </button>
              </div>
            </div>

            <div className="divider" />

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { icon: MapPin,   label: 'Location',    value: item.location },
                { icon: Calendar, label: 'Date',         value: `${new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` },
                { icon: Tag,      label: 'Category',     value: item.category },
                { icon: User,     label: 'Reported by',  value: item.postedBy?.name || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="detail-chip">
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color="var(--accent)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Image */}
            {imageUrl && (
              <div style={{ marginBottom: 24 }}>
                <p className="section-title">Photo</p>
                <div onClick={() => setImageOpen(true)} style={{ cursor: 'zoom-in', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                  <Image src={imageUrl} alt={item.title} width={800} height={300}
                    style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                  <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#fff' }}>
                    Click to expand
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <p className="section-title">Description</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{item.description}</p>
            </div>

            {/* Status banner for non-claimable found items */}
            {item.type === 'found' && item.status !== 'posted' && !isOwner && (
              <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, fontSize: 13, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertCircle size={15} />
                This item is currently <strong>{item.status}</strong> and cannot be claimed.
              </div>
            )}

            {/* Owner badge */}
            {isOwner && (
              <div style={{ padding: '12px 16px', background: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={14} /> This is your post.
              </div>
            )}

            {/* Claim CTA */}
            {canClaim && !claimSent && !claimOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', background: 'rgba(34,211,165,0.06)', border: '1px solid rgba(34,211,165,0.2)', borderRadius: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Is this yours?</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Submit a verified claim to recover your item.</p>
                </div>
                <button className="btn-primary" onClick={() => setClaimOpen(true)} style={{ padding: '10px 18px', flexShrink: 0 }}>
                  <Shield size={14} /> Claim it
                </button>
              </div>
            )}

            {/* Claim form */}
            {canClaim && !claimSent && claimOpen && (
              <div className="slide-up" style={{ padding: '22px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Verify Ownership</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your answers will be reviewed by our team.</p>
                  </div>
                  <button onClick={() => { setClaimOpen(false); setClaimError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                    <X size={16} />
                  </button>
                </div>

                {claimError && (
                  <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 14, fontSize: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={12} /> {claimError}
                  </div>
                )}

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>
                    1. Describe a unique identifying feature
                  </label>
                  <textarea className="input answer-field" value={answer1} onChange={e => setAnswer1(e.target.value)}
                    style={{ minHeight: 72 }} placeholder="e.g. There's a sticker of a blue cat on the back…" />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>
                    2. Serial number, inscription, or other identifier
                  </label>
                  <textarea className="input answer-field" value={answer2} onChange={e => setAnswer2(e.target.value)}
                    style={{ minHeight: 72 }} placeholder="e.g. Serial: SN-12345 or 'NT' engraved on the back…" />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-ghost" onClick={() => { setClaimOpen(false); setClaimError(''); }} style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleClaim} disabled={claimLoading} style={{ flex: 2, justifyContent: 'center' }}>
                    {claimLoading
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                          Submitting…
                        </span>
                      : <><Shield size={14} /> Submit Claim</>
                    }
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </button>
                </div>
              </div>
            )}

            {/* Claim success */}
            {claimSent && (
              <div className="slide-up" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.25)', borderRadius: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(34,211,165,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <CheckCircle size={18} color="#22d3a5" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#34d399', marginBottom: 3 }}>Claim submitted!</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Our team will review your answers and notify you within 24 hours. Check <Link href="/claims" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>My Claims</Link> for updates.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related items */}
        {relatedItems.length > 0 && (
          <div className="animate-fadeUp stagger-2">
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
              More in {item.category}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {relatedItems.map(rel => (
                <Link key={rel._id} href={`/item/${rel._id}`} style={{ textDecoration: 'none', display: 'block', padding: '16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{categoryEmoji[rel.category] || '📦'}</span>
                    <span className={`badge badge-${rel.status}`} style={{ fontSize: 10 }}>{rel.status}</span>
                  </div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{rel.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rel.location} · {getDaysAgo(rel.date)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}