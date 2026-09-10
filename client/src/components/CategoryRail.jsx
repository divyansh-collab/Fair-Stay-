import React from 'react';
import { 
  LayoutGrid, 
  Umbrella, 
  Mountain, 
  Waves, 
  Landmark, 
  Flame, 
  Building2, 
  Trees, 
  Laptop, 
  Gem, 
  PiggyBank 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Homes', icon: LayoutGrid },
  { id: 'Beachfront', label: 'Beachfront', icon: Umbrella },
  { id: 'Mountains', label: 'Mountains', icon: Mountain },
  { id: 'Pools', label: 'Amazing Pools', icon: Waves },
  { id: 'Heritage', label: 'Heritage', icon: Landmark },
  { id: 'Trending', label: 'Trending', icon: Flame },
  { id: 'City', label: 'City Stays', icon: Building2 },
  { id: 'Countryside', label: 'Countryside', icon: Trees },
  { id: 'Workation', label: 'Workation', icon: Laptop },
  { id: 'Luxe', label: 'Luxe', icon: Gem },
  { id: 'Budget', label: 'Budget', icon: PiggyBank },
];

export default function CategoryRail({ 
  activeCategory, 
  onSelectCategory, 
  showTax, 
  onToggleTax 
}) {
  return (
    <div className="filter-wrapper" style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-main)', position: 'relative', zIndex: 10 }}>
      <div className="container-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'nowrap', minHeight: '68px' }}>
        {/* Horizontal Category Scroll Rail */}
        <div className="category-rail" style={{ display: 'flex', alignItems: 'center', gap: '32px', overflowX: 'auto', padding: '12px 0 6px', flex: 1 }}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = (!activeCategory && cat.id === 'All') || activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id === 'All' ? '' : cat.id)}
                className={`category-item ${isActive ? 'active' : ''}`}
                type="button"
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Display Total after Taxes Switch (Matching Previous Version Mockup) */}
        <div className="tax-toggle-box" style={{ flexShrink: 0, margin: '8px 0' }}>
          <label 
            htmlFor="taxToggleSwitch" 
            style={{ 
              fontSize: '0.84rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)', 
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              margin: 0
            }}
          >
            Display total after taxes
          </label>
          <label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '22px', cursor: 'pointer', margin: 0 }}>
            <input
              id="taxToggleSwitch"
              type="checkbox"
              checked={showTax}
              onChange={(e) => onToggleTax(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0, margin: 0 }}
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
                transition: 'background-color 0.2s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '""',
                  height: '16px',
                  width: '16px',
                  left: showTax ? '19px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
