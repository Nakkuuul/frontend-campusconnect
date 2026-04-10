'use client';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import { itemService } from '../../lib/services/item.service';
import { Search, SlidersHorizontal, X, Filter, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';

const categories = ['All', 'Electronics', 'Documents', 'Accessories', 'Stationery', 'ID/Cards', 'Clothing', 'Keys', 'Other'];
const locations  = ['All', 'Main Library', 'Cafeteria Block C', 'Sports Complex', 'Computer Lab 101', 'Lecture Hall B2', 'Hostel Block A', 'Parking Area', 'Gym'];
const statuses   = ['All', 'posted', 'matched', 'claimed', 'resolved'];

const categoryEmoji: Record<string, string> = {
  Electronics: '💻', Documents: '📄', Accessories: '👜',
  Stationery: '✏️', 'ID/Cards': '🪪', Clothing: '👕', Keys: '🔑', Other: '📦',
};

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

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ height: 3, background: 'var(--border)', borderRadius: 0, margin: '-20px -20px 16px', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 15, width: '80%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 12, width: '100%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 12, width: '70%', marginBottom: 16 }} />
      <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ height: 11, width: 100 }} />
        <div className="skeleton" style={{ height: 26, width: 64, borderRadius: 6 }} />
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const [query, setQuery]             = useState('');
  const [typeFilter, setTypeFilter]   = useState<'all' | 'lost' | 'found'>('all');
  const [category, setCategory]       = useState('All');
  const [location, setLocation]       = useState('All');
  const [status, setStatus]           = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>('grid');
  const [items, setItems]             = useState<Item[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const LIMIT = 12;

  const activeFilterCount = [
    category !== 'All', location !== 'All', status !== 'All',
  ].filter(Boolean).length;

  const fetchItems = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const result = await itemService.getAll({
        type: typeFilter, category, location, status,
        q: query, page: p, limit: LIMIT,
      });
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages || 1);
      setPage(p);
    } catch (err) {
      console.error('Browse fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, typeFilter, category, location, status]);

  useEffect(() => {
    const t = setTimeout(() => fetchItems(1), query ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchItems, query]);

  const resetFilters = () => {
    setCategory('All');
    setLocation('All');
    setStatus('All');
    setTypeFilter('all');
    setQuery('');
  };

  const hasActiveFilters = query || typeFilter !== 'all' || category !== 'All' || location !== 'All' || status !== 'All';

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
        .skeleton {
          background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius: 6px;
        }
        .filter-panel { animation: slideDown 0.2s ease; }
        .type-btn { transition: all 0.2s; }
        .type-btn:hover:not(.active-type) { background: rgba(255,255,255,0.04) !important; color: var(--text-secondary) !important; }
        .view-btn { transition: all 0.2s; }
        .view-btn:hover { background: var(--bg-card-hover) !important; }
        .cat-chip { transition: all 0.18s; cursor: pointer; }
        .cat-chip:hover { border-color: var(--border-bright) !important; color: var(--text-secondary) !important; }
        .page-btn { transition: all 0.2s; }
        .page-btn:hover:not(:disabled) { background: var(--bg-card-hover) !important; border-color: var(--border-bright) !important; }
        .active-filter-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; borderRadius: 99px;
          background: rgba(79,110,247,0.1); border: 1px solid rgba(79,110,247,0.25);
          font-size: 11px; color: var(--accent); font-weight: 600; font-family: 'Syne', sans-serif;
          cursor: pointer; transition: background 0.15s;
        }
        .active-filter-chip:hover { background: rgba(79,110,247,0.18); }
      `}</style>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 48px' }}>

        {/* Header */}
        <div className="animate-fadeUp" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Browse Items</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {loading ? 'Searching…' : total === 0 ? 'No items found' : `${total} item${total !== 1 ? 's' : ''} across campus`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="view-btn" onClick={() => setViewMode('grid')}
                style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${viewMode === 'grid' ? 'var(--accent)' : 'var(--border)'}`, background: viewMode === 'grid' ? 'rgba(79,110,247,0.1)' : 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutGrid size={14} color={viewMode === 'grid' ? 'var(--accent)' : 'var(--text-muted)'} />
              </button>
              <button className="view-btn" onClick={() => setViewMode('list')}
                style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${viewMode === 'list' ? 'var(--accent)' : 'var(--border)'}`, background: viewMode === 'list' ? 'rgba(79,110,247,0.1)' : 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <List size={14} color={viewMode === 'list' ? 'var(--accent)' : 'var(--text-muted)'} />
              </button>
            </div>
          </div>
        </div>

        {/* Search + controls */}
        <div className="animate-fadeUp stagger-1" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>

            {/* Search bar */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input className="input" style={{ paddingLeft: 42, paddingRight: query ? 40 : 14 }}
                placeholder="Search items, descriptions, locations…"
                value={query} onChange={e => setQuery(e.target.value)} />
              {query && (
                <button onClick={() => setQuery('')}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <X size={13} color="var(--text-muted)" />
                </button>
              )}
            </div>

            {/* Type toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
              {(['all', 'lost', 'found'] as const).map(t => (
                <button key={t} className={`type-btn ${typeFilter === t ? 'active-type' : ''}`} onClick={() => setTypeFilter(t)}
                  style={{
                    padding: '9px 14px', border: 'none', cursor: 'pointer',
                    fontFamily: 'Syne', fontWeight: 600, fontSize: 12, textTransform: 'capitalize',
                    background: typeFilter === t
                      ? t === 'lost' ? 'rgba(239,68,68,0.15)' : t === 'found' ? 'rgba(34,211,165,0.12)' : 'var(--accent)'
                      : 'transparent',
                    color: typeFilter === t
                      ? t === 'lost' ? '#f87171' : t === 'found' ? '#34d399' : '#fff'
                      : 'var(--text-muted)',
                    borderRight: t !== 'found' ? '1px solid var(--border)' : 'none',
                  }}>
                  {t === 'lost' ? '🔴' : t === 'found' ? '🟢' : ''} {t}
                </button>
              ))}
            </div>

            {/* Filters button */}
            <button onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '9px 14px', flexShrink: 0, position: 'relative' }}>
              <SlidersHorizontal size={14} /> Filters
              {activeFilterCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%', background: '#f59e0b', color: '#000', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Category quick chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {categories.map(c => (
              <button key={c} className="cat-chip"
                onClick={() => setCategory(c === category ? 'All' : c)}
                style={{
                  flexShrink: 0, padding: '5px 12px', borderRadius: 99,
                  border: `1px solid ${category === c && c !== 'All' ? 'var(--accent)' : 'var(--border)'}`,
                  background: category === c && c !== 'All' ? 'rgba(79,110,247,0.1)' : 'transparent',
                  color: category === c && c !== 'All' ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: 12, fontFamily: 'Syne', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                {c !== 'All' && <span style={{ fontSize: 13 }}>{categoryEmoji[c]}</span>}
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="card filter-panel" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <label className="label">Location</label>
                <select className="input" value={location} onChange={e => setLocation(e.target.value)}>
                  {locations.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                  {statuses.map(s => <option key={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn-ghost" onClick={resetFilters} style={{ width: '100%', justifyContent: 'center' }}>
                  <X size={13} /> Reset all
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Active filters:</span>
            {query && <span className="active-filter-chip" onClick={() => setQuery('')}>"{query}" <X size={9} /></span>}
            {typeFilter !== 'all' && <span className="active-filter-chip" onClick={() => setTypeFilter('all')} style={{ textTransform: 'capitalize' }}>{typeFilter} <X size={9} /></span>}
            {category !== 'All' && <span className="active-filter-chip" onClick={() => setCategory('All')}>{category} <X size={9} /></span>}
            {location !== 'All' && <span className="active-filter-chip" onClick={() => setLocation('All')}>{location} <X size={9} /></span>}
            {status !== 'All' && <span className="active-filter-chip" onClick={() => setStatus('All')} style={{ textTransform: 'capitalize' }}>{status} <X size={9} /></span>}
            <button onClick={resetFilters} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px dashed var(--border)', borderRadius: 14 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No items found</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
              {hasActiveFilters ? 'Try adjusting your filters or search query.' : 'No items have been reported yet.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {hasActiveFilters && (
                <button className="btn-ghost" onClick={resetFilters}>
                  <X size={14} /> Clear filters
                </button>
              )}
              <Link href="/report" className="btn-primary">Report an item</Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: viewMode === 'list' ? 10 : 16 }}>
              {items.map((item, i) => <ItemCard key={item._id} item={item} delay={i * 0.03} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 32 }}>
                <button className="page-btn btn-ghost" onClick={() => fetchItems(page - 1)} disabled={page === 1}
                  style={{ padding: '8px 16px', opacity: page === 1 ? 0.4 : 1 }}>
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) => p === '…'
                    ? <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', fontSize: 13 }}>…</span>
                    : <button key={p} className="page-btn" onClick={() => fetchItems(p as number)}
                        style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${page === p ? 'var(--accent)' : 'var(--border)'}`, background: page === p ? 'rgba(79,110,247,0.12)' : 'var(--bg-card)', color: page === p ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        {p}
                      </button>
                  )
                }
                <button className="page-btn btn-ghost" onClick={() => fetchItems(page + 1)} disabled={page === totalPages}
                  style={{ padding: '8px 16px', opacity: page === totalPages ? 0.4 : 1 }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}