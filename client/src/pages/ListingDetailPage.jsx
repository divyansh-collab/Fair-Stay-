import React, { useState, useEffect, useRef } from 'react';
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
import CheckoutModal from '../components/CheckoutModal';
import RoomTicketModal from '../components/RoomTicketModal';
import ListingMap from '../components/ListingMap';
import ReviewSection from '../components/ReviewSection';
import DateRangePicker, { formatDisplayDate } from '../components/DateRangePicker';
import { toast } from 'react-hot-toast';

// 4 complementary fallback high-res photos for luxury 5-photo bento grid
const COMPLEMENTARY_PHOTOS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80',
];

export function getCleanFestivalName(name) {
  if (!name) return 'Festival';
  return name.replace(/\s*&.*$/, '').trim();
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Booking & Modal States
  const defaultIn = new Date().toISOString().split('T')[0];
  const defaultOut = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(defaultIn);
  const [checkOut, setCheckOut] = useState(defaultOut);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarStep, setCalendarStep] = useState('checkIn');
  const [guests, setGuests] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [keylessPin, setKeylessPin] = useState('8492');
  const [isSaved, setIsSaved] = useState(false);
  const [seasonalPricing, setSeasonalPricing] = useState(null);

  useEffect(() => {
    if (!listing?._id) return;
    api.predictFestivalPrice({
      listingId: listing._id,
      destination: listing.location,
      checkInDate: checkIn,
      basePrice: Number(listing.price) || 3500,
    }).then((res) => {
      if (res) setSeasonalPricing(res);
    }).catch((err) => {
      console.warn('Could not load festival pricing for stay:', err);
    });
  }, [listing?._id, checkIn]);

  useEffect(() => {
    try {
      const savedList = JSON.parse(localStorage.getItem('fairstay_wishlist') || '[]');
      setIsSaved(savedList.includes(id));
    } catch (e) {}
  }, [id]);

  const toggleWishlist = () => {
    try {
      const savedList = JSON.parse(localStorage.getItem('fairstay_wishlist') || '[]');
      let updated;
      if (savedList.includes(id)) {
        updated = savedList.filter(item => item !== id);
        setIsSaved(false);
        toast('Removed from saved stays', { icon: '💔' });
      } else {
        updated = [...savedList, id];
        setIsSaved(true);
        toast.success('Saved to your wishlist! ❤️');
      }
      localStorage.setItem('fairstay_wishlist', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title || 'FairStay',
          text: `Check out ${listing?.title || 'this stay'} on FairStay!`,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Stay link copied to clipboard!');
      } catch (e) {
        toast.error('Could not copy link');
      }
    }
  };

  useEffect(() => {
    loadListing();
    window.scrollTo(0, 0);
  }, [id]);

  const loadListing = async () => {
    setLoading(true);
    try {
      // High-speed direct single listing fetch
      const res = await api.getListing(id);
      if (res && res.data) {
        setListing(res.data);
      } else {
        // Resilient fallback
        const allRes = await api.getListings();
        const found = allRes?.data?.find((item) => item._id === id);
        setListing(found || allRes?.data?.[0]);
      }
    } catch (err) {
      console.error('Failed to load listing:', err);
      try {
        const allRes = await api.getListings();
        const found = allRes?.data?.find((item) => item._id === id);
        setListing(found || allRes?.data?.[0]);
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom" style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', border: '3px solid #ff5a5f', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Loading Sanctuary Details...
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Fetching verified photos, real-time rates & FairSafe credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container-custom" style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '24px', padding: '40px 24px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' }}>
            Stay Not Found
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
            The vacation sanctuary or room you are looking for may have been booked, updated, or moved.
          </p>
          <Link to="/" className="btn-coral">
            Explore All Stays
          </Link>
        </div>
      </div>
    );
  }

  const mainPhoto = listing.image?.url || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80';
  const gallery = [mainPhoto, ...COMPLEMENTARY_PHOTOS];

  const basePrice = Number(listing.price) || 3500;
  const inDate = checkIn ? new Date(checkIn) : new Date();
  const outDate = checkOut ? new Date(checkOut) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const diffTime = outDate.getTime() - inDate.getTime();
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const multiplier = seasonalPricing?.multiplier || 
    (seasonalPricing?.percentage && seasonalPricing?.direction === 'higher' ? (1 + Number(seasonalPricing.percentage) / 100) : 
     seasonalPricing?.percentage && seasonalPricing?.direction === 'lower' ? (1 - Number(seasonalPricing.percentage) / 100) : 1.0);
  const effectiveNightlyRate = (seasonalPricing?.effectivePrice && seasonalPricing.effectivePrice !== basePrice)
    ? seasonalPricing.effectivePrice 
    : Math.round(basePrice * multiplier);
  const baseSubtotal = basePrice * nights;
  const seasonalAdjustment = (effectiveNightlyRate - basePrice) * nights;
  const staySubtotal = effectiveNightlyRate * nights;

  const gstRate = effectiveNightlyRate > 7500 ? 0.18 : (effectiveNightlyRate <= 1000 ? 0 : 0.12);
  const gstAmount = Math.round(staySubtotal * gstRate);
  const totalAmount = staySubtotal + gstAmount;

  const isSurge = seasonalPricing && (
    (seasonalPricing.rawPercentage && seasonalPricing.rawPercentage > 0) ||
    seasonalPricing.direction === 'higher' ||
    (seasonalPricing.signedPercentage && String(seasonalPricing.signedPercentage).startsWith('+'))
  );
  const isDiscount = seasonalPricing && (
    (seasonalPricing.rawPercentage && seasonalPricing.rawPercentage < 0) ||
    seasonalPricing.direction === 'lower' ||
    (seasonalPricing.signedPercentage && String(seasonalPricing.signedPercentage).startsWith('-'))
  );
  const hasImpact = seasonalPricing && (isSurge || isDiscount) && seasonalPricing.festivalId !== 'standard';

  return (
    <div className="container-custom" style={{ padding: '32px 24px 80px' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Stays</span>
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleShare}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '6px 14px', borderRadius: '8px' }}
          >
            <Share2 size={16} /> Share
          </button>
          <button
            onClick={toggleWishlist}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: isSaved ? '#ff5a5f' : 'var(--text-primary)', fontWeight: '600', cursor: 'pointer', background: isSaved ? 'rgba(255, 90, 95, 0.15)' : 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '6px 14px', borderRadius: '8px' }}
          >
            <Heart size={16} fill={isSaved ? '#ff5a5f' : 'none'} color={isSaved ? '#ff5a5f' : 'currentColor'} /> {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Title & Location Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '8px' }}>
          {listing.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: 'var(--text-primary)' }}>
            <Star size={14} style={{ fill: '#eab308', color: '#eab308' }} />
            {listing.reviews && listing.reviews.length > 0
              ? (listing.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / listing.reviews.length).toFixed(1)
              : '4.9'} • <u style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{listing.reviews?.length || 0} {listing.reviews?.length === 1 ? 'review' : 'reviews'}</u>
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} style={{ color: '#ff5a5f' }} />
            {listing.location && listing.location.toLowerCase().includes('india') ? listing.location : `${listing.location}, India`}
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
            background: 'var(--bg-card)',
            border: '1px solid var(--border-hover)',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
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
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Entire vacation villa hosted by Verified Superhost
            </h2>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
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
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <Wifi size={20} style={{ color: '#ff5a5f', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>Ultra Fast 100+ Mbps Wi-Fi</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Verified fiber broadband perfect for remote work and 4K streaming.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <ShieldCheck size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>Direct Host Pricing</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No arbitrary 300% OTA markups. You pay direct host rates.</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>
              About this sanctuary
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.7 }}>
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
              What this place offers
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
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

          {/* Sleeping Arrangements */}
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Where you'll sleep
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <Bed size={22} style={{ color: '#ff5a5f', marginBottom: '10px' }} />
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Bedroom 1</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1 King size bed • Ensuite bath</div>
              </div>
              <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <Bed size={22} style={{ color: '#ff5a5f', marginBottom: '10px' }} />
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Bedroom 2</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1 Queen bed • Scenic view</div>
              </div>
              <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <Sparkles size={22} style={{ color: '#ff5a5f', marginBottom: '10px' }} />
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Living area</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1 Plush sofa bed lounge</div>
              </div>
            </div>
          </div>

          {/* Host Profile Card */}
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', padding: '18px 22px', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff5a5f 0%, #ff7b80 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(255,90,95,0.3)' }}>
                  {listing.owner?.username ? listing.owner.username.charAt(0).toUpperCase() : 'H'}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Hosted by {listing.owner?.username || 'Verified Superhost'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#16a34a', fontWeight: '700' }}>✓ Verified Host</span>
                    <span>•</span>
                    <span>100% Response Rate</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.success(`Connected with ${listing.owner?.username || 'Host'}! Direct messaging active.`)}
                style={{ padding: '8px 18px', borderRadius: '10px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Contact Host
              </button>
            </div>
          </div>

          {/* Things to Know / House Rules */}
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '14px' }}>
              Things to know
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', fontSize: '0.84rem' }}>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>House Rules</div>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>Check-in: 2:00 PM – 10:00 PM</span>
                  <span>Checkout: 11:00 AM</span>
                  <span>Smoke-free environment</span>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>Health & Safety</div>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>Keyless digital pass entry</span>
                  <span>Security lock on bedroom</span>
                  <span>First aid kit on-premises</span>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>Cancellation Policy</div>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>100% full refund up to 24h</span>
                  <span>FairSafe Price Guarantee</span>
                  <span>Zero hidden service fees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div style={{ marginTop: '32px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Where you'll be
            </h3>
            <ListingMap listing={listing} />
          </div>

          {/* Real Guest Reviews & Community Ratings */}
          <ReviewSection
            listingId={listing._id}
            reviews={listing.reviews || []}
            onReviewAdded={(newReview) => {
              setListing((prev) => ({
                ...prev,
                reviews: [newReview, ...(prev.reviews || [])],
              }));
            }}
          />
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div>
          <div style={{ position: 'sticky', top: '100px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
            {/* Price Header */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                {hasImpact ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.65rem', fontWeight: '800', color: isSurge ? 'var(--text-primary)' : '#16a34a' }}>
                        ₹{effectiveNightlyRate.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        / night
                      </span>
                      <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        ₹{basePrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      marginTop: '6px',
                      background: isSurge ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                      color: isSurge ? '#dc2626' : '#15803d',
                      border: `1px solid ${isSurge ? 'rgba(239, 68, 68, 0.22)' : 'rgba(34, 197, 94, 0.22)'}`
                    }}>
                      <span>{seasonalPricing.emoji || (isSurge ? '🔥' : '🌿')}</span>
                      <span>
                        {seasonalPricing.signedPercentage} {getCleanFestivalName(seasonalPricing.festivalName)} {isSurge ? 'Surge' : 'Discount'}
                        {' '}({effectiveNightlyRate - basePrice >= 0 ? '+' : ''}₹{Math.abs(effectiveNightlyRate - basePrice).toLocaleString('en-IN')}/night)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      ₹{basePrice.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                      / night
                    </span>
                  </div>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} style={{ fill: '#eab308', color: '#eab308' }} />
                <span>4.96</span>
              </div>
            </div>

            {/* Check-In / Check-Out Box */}
            <div
              style={{
                position: 'relative',
                border: isCalendarOpen ? '1px solid #ff5a5f' : '1px solid var(--border-hover)',
                borderRadius: '14px',
                marginBottom: '16px',
                background: 'var(--bg-input)',
                boxShadow: isCalendarOpen ? '0 0 0 3px rgba(255, 90, 95, 0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-hover)' }}>
                {/* Check-In Trigger */}
                <div
                  onClick={() => {
                    setCalendarStep('checkIn');
                    setIsCalendarOpen(true);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRight: '1px solid var(--border-hover)',
                    cursor: 'pointer',
                    background: isCalendarOpen && calendarStep === 'checkIn' ? 'rgba(255, 90, 95, 0.08)' : 'transparent',
                    transition: 'background 0.15s ease',
                    borderTopLeftRadius: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Check-in
                    </label>
                    <Calendar size={13} style={{ color: '#ff5a5f', pointerEvents: 'none' }} />
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {formatDisplayDate(checkIn)}
                  </div>
                </div>

                {/* Check-Out Trigger */}
                <div
                  onClick={() => {
                    setCalendarStep('checkOut');
                    setIsCalendarOpen(true);
                  }}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    background: isCalendarOpen && calendarStep === 'checkOut' ? 'rgba(255, 90, 95, 0.08)' : 'transparent',
                    transition: 'background 0.15s ease',
                    borderTopRightRadius: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Check-out
                    </label>
                    <Calendar size={13} style={{ color: '#ff5a5f', pointerEvents: 'none' }} />
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {formatDisplayDate(checkOut)}
                  </div>
                </div>
              </div>

              {/* Guests Dropdown */}
              <div style={{ padding: '10px 14px' }}>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.82rem', fontFamily: 'inherit', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="1" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>1 guest</option>
                  <option value="2" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>2 guests</option>
                  <option value="4" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>4 guests</option>
                  <option value="6" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>6 guests</option>
                </select>
              </div>

              {/* Luxury Floating Calendar Popover */}
              <DateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                initialStep={calendarStep}
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                onDatesChange={({ checkIn: newIn, checkOut: newOut }) => {
                  setCheckIn(newIn);
                  setCheckOut(newOut);
                }}
              />
            </div>

            {/* Direct Reserve Button */}
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="btn-coral"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: '8px', cursor: 'pointer' }}
            >
              Reserve
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              You won't be charged yet
            </div>

            {/* Short & Transparent Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>₹{effectiveNightlyRate.toLocaleString('en-IN')} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>₹{staySubtotal.toLocaleString('en-IN')}</span>
              </div>

              {hasImpact && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: isSurge ? '#dc2626' : '#15803d',
                  background: isSurge ? 'rgba(239, 68, 68, 0.06)' : 'rgba(34, 197, 94, 0.06)',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${isSurge ? 'rgba(239, 68, 68, 0.16)' : 'rgba(34, 197, 94, 0.16)'}`,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>{seasonalPricing.emoji || (isSurge ? '🪔' : '🌿')}</span>
                    <span>Includes {getCleanFestivalName(seasonalPricing.festivalName)} ({seasonalPricing.signedPercentage})</span>
                  </span>
                  <span>{seasonalAdjustment >= 0 ? '+' : ''}₹{seasonalAdjustment.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Taxes & GST ({Math.round(gstRate * 100)}%)</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '600' }}>
                <span>FairStay Service fee</span>
                <span>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '14px', fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                <span>Total</span>
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

      {/* Interactive Payment Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        listing={listing}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        seasonalPricing={seasonalPricing}
        effectiveNightlyRate={effectiveNightlyRate}
        onBookingSuccess={(booking, pin) => {
          setConfirmedBooking(booking);
          setKeylessPin(pin || '8492');
          setIsTicketOpen(true);
          toast.success('Reservation confirmed! Room pass generated 🎉');
        }}
      />

      {/* Luxury Confirmed Room Ticket Pass Modal */}
      <RoomTicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        booking={confirmedBooking}
        keylessPin={keylessPin}
      />
    </div>
  );
}
