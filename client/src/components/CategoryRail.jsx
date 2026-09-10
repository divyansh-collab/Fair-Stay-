import React from 'react';
import { 
  Flame, 
  Waves, 
  Mountain, 
  Landmark, 
  Sparkles, 
  Gem, 
  BadgePercent, 
  Laptop, 
  Building2, 
  Compass, 
  Tent, 
  Layers 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Stays', icon: Layers },
  { id: 'Trending', label: 'Trending', icon: Flame },
  { id: 'Beachfront', label: 'Beachfront', icon: Waves },
  { id: 'Mountains', label: 'Mountains', icon: Mountain },
  { id: 'Heritage', label: 'Heritage', icon: Landmark },
  { id: 'Pools', label: 'Pools', icon: Sparkles },
  { id: 'Luxe', label: 'Luxe', icon: Gem },
  { id: 'Budget', label: 'Budget', icon: BadgePercent },
  { id: 'Haveli', label: 'Havelis', icon: Building2 },
  { id: 'Workation', label: 'Workation', icon: Laptop },
  { id: 'Camping', label: 'Camping', icon: Tent },
  { id: 'Countryside', label: 'Countryside', icon: Compass },
];

export default function CategoryRail({ 
  activeCategory, 
  onSelectCategory, 
  showTax, 
  onToggleTax,
  minPrice,
  maxPrice,
  onPriceChange
}) {
  return (
    <div style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff', position: 'sticky', top: '80px', zIndex: 900 }}>
      <div className="container-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'nowrap' }}>
        {/* Horizontal Category Scroll Rail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', padding: '12px 0', scrollbarWidth: 'none', msOverflowStyle: 'none', flex: 1 }}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = (activeCategory || 'All') === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id === 'All' ? '' : cat.id)}
                className={`category-pill ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Price Filter Inputs */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', background: '#f8fafc', padding: '6px 10px', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontWeight: '600' }}>Price:</span>
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice || ''}
            onChange={(e) => onPriceChange?.(e.target.value, maxPrice)}
            style={{ width: '65px', padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem', outline: 'none' }}
          />
          <span style={{ color: '#94a3b8' }}>-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice || ''}
            onChange={(e) => onPriceChange?.(minPrice, e.target.value)}
            style={{ width: '65px', padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem', outline: 'none' }}
          />
        </div>

        {/* Display Total before Taxes Pill */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '9999px', background: '#f8fafc', fontSize: '0.78rem', fontWeight: '600', color: '#334155' }}>
          <span>Display total before taxes</span>
          <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', cursor: 'pointer', margin: 0 }}>
            <input
              type="checkbox"
              checked={showTax}
              onChange={(e) => onToggleTax(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: showTax ? '#ff5a5f' : '#cbd5e1',
                borderRadius: '9999px',
                transition: '0.2s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '""',
                  height: '14px',
                  width: '14px',
                  left: showTax ? '19px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.2s',
                }}
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
