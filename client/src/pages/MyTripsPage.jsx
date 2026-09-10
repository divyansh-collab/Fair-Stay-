import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Luggage, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  QrCode, 
  KeyRound, 
  Sparkles, 
  ArrowRight,
  Frown,
  CheckCircle2,
  Clock,
  XCircle,
  Plus
} from 'lucide-react';
import api from '../services/api';
import RoomTicketModal from '../components/RoomTicketModal';

export default function MyTripsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // 1. Fetch from server API
      const res = await api.getBookings();
      const serverBookings = (res && res.data) ? res.data : [];

      // 2. Fetch from local storage (client-made bookings)
      const localBookings = JSON.parse(localStorage.getItem('fairstay_bookings') || '[]');

      // Merge and deduplicate by _id
      const map = new Map();
      [...localBookings, ...serverBookings].forEach((b) => {
        if (b && b._id && !map.has(b._id)) {
          map.set(b._id, b);
        }
      });

      const combined = Array.from(map.values());
      setBookings(combined);
    } catch (err) {
      console.error('Failed to load trips:', err);
      const localBookings = JSON.parse(localStorage.getItem('fairstay_bookings') || '[]');
      setBookings(localBookings);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = (b) => {
    setSelectedBooking(b);
    setIsTicketOpen(true);
  };

  const handleCancelBooking = async (bId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? You will receive a 100% full FairSafe refund immediately.')) {
      return;
    }

    try {
      await api.cancelBooking(bId);
    } catch (e) {
      console.warn('Backend cancel failed, updating locally:', e);
    }

    // Update state and local storage
    const updated = bookings.map((b) => (b._id === bId ? { ...b, status: 'cancelled' } : b));
    setBookings(updated);
    localStorage.setItem('fairstay_bookings', JSON.stringify(updated));
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="container-custom" style={{ padding: '40px 24px 80px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff5a5f', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Luggage size={16} /> My Reservations & Room Passes
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)', margin: '4px 0 6px' }}>
            My Trips & Boarding Passes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Manage your verified stays, view assigned suite numbers, access keyless door PINs, and download check-in vouchers.
          </p>
        </div>

        <Link to="/" className="btn-coral" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Book Another Stay</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <button
          onClick={() => setFilterStatus('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontWeight: '700',
            fontSize: '0.85rem',
            background: filterStatus === 'all' ? 'var(--text-primary)' : 'var(--bg-secondary)',
            color: filterStatus === 'all' ? 'var(--bg-main)' : 'var(--text-secondary)',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          All Stays ({bookings.length})
        </button>

        <button
          onClick={() => setFilterStatus('confirmed')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontWeight: '700',
            fontSize: '0.85rem',
            background: filterStatus === 'confirmed' ? '#10b981' : 'var(--bg-secondary)',
            color: filterStatus === 'confirmed' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
        </button>

        <button
          onClick={() => setFilterStatus('cancelled')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontWeight: '700',
            fontSize: '0.85rem',
            background: filterStatus === 'cancelled' ? '#ef4444' : 'var(--bg-secondary)',
            color: filterStatus === 'cancelled' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Cancelled ({bookings.filter((b) => b.status === 'cancelled').length})
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="trips-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-light)', height: '280px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredBookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <Luggage size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
            No trips found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            {filterStatus === 'all'
              ? "You haven't reserved any sanctuaries yet. Discover verified properties across Goa, Manali, Jaipur, and beyond."
              : `You have no ${filterStatus} bookings.`}
          </p>
          <Link to="/" className="btn-coral">
            Explore Handcrafted Stays
          </Link>
        </div>
      )}

      {/* Trips Grid */}
      {!loading && filteredBookings.length > 0 && (
        <div className="trips-grid">
          {filteredBookings.map((b) => {
            const listing = b.listing || {};
            const inDate = new Date(b.checkIn || Date.now());
            const outDate = new Date(b.checkOut || Date.now() + 2 * 24 * 60 * 60 * 1000);
            const isConfirmed = b.status === 'confirmed';
            const isCancelled = b.status === 'cancelled';

            return (
              <div
                key={b._id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '24px',
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Stay Image & Status Header */}
                <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: 'var(--bg-secondary)' }}>
                  <img
                    src={listing.image?.url || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80'}
                    alt={listing.title || 'Stay'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* Status Badge */}
                  <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#fff',
                        background: isConfirmed ? '#10b981' : (isCancelled ? '#ef4444' : '#f59e0b'),
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                      }}
                    >
                      {isConfirmed && <CheckCircle2 size={13} />}
                      {isCancelled && <XCircle size={13} />}
                      {!isConfirmed && !isCancelled && <Clock size={13} />}
                      <span>{(b.status || 'CONFIRMED').toUpperCase()}</span>
                    </span>
                  </div>

                  {/* Room Number Badge */}
                  {b.roomNumber && (
                    <div style={{ position: 'absolute', bottom: '14px', right: '14px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                      {b.roomNumber}
                    </div>
                  )}
                </div>

                {/* Booking Body Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.3 }}>
                      {listing.title || 'Luxury Sanctuary Stay'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '14px' }}>
                      <MapPin size={14} style={{ color: '#ff5a5f' }} />
                      <span>{listing.location || 'India'}</span>
                    </div>

                    {/* Schedule & Specs Box */}
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '14px', padding: '12px 14px', border: '1px solid var(--border-light)', marginBottom: '16px', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Schedule:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {inDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {outDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Occupancy:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{b.guests || 1} guest{(b.guests || 1) > 1 ? 's' : ''}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '6px', color: '#10b981' }}>
                        <span>Total Paid:</span>
                        <strong style={{ fontSize: '0.92rem' }}>₹{Number(b.totalPrice || 0).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {/* View Room Pass Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenTicket(b)}
                      className="btn-coral"
                      style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <QrCode size={16} />
                      <span>Room Pass</span>
                    </button>

                    {/* View Stay Details */}
                    {listing._id && (
                      <Link
                        to={`/stay/${listing._id}`}
                        className="btn-outline"
                        style={{ padding: '10px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        Details
                      </Link>
                    )}

                    {/* Cancel Reservation Option */}
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b._id)}
                        className="btn-outline"
                        style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fecaca' }}
                        title="100% Full Refund Cancellation"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Boarding Pass Modal */}
      <RoomTicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        booking={selectedBooking}
        keylessPin={selectedBooking?.keylessPin || '8492'}
      />
    </div>
  );
}
