'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle, Clock, XCircle, Eye, Shield, ChevronDown, ChevronUp, AlertCircle, X, MapPin } from 'lucide-react';
import { claimsService } from '../../lib/services/claims.service';
import { itemService } from '../../lib/services/item.service';

interface Item {
  _id: string;
  title: string;
  location: string;
  category: string;
}

interface Claim {
  _id: string;
  itemId: Item;
  status: 'approved' | 'pending' | 'rejected';
  answer1: string;
  answer2: string;
  proof?: string;
  notes?: string;
  createdAt: string;
}

const statusConfig = {
  approved: { label: 'Approved',       icon: CheckCircle, color: 'var(--accent-2)', bg: 'rgba(34,211,165,0.1)',  border: 'rgba(34,211,165,0.25)' },
  pending:  { label: 'Pending Review', icon: Clock,       color: '#f59e0b',          bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  rejected: { label: 'Rejected',       icon: XCircle,     color: '#ef4444',          bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)' },
};

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'] as const;
type Filter = typeof FILTERS[number];

const MAX_ANSWER = 500;

function SkeletonClaim() {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 15, width: '55%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 11, width: '30%' }} />
        </div>
        <div className="skeleton" style={{ height: 26, width: 100, borderRadius: 99 }} />
      </div>
    </div>
  );
}

export default function ClaimsPage() {
  const [claims, setClaims]         = useState<Claim[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [filter, setFilter]         = useState<Filter>('All');
  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null);
  const [withdrawing, setWithdrawing]       = useState(false);
  const [successMsg, setSuccessMsg]         = useState('');

  const [claimForm, setClaimForm] = useState({
    itemId: '', answer1: '', answer2: '', proof: '',
  });

  // ── Field-level validation ──────────────────────────────────────────────────
  const formErrors = {
    itemId:  !claimForm.itemId            ? 'Please select an item.' : '',
    answer1: !claimForm.answer1.trim()    ? 'This answer is required.' :
             claimForm.answer1.length > MAX_ANSWER ? `Max ${MAX_ANSWER} characters.` : '',
    answer2: !claimForm.answer2.trim()    ? 'This answer is required.' :
             claimForm.answer2.length > MAX_ANSWER ? `Max ${MAX_ANSWER} characters.` : '',
  };
  const [formTouched, setFormTouched] = useState({ itemId: false, answer1: false, answer2: false });
  const isFormValid = !formErrors.itemId && !formErrors.answer1 && !formErrors.answer2;

  useEffect(() => {
    const load = async () => {
      try {
        const [myClaims, browseResult] = await Promise.all([
          claimsService.getMy(),
          itemService.getAll({ type: 'found', status: 'posted' }),
        ]);
        setClaims(myClaims);
        setFoundItems(browseResult.items);
      } catch (err) {
        console.error('Claims load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setClaimForm({ itemId: '', answer1: '', answer2: '', proof: '' });
    setFormTouched({ itemId: false, answer1: false, answer2: false });
    setFormError('');
  };

  const handleSubmitClaim = async () => {
    // Touch all fields to show errors
    setFormTouched({ itemId: true, answer1: true, answer2: true });
    if (!isFormValid) return;

    setSubmitting(true);
    setFormError('');
    try {
      const newClaim = await claimsService.submit({
        itemId:  claimForm.itemId,
        answer1: claimForm.answer1.trim(),
        answer2: claimForm.answer2.trim(),
        proof:   claimForm.proof.trim() || undefined,
      });
      setClaims(prev => [newClaim, ...prev]);
      resetForm();
      setShowForm(false);
      setSuccessMsg('Claim submitted successfully! You\'ll be notified within 24 hours.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: { msg: string }[] } } };
      // Handle both message string and errors array from express-validator
      const msg = error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || 'Failed to submit claim. Please try again.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await claimsService.withdraw(withdrawTarget);
      setClaims(prev => prev.filter(c => c._id !== withdrawTarget));
      setWithdrawTarget(null);
      setExpanded(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Could not withdraw claim.');
      setWithdrawTarget(null);
    } finally {
      setWithdrawing(false);
    }
  };

  const filtered = claims.filter(c =>
    filter === 'All' ? true : c.status === filter.toLowerCase()
  );

  const counts = {
    All:      claims.length,
    Pending:  claims.filter(c => c.status === 'pending').length,
    Approved: claims.filter(c => c.status === 'approved').length,
    Rejected: claims.filter(c => c.status === 'rejected').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .skeleton {
          background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius: 8px;
        }
        .claim-form { animation: slideDown 0.3s ease; }
        .claim-expanded { animation: slideDown 0.2s ease; }
        .success-toast { animation: slideUp 0.3s ease; }
        .filter-tab {
          padding: 6px 14px; border-radius: 99px; border: 1px solid var(--border);
          background: transparent; cursor: pointer; font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 600; color: var(--text-muted);
          transition: all 0.2s; display: flex; align-items: center; gap: 5px;
        }
        .filter-tab.active {
          background: var(--accent); border-color: var(--accent); color: #fff;
        }
        .filter-tab:not(.active):hover { border-color: var(--border-bright); color: var(--text-secondary); }
        .claim-header { transition: background 0.15s; }
        .claim-header:hover { background: var(--bg-card-hover); }
        .char-count { font-size: 10px; text-align: right; margin-top: 4px; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
        .dialog { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 28px; max-width: 360px; width: 90%; animation: slideUp 0.25s ease; }
      `}</style>

      {/* Withdraw confirmation dialog */}
      {withdrawTarget && (
        <div className="overlay" onClick={() => setWithdrawTarget(null)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <AlertCircle size={22} color="#ef4444" />
            </div>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Withdraw claim?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.6 }}>
              This will permanently remove your claim. You can submit a new one later if needed.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setWithdrawTarget(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={confirmWithdraw} disabled={withdrawing}
                style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#f87171', fontFamily: 'Syne', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.3)' } as React.CSSProperties}>
                {withdrawing
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <span style={{ width: 12, height: 12, border: '2px solid rgba(248,113,113,0.3)', borderTop: '2px solid #f87171', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Withdrawing…
                    </span>
                  : 'Yes, withdraw'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {successMsg && (
        <div className="success-toast" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid rgba(34,211,165,0.3)', borderRadius: 99, padding: '12px 20px', fontSize: 13, color: '#34d399', zIndex: 100, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', whiteSpace: 'nowrap' }}>
          <CheckCircle size={14} /> {successMsg}
        </div>
      )}

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 48px' }}>

        {/* Header */}
        <div className="animate-fadeUp" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>My Claims</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {loading ? '…' : `${claims.length} claim${claims.length !== 1 ? 's' : ''} submitted`}
            </p>
          </div>
          <button className="btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} style={{ marginTop: 4 }}>
            {showForm ? <><X size={14} /> Cancel</> : <><Shield size={15} /> New Claim</>}
          </button>
        </div>

        {/* New claim form */}
        {showForm && (
          <div className="card claim-form" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Submit a Claim</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Your answers will be reviewed by our admin team.</p>

            {formError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={13} /> {formError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Item selector */}
              <div>
                <label className="label">Select Item to Claim</label>
                <select className="input"
                  value={claimForm.itemId}
                  onChange={e => { setClaimForm(f => ({ ...f, itemId: e.target.value })); setFormTouched(t => ({ ...t, itemId: true })); }}
                  onBlur={() => setFormTouched(t => ({ ...t, itemId: true }))}
                  style={{ borderColor: formTouched.itemId && formErrors.itemId ? '#e53935' : undefined }}>
                  <option value="">Choose a found item…</option>
                  {foundItems.length === 0
                    ? <option disabled>No claimable items available</option>
                    : foundItems.map(i => (
                        <option key={i._id} value={i._id}>{i.title} — {i.location}</option>
                      ))
                  }
                </select>
                {formTouched.itemId && formErrors.itemId && (
                  <p style={{ fontSize: 11, color: '#e53935', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>⚠</span> {formErrors.itemId}
                  </p>
                )}
              </div>

              {/* Answer 1 */}
              <div>
                <label className="label">Unique identifying feature</label>
                <textarea className="input"
                  placeholder="e.g. There's a small crack on the bottom-left corner, and a blue sticker on the back…"
                  value={claimForm.answer1}
                  onChange={e => setClaimForm(f => ({ ...f, answer1: e.target.value }))}
                  onBlur={() => setFormTouched(t => ({ ...t, answer1: true }))}
                  style={{ minHeight: 80, borderColor: formTouched.answer1 && formErrors.answer1 ? '#e53935' : undefined }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  {formTouched.answer1 && formErrors.answer1
                    ? <p style={{ fontSize: 11, color: '#e53935', display: 'flex', alignItems: 'center', gap: 4 }}><span>⚠</span> {formErrors.answer1}</p>
                    : <span />
                  }
                  <p className="char-count" style={{ color: claimForm.answer1.length > MAX_ANSWER ? '#e53935' : 'var(--text-muted)' }}>
                    {claimForm.answer1.length}/{MAX_ANSWER}
                  </p>
                </div>
              </div>

              {/* Answer 2 */}
              <div>
                <label className="label">Serial number, inscription, or other identifier</label>
                <textarea className="input"
                  placeholder="e.g. Serial: SN-12345, or initials 'NT' engraved on the back…"
                  value={claimForm.answer2}
                  onChange={e => setClaimForm(f => ({ ...f, answer2: e.target.value }))}
                  onBlur={() => setFormTouched(t => ({ ...t, answer2: true }))}
                  style={{ minHeight: 80, borderColor: formTouched.answer2 && formErrors.answer2 ? '#e53935' : undefined }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  {formTouched.answer2 && formErrors.answer2
                    ? <p style={{ fontSize: 11, color: '#e53935', display: 'flex', alignItems: 'center', gap: 4 }}><span>⚠</span> {formErrors.answer2}</p>
                    : <span />
                  }
                  <p className="char-count" style={{ color: claimForm.answer2.length > MAX_ANSWER ? '#e53935' : 'var(--text-muted)' }}>
                    {claimForm.answer2.length}/{MAX_ANSWER}
                  </p>
                </div>
              </div>

              {/* Supporting evidence */}
              <div>
                <label className="label">Supporting Evidence <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)' }}>(optional)</span></label>
                <textarea className="input"
                  placeholder="Purchase receipts, photos, or any other supporting evidence…"
                  value={claimForm.proof}
                  onChange={e => setClaimForm(f => ({ ...f, proof: e.target.value }))}
                  style={{ minHeight: 70 }} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmitClaim}
                  style={{ flex: 2, justifyContent: 'center' }} disabled={submitting}>
                  {submitting
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                        Submitting…
                      </span>
                    : <><Shield size={14} /> Submit Claim</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        {!loading && claims.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f}
                {counts[f] > 0 && (
                  <span style={{ fontSize: 10, background: filter === f ? 'rgba(255,255,255,0.25)' : 'var(--border)', borderRadius: 99, padding: '1px 6px' }}>
                    {counts[f]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Claims list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3].map(i => <SkeletonClaim key={i} />)}
          </div>
        ) : claims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', border: '1px dashed var(--border)', borderRadius: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No claims yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Browse found items and claim anything that belongs to you.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)} style={{ margin: '0 auto' }}>
              <Shield size={14} /> Submit your first claim
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 14 }}>No {filter.toLowerCase()} claims.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((claim, i) => {
              const cfg    = statusConfig[claim.status];
              const Icon   = cfg.icon;
              const isOpen = expanded === claim._id;
              const item   = claim.itemId;

              return (
                <div key={claim._id} className={`card animate-fadeUp stagger-${Math.min(i + 1, 5)}`} style={{ overflow: 'hidden' }}>
                  {/* Status stripe */}
                  <div style={{ height: 3, background: cfg.color, opacity: 0.6 }} />

                  {/* Header */}
                  <div className="claim-header" onClick={() => setExpanded(isOpen ? null : claim._id)}
                    style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={20} color={cfg.color} />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                          {item?.title || 'Unknown Item'}
                        </div>
                        {item?.location && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={10} /> {item.location}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          Submitted {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ padding: '4px 12px', borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 11, fontWeight: 700, fontFamily: 'Syne', color: cfg.color, whiteSpace: 'nowrap' }}>
                        {cfg.label}
                      </span>
                      {isOpen ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="claim-expanded" style={{ padding: '0 22px 22px', borderTop: '1px solid var(--border)', paddingTop: 18 }}>

                      {/* Admin notes */}
                      {claim.notes && (
                        <div style={{ marginBottom: 16, padding: '12px 14px', background: claim.status === 'approved' ? 'rgba(34,211,165,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${claim.status === 'approved' ? 'rgba(34,211,165,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 8 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Admin Notes</p>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{claim.notes}</p>
                        </div>
                      )}

                      {/* Your answers */}
                      <div style={{ marginBottom: 14 }}>
                        <p className="section-title">Your Answers</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[{ q: 'Unique identifying feature', a: claim.answer1 }, { q: 'Serial / identifier', a: claim.answer2 }].map(({ q, a }) => (
                            <div key={q} style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{q}</p>
                              <p style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                <Eye size={12} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} /> {a}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Approved banner */}
                      {claim.status === 'approved' && (
                        <div style={{ padding: '12px 16px', background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.25)', borderRadius: 8, fontSize: 13, color: '#34d399', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span>Claim approved! Please visit the admin office with your ID to collect your item.</span>
                        </div>
                      )}

                      {/* Rejected banner */}
                      {claim.status === 'rejected' && (
                        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <XCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span>Claim was not approved. If you believe this is an error, contact campus administration.</span>
                        </div>
                      )}

                      {/* Withdraw button */}
                      {claim.status === 'pending' && (
                        <button onClick={() => setWithdrawTarget(claim._id)}
                          style={{ marginTop: 14, background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#f87171', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600 }}>
                          Withdraw claim
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}