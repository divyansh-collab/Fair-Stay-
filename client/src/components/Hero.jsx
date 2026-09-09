import React from 'react';
import { MapPin, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

const TOP_DESTINATIONS = [
  { name: 'All Stays', filter: '' },
  { name: 'Goa (Beaches & Villas)', filter: 'Goa' },
  { name: 'Manali (Snow & Peaks)', filter: 'Manali' },
  { name: 'Jaipur (Havelis & Palaces)', filter: 'Jaipur' },
  { name: 'Varanasi (Spiritual Ghats)', filter: 'Varanasi' },
  { name: 'Kerala (Backwaters & Tea)', filter: 'Kerala' },
  { name: 'Udaipur (Lakeside Suites)', filter: 'Udaipur' },
];

export default function Hero({ activeDestination, onSelectDestination }) {
  return (
    <section style={{ padding: '40px 0 24px', background: 'radial-gradient(circle at 50% 0%, rgba(255, 90, 95, 0.08) 0%, transparent 60%)' }}>
      <div className="container-custom" style={{ textAlign: 'center', maxWidth: '840px' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 90, 95, 0.1)', color: '#ff5a5f', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '16px', border: '1px solid rgba(255, 90, 95, 0.2)' }}>
          <Sparkles size={14} />
          <span>STAY DIFFERENT. TRAVEL BETTER.</span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '800', lineHeight: 1.15, color: '#0f172a', letterSpacing: '-1px', marginBottom: '16px' }}>
          Your Next Stay Starts Here.
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.6, marginBottom: '28px' }}>
          From cozy homes to luxury escapes, discover places worth staying — or open your doors to travelers.
        </p>

        {/* Destination Shortcuts Rail */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {TOP_DESTINATIONS.map((dest) => {
            const isActive = activeDestination === dest.filter;
            return (
              <button
                key={dest.name}
                onClick={() => onSelectDestination(dest.filter)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  background: isActive ? '#ff5a5f' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  border: isActive ? '1px solid #ff5a5f' : '1px solid #e2e8f0',
                  boxShadow: isActive ? '0 4px 12px rgba(255, 90, 95, 0.3)' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <MapPin size={13} style={{ opacity: isActive ? 1 : 0.6 }} />
                <span>{dest.name}</span>
              </button>
            );
          })}
        </div>

        {/* Value Prop Guarantee Strip */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', color: '#64748b', fontSize: '0.78rem', fontWeight: '600', padding: '8px 20px', background: '#ffffff', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
            <ShieldCheck size={14} /> Direct Host Pricing
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ff5a5f' }}>
            <TrendingUp size={14} /> Area Festival Trends
          </span>
          <span>•</span>
          <span>Zero Restrictive Handcuffs</span>
        </div>
      </div>
    </section>
  );
}
