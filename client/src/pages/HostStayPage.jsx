import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  Image as ImageIcon, 
  IndianRupee, 
  Users, 
  Bed, 
  Bath, 
  ShieldCheck,
  ChevronRight,
  Loader2
} from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  'Trending',
  'Beachfront',
  'Mountains',
  'Heritage',
  'Pools',
  'Luxe',
  'Budget',
  'Havelis'
];

const SAMPLE_PHOTOS = [
  { label: 'Goa Coastal Villa', url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Manali Pine Chalet', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Jaipur Royal Haveli', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kerala Backwater Estate', url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80' }
];

export default function HostStayPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Trending');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState(4500);
  const [maxGuests, setMaxGuests] = useState(4);
  const [bedrooms, setBedrooms] = useState(2);
  const [beds, setBeds] = useState(2);
  const [baths, setBaths] = useState(2);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(SAMPLE_PHOTOS[0].url);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !price) {
      setErrorMsg('Please provide a property title, location, and nightly rate.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        title: title.trim(),
        category,
        location: location.trim(),
        price: Number(price),
        maxGuests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        beds: Number(beds),
        baths: Number(baths),
        description: description.trim() || `${title} in ${location} — an authentic, verified FairStay property featuring luxury comfort and zero-surge direct host rates.`,
        imageUrl: imageUrl.trim(),
      };

      const res = await api.createListing(payload);
      if (res && res.success && res.data) {
        navigate(`/stay/${res.data._id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to create listing:', err);
      setErrorMsg('Failed to publish listing. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom" style={{ padding: '36px 24px 80px', maxWidth: '1100px' }}>
      
      {/* Top Breadcrumb */}
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px' }}>
        <ArrowLeft size={16} />
        <span>Back to Explore</span>
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff1f2', color: '#ff5a5f', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          <Building size={14} /> FairStay Host Portal
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 8px' }}>
          List Your Sanctuary on FairStay
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: '700px' }}>
          Welcome discerning guests with full pricing autonomy, direct host earnings, zero intermediary markups, and FairSafe verification.
        </p>
      </div>

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '24px' }}>
          {errorMsg}
        </div>
      )}

      {/* Form & Live Preview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Left Column: Form Controls */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Core Details */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
              1. Basic Property Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Sunset Heritage Villa with Private Pool"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>City, State</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Goa, Goa"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pricing & Sizing */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
              2. Nightly Rate & Capacity
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Direct Host Nightly Rate (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '10px', fontWeight: '800', color: 'var(--text-primary)' }}>₹</span>
                  <input
                    type="number"
                    required
                    min={500}
                    step={100}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px 10px 32px', borderRadius: '12px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontWeight: '700' }}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Statutory GST slab: {price > 7500 ? '18% Luxury Hotel GST' : (price <= 1000 ? '0% GST (Exempt)' : '12% Hotel GST')}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>Max Guests</label>
                  <input
                    type="number"
                    min={1}
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>Bedrooms</label>
                  <input
                    type="number"
                    min={1}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>Beds</label>
                  <input
                    type="number"
                    min={1}
                    value={beds}
                    onChange={(e) => setBeds(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>Baths</label>
                  <input
                    type="number"
                    min={1}
                    value={baths}
                    onChange={(e) => setBaths(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Sanctuary Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your property's view, serenity, amenities, and unique highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Photography */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
              3. Photography
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Main High-Res Photo URL</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-hover)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Or choose from verified high-res sanctuaries:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SAMPLE_PHOTOS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${imageUrl === p.url ? '#ff5a5f' : 'var(--border-light)'}`,
                      background: imageUrl === p.url ? 'rgba(255, 90, 95, 0.12)' : 'var(--bg-secondary)',
                      color: imageUrl === p.url ? '#ff5a5f' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-coral"
            style={{ width: '100%', padding: '16px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Publishing to FairStay Network...</span>
              </>
            ) : (
              <>
                <span>Publish Sanctuary & Start Hosting</span>
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Right Column: Live Stay Card Preview */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} style={{ color: '#ff5a5f' }} />
            <span>Live Guest Feed Preview</span>
          </div>

          {/* Preview Card */}
          <div className="stay-card" style={{ maxWidth: '380px', margin: '0 auto', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}>
            <div className="stay-card-img-wrap">
              <img
                src={imageUrl}
                alt="Preview"
                className="stay-card-img"
                onError={(e) => {
                  e.currentTarget.src = SAMPLE_PHOTOS[0].url;
                }}
              />
              <div className="fairsafe-badge">
                <ShieldCheck size={12} style={{ color: '#4ade80' }} />
                <span>FairSafe 98</span>
              </div>
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', color: '#fff' }}>
                {category}
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  <MapPin size={13} style={{ color: '#ff5a5f' }} />
                  <span>{location || 'Destination City'}</span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  ⭐ 5.0 (New)
                </div>
              </div>

              <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)', margin: '4px 0 8px', lineHeight: 1.3 }}>
                {title || 'Your Handcrafted Vacation Sanctuary'}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <span>{maxGuests} guests</span>
                <span>•</span>
                <span>{bedrooms} bds</span>
                <span>•</span>
                <span>{baths} baths</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ₹{Number(price || 4500).toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                    / night
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#ff5a5f', background: 'rgba(255, 90, 95, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>
                  Direct Host Rate
                </span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '16px', marginTop: '20px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              🛡️ FairStay Host Guarantee
            </div>
            Direct payouts to bank or UPI, zero intermediary deductions, and seasonal festival pricing control with complete freedom.
          </div>
        </div>
      </div>
    </div>
  );
}
