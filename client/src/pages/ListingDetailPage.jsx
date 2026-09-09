import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  ShieldCheck, 
  Wifi, 
  Car, 
  Tv, 
  Wind, 
  UtensilsCrossed, 
  ArrowLeft, 
  Share2, 
  Heart,
  Calendar,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import FestivalPricingWidget from '../components/FestivalPricingWidget';

// 4 complementary fallback high-res photos for luxury 5-photo bento grid
const COMPLEMENTARY_PHOTOS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80',
];

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Booking widget state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    loadListing();
    window.scrollTo(0, 0);
  }, [id]);

  const loadListing = async () => {
    setLoading(true);
    try {
      const res = await api.getListings();
      if (res && res.data) {
        const found = res.data.find((item) => item._id === id);
        setListing(found || res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load listing:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#64748b' }}>
          Loading sanctuary details...
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const mainPhoto = listing.image?.url || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80';
  const gallery = [mainPhoto, ...COMPLEMENTARY_PHOTOS];

  const basePrice = Number(listing.price) || 3500;
  const nights = 2; // Default 2 nights preview
  const staySubtotal = basePrice * nights;
  const gstRate = basePrice > 7500 ? 0.18 : 0.12;
  const gstAmount = Math.round(staySubtotal * gstRate);
  const totalAmount = staySubtotal + gstAmount;

  return (
    <div className="container-custom" style={{ padding: '32px 24px 80px' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Stays</span>
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#0f172a', fontWeight: '600', cursor: 'pointer' }}>
            <Share2 size={16} /> Share
          </button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#0f172a', fontWeight: '600', cursor: 'pointer' }}>
            <Heart size={16} /> Save
          </button>
        </div>
      </div>

      {/* Title & Location Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.25, marginBottom: '8px' }}>
          {listing.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.88rem', color: '#475569' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: '#0f172a' }}>
            <Star size={14} style={{ fill: '#eab308', color: '#eab308' }} />
            4.96 • <u style={{ fontWeight: '600', color: '#64748b' }}>24 reviews</u>
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} style={{ color: '#ff5a5f' }} />
            {listing.location}, India
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#16a34a', fontWeight: '700' }}>
            <ShieldCheck size={14} /> FairSafe Score {listing.fairsafeScore || 96}
          </span>
        </div>
      </div>

      {/* 5-Photo Luxury Bento Showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '200px 200px', gap: '10px', borderRadius: '20px', overflow: 'hidden', marginBottom: '40px', position: 'relative' }}>
        {/* Main Hero Photo */}
        <div
          onClick={() => setLightboxIndex(0)}
          style={{ gridRow: 'span 2', cursor: 'pointer', overflow: 'hidden', background: '#e2e8f0' }}
        >
          <img
            src={gallery[0]}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </div>

        {/* 4 Complementary Bento Photos */}
        {gallery.slice(1, 5).map((img, i) => (
          <div
            key={i}
            onClick={() => setLightboxIndex(i + 1)}
            style={{ cursor: 'pointer', overflow: 'hidden', background: '#e2e8f0' }}
          >
            <img
              src={img}
              alt={`Photo ${i + 2}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>
        ))}

        {/* "Show all 5 photos" floating button */}
        <button
          onClick={() => setLightboxIndex(0)}
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            background: '#ffffff',
            border: '1px solid #0f172a',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: '700',
            color: '#0f172a',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
          }}
        >
          Show all 5 photos
        </button>
      </div>

      {/* Content Split: Details on Left, Booking Card on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '48px' }}>
        {/* Left Column */}
        <div>
          {/* Room Specifications */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              Entire vacation villa hosted by Verified Superhost
            </h2>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: '#64748b' }}>
              <span>{listing.maxGuests || 4} guests</span>
              <span>•</span>
              <span>{listing.bedrooms || 2} bedrooms</span>
              <span>•</span>
              <span>{listing.beds || 2} beds</span>
              <span>•</span>
              <span>{listing.baths || 2} baths</span>
            </div>
          </div>

          {/* Highlights */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <Wifi size={20} style={{ color: '#ff5a5f', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a' }}>Ultra Fast 100+ Mbps Wi-Fi</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Verified fiber broadband perfect for remote work and 4K streaming.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <ShieldCheck size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a' }}>Direct Host Pricing</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>No arbitrary 300% OTA markups. You pay direct host rates.</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              About this sanctuary
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7 }}>
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
              What this place offers
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '0.88rem', color: '#334155' }}>
              {(listing.amenities && listing.amenities.length > 0 ? listing.amenities : [
                'High-Speed Wi-Fi (100+ Mbps)',
                'Private Swimming Pool',
                'Air Conditioning',
                'Dedicated Workspace',
                'Fully Equipped Kitchen',
                'Free Parking On-Premises',
                'Scenic Balcony Views',
                'Pet Friendly'
              ]).map((am, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#ff5a5f' }}>✓</span>
                  <span>{am}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Festival & Seasonal Price Intelligence */}
          <FestivalPricingWidget listing={listing} />
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div>
          <div style={{ position: 'sticky', top: '100px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}>
            {/* Price Header */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                  ₹{basePrice.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#64748b', marginLeft: '4px' }}>
                  / night
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} style={{ fill: '#eab308', color: '#eab308' }} />
                <span>4.96</span>
              </div>
            </div>

            {/* Check-In / Check-Out Box */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #cbd5e1' }}>
                <div style={{ padding: '10px 14px', borderRight: '1px solid #cbd5e1' }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569' }}>Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.8rem', fontFamily: 'inherit', color: '#0f172a' }}
                  />
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569' }}>Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.8rem', fontFamily: 'inherit', color: '#0f172a' }}
                  />
                </div>
              </div>
              <div style={{ padding: '10px 14px' }}>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569' }}>Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.82rem', fontFamily: 'inherit', background: 'transparent' }}
                >
                  <option value="1">1 guest</option>
                  <option value="2">2 guests</option>
                  <option value="4">4 guests</option>
                  <option value="6">6 guests</option>
                </select>
              </div>
            </div>

            {/* Direct Reserve Button */}
            <a
              href={`/listings/${listing._id}`}
              className="btn-coral"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: '14px' }}
            >
              Reserve via FairStay
            </a>

            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>
              You won't be charged yet • Instant 100% full refund guarantee
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>₹{basePrice.toLocaleString('en-IN')} × {nights} nights</span>
                <span>₹{staySubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Statutory GST ({basePrice > 7500 ? '18%' : '12%'})</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '600' }}>
                <span>FairStay Service Fee</span>
                <span>₹0 (Waived)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '14px', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                <span>Total before taxes & fees</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.95)', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <button
            onClick={() => setLightboxIndex(null)}
            style={{ position: 'absolute', top: '24px', right: '24px', color: '#ffffff', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>

          <img
            src={gallery[lightboxIndex]}
            alt={`Gallery ${lightboxIndex + 1}`}
            style={{ maxWidth: '90%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }}
          />

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px', color: '#fff' }}>
            <button
              onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))}
              style={{ color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '9999px', cursor: 'pointer' }}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
              {lightboxIndex + 1} / {gallery.length}
            </span>
            <button
              onClick={() => setLightboxIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))}
              style={{ color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '9999px', cursor: 'pointer' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
