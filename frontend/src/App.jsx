import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WatchlistPage from './pages/WatchlistPage';
import ProfilePage from './pages/ProfilePage';
import './i18n/i18n';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { WatchlistProvider } from './hooks/useWatchlist.jsx';

function PrivateRoute({ children }) {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AppFooter() {
    const { t } = useTranslation();
    return (
        <footer className="py-8 border-t border-border mt-12">
            <div className="container text-center text-sm text-muted">
                <p>{t('footer.copyright')}</p>
                <p className="mt-2">{t('footer.data_source')}</p>
            </div>
        </footer>
    );
}

function AppShell() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <ProfilePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/watchlist"
                        element={
                            <PrivateRoute>
                                <WatchlistPage />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </main>
            <AppFooter />
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <WatchlistProvider>
                        <AppShell />
                    </WatchlistProvider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
