'use client';
import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { Upload, CheckCircle, MapPin, Calendar, Tag, AlignLeft, ArrowRight, X, Image as ImageIcon, AlertCircle, Lightbulb } from 'lucide-react';
import { itemService } from '../../lib/services/item.service';

const categories = ['Electronics', 'Documents', 'Accessories', 'Stationery', 'ID/Cards', 'Clothing', 'Keys', 'Other'];
const locations  = ['Main Library', 'Cafeteria Block C', 'Sports Complex', 'Computer Lab 101', 'Lecture Hall B2', 'Hostel Block A', 'Parking Area', 'Gym', 'Admin Block', 'Other'];

const categoryEmoji: Record<string, string> = {
  Electronics: '💻', Documents: '📄', Accessories: '👜',
  Stationery: '✏️', 'ID/Cards': '🪪', Clothing: '👕', Keys: '🔑', Other: '📦',
};

const MAX_TITLE       = 100;
const MAX_DESCRIPTION = 1000;
const MAX_FILE_MB     = 5;

function validate(form: { title: string; category: string; location: string; date: string; description: string }) {
  const errs: Record<string, string> = {};
  if (!form.title.trim())       errs.title       = 'Title is required.';
  else if (form.title.length > MAX_TITLE) errs.title = `Max ${MAX_TITLE} characters.`;
  if (!form.category)           errs.category    = 'Category is required.';
  if (!form.location)           errs.location    = 'Location is required.';
  if (!form.date)               errs.date        = 'Date is required.';
  if (!form.description.trim()) errs.description = 'Description is required.';
  else if (form.description.length > MAX_DESCRIPTION) errs.description = `Max ${MAX_DESCRIPTION} characters.`;
  return errs;
}

function ReportForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const defaultType  = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const [type, setType]                 = useState<'lost' | 'found'>(defaultType as 'lost' | 'found');
  const [form, setForm]                 = useState({ title: '', category: '', location: '', date: '', description: '' });
  const [touched, setTouched]           = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDragging, setImageDragging] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [apiError, setApiError]         = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const errors = validate(form);
  const showError = (field: string) => (touched[field] || submitAttempted) && errors[field];

  const handleBlur = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  const setImage = (file: File) => {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setApiError(`Image must be under ${MAX_FILE_MB}MB.`);
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImageDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) setImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setApiError('');
    try {
      await itemService.report({
        type, title: form.title, category: form.category,
        location: form.location, date: form.date,
        description: form.description, image: imageFile,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: { msg: string }[] } } };
      setApiError(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to post item. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({ title: '', category: '', location: '', date: '', description: '' });
    setTouched({});
    setSubmitAttempted(false);
    setImageFile(null);
    setImagePreview(null);
    setApiError('');
  };

  const inputBorder = (field: string) => {
    if (showError(field)) return '#e53935';
    if (touched[field] && !errors[field] && (form as Record<string, string>)[field]) return '#22d3a5';
    return undefined;
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <style>{`
          @keyframes successPop {
            0%   { transform: scale(0.7); opacity: 0; }
            70%  { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          .success-icon { animation: successPop 0.5s ease forwards; }
        `}</style>
        <div className="success-icon" style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(34,211,165,0.12)', border: '2px solid rgba(34,211,165,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={44} color="var(--accent-2)" />
        </div>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 26, marginBottom: 10 }}>Item reported!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 6 }}>
          Your <strong>{type}</strong> item is now live on CampusConnect.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>
          Our matching system is scanning for potential matches across {type === 'lost' ? 'found' : 'lost'} items.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-ghost" onClick={handleReset}>Report another</button>
          <button className="btn-ghost" onClick={() => router.push('/browse')}>Browse items</button>
          <button className="btn-primary" onClick={() => router.push('/dashboard')}>
            Go to Dashboard <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .field-error { animation: slideIn 0.2s ease; font-size: 11px; margin-top: 5px; color: #e53935; display: flex; align-items: center; gap: 4px; }
        .field-ok    { font-size: 11px; margin-top: 5px; color: #22d3a5; display: flex; align-items: center; gap: 4px; }
        .drop-zone { transition: border-color 0.2s, background 0.2s; }
        .drop-zone:hover { border-color: var(--accent) !important; background: rgba(79,110,247,0.04) !important; }
        .cat-option { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.15s; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .cat-option:hover:not(.selected) { border-color: var(--border-bright); background: rgba(255,255,255,0.02); }
        .cat-option.selected { border-color: var(--accent); background: rgba(79,110,247,0.08); }
        .type-btn { flex: 1; padding: 14px 12px; border: none; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
      `}</style>

      {/* Type toggle */}
      <div style={{ display: 'flex', marginBottom: 28, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {(['lost', 'found'] as const).map(t => (
          <button key={t} type="button" onClick={() => setType(t)} className="type-btn" style={{
            background: type === t ? (t === 'lost' ? 'rgba(239,68,68,0.14)' : 'rgba(34,211,165,0.1)') : 'transparent',
            color: type === t ? (t === 'lost' ? '#f87171' : '#34d399') : 'var(--text-muted)',
            borderRight: t === 'lost' ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: 18 }}>{t === 'lost' ? '🔴' : '🟢'}</span>
            {t === 'lost' ? 'I Lost Something' : 'I Found Something'}
          </button>
        ))}
      </div>

      {/* API error */}
      {apiError && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={13} /> {apiError}
        </div>
      )}

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <label className="label"><AlignLeft size={10} style={{ display: 'inline', marginRight: 5 }} />Item Title</label>
        <input className="input" placeholder={type === 'lost' ? 'e.g. Apple AirPods Pro' : 'e.g. Found blue wallet near library'}
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          onBlur={() => handleBlur('title')}
          style={{ borderColor: inputBorder('title') }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          {showError('title')
            ? <p className="field-error"><span>⚠</span> {errors.title}</p>
            : <span />
          }
          <p style={{ fontSize: 10, color: form.title.length > MAX_TITLE ? '#e53935' : 'var(--text-muted)', marginTop: 4 }}>
            {form.title.length}/{MAX_TITLE}
          </p>
        </div>
      </div>

      {/* Category visual picker */}
      <div style={{ marginBottom: 20 }}>
        <label className="label"><Tag size={10} style={{ display: 'inline', marginRight: 5 }} />Category</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {categories.map(c => (
            <button key={c} type="button"
              className={`cat-option ${form.category === c ? 'selected' : ''}`}
              onClick={() => { setForm(f => ({ ...f, category: c })); setTouched(t => ({ ...t, category: true })); }}>
              <span style={{ fontSize: 20 }}>{categoryEmoji[c]}</span>
              <span style={{ fontSize: 11, fontFamily: 'Syne', fontWeight: 600, color: form.category === c ? 'var(--accent)' : 'var(--text-muted)' }}>{c}</span>
            </button>
          ))}
        </div>
        {showError('category') && <p className="field-error"><span>⚠</span> {errors.category}</p>}
      </div>

      {/* Date + Location row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label className="label"><Calendar size={10} style={{ display: 'inline', marginRight: 5 }} />Date {type === 'lost' ? 'Lost' : 'Found'}</label>
          <input className="input" type="date"
            value={form.date}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            onBlur={() => handleBlur('date')}
            style={{ borderColor: inputBorder('date') }} />
          {showError('date') && <p className="field-error"><span>⚠</span> {errors.date}</p>}
        </div>

        <div>
          <label className="label"><MapPin size={10} style={{ display: 'inline', marginRight: 5 }} />Location</label>
          <select className="input"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            onBlur={() => handleBlur('location')}
            style={{ borderColor: inputBorder('location') }}>
            <option value="">Select location</option>
            {locations.map(l => <option key={l}>{l}</option>)}
          </select>
          {showError('location') && <p className="field-error"><span>⚠</span> {errors.location}</p>}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 20 }}>
        <label className="label">Description</label>
        <textarea className="input"
          placeholder="Describe the item — color, brand, size, distinguishing marks, where exactly you lost/found it…"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          onBlur={() => handleBlur('description')}
          style={{ minHeight: 110, borderColor: inputBorder('description') }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          {showError('description')
            ? <p className="field-error"><span>⚠</span> {errors.description}</p>
            : <span />
          }
          <p style={{ fontSize: 10, color: form.description.length > MAX_DESCRIPTION ? '#e53935' : 'var(--text-muted)' }}>
            {form.description.length}/{MAX_DESCRIPTION}
          </p>
        </div>
      </div>

      {/* Image upload — drag & drop */}
      <div style={{ marginBottom: 28 }}>
        <label className="label"><ImageIcon size={10} style={{ display: 'inline', marginRight: 5 }} />Upload Image <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)' }}>(optional — increases match rate by 3×)</span></label>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} style={{ display: 'none' }} />

        {imagePreview ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 14, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Image src={imagePreview} alt="preview" width={80} height={80}
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block' }} />
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={11} color="var(--text-muted)" />
              </button>
            </div>
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>{imageFile?.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                {imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB` : ''}
              </p>
              <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()} style={{ fontSize: 12, padding: '6px 12px' }}>
                Change image
              </button>
            </div>
          </div>
        ) : (
          <div
            className="drop-zone"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setImageDragging(true); }}
            onDragLeave={() => setImageDragging(false)}
            onDrop={handleDrop}
            style={{
              width: '100%', padding: '32px 24px',
              border: `2px dashed ${imageDragging ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10, cursor: 'pointer',
              background: imageDragging ? 'rgba(79,110,247,0.05)' : 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} color={imageDragging ? 'var(--accent)' : 'var(--text-muted)'} />
            </div>
            <p style={{ fontSize: 13, color: imageDragging ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600 }}>
              {imageDragging ? 'Drop it here!' : 'Click or drag & drop to upload'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG, WebP up to 5MB</p>
          </div>
        )}
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '14px', width: '100%', fontSize: 15 }} disabled={loading}>
        {loading
          ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Posting…
            </span>
          : <><span style={{ fontSize: 16 }}>{type === 'lost' ? '🔴' : '🟢'}</span> Post {type === 'lost' ? 'Lost' : 'Found'} Item <ArrowRight size={16} /></>
        }
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </button>
    </form>
  );
}

export default function ReportPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 48px' }}>

        <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>Report an Item</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Fill in the details and we&apos;ll match it with existing posts</p>
        </div>

        <div className="card animate-fadeUp stagger-1" style={{ padding: 32 }}>
          <Suspense fallback={
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Loading form…</div>
          }>
            <ReportForm />
          </Suspense>
        </div>

        {/* Tips card */}
        <div className="card animate-fadeUp stagger-2" style={{ padding: 20, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Lightbulb size={14} color="var(--warning)" />
            <p className="section-title" style={{ marginBottom: 0 }}>Tips for a better post</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { tip: 'Add specific identifiers like serial numbers or markings', impact: 'Essential' },
              { tip: 'Upload a clear photo — increases match rate by 3×',        impact: 'High impact' },
              { tip: 'Be accurate with location and date',                        impact: 'Important' },
              { tip: 'Check browse page first — it may already be posted',        impact: 'Save time' },
            ].map(({ tip, impact }) => (
              <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flex: 1 }}>
                  <span style={{ color: 'var(--accent-2)', marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tip}</span>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'Syne', fontWeight: 600 }}>
                  {impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}