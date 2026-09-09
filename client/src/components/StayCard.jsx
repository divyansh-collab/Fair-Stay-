import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users, Bed, Bath, ShieldCheck } from 'lucide-react';

export default function StayCard({ listing, showTax }) {
  if (!listing) return null;

  const basePrice = Number(listing.price) || 0;
  // Indian GST slab calculation: <=7500: 12%, >7500: 18%
  const gstRate = basePrice > 7500 ? 0.18 : 0.12;
  const taxAmount = Math.round(basePrice * gstRate);
  const displayPrice = showTax ? basePrice + taxAmount : basePrice;

  const averageRating = listing.reviews && listing.reviews.length > 0
    ? (listing.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / listing.reviews.length).toFixed(1)
    : '4.95';

  const imageUrl = listing.image?.url || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="stay-card">
      <Link to={`/listing/${listing._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Photo Container */}
        <div className="stay-card-img-wrap">
          <img
            src={imageUrl}
            alt={listing.title}
            className="stay-card-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* FairSafe Quality Badge */}
          <div className="fairsafe-badge">
            <ShieldCheck size={12} style={{ color: '#4ade80' }} />
            <span>FairSafe {listing.fairsafeScore || 96}</span>
          </div>

          {/* Category Tag */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(6px)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', color: '#1e293b' }}>
            {listing.category || 'Trending'}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px' }}>
          {/* Location & Rating */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#64748b', fontWeight: '500' }}>
              <MapPin size={13} style={{ color: '#ff5a5f' }} />
              <span>{listing.location || 'India'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
              <Star size={13} style={{ fill: '#eab308', color: '#eab308' }} />
              <span>{averageRating}</span>
              <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '0.75rem' }}>
                ({listing.reviews?.length || 18})
              </span>
            </div>
          </div>

          {/* Stay Title */}
          <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.35, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.title}
          </h3>

          {/* Capacity Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: '#64748b', marginBottom: '12px' }}>
            <span>{listing.maxGuests || 4} guests</span>
            <span>•</span>
            <span>{listing.bedrooms || 2} bds</span>
            <span>•</span>
            <span>{listing.baths || 2} baths</span>
          </div>

          {/* Pricing Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px' }}>
                / night
              </span>
              {showTax && (
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#16a34a', fontWeight: '600' }}>
                  includes ₹{taxAmount.toLocaleString('en-IN')} GST
                </span>
              )}
            </div>

            <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#ff5a5f', background: 'rgba(255, 90, 95, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>
              Direct Rate
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
