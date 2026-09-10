import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Printer, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  KeyRound, 
  QrCode, 
  Share2, 
  ArrowRight,
  Sparkles,
  Luggage
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RoomTicketModal({ 
  isOpen, 
  onClose, 
  booking, 
  keylessPin = '8492' 
}) {
  const navigate = useNavigate();
  if (!isOpen || !booking) return null;

  const listing = booking.listing || {};
  const inDate = new Date(booking.checkIn || Date.now());
  const outDate = new Date(booking.checkOut || Date.now() + 2 * 24 * 60 * 60 * 1000);
  const roomNumber = booking.roomNumber || `SUITE-${(listing.location || 'STAY').slice(0,3).toUpperCase()}-402`;
  const bookingId = booking._id ? String(booking._id).slice(-8).toUpperCase() : 'FS-892401';
  const totalAmount = Number(booking.totalPrice) || 7840;

  const handlePrint = () => {
    window.print();
  };

  const handleGoToTrips = () => {
    onClose();
    navigate('/trips');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '28px', width: '100%', maxWidth: '720px', maxHeight: '94vh', overflowY: 'auto', boxShadow: '0 30px 70px rgba(0,0,0,0.35)', position: 'relative', border: '1px solid var(--border-light)' }}>
        
        {/* Top Celebration Bar */}
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '20px 28px', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', opacity: 0.9 }}>
                Reservation Confirmed
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                Your Suite & Digital Room Pass is Ready!
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', border: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Boarding Pass Ticket Body */}
        <div style={{ padding: '28px' }}>
          
          {/* Ticket Card Container */}
          <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-light)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
            
            {/* Top Pass Brand Strip */}
            <div style={{ padding: '16px 24px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#ff5a5f' }} />
                <span style={{ fontWeight: '800', letterSpacing: '0.5px', fontSize: '1rem' }}>FairStay Sanctuary Pass</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
                <span>Booking ID:</span>
                <span style={{ color: '#38bdf8', fontWeight: '800', letterSpacing: '1px' }}>#{bookingId}</span>
              </div>
            </div>

            {/* Room Number & Keyless PIN Hero Section */}
            <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderBottom: '2px dashed var(--border-light)', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Assigned Room Suite
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{roomNumber}</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(14, 165, 233, 0.15)', color: '#0284c7', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', marginTop: '6px' }}>
                  <ShieldCheck size={14} /> Guaranteed Direct Host Allocation
                </div>
              </div>

              {/* Digital Door PIN */}
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                  <KeyRound size={14} style={{ color: '#ff5a5f' }} />
                  <span>Keyless Entry PIN</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ff5a5f', letterSpacing: '6px', marginTop: '4px' }}>
                  {keylessPin}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Tap PIN at smart-lock door</div>
              </div>
            </div>

            {/* Property & Stay Details */}
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 140px', gap: '20px', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {listing.title || 'Luxury Vacation Stay'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <MapPin size={15} style={{ color: '#ff5a5f' }} />
                  <span>{listing.location || 'India'}</span>
                </div>

                {/* Dates & Guest Specs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Check-In</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {inDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>From 2:00 PM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Check-Out</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {outDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Until 11:00 AM</div>
                  </div>
                </div>

                {/* Guest & Total Paid */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '14px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Primary Guest: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{booking.guestName || 'Valued Guest'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Occupancy: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{booking.guests || 1} guest{(booking.guests || 1) > 1 ? 's' : ''}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Paid: </span>
                    <strong style={{ color: '#10b981' }}>₹{totalAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Digital Check-in QR Code */}
              <div style={{ textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                <div style={{ background: '#fff', padding: '6px', borderRadius: '10px', display: 'inline-block' }}>
                  <svg width="100" height="100" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto' }}>
                    <rect width="100" height="100" fill="white" />
                    <rect x="8" y="8" width="28" height="28" fill="#0f172a" />
                    <rect x="13" y="13" width="18" height="18" fill="white" />
                    <rect x="18" y="18" width="8" height="8" fill="#ff5a5f" />
                    <rect x="64" y="8" width="28" height="28" fill="#0f172a" />
                    <rect x="69" y="13" width="18" height="18" fill="white" />
                    <rect x="74" y="18" width="8" height="8" fill="#ff5a5f" />
                    <rect x="8" y="64" width="28" height="28" fill="#0f172a" />
                    <rect x="13" y="69" width="18" height="18" fill="white" />
                    <rect x="18" y="74" width="8" height="8" fill="#ff5a5f" />
                    <rect x="45" y="15" width="10" height="25" fill="#0f172a" />
                    <rect x="42" y="48" width="16" height="16" fill="#ff5a5f" />
                    <rect x="64" y="64" width="28" height="28" fill="#0f172a" />
                    <rect x="70" y="70" width="16" height="16" fill="white" />
                  </svg>
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Scan at Front Desk
                </div>
              </div>
            </div>

            {/* Bottom Pass Guarantee Strip */}
            <div style={{ background: 'var(--bg-secondary)', padding: '12px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>🛡️ Zero-Surge FairSafe Guaranteed Reservation</span>
              <span>100% Full Refund if cancelled 24h prior</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
            <button
              onClick={handlePrint}
              className="btn-outline"
              style={{ flex: 1, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
            >
              <Printer size={18} />
              <span>Print / Save Voucher</span>
            </button>

            <button
              onClick={handleGoToTrips}
              className="btn-coral"
              style={{ flex: 1, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
            >
              <Luggage size={18} />
              <span>View in My Trips</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
