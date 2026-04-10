'use client';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Tag, ArrowRight, Clock } from 'lucide-react';

export type ItemStatus = 'posted' | 'matched' | 'claimed' | 'resolved';
export type ItemType   = 'lost' | 'found';

export interface Item {
  _id?: string;
  id?: string;
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
  posted:   'Posted',
  matched:  'Matched',
  claimed:  'Claimed',
  resolved: 'Resolved',
};

const categoryEmoji: Record<string, string> = {
  Electronics: '💻',
  Documents:   '📄',
  Accessories: '👜',
  Stationery:  '✏️',
  'ID/Cards':  '🪪',
  Clothing:    '👕',
  Keys:        '🔑',
  Other:       '📦',
};

function getDaysAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (isNaN(diff))  return dateStr;
  if (diff === 0)   return 'Today';
  if (diff === 1)   return 'Yesterday';
  if (diff < 30)    return `${diff}d ago`;
  if (diff < 365)   return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}

export default function ItemCard({ item, delay = 0 }: { item: Item; delay?: number }) {
  const isLost   = item.type === 'lost';
  const itemId   = item._id || item.id;
  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.image}`
    : null;

  const accentColor  = isLost ? '#f97316' : '#22d3a5';
  const bgColor      = isLost ? 'rgba(239,68,68,0.08)'  : 'rgba(34,211,165,0.08)';
  const borderColor  = isLost ? 'rgba(239,68,68,0.18)'  : 'rgba(34,211,165,0.18)';

  return (
    <div
      className="card animate-fadeUp"
      style={{ animationDelay: `${delay}s`, padding: 0, position: 'relative', overflow: 'hidden' }}
    >
      <style>{`
        .item-card-inner { transition: background 0.2s; }
        .item-card-inner:hover .item-card-link { gap: 8px !important; }
        .item-card-link { transition: gap 0.2s; }
        .item-thumb { transition: transform 0.3s ease; }
        .item-thumb:hover { transform: scale(1.04); }
      `}</style>

      {/* Type stripe */}
      <div style={{
        height: 3, width: '100%',
        background: isLost
          ? 'linear-gradient(90deg, #ef4444, #f97316)'
          : 'linear-gradient(90deg, #22d3a5, #4f6ef7)',
      }} />

      <div className="item-card-inner" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

          {/* Category icon or thumbnail */}
          <div style={{ flexShrink: 0 }}>
            {imageUrl ? (
              <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', border: `1px solid ${borderColor}` }}>
                <Image src={imageUrl} alt={item.title} width={52} height={52}
                  className="item-thumb"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: 10, fontSize: 22,
                background: bgColor, border: `1px solid ${borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {categoryEmoji[item.category] || '📦'}
              </div>
            )}
          </div>

          {/* Title + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 9, fontWeight: 800, fontFamily: 'Syne',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: accentColor, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, display: 'inline-block' }} />
                {isLost ? 'Lost' : 'Found'}
              </span>
              <span className={`badge badge-${item.status}`} style={{ fontSize: 9 }}>
                {statusLabel[item.status]}
              </span>
            </div>
            <h3 style={{
              fontFamily: 'Syne', fontSize: 14, fontWeight: 700,
              color: 'var(--text-primary)', lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.title}
            </h3>
          </div>

          {/* Days ago pill */}
          <div style={{
            flexShrink: 0, fontSize: 10, color: 'var(--text-muted)',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 99, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4,
            whiteSpace: 'nowrap',
          }}>
            <Clock size={9} /> {getDaysAgo(item.date)}
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: '0 0 2px',
        }}>
          {item.description}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>

          {/* Meta chips */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
              <MapPin size={10} style={{ flexShrink: 0 }} /> {item.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              <Tag size={10} /> {item.category}
            </span>
          </div>

          {/* View details link */}
          <Link
            href={`/item/${itemId}`}
            className="item-card-link"
            style={{
              display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
              fontSize: 11, fontWeight: 700, fontFamily: 'Syne',
              color: 'var(--accent)', textDecoration: 'none',
              padding: '5px 10px', borderRadius: 6,
              background: 'var(--accent-glow)',
              border: '1px solid rgba(79,110,247,0.2)',
              transition: 'background 0.2s, gap 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,110,247,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-glow)')}
          >
            View <ArrowRight size={11} />
          </Link>
        </div>

        {/* Posted by */}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -6 }}>
          Posted by{' '}
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            {typeof item.postedBy === 'string' ? item.postedBy : item.postedBy?.name || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}