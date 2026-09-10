import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Sparkles, 
  Heart,
  Share2,
  Send,
  MessageCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

export default function Footer() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleFilter = (type, val) => {
    navigate(`/?${type}=${encodeURIComponent(val)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ 
      background: 'var(--bg-secondary)', 
      borderTop: '1px solid var(--border-light)', 
      color: 'var(--text-secondary)', 
      marginTop: '60px',
      padding: '48px 0 28px',
      transition: 'all 0.3s ease'
    }}>
      <div className="container-custom">
        {/* Main 4 Columns */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '36px', 
          paddingBottom: '36px', 
          borderBottom: '1px solid var(--border-light)' 
        }}>
          {/* Brand & Purpose */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #ff5a5f, #ff7b54)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.1rem',
                boxShadow: '0 2px 8px rgba(255, 90, 95, 0.3)'
              }}>
                🏡
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                FairStay<span style={{ color: '#ff5a5f' }}>.</span>
              </span>
            </Link>
            <p style={{ fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: '280px' }}>
              India's transparent vacation rental and spiritual sanctuary marketplace. Zero 300% OTA markups — only direct host rates.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#16a34a', fontWeight: '700' }}>
              <ShieldCheck size={14} /> FairSafe™ Guaranteed Direct Pricing
            </div>
          </div>

          {/* Column 1: Popular Corridors */}
          <div>
            <h4 style={{ fontSize: '0.86rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-primary)', marginBottom: '14px' }}>
              Popular Corridors
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.84rem' }}>
              <li>
                <button onClick={() => handleFilter('destination', 'Goa')} className="footer-simple-link">Goa Beachfront & Villas</button>
              </li>
              <li>
                <button onClick={() => handleFilter('destination', 'Manali')} className="footer-simple-link">Manali Mountain Chalets</button>
              </li>
              <li>
                <button onClick={() => handleFilter('destination', 'Jaipur')} className="footer-simple-link">Jaipur Royal Havelis</button>
              </li>
              <li>
                <button onClick={() => handleFilter('destination', 'Varanasi')} className="footer-simple-link">Varanasi Holy Ghat Stays</button>
              </li>
              <li>
                <button onClick={() => handleFilter('destination', 'Kerala')} className="footer-simple-link">Kerala Backwater Estates</button>
              </li>
              <li>
                <button onClick={() => handleFilter('destination', 'Udaipur')} className="footer-simple-link">Udaipur Lakeside Suites</button>
              </li>
            </ul>
          </div>

          {/* Column 2: Stay Categories */}
          <div>
            <h4 style={{ fontSize: '0.86rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-primary)', marginBottom: '14px' }}>
              Stay Collections
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.84rem' }}>
              <li>
                <button onClick={() => handleFilter('category', 'Beachfront')} className="footer-simple-link">Beachfront Sanctuaries</button>
              </li>
              <li>
                <button onClick={() => handleFilter('category', 'Mountains')} className="footer-simple-link">Mountain Chalets</button>
              </li>
              <li>
                <button onClick={() => handleFilter('category', 'Pools')} className="footer-simple-link">Private Pool Escapes</button>
              </li>
              <li>
                <button onClick={() => handleFilter('category', 'Heritage')} className="footer-simple-link">Heritage & Haveli Homes</button>
              </li>
              <li>
                <button onClick={() => handleFilter('category', 'Workation')} className="footer-simple-link">Verified Workation Lofts</button>
              </li>
              <li>
                <button onClick={() => handleFilter('category', 'Budget')} className="footer-simple-link">Pilgrim & Budget Stays</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Hosting & Support */}
          <div>
            <h4 style={{ fontSize: '0.86rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-primary)', marginBottom: '14px' }}>
              Host & Transparency
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.84rem' }}>
              <li>
                <Link to="/host" className="footer-simple-link">List Your Sanctuary</Link>
              </li>
              <li>
                <Link to="/trips" className="footer-simple-link">My Trips & Room Passes</Link>
              </li>
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-fairstay-ai'))} 
                  className="footer-simple-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <Sparkles size={13} style={{ color: '#ff5a5f' }} /> FairStay AI Concierge
                </button>
              </li>
              <li>
                <button 
                  onClick={() => toast('FairSafe Guarantee: 100% direct-host transparent pricing with zero middleman markup.', { icon: '🛡️' })}
                  className="footer-simple-link"
                >
                  FairSafe™ Price Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => toast('Cancellation: 100% full refund up to 24h prior to check-in.', { icon: '✨' })}
                  className="footer-simple-link"
                >
                  100% Refund Cancellation
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Controls */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '16px', 
          paddingTop: '24px', 
          fontSize: '0.82rem' 
        }}>
          {/* Left: Copyright & Legal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span>
              © {new Date().getFullYear()} FairStay Inc. Handcrafted with <Heart size={12} style={{ display: 'inline', color: '#ff5a5f', verticalAlign: 'middle' }} /> for travelers across India.
            </span>
            <span style={{ color: 'var(--border-hover)' }}>•</span>
            <a href="#" onClick={(e) => { e.preventDefault(); toast('Privacy: All bookings and identity data are encrypted with bank-grade 256-bit SSL.', { icon: '🔒' }); }} className="footer-sub-link">Privacy</a>
            <span style={{ color: 'var(--border-hover)' }}>•</span>
            <a href="#" onClick={(e) => { e.preventDefault(); toast('Terms: FairStay enforces 100% direct host rates and verified physical capacity.', { icon: '📜' }); }} className="footer-sub-link">Terms</a>
            <span style={{ color: 'var(--border-hover)' }}>•</span>
            <a href="#" onClick={(e) => { e.preventDefault(); toast('Sitemap: Stays across Goa, Manali, Jaipur, Varanasi, Kerala, Udaipur & 20+ corridors.', { icon: '🗺️' }); }} className="footer-sub-link">Sitemap</a>
          </div>

          {/* Right: Currency & Theme Quick Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              <Globe size={14} />
              <span>English (IN)</span>
              <span>•</span>
              <span>₹ INR</span>
            </div>

            <button
              onClick={toggleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Toggle Light / Dark theme"
            >
              {isDark ? <Sun size={14} style={{ color: '#fbbf24' }} /> : <Moon size={14} style={{ color: '#0ea5e9' }} />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
