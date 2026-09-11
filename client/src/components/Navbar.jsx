import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Globe, Menu, User, Sparkles, Luggage, Sun, Moon, X, Shield, MapPin, Calendar as CalendarIcon, Users, Check } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DateRangePicker, { formatDisplayDate } from './DateRangePicker';

const POPULAR_DESTINATIONS = [
  { name: 'Prayagraj', state: 'Uttar Pradesh', desc: 'Triveni Sangam & Sacred Ghats', icon: '🕉️' },
  { name: 'Haridwar', state: 'Uttarakhand', desc: 'Ganga Aarti & Ashram Sanctuaries', icon: '🌊' },
  { name: 'Rishikesh', state: 'Uttarakhand', desc: 'Yoga Capital & River Retreats', icon: '🧘' },
  { name: 'Manali', state: 'Himachal Pradesh', desc: 'Snowy Chalets & Alpine Valleys', icon: '🏔️' },
  { name: 'Varanasi', state: 'Uttar Pradesh', desc: 'Dashashwamedh Ghat & Kashi Stays', icon: '🪔' },
  { name: 'Goa', state: 'Goa', desc: 'Beachfront Villas & Coastal Sunburn', icon: '🌴' },
  { name: 'Jaipur', state: 'Rajasthan', desc: 'Royal Havelis & Pink City Palaces', icon: '🏰' },
  { name: 'Shimla', state: 'Himachal Pradesh', desc: 'Colonial Hills & Pine Ridges', icon: '❄️' },
  { name: 'Udaipur', state: 'Rajasthan', desc: 'Pichola Lakefront Luxury', icon: '🛶' },
  { name: 'Munnar', state: 'Kerala', desc: 'Tea Plantations & Misty Mountains', icon: '🌿' },
  { name: 'Ayodhya', state: 'Uttar Pradesh', desc: 'Ram Mandir & Sacred Saryu Stays', icon: '🛕' },
  { name: 'Mathura', state: 'Uttar Pradesh', desc: 'Braj & Krishna Janmabhoomi Stays', icon: '🦚' },
  { name: 'Mumbai', state: 'Maharashtra', desc: 'Modern City Lofts & Sea-Facing Suites', icon: '🏙️' },
];

export default function Navbar({ onSearch, currentFilters = {}, currentSearch = '' }) {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'location' | 'dates' | 'guests' | null
  const [destination, setDestination] = useState(currentFilters.destination || '');
  const [locationInput, setLocationInput] = useState(currentFilters.destination || currentSearch || '');
  const [checkIn, setCheckIn] = useState(currentFilters.checkIn || '');
  const [checkOut, setCheckOut] = useState(currentFilters.checkOut || '');
  const [adults, setAdults] = useState(Math.max(1, currentFilters.guests || 1));
  const [children, setChildren] = useState(0);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const routeLocation = useLocation();
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const totalGuests = adults + children;

  useEffect(() => {
    if (currentFilters.destination !== undefined) setDestination(currentFilters.destination);
    if (currentFilters.checkIn !== undefined) setCheckIn(currentFilters.checkIn);
    if (currentFilters.checkOut !== undefined) setCheckOut(currentFilters.checkOut);
    if (currentFilters.guests) setAdults(currentFilters.guests);
    if (currentSearch) setLocationInput(currentSearch);
  }, [currentFilters, currentSearch]);

  // Close dropdown and search popovers on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Live auto-suggest when typing in location input
  useEffect(() => {
    if (!locationInput.trim() || locationInput.length < 2) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await api.searchListings(locationInput);
        if (data && data.results) setDestSuggestions(data.results.slice(0, 4));
      } catch (err) {
        console.error('Auto-suggest error:', err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [locationInput]);

  const handleSelectDestination = (destName) => {
    setDestination(destName);
    setLocationInput(destName);
    setDestSuggestions([]);
    // Smoothly advance to date selection
    setActiveDropdown('dates');
  };

  const handleExecuteSearch = (e) => {
    if (e) e.preventDefault();
    setActiveDropdown(null);
    setDestSuggestions([]);

    const filters = {
      destination: destination.trim(),
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      guests: totalGuests,
      search: destination ? '' : locationInput.trim(),
    };

    if (onSearch) {
      onSearch(filters);
    }

    if (routeLocation.pathname !== '/' && routeLocation.pathname !== '/listings') {
      navigate('/');
    }
  };

  const handleSelectStay = (item) => {
    setActiveDropdown(null);
    navigate('/stay/' + item._id);
  };

  const navBg = isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)';
  const navText = isDark ? '#f8fafc' : '#0f172a';
  const navBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
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

        {/* Center 3-Segment Interactive Search Capsule (Airbnb Style) */}
        <div style={{ position: 'relative', flex: '0 1 auto' }} className="nav-search-wrapper" ref={searchContainerRef}>
          <div className="search-capsule-3seg">
            {/* Segment 1: Where */}
            <div
              className={`capsule-segment ${activeDropdown === 'location' ? 'active' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
              title="Search destinations"
            >
              <span className="seg-label">Where</span>
              <span className="seg-value" title={destination || 'Anywhere in India'}>
                {destination || 'Anywhere'}
              </span>
              {destination && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDestination('');
                    setLocationInput('');
                    if (onSearch) onSearch({ destination: '', checkIn, checkOut, guests: totalGuests });
                  }}
                  className="seg-clear-btn"
                  title="Clear location"
                >
                  <X size={10} />
                </button>
              )}
            </div>

            <div className="search-capsule-divider" />

            {/* Segment 2: When */}
            <div
              className={`capsule-segment ${activeDropdown === 'dates' ? 'active' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'dates' ? null : 'dates')}
              title="Pick trip dates"
            >
              <span className="seg-label">When</span>
              <span className="seg-value" title={checkIn && checkOut ? `${formatDisplayDate(checkIn)} – ${formatDisplayDate(checkOut)}` : 'Any week'}>
                {checkIn && checkOut
                  ? `${formatDisplayDate(checkIn).replace(/,\s*\d{4}/, '')} – ${formatDisplayDate(checkOut).replace(/,\s*\d{4}/, '')}`
                  : 'Any week'}
              </span>
              {checkIn && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCheckIn('');
                    setCheckOut('');
                    if (onSearch) onSearch({ destination, checkIn: '', checkOut: '', guests: totalGuests });
                  }}
                  className="seg-clear-btn"
                  title="Clear dates"
                >
                  <X size={10} />
                </button>
              )}
            </div>

            <div className="search-capsule-divider" />

            {/* Segment 3: Who */}
            <div
              className={`capsule-segment ${activeDropdown === 'guests' ? 'active' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
              title="Add number of guests"
            >
              <span className="seg-label">Who</span>
              <span className="seg-value">
                {totalGuests > 1 ? `${totalGuests} guests` : 'Add guests'}
              </span>
              {totalGuests > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAdults(1);
                    setChildren(0);
                    if (onSearch) onSearch({ destination, checkIn, checkOut, guests: 1 });
                  }}
                  className="seg-clear-btn"
                  title="Reset guests"
                >
                  <X size={10} />
                </button>
              )}
            </div>

            {/* Search Execute Button */}
            <button
              type="button"
              onClick={handleExecuteSearch}
              className="search-btn-circle"
              aria-label="Search"
              title="Search verified stays"
            >
              <Search size={15} color="#ffffff" strokeWidth={2.5} />
            </button>
          </div>

          {/* Popover 1: Where (Location Dropdown) */}
          {activeDropdown === 'location' && (
            <div className="nav-popover nav-popover-location" style={{ background: dropBg, borderColor: navBorder }}>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search destinations (e.g. Prayagraj, Haridwar, Manali)..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="dest-search-input"
                  autoFocus
                />
                {locationInput && (
                  <button
                    type="button"
                    onClick={() => { setLocationInput(''); setDestination(''); }}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Suggestions if typed */}
              {destSuggestions.length > 0 && (
                <div style={{ marginBottom: '14px', borderBottom: '1px solid ' + navBorder, paddingBottom: '10px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#ff5a5f', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Matching Stays
                  </div>
                  {destSuggestions.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectStay(item)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? '#0f172a' : '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <img src={item.image?.url} alt={item.title} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: navText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.location} • ₹{item.price?.toLocaleString('en-IN')}/night</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Popular Curated Destinations */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: '800', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                  Popular Destinations
                </span>
                {destination && (
                  <button
                    type="button"
                    onClick={() => { setDestination(''); setLocationInput(''); }}
                    style={{ background: 'none', border: 'none', color: '#ff5a5f', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="dest-grid">
                {POPULAR_DESTINATIONS
                  .filter(d => !locationInput.trim() || d.name.toLowerCase().includes(locationInput.toLowerCase()) || d.state.toLowerCase().includes(locationInput.toLowerCase()))
                  .map((dest) => {
                    const isSelected = destination.toLowerCase() === dest.name.toLowerCase();
                    return (
                      <button
                        key={dest.name}
                        type="button"
                        onClick={() => handleSelectDestination(dest.name)}
                        className={`dest-card ${isSelected ? 'selected' : ''}`}
                      >
                        <span style={{ fontSize: '1.25rem' }}>{dest.icon}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: '700', color: navText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {dest.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {dest.desc}
                          </div>
                        </div>
                        {isSelected && <Check size={14} color="#ff5a5f" strokeWidth={2.5} />}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Popover 2: When (Date Range Picker) */}
          {activeDropdown === 'dates' && (
            <DateRangePicker
              checkIn={checkIn}
              checkOut={checkOut}
              isOpen={activeDropdown === 'dates'}
              onClose={() => setActiveDropdown(null)}
              onDatesChange={({ checkIn: newIn, checkOut: newOut }) => {
                setCheckIn(newIn);
                setCheckOut(newOut);
                if (newIn && newOut) {
                  setTimeout(() => setActiveDropdown('guests'), 180);
                }
              }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                left: '50%',
                right: 'auto',
                transform: 'translateX(-50%)',
                width: '350px',
                zIndex: 2100,
              }}
            />
          )}

          {/* Popover 3: Who (Guest Counter Stepper) */}
          {activeDropdown === 'guests' && (
            <div className="nav-popover nav-popover-guests" style={{ background: dropBg, borderColor: navBorder }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid ' + navBorder, paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: '800', color: navText }}>Guests</span>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ff5a5f' }}>
                  {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'} Selected
                </span>
              </div>

              {/* Adults Counter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700', color: navText }}>Adults</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Ages 13 or above</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => setAdults((a) => Math.max(1, a - 1))}
                    className="stepper-btn"
                    aria-label="Decrease adults"
                  >
                    –
                  </button>
                  <span style={{ fontSize: '0.92rem', fontWeight: '800', color: navText, minWidth: '18px', textAlign: 'center' }}>
                    {adults}
                  </span>
                  <button
                    type="button"
                    disabled={adults + children >= 16}
                    onClick={() => setAdults((a) => a + 1)}
                    className="stepper-btn"
                    aria-label="Increase adults"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700', color: navText }}>Children</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Ages 2–12</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => setChildren((c) => Math.max(0, c - 1))}
                    className="stepper-btn"
                    aria-label="Decrease children"
                  >
                    –
                  </button>
                  <span style={{ fontSize: '0.92rem', fontWeight: '800', color: navText, minWidth: '18px', textAlign: 'center' }}>
                    {children}
                  </span>
                  <button
                    type="button"
                    disabled={adults + children >= 16}
                    onClick={() => setChildren((c) => c + 1)}
                    className="stepper-btn"
                    aria-label="Increase children"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Fast Presets */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', borderTop: '1px solid ' + navBorder, paddingTop: '12px' }}>
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => { setAdults(num); setChildren(0); }}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      border: totalGuests === num ? '1px solid #ff5a5f' : '1px solid ' + navBorder,
                      background: totalGuests === num ? 'rgba(255, 90, 95, 0.12)' : 'var(--bg-secondary)',
                      color: totalGuests === num ? '#ff5a5f' : navText,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {num === 6 ? '6+' : `${num} ${num === 1 ? 'guest' : 'guests'}`}
                  </button>
                ))}
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid ' + navBorder, paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setAdults(1); setChildren(0); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.78rem', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveDropdown(null); handleExecuteSearch(); }}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '10px',
                    background: '#ff5a5f',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(255, 90, 95, 0.3)',
                  }}
                >
                  Apply & Search
                </button>
              </div>
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
