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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        borderRadius: '16px',
        padding: '18px',
        boxShadow: '0 20px 45px -8px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0,0,0,0.15)',
        zIndex: 1050,
        color: 'var(--text-primary)',
        animation: 'fadeIn 0.15s ease',
        minWidth: '300px',
      }}
    >
      {/* Header Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setStep('checkIn')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: step === 'checkIn' ? '#ff5a5f' : 'var(--bg-secondary)',
              color: step === 'checkIn' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Check-in: {checkIn ? formatDisplayDate(checkIn) : 'Pick'}
          </button>
          <button
            type="button"
            onClick={() => setStep('checkOut')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: step === 'checkOut' ? '#ff5a5f' : 'var(--bg-secondary)',
              color: step === 'checkOut' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Check-out: {checkOut ? formatDisplayDate(checkOut) : 'Pick'}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
          }}
          aria-label="Close calendar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Month Navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
        <span style={{ fontSize: '0.98rem', fontWeight: '800', letterSpacing: '-0.2px' }}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={prevMonth}
            disabled={isPrevDisabled}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-card)',
              color: isPrevDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: isPrevDisabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              opacity: isPrevDisabled ? 0.35 : 1,
            }}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '6px' }}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', padding: '4px 0' }}>
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
          <div key={`empty-${i}`} style={{ height: '34px' }} />
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

          if (isPast) {
            color = 'var(--text-muted)';
            fontWeight = '400';
          } else if (isCheckIn || isCheckOut) {
            bg = '#ff5a5f';
            color = '#ffffff';
            fontWeight = '800';
            borderRadius = isCheckIn ? '10px 0 0 10px' : '0 10px 10px 0';
            if (isCheckIn && isCheckOut) borderRadius = '10px';
          } else if (isInRange) {
            bg = 'rgba(255, 90, 95, 0.12)';
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
                height: '34px',
                border: isToday && !isCheckIn && !isCheckOut ? '1px dashed #ff5a5f' : 'none',
                background: bg,
                color: color,
                borderRadius: borderRadius,
                fontSize: '0.82rem',
                fontWeight: fontWeight,
                cursor: isPast ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.1s ease',
                outline: 'none',
                padding: 0,
                opacity: isPast ? 0.35 : 1,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Quick Suggestions */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => handleSelectQuick(0, 2)}
          style={{
            padding: '4px 10px',
            borderRadius: '9999px',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-secondary)',
            fontSize: '0.72rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          ⚡ This Weekend (2n)
        </button>
        <button
          type="button"
          onClick={() => handleSelectQuick(7, 3)}
          style={{
            padding: '4px 10px',
            borderRadius: '9999px',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-secondary)',
            fontSize: '0.72rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          🌴 Next Week (3n)
        </button>
      </div>

      {/* Bottom Summary & Apply Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{nightsCount} {nightsCount === 1 ? 'night' : 'nights'}</strong> stay
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              fontSize: '0.76rem',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: '#ff5a5f',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Check size={14} /> Apply Dates
          </button>
        </div>
      </div>
    </div>
  );
}
