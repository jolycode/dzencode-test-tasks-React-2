import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NavigationMenu } from './components/NavigationMenu';
import { LanguageProvider } from './contexts/LanguageContext';
import './i18n';

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming');

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false); 
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header onMenuClick={handleMenuClick} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        <main className="flex-1 overflow-auto">
          <NavigationMenu activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <Routes>
          <Route path="/:lang/*" element={<AppContent />} />
          <Route path="*" element={<Navigate to="/en" replace />} />
        </Routes>
      </LanguageProvider>
    </Router>
  );
}

export default App;