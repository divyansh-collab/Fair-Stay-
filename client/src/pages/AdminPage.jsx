import { useEffect, useState } from "react";
import { BarChart3, Hotel, Calendar, IndianRupee, Users, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(amount) {
  if (isNaN(amount) || amount == null) return "₹0";
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "—";
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / 86400000));
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, accent = "#ff5a5f" }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 16,
        padding: "22px 24px",
        display: "flex",
        alignItems: "center",
        gap: 18,
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
        flex: "1 1 180px",
        minWidth: 160,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: accent + "1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={accent} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    confirmed: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" },
    pending:   { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
    cancelled: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
  };
  const s = map[status?.toLowerCase()] || { bg: "var(--bg-secondary)", color: "var(--text-secondary)" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: 20,
        padding: "3px 12px",
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {status || "unknown"}
    </span>
  );
}

// ─── Table wrapper ────────────────────────────────────────────────────────────

function ScrollTable({ children }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 14, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", border: "1px solid var(--border-light)" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "var(--bg-card)",
          borderRadius: 14,
          overflow: "hidden",
          fontSize: 14,
        }}
      >
        {children}
      </table>
    </div>
  );
}

const TH_STYLE = {
  padding: "12px 16px",
  textAlign: "left",
  background: "var(--bg-secondary)",
  color: "var(--text-secondary)",
  fontWeight: 600,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

function TD({ children, style = {} }) {
  return (
    <td style={{ padding: "12px 16px", color: "var(--text-primary)", verticalAlign: "middle", ...style }}>
      {children}
    </td>
  );
}

// ─── Listings Table ───────────────────────────────────────────────────────────

function ListingsTable({ listings }) {
  if (!listings.length) {
    return <p style={{ color: "#94a3b8", textAlign: "center", padding: 32 }}>No listings found.</p>;
  }
  return (
    <ScrollTable>
      <thead>
        <tr>
          {["Title", "Location", "Category", "Price / Night", "FairSafe Score"].map((h) => (
            <th key={h} style={TH_STYLE}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {listings.map((l, i) => (
          <tr key={l._id || i} style={{ background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-secondary)" }}>
            <TD>
              <span style={{ fontWeight: 600 }}>{l.title || "—"}</span>
            </TD>
            <TD>{l.location || "—"}</TD>
            <TD>
              <span
                style={{
                  background: "#ff5a5f1a",
                  color: "#ff5a5f",
                  borderRadius: 20,
                  padding: "2px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {l.category || "—"}
              </span>
            </TD>
            <TD>{l.price != null ? formatINR(l.price) : "—"}</TD>
            <TD>
              {l.fairsafeScore != null ? (
                <span style={{ fontWeight: 600, color: l.fairsafeScore >= 7 ? "#16a34a" : "#dc2626" }}>
                  {l.fairsafeScore}/10
                </span>
              ) : "—"}
            </TD>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

// ─── Bookings Table ───────────────────────────────────────────────────────────

function BookingsTable({ bookings }) {
  if (!bookings.length) {
    return <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: 32 }}>No bookings found.</p>;
  }
  return (
    <ScrollTable>
      <thead>
        <tr>
          {["Guest", "Listing", "Check-In", "Check-Out", "Nights", "Total Price", "Status"].map((h) => (
            <th key={h} style={TH_STYLE}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bookings.map((b, i) => (
          <tr key={b._id || i} style={{ background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-secondary)" }}>
            <TD>
              <span style={{ fontWeight: 600 }}>
                {b.user?.username || b.guestName || "—"}
              </span>
            </TD>
            <TD>{b.listing?.title || b.listingTitle || "—"}</TD>
            <TD>{formatDate(b.checkIn)}</TD>
            <TD>{formatDate(b.checkOut)}</TD>
            <TD>{nightsBetween(b.checkIn, b.checkOut)}</TD>
            <TD>{b.totalPrice != null ? formatINR(b.totalPrice) : "—"}</TD>
            <TD><StatusBadge status={b.status} /></TD>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

// ─── Access Denied ────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 20,
          padding: "48px 40px",
          textAlign: "center",
          maxWidth: 420,
          boxShadow: "var(--shadow-md)",
        }}
      >
        <ShieldAlert size={52} color="#ff5a5f" strokeWidth={1.5} style={{ marginBottom: 16 }} />
        <h2 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: 22, fontWeight: 700 }}>
          Access Denied
        </h2>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 15 }}>
          Administrators Only — you do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [lRes, bRes] = await Promise.all([
          fetch("/api/listings?limit=48", { credentials: "include" }),
          fetch("/api/bookings", { credentials: "include" }),
        ]);
        const [lData, bData] = await Promise.all([lRes.json(), bRes.json()]);
        const list = lData.data || lData.listings || (Array.isArray(lData) ? lData : []);
        const bkgs = bData.data || bData.bookings || (Array.isArray(bData) ? bData : []);
        setListings(Array.isArray(list) ? list : []);
        setBookings(Array.isArray(bkgs) ? bkgs : []);
      } catch (err) {
        console.error("Admin fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [user]);

  // ── Guard ────────────────────────────────────────────────────────────────────
  if (user && !user.isAdmin) return <AccessDenied />;

  // ── Derived stats ─────────────────────────────────────────────────────────
  const confirmedBookings = bookings.filter(
    (b) => b.status?.toLowerCase() === "confirmed"
  );
  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + (Number(b.totalPrice) || 0),
    0
  );

  const TAB_BTN = (label, id) => ({
    background: activeTab === id ? "#ff5a5f" : "var(--bg-secondary)",
    color: activeTab === id ? "#fff" : "var(--text-secondary)",
    border: "none",
    borderRadius: 10,
    padding: "9px 22px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-main)",
        padding: "32px 24px",
        fontFamily: "inherit",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <BarChart3 size={28} color="#ff5a5f" strokeWidth={2} />
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>
              Admin Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
              FairStay platform overview
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Loading stats…</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <StatCard icon={Hotel}         label="Total Listings"      value={listings.length}           accent="#ff5a5f" />
            <StatCard icon={Calendar}      label="Total Bookings"      value={bookings.length}           accent="#6366f1" />
            <StatCard icon={Users}         label="Confirmed Bookings"  value={confirmedBookings.length}  accent="#0ea5e9" />
            <StatCard icon={IndianRupee}   label="Total Revenue"       value={formatINR(totalRevenue)}   accent="#10b981" />
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={TAB_BTN("Listings", "listings")} onClick={() => setActiveTab("listings")}>
            🏠 Listings
          </button>
          <button style={TAB_BTN("Bookings", "bookings")} onClick={() => setActiveTab("bookings")}>
            📅 Bookings
          </button>
        </div>

        {/* Tables */}
        {loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Loading data…</p>
        ) : activeTab === "listings" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              All Listings ({listings.length})
            </h2>
            <ListingsTable listings={listings} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              All Bookings ({bookings.length})
            </h2>
            <BookingsTable bookings={bookings} />
          </div>
        )}

      </div>
    </div>
  );
}
