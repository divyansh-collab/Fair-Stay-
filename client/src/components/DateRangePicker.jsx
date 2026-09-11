import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function formatYMD(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseYMD(ymdStr) {
  if (!ymdStr) return null;
  const parts = ymdStr.split('-');
  if (parts.length !== 3) return null;
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

export function formatDisplayDate(ymdStr) {
  const d = parseYMD(ymdStr);
  if (!d) return 'Add date';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  onDatesChange,
  isOpen,
  onClose,
  initialStep = 'checkIn',
}) {
  const popupRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialCheckInDate = parseYMD(checkIn) || today;
  const [currentMonth, setCurrentMonth] = useState(initialCheckInDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialCheckInDate.getFullYear());
  const [step, setStep] = useState(initialStep);
  const [hoverDate, setHoverDate] = useState(null);

  useEffect(() => {
    if (checkIn) {
      const d = parseYMD(checkIn);
      if (d) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const isPrevDisabled =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  const inDate = parseYMD(checkIn);
  const outDate = parseYMD(checkOut);

  const handleDateClick = (day) => {
    const clicked = new Date(currentYear, currentMonth, day);
    clicked.setHours(0, 0, 0, 0);

    if (clicked < today) return;

    if (step === 'checkIn') {
      const newInStr = formatYMD(clicked);
      let newOutStr = checkOut;
      if (!outDate || outDate <= clicked) {
        const nextDay = new Date(clicked);
        nextDay.setDate(nextDay.getDate() + 1);
        newOutStr = formatYMD(nextDay);
      }
      onDatesChange({ checkIn: newInStr, checkOut: newOutStr });
      setStep('checkOut');
    } else {
      if (!inDate || clicked <= inDate) {
        const newInStr = formatYMD(clicked);
        const nextDay = new Date(clicked);
        nextDay.setDate(nextDay.getDate() + 1);
        onDatesChange({ checkIn: newInStr, checkOut: formatYMD(nextDay) });
        setStep('checkOut');
      } else {
        onDatesChange({ checkIn, checkOut: formatYMD(clicked) });
        onClose();
      }
    }
  };

  const handleSelectQuick = (daysAhead, stayLength) => {
    const start = new Date(today);
    start.setDate(start.getDate() + daysAhead);
    const end = new Date(start);
    end.setDate(end.getDate() + stayLength);

    onDatesChange({ checkIn: formatYMD(start), checkOut: formatYMD(end) });
    setCurrentMonth(start.getMonth());
    setCurrentYear(start.getFullYear());
    onClose();
  };

  let nightsCount = 1;
  if (inDate && outDate && outDate > inDate) {
    nightsCount = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: '0',
        right: '0',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-hover)',
        borderRadius: '20px',
        padding: '18px 18px 16px',
        boxShadow: '0 24px 50px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 90, 95, 0.18)',
        zIndex: 10005,
        color: 'var(--text-primary)',
        animation: 'fadeIn 0.18s ease-out',
        minWidth: '310px',
        maxHeight: 'min(580px, calc(100vh - 150px))',
        overflowY: 'auto',
      }}
    >
      {/* Step Selector Tabs & Close Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setStep('checkIn')}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: '700',
              border: step === 'checkIn' ? '1px solid #ff5a5f' : '1px solid var(--border-light)',
              cursor: 'pointer',
              background: step === 'checkIn' ? '#ff5a5f' : 'var(--bg-secondary)',
              color: step === 'checkIn' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: step === 'checkIn' ? '0 2px 8px rgba(255, 90, 95, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Check-in: {checkIn ? formatDisplayDate(checkIn) : 'Pick date'}
          </button>
          <button
            type="button"
            onClick={() => setStep('checkOut')}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: '700',
              border: step === 'checkOut' ? '1px solid #ff5a5f' : '1px solid var(--border-light)',
              cursor: 'pointer',
              background: step === 'checkOut' ? '#ff5a5f' : 'var(--bg-secondary)',
              color: step === 'checkOut' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: step === 'checkOut' ? '0 2px 8px rgba(255, 90, 95, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Check-out: {checkOut ? formatDisplayDate(checkOut) : 'Pick date'}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.15s ease',
          }}
          title="Close calendar"
          aria-label="Close calendar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Prominent Month Navigator: [ < Previous Month ]  [ Month Year ]  [ Next Month > ] */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', padding: '0 4px' }}>
        {/* Previous Month Button */}
        <button
          type="button"
          onClick={prevMonth}
          disabled={isPrevDisabled}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-hover)',
            background: 'var(--bg-secondary)',
            color: isPrevDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: isPrevDisabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            opacity: isPrevDisabled ? 0.3 : 1,
          }}
          title="Previous month"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Current Month & Year Display */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
        </div>

        {/* Forward / Next Month Button (High contrast, signature coral highlight) */}
        <button
          type="button"
          onClick={nextMonth}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            border: '1.5px solid #ff5a5f',
            background: 'rgba(255, 90, 95, 0.12)',
            color: '#ff5a5f',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 10px rgba(255, 90, 95, 0.25)',
          }}
          title="Next month (Forward)"
          aria-label="Next month"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Weekday Column Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            style={{
              fontSize: '0.72rem',
              fontWeight: '800',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '2px 0'
            }}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}
        onMouseLeave={() => setHoverDate(null)}
      >
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} style={{ height: '36px' }} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(currentYear, currentMonth, day);
          dateObj.setHours(0, 0, 0, 0);

          const isPast = dateObj < today;
          const isToday = dateObj.getTime() === today.getTime();
          const isCheckIn = inDate && dateObj.getTime() === inDate.getTime();
          const isCheckOut = outDate && dateObj.getTime() === outDate.getTime();

          let isInRange = false;
          if (inDate && outDate && dateObj > inDate && dateObj < outDate) {
            isInRange = true;
          }
          if (step === 'checkOut' && inDate && hoverDate && hoverDate > inDate && dateObj > inDate && dateObj <= hoverDate) {
            isInRange = true;
          }

          let bg = 'transparent';
          let color = 'var(--text-primary)';
          let borderRadius = '8px';
          let fontWeight = '500';
          let boxShadow = 'none';

          if (isPast) {
            color = 'var(--text-muted)';
            fontWeight = '400';
          } else if (isCheckIn || isCheckOut) {
            bg = '#ff5a5f';
            color = '#ffffff';
            fontWeight = '800';
            borderRadius = isCheckIn ? '10px 0 0 10px' : '0 10px 10px 0';
            if (isCheckIn && isCheckOut) borderRadius = '10px';
            boxShadow = '0 2px 8px rgba(255, 90, 95, 0.4)';
          } else if (isInRange) {
            bg = 'rgba(255, 90, 95, 0.14)';
            color = '#ff5a5f';
            fontWeight = '700';
            borderRadius = '0';
          }

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => !isPast && setHoverDate(dateObj)}
              style={{
                height: '36px',
                border: isToday && !isCheckIn && !isCheckOut ? '1.5px dashed #ff5a5f' : 'none',
                background: bg,
                color: color,
                borderRadius: borderRadius,
                fontSize: '0.84rem',
                fontWeight: fontWeight,
                cursor: isPast ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.1s ease',
                outline: 'none',
                padding: 0,
                opacity: isPast ? 0.35 : 1,
                boxShadow: boxShadow,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Quick Selection Presets */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button
          type="button"
          onClick={() => handleSelectQuick(0, 2)}
          style={{
            flexShrink: 0,
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-secondary)',
            fontSize: '0.74rem',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          ⚡ This Weekend (2n)
        </button>
        <button
          type="button"
          onClick={() => handleSelectQuick(7, 3)}
          style={{
            flexShrink: 0,
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-secondary)',
            fontSize: '0.74rem',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          🌴 Next Week (3n)
        </button>
        <button
          type="button"
          onClick={() => handleSelectQuick(0, 7)}
          style={{
            flexShrink: 0,
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-secondary)',
            fontSize: '0.74rem',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          ✨ 7 Nights
        </button>
      </div>

      {/* Bottom Summary & Apply Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{nightsCount} {nightsCount === 1 ? 'night' : 'nights'}</strong> stay
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              const start = formatYMD(today);
              const next = new Date(today);
              next.setDate(next.getDate() + 2);
              onDatesChange({ checkIn: start, checkOut: formatYMD(next) });
              setStep('checkIn');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '4px 6px',
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              background: '#ff5a5f',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(255, 90, 95, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            <Check size={15} strokeWidth={2.5} /> Apply Dates
          </button>
        </div>
      </div>
    </div>
  );
}
