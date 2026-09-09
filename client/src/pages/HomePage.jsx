import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import CategoryRail from '../components/CategoryRail';
import StayCard from '../components/StayCard';
import api from '../services/api';
import { Sparkles, MapPin, Frown } from 'lucide-react';

export default function HomePage({ searchQuery, onClearSearch }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeDestination, setActiveDestination] = useState('');
  const [showTax, setShowTax] = useState(false);

  useEffect(() => {
    loadListings();
  }, [activeCategory, activeDestination, searchQuery]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (activeDestination) params.location = activeDestination;
      if (searchQuery) params.search = searchQuery;

      const res = await api.getListings(params);
      if (res && res.success && res.data) {
        setListings(res.data);
      } else {
        setListings([]);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationSelect = (dest) => {
    setActiveDestination(dest);
  };

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
  };

  // Only show hero when no filters or search are active
  const isFilterActive = Boolean(activeCategory || activeDestination || searchQuery);

  return (
    <div>
      {/* Hero Banner (hidden when filtering for instant focus) */}
      {!isFilterActive && (
        <Hero
          activeDestination={activeDestination}
          onSelectDestination={handleDestinationSelect}
        />
      )}

      {/* Category Filter Rail with Tax Toggle */}
      <CategoryRail
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        showTax={showTax}
        onToggleTax={setShowTax}
      />

      {/* Main Stays Container */}
      <main className="container-custom" style={{ padding: '32px 24px 60px' }}>
        {/* Results Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : activeDestination
                ? `Featured Stays in ${activeDestination}`
                : activeCategory
                ? `${activeCategory} Stays`
                : 'Explore Verified Stays across India'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {loading ? 'Finding stays...' : `${listings.length} stays found with direct host pricing`}
            </span>
          </div>

          {/* Active Filter Clear Tags */}
          {isFilterActive && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                  if (onClearSearch) onClearSearch();
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
              <div key={n} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ width: '100%', aspectRatio: '4/3', background: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '14px', width: '60%', background: '#e2e8f0', borderRadius: '4px' }} />
                  <div style={{ height: '18px', width: '85%', background: '#e2e8f0', borderRadius: '4px' }} />
                  <div style={{ height: '16px', width: '40%', background: '#e2e8f0', borderRadius: '4px', marginTop: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stays Grid */}
        {!loading && listings.length > 0 && (
          <div className="stays-grid">
            {listings.map((item) => (
              <StayCard key={item._id} listing={item} showTax={showTax} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', marginBottom: '16px' }}>
              <Frown size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              No Stays Found Matching Your Criteria
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
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
