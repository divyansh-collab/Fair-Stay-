import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Globe, Menu, User, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function Navbar({ onSearch, currentSearch }) {
  const [query, setQuery] = useState(currentSearch || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(currentSearch || '');
  }, [currentSearch]);

  // Live auto-suggest typing
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await api.searchListings(query);
        if (data && data.results) {
          setSuggestions(data.results.slice(0, 5));
        }
      } catch (err) {
        console.error('Auto-suggest error:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSuggestions([]);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSelectSuggestion = (item) => {
    setQuery(item.title);
    setSuggestions([]);
    navigate(`/listing/${item._id}`);
  };

  return (
    <header className="glass-nav">
      <div className="container-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px', gap: '16px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #ff5a5f 0%, #ff6b50 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(255, 90, 95, 0.3)' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FairStay
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '700', color: '#ff5a5f', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '-4px' }}>
              MERN EDITION
            </span>
          </div>
        </Link>

        {/* Global Instant Search Bar */}
        <div style={{ position: 'relative', flex: '1', maxWidth: '460px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '9999px', padding: '6px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Search size={18} style={{ color: '#94a3b8', marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search destinations, villas, pools, heritage..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.88rem', fontFamily: 'inherit' }}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); if (onSearch) onSearch(''); }} style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '2px 6px' }}>
                ✕
              </button>
            )}
            <button type="submit" className="btn-coral" style={{ padding: '6px 14px', fontSize: '0.8rem', marginLeft: '6px' }}>
              Search
            </button>
          </form>

          {/* Auto-suggest dropdown */}
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 12px 28px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
              {suggestions.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleSelectSuggestion(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                >
                  <img src={item.image?.url} alt={item.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.location} • ₹{item.price?.toLocaleString('en-IN')}/night</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/listings/new" className="btn-outline" style={{ fontSize: '0.85rem' }}>
            Become a Host
          </a>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
            >
              <Menu size={18} style={{ color: '#475569' }} />
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ff5a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} />
              </div>
            </button>

            {isDropdownOpen && (
              <div style={{ position: 'absolute', right: 0, top: '115%', width: '220px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '8px 0', zIndex: 100 }}>
                <a href="/login" style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>Log in</a>
                <a href="/signup" style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', color: '#475569' }}>Sign up</a>
                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '6px 0' }} />
                <a href="/bookings" style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', color: '#475569' }}>My Trips</a>
                <a href="/profile" style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', color: '#475569' }}>Profile</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
