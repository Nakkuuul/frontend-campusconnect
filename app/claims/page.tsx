'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle, Clock, XCircle, Eye, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { claimsService } from '../../lib/services/claims.service';
import { itemService } from '../../lib/services/item.service';

const statusConfig = {
  approved: { label: 'Approved',       icon: CheckCircle, color: 'var(--accent-2)', bg: 'rgba(34,211,165,0.1)',  border: 'rgba(34,211,165,0.25)' },
  pending:  { label: 'Pending Review', icon: Clock,       color: '#f59e0b',          bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  rejected: { label: 'Rejected',       icon: XCircle,     color: '#ef4444',          bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)' },
};

export default function ClaimsPage() {
  const [claims, setClaims]       = useState<any[]>([]);
  const [foundItems, setFoundItems] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [claimForm, setClaimForm] = useState({ itemId: '', answer1: '', answer2: '', proof: '' });

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

  const handleSubmitClaim = async () => {
    if (!claimForm.itemId || !claimForm.answer1 || !claimForm.answer2) {
      setFormError('Item, answer 1, and answer 2 are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const newClaim = await claimsService.submit({
        itemId:  claimForm.itemId,
        answer1: claimForm.answer1,
        answer2: claimForm.answer2,
        proof:   claimForm.proof,
      });
      setClaims(prev => [newClaim, ...prev]);
      setClaimForm({ itemId: '', answer1: '', answer2: '', proof: '' });
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (claimId: string) => {
    try {
      await claimsService.withdraw(claimId);
      setClaims(prev => prev.filter(c => c._id !== claimId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not withdraw claim.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 48px' }}>

        <div className="animate-fadeUp" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>My Claims</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Track verification status for items you've claimed</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginTop: 4 }}>
            <Shield size={15} /> New Claim
          </button>
        </div>

        {/* New claim form */}
        {showForm && (
          <div className="card animate-fadeUp" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Submit a Claim</h3>

            {formError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 14, fontSize: 13, color: '#f87171' }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Select Item to Claim</label>
                <select className="input" value={claimForm.itemId} onChange={e => setClaimForm(f => ({ ...f, itemId: e.target.value }))}>
                  <option value="">Choose a found item…</option>
                  {foundItems.map(i => (
                    <option key={i._id} value={i._id}>{i.title} — {i.location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Verification Answer 1</label>
                <input className="input" placeholder="Describe a unique feature of the item…"
                  value={claimForm.answer1} onChange={e => setClaimForm(f => ({ ...f, answer1: e.target.value }))} />
              </div>
              <div>
                <label className="label">Verification Answer 2</label>
                <input className="input" placeholder="Any serial number, inscription, or other identifier…"
                  value={claimForm.answer2} onChange={e => setClaimForm(f => ({ ...f, answer2: e.target.value }))} />
              </div>
              <div>
                <label className="label">Supporting Evidence (optional)</label>
                <textarea className="input" placeholder="Describe or paste links to supporting evidence (purchase receipt, photo, etc.)"
                  value={claimForm.proof} onChange={e => setClaimForm(f => ({ ...f, proof: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" onClick={() => { setShowForm(false); setFormError(''); }} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmitClaim} style={{ flex: 2, justifyContent: 'center' }} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Claim'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Claims list */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading claims…</p>
        ) : claims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <Shield size={36} style={{ margin: '0 auto 14px', display: 'block' }} />
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No claims yet</p>
            <p style={{ fontSize: 13 }}>Found something that belongs to you? Submit a claim.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {claims.map((claim, i) => {
              const cfg    = statusConfig[claim.status as keyof typeof statusConfig];
              const Icon   = cfg.icon;
              const isOpen = expanded === claim._id;
              const item   = claim.itemId;

              return (
                <div key={claim._id} className={`card animate-fadeUp stagger-${i + 1}`} style={{ overflow: 'hidden' }}>
                  {/* Header */}
                  <div onClick={() => setExpanded(isOpen ? null : claim._id)}
                    style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} color={cfg.color} />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                          {item?.title || 'Unknown Item'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Submitted {new Date(claim.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ padding: '4px 12px', borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 12, fontWeight: 600, fontFamily: 'Syne', color: cfg.color }}>
                        {cfg.label}
                      </span>
                      {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                      {claim.notes && (
                        <div style={{ marginBottom: 14 }}>
                          <p className="section-title">Admin Notes</p>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{claim.notes}</p>
                        </div>
                      )}

                      <div style={{ marginBottom: 14 }}>
                        <p className="section-title">Your Answers</p>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <li style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                            <Eye size={13} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                            {claim.answer1}
                          </li>
                          <li style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                            <Eye size={13} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                            {claim.answer2}
                          </li>
                        </ul>
                      </div>

                      {claim.status === 'approved' && (
                        <div style={{ marginTop: 8, padding: '12px 16px', background: 'rgba(34,211,165,0.06)', border: '1px solid rgba(34,211,165,0.2)', borderRadius: 8, fontSize: 13, color: '#34d399' }}>
                          Your claim has been approved. Please visit the admin office to collect your item.
                        </div>
                      )}

                      {claim.status === 'pending' && (
                        <button className="btn-ghost" onClick={() => handleWithdraw(claim._id)}
                          style={{ marginTop: 12, fontSize: 12, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
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