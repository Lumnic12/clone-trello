import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Common/Navbar';
import ErrorBoundary from './components/Common/ErrorBoundary';
import HomePage from './pages/HomePage';
import BoardPage from './pages/BoardPage';

export default function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            <Navbar onMenuToggle={() => setMobileSidebarOpen(p => !p)} />
            <Routes>
              <Route path="/" element={<HomePage mobileSidebarOpen={mobileSidebarOpen} onSidebarClose={() => setMobileSidebarOpen(false)} />} />
              <Route path="/board/:id" element={<BoardPage />} />
            </Routes>
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
