import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Users, Bed, Bath, ShieldCheck, Heart } from 'lucide-react';

const FALLBACK_SCRUBBER_PHOTOS = [
  'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
];

export function formatCleanLocation(locStr = '') {
  if (!locStr) return 'India';
  const parts = locStr.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return parts[0] || 'India';
  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  if (/india/i.test(last)) {
    return secondLast ? `${secondLast}, India` : 'India';
  }
  if (secondLast.length > 20) {
    return last;
  }
  return `${secondLast}, ${last}`;
}

export default function StayCard({ listing, showTax }) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!listing?._id) return;
    try {
      const saved = JSON.parse(localStorage.getItem('fairstay_wishlist') || '[]');
      setIsSaved(saved.includes(listing._id));
    } catch (e) {}
  }, [listing?._id]);

  if (!listing) return null;

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem('fairstay_wishlist') || '[]');
      let updated;
      if (saved.includes(listing._id)) {
        updated = saved.filter(id => id !== listing._id);
        setIsSaved(false);
      } else {
        updated = [...saved, listing._id];
        setIsSaved(true);
      }
      localStorage.setItem('fairstay_wishlist', JSON.stringify(updated));
    } catch (err) {}
  };

  const basePrice = Number(listing.price) || 0;
  const fest = listing.festivalPricing;
  const hasFestivalImpact = fest && fest.rawPercentage !== 0 && fest.festivalId !== 'standard';
  const effectiveNightly = Number(listing.effectivePrice) || (fest?.multiplier ? Math.round(basePrice * fest.multiplier) : basePrice);

  // Indian GST slab calculation: <=7500: 12%, >7500: 18%
  const gstRate = effectiveNightly > 7500 ? 0.18 : 0.12;
  const taxAmount = Math.round(effectiveNightly * gstRate);
  const displayPrice = showTax ? effectiveNightly + taxAmount : effectiveNightly;
  const displayBasePrice = showTax ? basePrice + Math.round(basePrice * (basePrice > 7500 ? 0.18 : 0.12)) : basePrice;

  const averageRating = listing.reviews && listing.reviews.length > 0
    ? (listing.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / listing.reviews.length).toFixed(1)
    : '4.95';

  const imageUrl = listing.image?.url || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80';

  const handleCardClick = (e) => {
    // Avoid double navigation if clicking interactive child button
    if (e.target.closest('button')) return;
    navigate(`/stay/${listing._id}`);
  };

  return (
    <div
      className="stay-card"
      onClick={handleCardClick}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
    >
      <Link
        to={`/stay/${listing._id}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          textDecoration: 'none',
          color: 'inherit',
          flex: 1,
        }}
      >
        {/* Photo Container with scrubber */}
        <div
          className="stay-card-img-wrap"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const fraction = x / rect.width;
            if (fraction < 0.33) setPhotoIndex(0);
            else if (fraction < 0.66) setPhotoIndex(1);
            else setPhotoIndex(2);
          }}
          onMouseLeave={() => setPhotoIndex(0)}
          style={{ position: 'relative' }}
        >
          <img
            src={photoIndex === 0 ? imageUrl : FALLBACK_SCRUBBER_PHOTOS[photoIndex]}
            alt={listing.title}
            className="stay-card-img"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Category Tag (Top Left) */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: '700',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              zIndex: 2,
            }}
          >
            {listing.category || 'Trending'}
          </div>

          {/* Wishlist Heart Button (Top Right) */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label="Save stay"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Heart
              size={16}
              fill={isSaved ? '#ff5a5f' : 'rgba(0,0,0,0.2)'}
              color={isSaved ? '#ff5a5f' : '#ffffff'}
              strokeWidth={2}
            />
          </button>

          {/* FairSafe Quality Badge (Bottom Left) */}
          <div className="fairsafe-badge">
            <ShieldCheck size={13} style={{ color: '#4ade80' }} />
            <span>FairSafe {listing.fairsafeScore || 96}</span>
          </div>

          {/* Photo Scrubber Dots Indicator (Bottom Right) */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              display: 'flex',
              gap: '4px',
              zIndex: 2,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(6px)',
              padding: '3px 6px',
              borderRadius: '9999px',
            }}
          >
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: photoIndex === idx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  transition: 'background 0.2s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
          {/* Location & Rating */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                fontWeight: '600',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}
              title={listing.location}
            >
              <MapPin size={13} style={{ color: '#ff5a5f', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatCleanLocation(listing.location)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', flexShrink: 0 }}>
              <Star size={13} style={{ fill: '#eab308', color: '#eab308' }} />
              <span>{averageRating}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.75rem' }}>
                ({listing.reviews?.length || 18})
              </span>
            </div>
          </div>

          {/* Stay Title */}
          <h3
            style={{
              fontSize: '0.98rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              margin: '2px 0 4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={listing.title}
          >
            {listing.title}
          </h3>

          {/* Capacity Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span>{listing.maxGuests || 4} guests</span>
            <span>•</span>
            <span>{listing.bedrooms || 2} bds</span>
            <span>•</span>
            <span>{listing.baths || 2} baths</span>
          </div>

          {/* Pricing Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: 'auto', gap: '8px' }}>
            <div>
              {hasFestivalImpact ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₹{displayBasePrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '1.18rem', fontWeight: '800', color: fest.rawPercentage > 0 ? 'var(--text-primary)' : '#16a34a' }}>
                    ₹{displayPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    / night
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ₹{displayPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    / night
                  </span>
                </div>
              )}
              {showTax && (
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#16a34a', fontWeight: '600', marginTop: '1px' }}>
                  includes ₹{taxAmount.toLocaleString('en-IN')} GST
                </span>
              )}
            </div>

            {hasFestivalImpact ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  color: fest.rawPercentage > 0 ? '#b91c1c' : '#15803d',
                  background: fest.rawPercentage > 0 ? '#fee2e2' : '#dcfce7',
                  border: `1px solid ${fest.rawPercentage > 0 ? '#fecaca' : '#bbf7d0'}`,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                title={fest.explanation}
              >
                {fest.emoji} {fest.signedPercentage} {fest.rawPercentage < 0 ? 'Discount' : (fest.festivalName.split(' ')[0] || 'Surge')}
              </span>
            ) : (
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#ff5a5f', background: 'rgba(255, 90, 95, 0.08)', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.3px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Direct Rate (0% Surge)
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
