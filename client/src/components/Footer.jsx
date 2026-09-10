import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  MapPin, 
  RefreshCw, 
  KeyRound, 
  Flame, 
  Compass, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Globe, 
  Share2, 
  MessageCircle, 
  Heart,
  ChevronRight,
  Shield,
  Layers,
  Send
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const INSPIRATION_TABS = [
  {
    id: 'destinations',
    label: 'Popular Corridors',
    items: [
      { name: 'Goa Coastal Villas', dest: 'Goa', desc: 'Beachfront sanctuaries with private pools' },
      { name: 'Manali Pine Chalets', dest: 'Manali', desc: 'Snow peaks & apple orchard retreats' },
      { name: 'Jaipur Royal Havelis', dest: 'Jaipur', desc: 'Heritage courtyard palaces in Pink City' },
      { name: 'Varanasi Ghat Sanctuaries', dest: 'Varanasi', desc: 'Spiritual riverfront Ganga stays' },
      { name: 'Kerala Backwater Estate', dest: 'Kerala', desc: 'Private lagoons & tea garden bungalows' },
      { name: 'Udaipur Lakeview Suites', dest: 'Udaipur', desc: 'Regal lakefront stays facing City Palace' },
      { name: 'Munnar Misty Hills', dest: 'Munnar', desc: 'High-altitude spice plantations' },
      { name: 'Rishikesh Yoga Sanctuaries', dest: 'Rishikesh', desc: 'Serene holy Ganga meditation havens' },
    ],
  },
  {
    id: 'experiences',
    label: 'Stay Categories',
    items: [
      { name: 'Beachfront Villas', cat: 'Beachfront', desc: 'Direct sandy shore access & sunset views' },
      { name: 'Mountain Chalets', cat: 'Mountains', desc: 'Wood-fired fireplaces & high Himalayan views' },
      { name: 'Amazing Pools', cat: 'Pools', desc: 'Private infinity pools & sun decks' },
      { name: 'Heritage Havelis', cat: 'Heritage', desc: 'Centuries-old artisanal architecture' },
      { name: 'Workation Lofts', cat: 'Workation', desc: '100+ Mbps verified fiber & dedicated desks' },
      { name: 'Luxe Escapes', cat: 'Luxe', desc: 'Bespoke concierge & chef-curated dining' },
      { name: 'Countryside Farms', cat: 'Countryside', desc: 'Organic farmlands & quiet nature groves' },
      { name: 'Budget Sanctuaries', cat: 'Budget', desc: 'Authentic stays under ₹1,500/night' },
    ],
  },
  {
    id: 'festivals',
    label: 'Festival & Event Calendars',
    items: [
      { name: 'Dev Deepawali (Varanasi)', dest: 'Varanasi', desc: '84 illuminated ghats · FairSafe +40% surge cap' },
      { name: 'Sunburn Week (Goa)', dest: 'Goa', desc: 'Asia\'s premier music week · Direct host rates' },
      { name: 'Jaipur Literature Festival', dest: 'Jaipur', desc: 'World\'s greatest lit gala · Verified havelis' },
      { name: 'Winter Carnival (Manali)', dest: 'Manali', desc: 'Fresh powder snow & hot spring chalets' },
      { name: 'Pushkar Camel Fair', dest: 'Pushkar', desc: 'Desert glamping & sacred lake rituals' },
      { name: 'Kolkata Durga Puja', dest: 'Kolkata', desc: 'Cultural art pavilions & heritage stays' },
    ],
  },
  {
    id: 'guarantees',
    label: 'FairSafe™ Transparency',
    items: [
      { name: 'Direct Host Rates', action: 'info', desc: 'Zero arbitrary 300% OTA markups. You pay direct rates.' },
      { name: 'Instant Keyless Passes', action: 'info', desc: 'Smart 4-digit door PIN & room suite assigned upon booking.' },
      { name: 'Statutory GST Transparency', action: 'info', desc: 'Compliant 0%, 12%, and 18% hotel GST classification.' },
      { name: '100% Free Cancellation', action: 'info', desc: 'Full refunds up to 24h before check-in with zero penalties.' },
      { name: 'Verified GPS Geocodes', action: 'info', desc: 'Every sanctuary inspected with authentic Google coordinates.' },
      { name: '24/7 AI Concierge Assistance', action: 'ai', desc: 'Powered by Gemini for bespoke itineraries & pricing trends.' },
    ],
  },
];

const PERKS = [
  {
    icon: ShieldCheck,
    color: '#4ade80',
    title: 'FairSafe™ Direct Pricing',
    desc: 'Zero 300% OTA markups. Real direct-host baseline with authentic seasonal event explanations.',
  },
  {
    icon: KeyRound,
    color: '#ff5a5f',
    title: 'Instant Keyless Room Passes',
    desc: 'Smart 4-digit door PIN & digital boarding pass generated automatically upon reservation.',
  },
  {
    icon: Wifi,
    color: '#38bdf8',
    title: 'Verified 100+ Mbps Wi-Fi',
    desc: 'Inspected high-speed fiber broadband and precise GPS geocodes on all sanctuaries.',
  },
  {
    icon: RefreshCw,
    color: '#a855f7',
    title: '100% Full Refund Guarantee',
    desc: 'Cancel anytime up to 24 hours before check-in with 100% zero-hassle FairSafe refunds.',
  },
];

export default function Footer() {
  const [activeTab, setActiveTab] = useState('destinations');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubscribed(true);
    toast.success('🎉 Welcome to FairStay Insider! You unlocked secret direct host deals.');
    setEmail('');
  };

  const handleItemClick = (item) => {
    if (item.action === 'ai') {
      window.dispatchEvent(new CustomEvent('open-fairstay-ai'));
      return;
    }
    if (item.action === 'info') {
      toast('FairSafe™ Guarantee: Zero middleman fees & 100% direct host rates.', { icon: '🛡️' });
      return;
    }
    if (item.dest) {
      navigate(`/?destination=${encodeURIComponent(item.dest)}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.cat) {
      navigate(`/?category=${encodeURIComponent(item.cat)}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentTabObj = INSPIRATION_TABS.find((t) => t.id === activeTab) || INSPIRATION_TABS[0];

  return (
    <footer className="footer-wrapper">
      <div className="container-custom" style={{ padding: '60px 24px 32px' }}>
        
        {/* Top Interactive Perks Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '56px' }}>
          {PERKS.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div key={idx} className="footer-perk-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${perk.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: perk.color }}>
                    <Icon size={19} />
                  </div>
                  <h4 style={{ color: '#f8fafc', fontSize: '0.92rem', fontWeight: '800', margin: 0 }}>
                    {perk.title}
                  </h4>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.55 }}>
                  {perk.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive Inspiration Directory Tabs */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '24px', padding: '32px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '18px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                Inspiration for Your Next Sanctuary
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0' }}>
                Discover verified direct-host stays across India's top travel corridors
              </p>
            </div>

            {/* Tab Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {INSPIRATION_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`footer-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {currentTabObj.items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleItemClick(item)}
                className="footer-link-pill"
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px 16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '2px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.86rem', color: '#f1f5f9' }}>{item.name}</span>
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter & Insider Perks Box */}
        <div className="footer-newsletter-box" style={{ marginBottom: '48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 90, 95, 0.15)', color: '#ff5a5f', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                <Sparkles size={13} /> Secret Sanctuary Drops
              </div>
              <h3 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: '800', margin: '0 0 8px' }}>
                Unlock Secret Direct-Host Rates & Festival Alerts
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: 0, lineHeight: 1.6 }}>
                Never get caught by surprise holiday surges. Join 24,000+ conscious travelers and receive verified direct host discounts.
              </p>
            </div>

            {/* Form */}
            <div>
              {isSubscribed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '14px 20px', borderRadius: '16px', color: '#10b981' }}>
                  <CheckCircle2 size={20} />
                  <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>
                    You are on the FairStay Insider List! Direct-host drops active.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: '1 1 220px' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '13px 14px 13px 40px',
                        borderRadius: '9999px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-coral-pill"
                    style={{ padding: '12px 24px', fontSize: '0.88rem' }}
                  >
                    <span>Join Club</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', fontSize: '0.72rem', color: '#64748b' }}>
                <span>🔒 Zero spam guarantee</span>
                <span>•</span>
                <span>Unsubscribe anytime</span>
                <span>•</span>
                <span>100% Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Brand, Socials, & Regional Settings Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '28px', marginBottom: '24px' }}>
          {/* Brand & Mission */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #ff5a5f, #ff7b54)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 10px rgba(255,90,95,0.4)', fontSize: '1.2rem' }}>
                🏡
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', lineHeight: 1 }}>
                  FairStay<span style={{ color: '#ff5a5f' }}>.</span>
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Vacation Rentals & Homes
                </div>
              </div>
            </Link>

            {/* Live System Indicator */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.25)', padding: '4px 12px', borderRadius: '9999px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontWeight: '700' }}>FairSafe™ Price Engine Live</span>
            </div>
          </div>

          {/* Controls: Region & Theme Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span>🇮🇳</span>
              <span style={{ fontWeight: '700' }}>INR (₹)</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
              <span>English (IN)</span>
            </div>

            <button
              onClick={toggleTheme}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={15} style={{ color: '#fbbf24' }} /> : <Moon size={15} style={{ color: '#38bdf8' }} />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Interactive Social Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Follow FairStay on Instagram">
                <Share2 size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Follow FairStay on X / Twitter">
                <Send size={15} />
              </a>
              <button onClick={() => window.dispatchEvent(new CustomEvent('open-fairstay-ai'))} className="footer-social-btn" title="Open FairStay AI Concierge">
                <MessageCircle size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Legal & Attribution Sub-row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', fontSize: '0.78rem', color: '#64748b' }}>
          <div>
            © {new Date().getFullYear()} FairStay Inc. Handcrafted with <Heart size={12} style={{ display: 'inline', color: '#ff5a5f', verticalAlign: 'middle' }} /> for travelers across India.
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#64748b' }}>Explore Stays</Link>
            <Link to="/trips" style={{ color: '#64748b' }}>My Trips</Link>
            <Link to="/host" style={{ color: '#64748b' }}>Host a Sanctuary</Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('FairSafe™ Guarantee: 100% direct-host transparent pricing with 0% middleman surge.'); }} style={{ color: '#64748b' }}>FairSafe™ Transparency</a>
            <a href="#" onClick={(e) => { e.preventDefault(); toast('Privacy Policy: All guest reservations and payments are 256-bit encrypted.', { icon: '🔒' }); }} style={{ color: '#64748b' }}>Privacy Policy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); toast('Terms: All bookings include 100% full refund rights up to 24h prior to check-in.', { icon: '📜' }); }} style={{ color: '#64748b' }}>Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
