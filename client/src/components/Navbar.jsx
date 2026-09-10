import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Globe, Menu, User, Sparkles, Luggage, Sun, Moon, X, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onSearch, currentSearch }) {
  const [query, setQuery] = useState(currentSearch || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => { setQuery(currentSearch || ''); }, [currentSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const data = await api.searchListings(query);
        if (data && data.results) setSuggestions(data.results.slice(0, 5));
      } catch (err) { console.error('Auto-suggest error:', err); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSuggestions([]);
    if (onSearch) onSearch(query);
  };

  const handleSelectSuggestion = (item) => {
    setQuery(item.title);
    setSuggestions([]);
    navigate('/stay/' + item._id);
  };

  const navBg = isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)';
  const navText = isDark ? '#f8fafc' : '#0f172a';
  const navBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const searchBg = isDark ? '#1e293b' : '#fff';
  const inputText = isDark ? '#f8fafc' : '#0f172a';
  const dropBg = isDark ? '#1e293b' : '#fff';

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: navBg, backdropFilter: 'blur(20px)', borderBottom: '1px solid ' + navBorder, boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
      <div className="container-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px', gap: '16px' }}>

        {/* Brand Logo - Previous Version Style */}
        <Link to="/" className="brand-hover-effect" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div className="brand-icon-wrapper shadow-sm">
            <span style={{ fontSize: '1.4rem' }}>🏡</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="brand-title">FairStay<span className="brand-dot">.</span></span>
            <span className="brand-subtitle">VACATION RENTALS & HOMES</span>
          </div>
        </Link>

        {/* Center Search Capsule (Airbnb Style) — hidden on mobile */}
        <div style={{ position: 'relative', flex: '0 1 auto' }} className="nav-search-wrapper">
          <form onSubmit={handleSearchSubmit} className="search-capsule" style={{ margin: 0 }}>
            <input
              type="text"
              placeholder="Anywhere"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.86rem',
                fontWeight: '700',
                fontFamily: 'inherit',
                color: inputText,
                width: query ? '240px' : '78px',
                transition: 'width 0.2s ease',
              }}
            />
            {!query && (
              <>
                <div className="search-capsule-divider" />
                <span className="capsule-sub-text" style={{ whiteSpace: 'nowrap', fontWeight: '500' }}>Any week</span>
                <div className="search-capsule-divider" />
                <span className="capsule-sub-text" style={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>Add guests</span>
              </>
            )}
            <button type="submit" className="search-btn-circle" style={{ border: 'none', cursor: 'pointer' }} aria-label="Search">
              <Search size={14} color="#ffffff" strokeWidth={2.5} />
            </button>
          </form>

          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '108%', left: 0, right: 0, background: dropBg, border: '1px solid ' + navBorder, borderRadius: '16px', boxShadow: '0 12px 28px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
              {suggestions.map((item) => (
                <div key={item._id} onClick={() => handleSelectSuggestion(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid ' + navBorder }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? '#0f172a' : '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = dropBg)}>
                  <img src={item.image?.url} alt={item.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: navText }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.location} • ₹{item.price?.toLocaleString('en-IN')}/night</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Right Actions - Previous Version Style */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }} className="nav-right-desktop">
          {/* List Your Property */}
          <Link to="/host" className="btn-nav-action">
            <span style={{ fontSize: '1rem', color: '#ff5a5f' }}>🏠</span>
            <span>List Your Property</span>
          </Link>

          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="btn-wishlist-nav" title="Toggle Light / Dark theme">
            {isDark ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} style={{ color: '#0ea5e9' }} />}
          </button>

          {/* Wishlist Saved Button */}
          <Link to="/trips" className="btn-wishlist-nav" title="Saved Stays & Wishlist">
            <span style={{ fontSize: '1.1rem', color: '#ff5a5f' }}>❤️</span>
          </Link>

          {/* User Menu Capsule */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="user-menu-btn">
              <Menu size={18} style={{ color: navText === '#f8fafc' ? '#94a3b8' : '#475569' }} />
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                {user?.profilePhoto?.url ? (
                  <img src={user.profilePhoto.url} alt={user.username} className="user-avatar-thumb" />
                ) : (
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#ff5a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700' }}>
                    {user ? user.username?.[0]?.toUpperCase() : <User size={16} />}
                  </div>
                )}
                {/* Online emerald dot */}
                {user && <span className="online-status-dot" />}
              </div>
              {user && (
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: navText }}>
                  {user.username}
                </span>
              )}
            </button>
            {isDropdownOpen && (
              <div style={{ position: 'absolute', right: 0, top: '115%', width: '220px', background: dropBg, borderRadius: '16px', border: '1px solid ' + navBorder, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: '8px 0', zIndex: 300 }}>
                {user ? (
                  <>
                    <div style={{ padding: '10px 20px 8px', borderBottom: '1px solid ' + navBorder }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: navText }}>👋 {user.username}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</div>
                    </div>
                    <Link to="/trips" onClick={() => setIsDropdownOpen(false)} style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', fontWeight: '600', color: '#ff5a5f', textDecoration: 'none' }}>My Trips & Passes</Link>
                    <Link to="/host" onClick={() => setIsDropdownOpen(false)} style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', color: navText, textDecoration: 'none' }}>Host a Sanctuary</Link>
                    {user.isAdmin && <Link to="/admin" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '0.85rem', color: '#7c3aed', textDecoration: 'none' }}><Shield size={14} />Admin Dashboard</Link>}
                    <a href="/profile" style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', color: navText, textDecoration: 'none' }}>Edit Profile</a>
                    <hr style={{ border: 'none', borderTop: '1px solid ' + navBorder, margin: '6px 0' }} />
                    <button onClick={() => { setIsDropdownOpen(false); logout(); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 20px', fontSize: '0.85rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/" onClick={() => setIsDropdownOpen(false)} style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', fontWeight: '600', color: navText, textDecoration: 'none' }}>Explore Stays</Link>
                    <Link to="/trips" onClick={() => setIsDropdownOpen(false)} style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', color: '#ff5a5f', textDecoration: 'none' }}>My Trips</Link>
                    <hr style={{ border: 'none', borderTop: '1px solid ' + navBorder, margin: '6px 0' }} />
                    <a href="/login" style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', fontWeight: '600', color: navText, textDecoration: 'none' }}>Log in</a>
                    <a href="/signup" style={{ display: 'block', padding: '10px 20px', fontSize: '0.85rem', color: '#64748b', textDecoration: 'none' }}>Sign up</a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="nav-mobile-hamburger"
          style={{ display: 'none', flexDirection: 'column', gap: '5px', padding: '8px', border: '1px solid ' + navBorder, borderRadius: '10px', background: 'transparent', cursor: 'pointer' }}>
          {isMobileMenuOpen ? <X size={22} style={{ color: navText }} /> : <Menu size={22} style={{ color: navText }} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div style={{ background: navBg, borderTop: '1px solid ' + navBorder, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', background: searchBg, border: '1px solid ' + navBorder, borderRadius: '9999px', padding: '8px 14px' }}>
            <Search size={17} style={{ color: '#94a3b8', marginRight: '8px' }} />
            <input type="text" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.9rem', background: 'transparent', color: inputText }} />
            <button type="submit" className="btn-coral" style={{ padding: '5px 14px', fontSize: '0.8rem' }}>Go</button>
          </form>
          <Link to="/trips" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', borderBottom: '1px solid ' + navBorder, fontWeight: '600', color: '#ff5a5f', textDecoration: 'none' }}>🧳 My Trips</Link>
          <Link to="/host" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', borderBottom: '1px solid ' + navBorder, fontWeight: '600', color: navText, textDecoration: 'none' }}>🏡 Host a Stay</Link>
          {user ? (
            <>
              <a href="/profile" style={{ padding: '10px 0', borderBottom: '1px solid ' + navBorder, color: navText, textDecoration: 'none' }}>👤 {user.username}</a>
              {user.isAdmin && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', borderBottom: '1px solid ' + navBorder, color: '#7c3aed', textDecoration: 'none' }}>🛡️ Admin</Link>}
              <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} style={{ padding: '10px 0', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '600' }}>Log out</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="/login" style={{ flex: 1, padding: '10px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '9999px', fontWeight: '600', color: navText, textDecoration: 'none' }}>Log in</a>
              <a href="/signup" className="btn-coral" style={{ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '9999px', textDecoration: 'none' }}>Sign up</a>
            </div>
          )}
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', color: navText, fontWeight: '600' }}>
            {isDark ? <><Sun size={17} style={{ color: '#fbbf24' }} /> Light Mode</> : <><Moon size={17} style={{ color: '#6366f1' }} /> Dark Mode</>}
          </button>
        </div>
      )}
    </header>
  );
}
