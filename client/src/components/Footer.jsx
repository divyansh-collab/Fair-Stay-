import React from 'react';
import { Sparkles, ShieldCheck, Wifi, MapPin, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '60px 0 30px', marginTop: '60px', borderTop: '1px solid #1e293b' }}>
      <div className="container-custom">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ff5a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: '800' }}>FairStay</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#64748b', marginBottom: '16px' }}>
              India's premier luxury vacation rentals and spiritual sanctuary marketplace, engineered with transparent area-centric pricing and zero restrictions.
            </p>
            <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: '700', color: '#ff5a5f', background: 'rgba(255, 90, 95, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
              FULL STACK MERN EDITION
            </span>
          </div>

          {/* Top Corridors */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: '700', marginBottom: '16px' }}>Top Travel Corridors</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <li><a href="/?destination=Goa" style={{ color: '#94a3b8' }}>Goa (Beachfront & Private Villas)</a></li>
              <li><a href="/?destination=Manali" style={{ color: '#94a3b8' }}>Manali & Solang (Pine Cottages)</a></li>
              <li><a href="/?destination=Jaipur" style={{ color: '#94a3b8' }}>Jaipur (Royal Havelis & Palaces)</a></li>
              <li><a href="/?destination=Varanasi" style={{ color: '#94a3b8' }}>Varanasi (Ghats & Spiritual Stays)</a></li>
              <li><a href="/?destination=Kerala" style={{ color: '#94a3b8' }}>Kerala & Munnar (Tea Estates)</a></li>
              <li><a href="/?destination=Udaipur" style={{ color: '#94a3b8' }}>Udaipur (Lakeside Suites)</a></li>
            </ul>
          </div>

          {/* FairSafe Guarantees */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: '700', marginBottom: '16px' }}>FairSafe™ Guarantees</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: '#4ade80' }} />
                <span>100% Direct Host Rates (Zero Markup)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={16} style={{ color: '#38bdf8' }} />
                <span>Verified Fast Wi-Fi (100+ Mbps)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: '#f43f5e' }} />
                <span>Verified Neighborhood Geocodes</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} style={{ color: '#a855f7' }} />
                <span>100% Free Cancellation Support</span>
              </li>
            </ul>
          </div>

          {/* Technology & Stack */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: '700', marginBottom: '16px' }}>MERN Architecture</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
              <div><strong style={{ color: '#f1f5f9' }}>M:</strong> MongoDB (Atlas Mongoose ODM)</div>
              <div><strong style={{ color: '#f1f5f9' }}>E:</strong> Express.js REST API Server</div>
              <div><strong style={{ color: '#f1f5f9' }}>R:</strong> React 19 (Vite Single Page App)</div>
              <div><strong style={{ color: '#f1f5f9' }}>N:</strong> Node.js Production Engine</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem' }}>
          <div>
            © {new Date().getFullYear()} FairStay Inc. Handcrafted with ❤️ for travelers across India.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ color: '#64748b' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#64748b' }}>Terms of Service</a>
            <a href="#" style={{ color: '#64748b' }}>FairSafe™ Transparency</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
