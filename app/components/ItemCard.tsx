'use client';
import Link from 'next/link';
import { MapPin, Calendar, Tag, ArrowRight } from 'lucide-react';

export type ItemStatus = 'posted' | 'matched' | 'claimed' | 'resolved';
export type ItemType = 'lost' | 'found';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: string;
  location: string;
  date: string;
  status: ItemStatus;
  description: string;
  postedBy: string | { name: string };
  image?: string;
}

const statusLabel: Record<ItemStatus, string> = {
  posted: 'Posted',
  matched: 'Matched',
  claimed: 'Claimed',
  resolved: 'Resolved',
};

const categoryEmoji: Record<string, string> = {
  Electronics: '💻',
  Documents: '📄',
  Accessories: '👜',
  Stationery: '✏️',
  'ID/Cards': '🪪',
  Clothing: '👕',
  Keys: '🔑',
  Other: '📦',
};

export default function ItemCard({ item, delay = 0 }: { item: Item; delay?: number }) {
  const isLost = item.type === 'lost';

  return (
    <div
      className="card animate-fadeUp"
      style={{
        animationDelay: `${delay}s`,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Type stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: isLost
          ? 'linear-gradient(90deg, #ef4444, #f97316)'
          : 'linear-gradient(90deg, #22d3a5, #4f6ef7)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: isLost ? 'rgba(239,68,68,0.1)' : 'rgba(34,211,165,0.1)',
            border: `1px solid ${isLost ? 'rgba(239,68,68,0.2)' : 'rgba(34,211,165,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            {categoryEmoji[item.category] || '📦'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, fontFamily: 'Syne',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: isLost ? '#f97316' : '#22d3a5',
              }}>
                {isLost ? '● Lost' : '● Found'}
              </span>
              <span className={`badge badge-${item.status}`}>
                {statusLabel[item.status]}
              </span>
            </div>
            <h3 style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {item.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.description}
      </p>

      {/* Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
          <MapPin size={11} /> {item.location}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
          <Calendar size={11} /> {item.date}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
          <Tag size={11} /> {item.category}
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          by <span style={{ color: 'var(--text-secondary)' }}>{typeof item.postedBy === 'string' ? item.postedBy : item.postedBy?.name}</span>
        </span>
        <Link
          href={`/item/${item.id}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600, fontFamily: 'Syne',
            color: 'var(--accent)', textDecoration: 'none',
            transition: 'gap 0.2s',
          }}
        >
          View details <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
