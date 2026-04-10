'use client';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import { itemService } from '../../lib/services/item.service';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

const categories = ['All', 'Electronics', 'Documents', 'Accessories', 'Stationery', 'ID/Cards', 'Clothing', 'Keys', 'Other'];
const locations  = ['All', 'Main Library', 'Cafeteria Block C', 'Sports Complex', 'Computer Lab 101', 'Lecture Hall B2', 'Hostel Block A', 'Parking Area', 'Gym'];
const statuses   = ['All', 'posted', 'matched', 'claimed', 'resolved'];

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

export default function BrowsePage() {
  const [query, setQuery]           = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [category, setCategory]     = useState('All');
  const [location, setLocation]     = useState('All');
  const [status, setStatus]         = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const [items, setItems]     = useState<Item[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await itemService.getAll({ type: typeFilter, category, location, status, q: query });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      console.error('Browse fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, typeFilter, category, location, status]);

  // Debounce search — only fire after user stops typing for 400ms
  useEffect(() => {
    const t = setTimeout(fetchItems, query ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchItems, query]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 48px' }}>

        <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>Browse Items</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{loading ? '…' : `${total} items found across campus`}</p>
        </div>

        <div className="animate-fadeUp stagger-1" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            {/* Search */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="input" style={{ paddingLeft: 42 }}
                placeholder="Search by keyword, item name, description…"
                value={query} onChange={e => setQuery(e.target.value)} />
              {query && (
                <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={14} color="var(--text-muted)" />
                </button>
              )}
            </div>

            {/* Type toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {(['all', 'lost', 'found'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} style={{
                  padding: '10px 16px', border: 'none', cursor: 'pointer',
                  fontFamily: 'Syne', fontWeight: 600, fontSize: 13, textTransform: 'capitalize',
                  background: typeFilter === t ? 'var(--accent)' : 'transparent',
                  color: typeFilter === t ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}>{t}</button>
              ))}
            </div>

            <button onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'btn-primary' : 'btn-ghost'} style={{ padding: '10px 16px' }}>
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>

          {showFilters && (
            <div className="card animate-fadeUp" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <label className="label">Category</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
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
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>Loading items…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
            <Filter size={40} style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No items found</p>
            <p style={{ fontSize: 14 }}>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {items.map((item, i) => <ItemCard key={item._id} item={item} delay={i * 0.05} />)}
          </div>
        )}
      </main>
    </div>
  );
}