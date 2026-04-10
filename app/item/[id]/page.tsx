'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { MapPin, Calendar, Tag, User, ArrowLeft, Shield, Share2, Flag, CheckCircle } from 'lucide-react';
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

export default function ItemDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const currentUser = authService.getCurrentUser();

  const [item, setItem]           = useState<Item | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);

  const [claimOpen, setClaimOpen]   = useState(false);
  const [claimSent, setClaimSent]   = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [answer1, setAnswer1]       = useState('');
  const [answer2, setAnswer2]       = useState('');

  const [relatedItems, setRelatedItems] = useState<Item[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await itemService.getById(id as string);
        setItem(data);

        // Fetch related items by same category
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
    if (!answer1.trim() || !answer2.trim()) {
      setClaimError('Both answers are required.');
      return;
    }
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Loading item…</p>
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Item not found.</p>
        <Link href="/browse" className="btn-ghost" style={{ marginTop: 16 }}>← Back to browse</Link>
      </div>
    );
  }

  const isLost    = item.type === 'lost';
  const isOwner   = currentUser?._id === item.postedBy?._id;
  const canClaim  = item.type === 'found' && item.status === 'posted' && !isOwner;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
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
                <div style={{ width: 64, height: 64, borderRadius: 14, background: isLost ? 'rgba(239,68,68,0.1)' : 'rgba(34,211,165,0.1)', border: `1px solid ${isLost ? 'rgba(239,68,68,0.2)' : 'rgba(34,211,165,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {categoryEmoji[item.category] || '📦'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.08em', color: isLost ? '#f97316' : '#22d3a5' }}>
                      ● {isLost ? 'Lost Item' : 'Found Item'}
                    </span>
                    <span className={`badge badge-${item.status}`}>{item.status}</span>
                  </div>
                  <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, letterSpacing: '-0.01em' }}>{item.title}</h1>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn-ghost" style={{ padding: '8px 12px' }}><Share2 size={14} /></button>
                <button className="btn-ghost" style={{ padding: '8px 12px' }}><Flag size={14} /></button>
              </div>
            </div>

            <div className="divider" />

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { icon: MapPin,   label: 'Location',    value: item.location },
                { icon: Calendar, label: 'Date',         value: new Date(item.date).toLocaleDateString() },
                { icon: Tag,      label: 'Category',     value: item.category },
                { icon: User,     label: 'Reported by',  value: item.postedBy?.name || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 2 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Image */}
            {item.image && (
              <div style={{ marginBottom: 24 }}>
                <p className="section-title">Photo</p>
                <Image src={`http://localhost:5000${item.image}`} alt={item.title} width={800} height={300}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <p className="section-title">Description</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.description}</p>
            </div>

            {/* Claim action */}
            {canClaim && !claimSent && (
              <div>
                {!claimOpen ? (
                  <button className="btn-primary" onClick={() => setClaimOpen(true)} style={{ padding: '12px 24px' }}>
                    <Shield size={15} /> Claim this item
                  </button>
                ) : (
                  <div style={{ padding: '20px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Verify Ownership</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Answer both questions to prove this item is yours.</p>

                    {claimError && (
                      <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#f87171' }}>
                        {claimError}
                      </div>
                    )}

                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Describe a unique identifying feature of this item:</p>
                    <textarea className="input" value={answer1} onChange={e => setAnswer1(e.target.value)}
                      style={{ minHeight: 70, marginBottom: 12 }} placeholder="e.g. There's a sticker of…" />

                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Provide any serial number, inscription, or other identifier:</p>
                    <textarea className="input" value={answer2} onChange={e => setAnswer2(e.target.value)}
                      style={{ minHeight: 70, marginBottom: 14 }} placeholder="e.g. Serial number is SN-12345…" />

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn-ghost" onClick={() => { setClaimOpen(false); setClaimError(''); }}>Cancel</button>
                      <button className="btn-primary" onClick={handleClaim} disabled={claimLoading}>
                        {claimLoading ? 'Submitting…' : 'Submit Claim'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {claimSent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.25)', borderRadius: 10 }}>
                <CheckCircle size={18} color="var(--accent-2)" />
                <span style={{ fontSize: 14, color: '#34d399' }}>Claim submitted! You&apos;ll be notified within 24 hours.</span>
              </div>
            )}

            {isOwner && (
              <div style={{ padding: '12px 16px', background: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--accent)' }}>
                This is your post.
              </div>
            )}
          </div>
        </div>

        {/* Related items */}
        {relatedItems.length > 0 && (
          <div className="animate-fadeUp stagger-2">
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Related Items</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {relatedItems.map(rel => (
                <Link key={rel._id} href={`/item/${rel._id}`} style={{ textDecoration: 'none', display: 'block', padding: '14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{rel.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rel.location} · {new Date(rel.date).toLocaleDateString()}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}