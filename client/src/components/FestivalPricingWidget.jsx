import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Info, ShieldCheck, Sparkles, Compass } from 'lucide-react';
import api from '../services/api';

export default function FestivalPricingWidget({ listing, onPricingChange }) {
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
      if (onPricingChange && data) {
        onPricingChange(data);
      }
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

  const isSurge = prediction.rawPercentage > 0;
  const isDiscount = prediction.rawPercentage < 0;
  const isNeutral = !isSurge && !isDiscount;

  const cityName = prediction.destination || destination || 'Local City';

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '22px', marginTop: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
      {/* City-Centric Cultural Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: '800', color: '#ff5a5f', background: 'rgba(255, 90, 95, 0.1)', padding: '4px 10px', borderRadius: '9999px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Compass size={12} /> {cityName} Cultural & Seasonal Intelligence
          </span>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            {prediction.emoji || '⚖️'} {prediction.festivalName}
          </h4>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: isSurge ? '#ef4444' : isDiscount ? '#16a34a' : '#ff5a5f', lineHeight: 1.1 }}>
            {loading ? '...' : prediction.signedPercentage}
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            {prediction.demandLevel}
          </span>
        </div>
      </div>

      {/* Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            {cityName} Specific Events:
          </label>
          <select
            value={selectedFestival}
            onChange={handleFestivalChange}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-hover)', fontSize: '0.82rem', fontFamily: 'inherit', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
          >
            <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Standard Regular Season</option>
            {prediction.availableEvents && prediction.availableEvents.map((ev) => (
              <option key={ev.id} value={ev.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                {ev.emoji} {ev.name} ({ev.direction === 'lower' ? '-' : '+'}{Math.abs(ev.defaultPercentage)}%)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Or Check In Date:
          </label>
          <input
            type="date"
            value={checkInDate}
            onChange={handleDateChange}
            onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch (err) {} }}
            onFocus={(e) => { try { e.currentTarget.showPicker?.(); } catch (err) {} }}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-hover)', fontSize: '0.82rem', fontFamily: 'inherit', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Rates Breakdown Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Normal Baseline</span>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            ₹{Number(prediction.basePrice || basePrice).toLocaleString('en-IN')}
          </span>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Seasonal Impact</span>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: isSurge ? '#ef4444' : isDiscount ? '#16a34a' : 'var(--text-primary)' }}>
            {isSurge ? '+' : isDiscount ? '-' : ''}₹{Math.abs(prediction.difference || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #ff5a5f 0%, #ff6b50 100%)', color: '#fff', padding: '12px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(255, 90, 95, 0.25)' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.9, marginBottom: '2px' }}>Effective Rate</span>
          <span style={{ fontSize: '1rem', fontWeight: '800' }}>
            ₹{Number(prediction.effectivePrice || basePrice).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Fair Price Meter (Visual Transparency Layer) */}
      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📊</span> FairStay Price Meter
          </span>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: '6px',
            background: isSurge ? (prediction.percentage >= 30 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(234, 179, 8, 0.12)') : isDiscount ? 'rgba(34, 197, 94, 0.12)' : 'rgba(14, 165, 233, 0.12)',
            color: isSurge ? (prediction.percentage >= 30 ? '#dc2626' : '#ca8a04') : isDiscount ? '#16a34a' : '#0284c7',
          }}>
            {isSurge ? (prediction.percentage >= 30 ? '🔴 High Demand Event Rate' : '🟡 Above Typical Seasonal Rate') : isDiscount ? '🌿 Below Typical Off-Peak Savings' : '🟢 Fair Baseline Rate (0% Surge)'}
          </span>
        </div>

        {/* Progress Track */}
        <div style={{ position: 'relative', height: '8px', background: 'linear-gradient(to right, #22c55e 0%, #0ea5e9 33%, #eab308 66%, #ef4444 100%)', borderRadius: '9999px', margin: '14px 0 20px' }}>
          {/* Position Indicator Needle */}
          <div style={{
            position: 'absolute',
            top: '-5px',
            left: `${isDiscount ? Math.max(5, 22 + (prediction.rawPercentage * 0.6)) : isNeutral ? 33 : Math.min(95, 33 + (prediction.rawPercentage * 1.35))}%`,
            transform: 'translateX(-50%)',
            width: '18px',
            height: '18px',
            background: '#ffffff',
            border: `3px solid ${isSurge ? '#ef4444' : isDiscount ? '#16a34a' : '#0ea5e9'}`,
            borderRadius: '50%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            transition: 'all 0.3s ease',
          }} />
        </div>

        {/* Meter Labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', fontSize: '0.68rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          <div>
            <span style={{ display: 'block', fontWeight: '700', color: '#16a34a' }}>Off-Peak</span>
            <span>₹{Math.round(basePrice * 0.75).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontWeight: '700', color: '#0ea5e9' }}>Fair Baseline</span>
            <span>₹{Number(basePrice).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontWeight: '700', color: '#ca8a04' }}>Moderate</span>
            <span>₹{Math.round(basePrice * 1.2).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontWeight: '700', color: '#dc2626' }}>Peak Event</span>
            <span>₹{Math.round(basePrice * 1.45).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Area Context Explanation */}
      <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '12px' }}>
        <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} style={{ color: '#ff5a5f' }} />
          <span>{cityName} Hospitality Dynamics</span>
        </div>
        {prediction.explanation}
      </div>

      {/* Cultural & Tradition Policy Card */}
      {prediction.whyNotDiwali && (
        <div style={{ background: 'rgba(14, 165, 233, 0.07)', border: '1px solid rgba(14, 165, 233, 0.2)', padding: '12px 16px', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
          <div style={{ fontWeight: '700', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={14} style={{ color: '#0284c7' }} />
            <span>Cultural FairStay Guarantee</span>
          </div>
          {prediction.whyNotDiwali}
        </div>
      )}

      {/* Market Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
        <span>🏨 Area Compression: <strong style={{ color: 'var(--text-primary)' }}>{prediction.occupancyRate || 'Standard'}</strong></span>
        <span>🌤️ Climate: <strong style={{ color: 'var(--text-primary)' }}>{prediction.weatherIndex || 'Pleasant'}</strong></span>
        <span style={{ color: '#16a34a', fontWeight: '700' }}>✓ Zero Arbitrary Markups</span>
      </div>
    </div>
  );
}
