import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import CategoryRail from '../components/CategoryRail';
import StayCard from '../components/StayCard';
import api from '../services/api';
import { Sparkles, MapPin, Frown, Compass, Loader2, ArrowUp, CheckCircle2 } from 'lucide-react';

export default function HomePage({ searchQuery, onClearSearch }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeDestination, setActiveDestination] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showTax, setShowTax] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalListings, setTotalListings] = useState(0);

  useEffect(() => {
    setPage(1);
    loadListings(1, true);
  }, [activeCategory, activeDestination, searchQuery, minPrice, maxPrice]);

  const loadListings = async (pageNum = 1, isReset = false) => {
    if (isReset) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = { page: pageNum, limit: 12 };
      if (activeCategory) params.category = activeCategory;
      if (activeDestination) params.destination = activeDestination;
      if (searchQuery) params.search = searchQuery;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.getListings(params);
      if (res && res.success && res.data) {
        if (isReset) {
          setListings(res.data);
        } else {
          setListings((prev) => [...prev, ...res.data]);
        }
        setTotalPages(res.totalPages || 1);
        setTotalListings(res.total || res.count || res.data.length);
      } else {
        if (isReset) setListings([]);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
      if (isReset) setListings([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadListings(nextPage, false);
    }
  };

  const handleDestinationSelect = (dest) => {
    setActiveDestination(dest);
  };

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
  };

  // Only show hero when no filters or search are active
  const isFilterActive = Boolean(activeCategory || activeDestination || searchQuery || minPrice || maxPrice);

  return (
    <div>
      {/* Category Filter Rail (Matching Previous Version Mockup directly below Navbar) */}
      <CategoryRail
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        showTax={showTax}
        onToggleTax={setShowTax}
      />

      {/* Panoramic Scenic Sunset Villa Hero Banner */}
      {!isFilterActive && (
        <Hero
          activeDestination={activeDestination}
          onSelectDestination={handleDestinationSelect}
        />
      )}

      {/* Main Stays Container */}
      <main id="listingsGridView" className="container-custom" style={{ padding: '32px 24px 60px' }}>
        {/* Results Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : activeDestination
                ? `Featured Stays in ${activeDestination}`
                : activeCategory
                ? `${activeCategory} Stays`
                : 'Explore Verified Stays across India'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {loading ? 'Finding stays...' : `${totalListings || listings.length} stays found with direct host pricing`}
            </span>
          </div>

          {/* Active Filter Clear Tags */}
          {isFilterActive && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {activeDestination && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', color: '#0284c7', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '600' }}>
                  <MapPin size={12} /> {activeDestination}
                  <button onClick={() => setActiveDestination('')} style={{ color: '#0284c7', marginLeft: '4px', cursor: 'pointer' }}>✕</button>
                </span>
              )}
              {activeCategory && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '600' }}>
                  {activeCategory}
                  <button onClick={() => setActiveCategory('')} style={{ color: '#d97706', marginLeft: '4px', cursor: 'pointer' }}>✕</button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '600' }}>
                  ₹{minPrice || 0} - ₹{maxPrice || 'Any'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} style={{ color: '#15803d', marginLeft: '4px', cursor: 'pointer' }}>✕</button>
                </span>
              )}
              {searchQuery && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ffe4e6', color: '#e11d48', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '600' }}>
                  "{searchQuery}"
                  <button onClick={onClearSearch} style={{ color: '#e11d48', marginLeft: '4px', cursor: 'pointer' }}>✕</button>
                </span>
              )}
              <button
                onClick={() => {
                  setActiveDestination('');
                  setActiveCategory('');
                  onClearSearch && onClearSearch();
                }}
                style={{ fontSize: '0.78rem', color: '#ff5a5f', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Reset all
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="stays-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                <div style={{ width: '100%', aspectRatio: '16/10', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '14px', width: '60%', background: 'var(--border-light)', borderRadius: '4px' }} />
                  <div style={{ height: '18px', width: '85%', background: 'var(--border-light)', borderRadius: '4px' }} />
                  <div style={{ height: '16px', width: '40%', background: 'var(--border-light)', borderRadius: '4px', marginTop: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stays Grid */}
        {!loading && listings.length > 0 && (
          <>
            <div className="stays-grid">
              {listings.map((stay) => (
                <StayCard key={stay._id} listing={stay} showTax={showTax} />
              ))}
            </div>

            {/* Interactive Load More Section */}
            <div className="load-more-section" style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              
              {/* Visual Progress Bar & Tracker */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '380px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  <span>Showing {listings.length} of {totalListings || listings.length} stays</span>
                  <span style={{ color: '#ff5a5f' }}>{Math.min(100, Math.round((listings.length / (totalListings || listings.length)) * 100))}% explored</span>
                </div>
                
                {/* Progress Track */}
                <div style={{ width: '100%', height: '7px', background: 'var(--border-light)', borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.round((listings.length / (totalListings || listings.length)) * 100))}%`,
                      background: 'linear-gradient(90deg, #ff5a5f 0%, #ff7b54 50%, #10b981 100%)',
                      borderRadius: '9999px',
                      transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 0 10px rgba(255, 90, 95, 0.5)',
                    }}
                  />
                </div>
              </div>

              {/* Load More Button or Catalog Complete Card */}
              {page < totalPages ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="interactive-load-more-btn"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 size={18} className="spin-loader" />
                        <span>Fetching Verified Sanctuaries...</span>
                      </>
                    ) : (
                      <>
                        <Compass size={18} className="compass-icon" />
                        <span>Discover More Stays</span>
                        <span className="load-more-badge">+{Math.min(12, (totalListings || 0) - listings.length)}</span>
                      </>
                    )}
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Direct host pricing • 100% verified authentic photos
                  </span>
                </div>
              ) : (
                <div className="catalog-complete-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                        You've viewed all {listings.length} verified stays!
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                        All authentic properties across India are currently displayed.
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="btn-outline-pill"
                    >
                      <ArrowUp size={14} /> Back to Top
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-fairstay-ai'))}
                      className="btn-coral-pill"
                    >
                      <Sparkles size={14} /> Ask AI Concierge
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <Frown size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
              No Stays Found Matching Your Criteria
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Try broadening your location filter, clearing search keywords, or selecting another category.
            </p>
            <button
              onClick={() => {
                setActiveDestination('');
                setActiveCategory('');
                if (onClearSearch) onClearSearch();
              }}
              className="btn-coral"
            >
              Explore All Stays
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
