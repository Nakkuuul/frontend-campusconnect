'use client';
import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { Upload, CheckCircle, MapPin, Calendar, Tag, AlignLeft, ArrowRight, X, Image as ImageIcon } from 'lucide-react';
import { itemService } from '../../lib/services/item.service';

const categories = ['Electronics', 'Documents', 'Accessories', 'Stationery', 'ID/Cards', 'Clothing', 'Keys', 'Other'];
const locations  = ['Main Library', 'Cafeteria Block C', 'Sports Complex', 'Computer Lab 101', 'Lecture Hall B2', 'Hostel Block A', 'Parking Area', 'Gym', 'Admin Block', 'Other'];

function ReportForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const defaultType  = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const [type, setType]               = useState<'lost' | 'found'>(defaultType as 'lost' | 'found');
  const [form, setForm]               = useState({ title: '', category: '', location: '', date: '', description: '' });
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = ev => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    try {
      await itemService.report({
        type,
        title:       form.title,
        category:    form.category,
        location:    form.location,
        date:        form.date,
        description: form.description,
        image:       imageFile,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(error.response?.data?.message || 'Failed to post item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({ title: '', category: '', location: '', date: '', description: '' });
    setImageFile(null);
    setImagePreview(null);
    setApiError('');
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div className="animate-float" style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,211,165,0.12)', border: '2px solid rgba(34,211,165,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="var(--accent-2)" />
        </div>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, marginBottom: 12 }}>Item reported!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 8 }}>
          Your {type} item post is now live. We&apos;ll notify you of any matches.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>Smart matching is scanning for potential matches…</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-ghost" onClick={handleReset}>Report another</button>
          <button className="btn-primary" onClick={() => router.push('/dashboard')}>
            Go to Dashboard <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Type selector */}
      <div style={{ display: 'flex', marginBottom: 28, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {(['lost', 'found'] as const).map(t => (
          <button key={t} type="button" onClick={() => setType(t)} style={{
            flex: 1, padding: '12px', border: 'none', cursor: 'pointer',
            fontFamily: 'Syne', fontWeight: 700, fontSize: 14,
            background: type === t ? (t === 'lost' ? 'rgba(239,68,68,0.15)' : 'rgba(34,211,165,0.12)') : 'transparent',
            color: type === t ? (t === 'lost' ? '#f87171' : '#34d399') : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}>
            {t === 'lost' ? '🔴 I Lost Something' : '🟢 I Found Something'}
          </button>
        ))}
      </div>

      {/* API error */}
      {apiError && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#f87171' }}>
          {apiError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label"><AlignLeft size={10} style={{ display: 'inline', marginRight: 5 }} />Item Title</label>
          <input className="input" placeholder={type === 'lost' ? 'e.g. Apple AirPods Pro' : 'e.g. Found blue wallet'}
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        </div>

        <div>
          <label className="label"><Tag size={10} style={{ display: 'inline', marginRight: 5 }} />Category</label>
          <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
            <option value="">Select category</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="label"><Calendar size={10} style={{ display: 'inline', marginRight: 5 }} />Date {type === 'lost' ? 'Lost' : 'Found'}</label>
          <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label"><MapPin size={10} style={{ display: 'inline', marginRight: 5 }} />Location</label>
          <select className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required>
            <option value="">Select location</option>
            {locations.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">Description</label>
          <textarea className="input" placeholder="Describe the item in detail — color, brand, size, any distinguishing marks…"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required style={{ minHeight: 110 }} />
        </div>
      </div>

      {/* Image upload */}
      <div style={{ marginBottom: 28 }}>
        <label className="label"><ImageIcon size={10} style={{ display: 'inline', marginRight: 5 }} />Upload Image (optional)</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
        {imagePreview ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Image src={imagePreview} alt="preview" width={120} height={120} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
            <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
              style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={12} color="var(--text-muted)" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} style={{
            width: '100%', padding: '28px', border: '2px dashed var(--border)', borderRadius: 10,
            background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
            <Upload size={24} color="var(--text-muted)" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to upload image</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG up to 5MB</span>
          </button>
        )}
      </div>

      <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '14px', width: '100%' }} disabled={loading}>
        {loading ? 'Posting…' : `Post ${type === 'lost' ? 'Lost' : 'Found'} Item`}
        {!loading && <ArrowRight size={16} />}
      </button>
    </form>
  );
}

export default function ReportPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '80px 24px 48px' }}>
        <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>Report an Item</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Fill in the details and we&apos;ll match it with existing posts</p>
        </div>

        <div className="card animate-fadeUp stagger-1" style={{ padding: 32 }}>
          <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>Loading…</div>}>
            <ReportForm />
          </Suspense>
        </div>

        <div className="card animate-fadeUp stagger-2" style={{ padding: 20, marginTop: 20 }}>
          <p className="section-title">Tips for a better post</p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Add specific identifiers like serial numbers or markings', 'Upload a clear photo — increases match rate by 3×', 'Be accurate with location and date', 'Check browse page first — it may already be posted'].map(tip => (
              <li key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-2)', marginTop: 2 }}>✓</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}