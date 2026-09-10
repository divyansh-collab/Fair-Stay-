/**
 * ============================================================================
 * 📱 FAIRSTAY STOREFRONT SWITCHBOARD (The "Grand Lobby Navigator")
 * ============================================================================
 * What this file does (in plain English):
 * 1. The top-level master conductor for the entire user interface.
 * 2. Glues the Navbar at top and Footer at bottom on every screen.
 * 3. Switches the center view when guests click links:
 *    - '/' -> HomePage (Browse villas, filter by city or beach)
 *    - '/listings/:id' -> ListingDetailPage (5-photo bento grid, reviews, map)
 *    - '/my-trips' -> MyTripsPage (See your confirmed bookings)
 *    - '/host' -> HostStayPage (List your home for guests)
 *    - '/admin' -> AdminPage (Secret manager dashboard for bookings/revenue)
 * 4. Floats the AI Concierge assistant in the bottom corner of every page.
 * ============================================================================
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import MyTripsPage from './pages/MyTripsPage';
import HostStayPage from './pages/HostStayPage';
import AiConciergeDrawer from './components/AiConciergeDrawer';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar onSearch={handleSearch} currentSearch={searchQuery} />
            <div style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage searchQuery={searchQuery} onClearSearch={handleClearSearch} />} />
                <Route path="/listings" element={<HomePage searchQuery={searchQuery} onClearSearch={handleClearSearch} />} />
                <Route path="/listing/:id" element={<ListingDetailPage />} />
                <Route path="/listings/:id" element={<ListingDetailPage />} />
                <Route path="/stay/:id" element={<ListingDetailPage />} />
                <Route path="/trips" element={<MyTripsPage />} />
                <Route path="/host" element={<HostStayPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/app" element={<HomePage searchQuery={searchQuery} onClearSearch={handleClearSearch} />} />
                <Route path="*" element={<HomePage searchQuery={searchQuery} onClearSearch={handleClearSearch} />} />
              </Routes>
            </div>
            <AiConciergeDrawer />
            <Footer />
            <Toaster position="top-right" />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
