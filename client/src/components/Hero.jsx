import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Tag, BadgeCheck } from 'lucide-react';

export default function Hero({ activeDestination, onSelectDestination }) {
  const vibeChips = [
    { label: '🌴 Goa Coastal Villas', filter: 'Goa' },
    { label: '🏔️ Manali Mountain Chalets', filter: 'Manali' },
    { label: '🏰 Jaipur Royal Haveli', filter: 'Jaipur' },
    { label: '🌿 Munnar Sanctuaries', filter: 'Munnar' },
    { label: '🌊 Udaipur Lakefront Stays', filter: 'Udaipur' },
  ];

  const handleExploreClick = () => {
    const el = document.getElementById('listingsGridView');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 580, behavior: 'smooth' });
    }
  };

  return (
    <section className="container-custom" style={{ padding: '20px 24px 12px' }}>
      <div id="naturalSanctuaryHero" className="natural-sanctuary-hero">
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
          {/* Luxury Brand Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              marginBottom: '16px',
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            <span>✨</span>
            <span>DISCOVER • BOOK • HOST</span>
          </div>

          {/* Main Editorial Headline (Two-tone) */}
          <h1
            style={{
              fontSize: 'clamp(2.3rem, 4.5vw, 3.6rem)',
              fontWeight: '800',
              letterSpacing: '-0.035em',
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '16px',
              textShadow: '0 2px 16px rgba(0, 0, 0, 0.65)',
            }}
          >
            Your Next Stay<br />
            <span
              style={{
                background: 'linear-gradient(90deg, #ffb070 0%, #ff6b50 60%, #ff416c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              Starts Here.
            </span>
          </h1>

          {/* Atmospheric Subtitle */}
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.92)',
              fontSize: '1.05rem',
              maxWidth: '520px',
              lineHeight: 1.6,
              marginBottom: '24px',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.6)',
            }}
          >
            From cozy homes to luxury escapes, discover places worth staying — or open your doors to travelers.
          </p>

          {/* Curated Discovery Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {vibeChips.map((chip) => {
              const isActive = activeDestination === chip.filter;
              return (
                <button
                  key={chip.filter}
                  onClick={() => onSelectDestination(isActive ? '' : chip.filter)}
                  style={{
                    background: isActive ? 'rgba(255, 90, 60, 0.85)' : 'rgba(0, 0, 0, 0.42)',
                    backdropFilter: 'blur(12px)',
                    border: isActive ? '1px solid #ff6b50' : '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: '500',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.42)';
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Dual Marketplace CTAs: Explore Stays → and Become a Host */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
            <button
              onClick={handleExploreClick}
              style={{
                background: 'linear-gradient(90deg, #ff6b4a 0%, #ff416c 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.95rem',
                padding: '12px 28px',
                borderRadius: '9999px',
                boxShadow: '0 6px 20px rgba(255, 65, 108, 0.4)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.25s ease',
              }}
            >
              <span>Explore Stays</span>
              <ArrowRight size={18} />
            </button>

            <Link
              to="/host"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.95rem',
                padding: '12px 24px',
                borderRadius: '9999px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1rem' }}>🏡</span>
              <span>Become a Host</span>
            </Link>
          </div>

          {/* Reassurance Trust Line */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '22px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.95)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} style={{ color: '#4ade80' }} /> 100% Verified Homes
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={15} style={{ color: '#facc15' }} /> Zero Hidden Fees
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BadgeCheck size={16} style={{ color: '#38bdf8' }} /> FairStay™ Protected
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
