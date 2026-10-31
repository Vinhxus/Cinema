import { useState } from 'react';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard, { type AdminTabId } from './pages/AdminDashboard';
import MovieManagement from './pages/MovieManagement';
import Showtimes from './pages/Showtimes';
import SeatingAndPricing from './pages/SeatingAndPricing';
import TicketCheckIn from './pages/TicketCheckIn';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState<AdminTabId>('overview');

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />
      </div>
    );
  }

  switch (currentTab) {
    case 'overview':
      return <AdminDashboard activeTab={currentTab} onNavigate={setCurrentTab} />;
      
    case 'movies':
      return <MovieManagement activeTab={currentTab} onNavigate={setCurrentTab} />;

    case 'showtimes':
      return <Showtimes activeTab={currentTab} onNavigate={setCurrentTab} />;
      
    case 'seating':
      return <SeatingAndPricing activeTab={currentTab} onNavigate={setCurrentTab} />;

    case 'checkin':
      return <TicketCheckIn activeTab={currentTab} onNavigate={setCurrentTab} />;

    case 'settings':
    default:
      return <AdminDashboard activeTab={currentTab} onNavigate={setCurrentTab} />;
  }
}