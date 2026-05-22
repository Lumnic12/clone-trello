import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Common/Navbar';
import ErrorBoundary from './components/Common/ErrorBoundary';
import HomePage from './pages/HomePage';
import BoardPage from './pages/BoardPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/board/:id" element={<BoardPage />} />
            </Routes>
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
