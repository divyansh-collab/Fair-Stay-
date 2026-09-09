import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import MyTripsPage from './pages/MyTripsPage';
import HostStayPage from './pages/HostStayPage';
import AiConciergeDrawer from './components/AiConciergeDrawer';
import Footer from './components/Footer';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar onSearch={handleSearch} currentSearch={searchQuery} />
        
        <div style={{ flex: 1 }}>
          <Routes>
            <Route
              path="/"
              element={<HomePage searchQuery={searchQuery} onClearSearch={handleClearSearch} />}
            />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/stay/:id" element={<ListingDetailPage />} />
            <Route path="/trips" element={<MyTripsPage />} />
            <Route path="/host" element={<HostStayPage />} />
            <Route path="/app" element={<HomePage searchQuery={searchQuery} onClearSearch={handleClearSearch} />} />
            <Route path="*" element={<HomePage searchQuery={searchQuery} onClearSearch={handleClearSearch} />} />
          </Routes>
        </div>

        <AiConciergeDrawer />
        <Footer />
      </div>
    </BrowserRouter>
  );
}
