import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Info, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function FestivalPricingWidget({ listing }) {
  const [prediction, setPrediction] = useState(null);
  const [selectedFestival, setSelectedFestival] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [loading, setLoading] = useState(false);

  const basePrice = listing?.price || 3500;
  const destination = listing?.location ? listing.location.split(',')[0].trim() : 'Goa';

  const fetchPrediction = async (festKey = '', dateVal = '') => {
    setLoading(true);
    try {
      const data = await api.predictFestivalPrice({
        listingId: listing?._id || '',
        destination: destination,
        basePrice: basePrice,
        listingTitle: listing?.title || 'Stay',
        festival: festKey || undefined,
        checkInDate: dateVal || undefined,
      });
      setPrediction(data);
    } catch (err) {
      console.error('Failed to load festival prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listing) {
      fetchPrediction();
    }
  }, [listing]);

  const handleFestivalChange = (e) => {
    const val = e.target.value;
    setSelectedFestival(val);
    setCheckInDate('');
    fetchPrediction(val, '');
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setCheckInDate(val);
    setSelectedFestival('');
    fetchPrediction('', val);
  };

  if (!prediction) return null;

  const isSurge = prediction.percentage > 0 && prediction.direction !== 'lower';
  const isDiscount = prediction.direction === 'lower';

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginTop: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: '700', color: '#ff5a5f', background: 'rgba(255, 90, 95, 0.1)', padding: '4px 10px', borderRadius: '9999px', marginBottom: '6px' }}>
            <Sparkles size={12} /> Live Festival & Seasonal Intelligence
          </span>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
            {prediction.emoji || '🎉'} {prediction.festivalName}
          </h4>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: isSurge ? '#ef4444' : isDiscount ? '#16a34a' : '#ff5a5f' }}>
            {loading ? '...' : prediction.signedPercentage}
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#64748b' }}>
            {prediction.demandLevel}
          </span>
        </div>
      </div>

      {/* Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
            Select City Event:
          </label>
          <select
            value={selectedFestival}
            onChange={handleFestivalChange}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'inherit', background: '#fff' }}
          >
            <option value="">Current Season</option>
            {prediction.availableEvents && prediction.availableEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.emoji} {ev.name} ({ev.direction === 'lower' ? '-' : '+'}{Math.abs(ev.defaultPercentage)}%)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
            Or Check In Date:
          </label>
          <input
            type="date"
            value={checkInDate}
            onChange={handleDateChange}
            style={{ width: '100%', padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'inherit', background: '#fff' }}
          />
        </div>
      </div>

      {/* Rates Breakdown Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Normal Baseline</span>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
            ₹{Number(prediction.basePrice || basePrice).toLocaleString('en-IN')}
          </span>
        </div>

        <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Seasonal Impact</span>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: isSurge ? '#ef4444' : isDiscount ? '#16a34a' : '#0f172a' }}>
            {isSurge ? '+' : isDiscount ? '-' : ''}₹{Math.abs(prediction.difference || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #ff5a5f 0%, #ff6b50 100%)', color: '#fff', padding: '12px', borderRadius: '10px' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.9, marginBottom: '2px' }}>Effective Rate</span>
          <span style={{ fontSize: '1rem', fontWeight: '800' }}>
            ₹{Number(prediction.effectivePrice || basePrice).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Area Context Explanation */}
      <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>
        <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} style={{ color: '#ff5a5f' }} />
          <span>Local Area Pricing Dynamics</span>
        </div>
        {prediction.explanation}
      </div>

      {/* Market Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
        <span>🏨 Area Compression: <strong style={{ color: '#0f172a' }}>{prediction.occupancyRate || 'Normal'}</strong></span>
        <span>🌤️ Climate: <strong style={{ color: '#0f172a' }}>{prediction.weatherIndex || 'Pleasant'}</strong></span>
        <span style={{ color: '#16a34a', fontWeight: '600' }}>✓ Zero Host Restrictions</span>
      </div>
    </div>
  );
}
