// Unified admin portal (tabs)
import { AdminPortal } from './pages/admin/AdminPortal';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import './index.css';
import { Header } from './components/layout/Header';
import { Footer } from './components/sections/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './components/dashboard/Dashboard';
import { ChatWidget } from './components/chat';
import { LeadCaptureModal } from './components/modals/LeadCaptureModal';
import { usePopupTriggers } from './hooks/usePopupTriggers';
import { useAdventureStore } from './store/adventureStore';
import { CartProvider } from './components/shop/CartContext';
import { ProductsProvider } from './components/shop/ProductsContext';
import { initializeAnalytics } from './utils/analyticsInit';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DebugPage } from './components/DebugPage';
import { useAuthInitializer } from './hooks/useAuthInitializer';
// import './utils/firebaseConnectionTest'; // Import Firebase connection test for debugging
// import './utils/firebaseMinimalTest'; // Import minimal Firebase test
import ShopPage from './pages/ShopPage';
import CartPage from './components/shop/CartPage';
import RequestProductPage from './pages/RequestProductPage';
// import WishlistPage from './components/shop/WishlistPage';

const HomePage = lazy(() => import('./pages/HomePage'));
const DestinationsPage = lazy(() => import('./pages/DestinationsPage'));
const TripDetailsPage = lazy(() => import('./pages/TripDetailsPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage').then(module => ({ default: module.PaymentPage }))); 
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DevAdminPage = lazy(() => import('./pages/DevAdminPage'));
const CreateStoryPage = lazy(() => import('./pages/CreateStoryPage'));
const StoriesPage = lazy(() => import('./pages/StoriesPage'));
const StoryDetailPage = lazy(() => import('./pages/StoryDetailPage'));
const StaysPage = lazy(() => import('./pages/StaysPage'));
const StayDetailPage = lazy(() => import('./pages/StayDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EnhancedDashboardPage = lazy(() => import('./pages/EnhancedDashboardPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const SafetyPage = lazy(() => import('./pages/SafetyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
// Admin pages (lazy)
// Individual admin pages are now accessed through AdminPortal tabs; keep itinerary page if needed standalone
const AdminItineraryPage = lazy(() => import('./pages/admin/AdminItineraryPage'));

function App() {
  const { theme } = useAdventureStore();
  
  // Initialize authentication state listener
  useAuthInitializer();
  
  // Initialize popup triggers
  usePopupTriggers();
  
  // Initialize analytics components on app start
  useEffect(() => {
    initializeAnalytics();
  }, []);
  
  return (
    <ErrorBoundary>
      <Router>
        <CartProvider>
        <ProductsProvider>
    <div className={`min-h-screen transition-colors ${theme === 'dark' ? 'dark' : ''}`} style={{ background:'var(--bg)', color:'var(--text)'}}>
            <Header />
            {/* <ThreeRoot /> */}
            <main>
              <Suspense fallback={
                <div style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  minHeight: '50vh',
                  fontSize: '1.2rem',
                  color: '#666'
                }}>
                  Loading...
                </div>
              }>
                <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/debug" element={<DebugPage />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                {/* Category specific routes reuse DestinationsPage */}
                <Route path="/waterfalls" element={<DestinationsPage />} />
                <Route path="/forts" element={<DestinationsPage />} />
                <Route path="/beaches" element={<DestinationsPage />} />
                <Route path="/hills" element={<DestinationsPage />} />
                <Route path="/trip/:id" element={<TripDetailsPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/admin/dev" element={<DevAdminPage />} />
                <Route path="/stories/new" element={<CreateStoryPage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/stories/:id" element={<StoryDetailPage />} />
                <Route path="/stays" element={<StaysPage />} />
                <Route path="/stays/:id" element={<StayDetailPage />} />
                {/* Category specific routes for stays */}
                <Route path="/hotels" element={<StaysPage />} />
                <Route path="/homestays" element={<StaysPage />} />
                <Route path="/resorts" element={<StaysPage />} />
                <Route path="/villas" element={<StaysPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/ai" element={<ProtectedRoute><EnhancedDashboardPage /></ProtectedRoute>} />
                <Route path="/dashboard/basic" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/safety" element={<SafetyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                {/* Shop routes */}
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/request-product" element={<RequestProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                {/* Admin Portal (protected) */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPortal /></ProtectedRoute>} />
                <Route path="/admin/portal" element={<ProtectedRoute adminOnly><AdminPortal /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/trips" element={<ProtectedRoute adminOnly><Navigate to="/admin?tab=trips" replace /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute adminOnly><Navigate to="/admin?tab=products" replace /></ProtectedRoute>} />
                <Route path="/admin/stories" element={<ProtectedRoute adminOnly><Navigate to="/admin?tab=stories" replace /></ProtectedRoute>} />
                <Route path="/admin/leads" element={<ProtectedRoute adminOnly><Navigate to="/admin?tab=leads" replace /></ProtectedRoute>} />
                <Route path="/admin/itinerary" element={<ProtectedRoute adminOnly><Navigate to="/admin?tab=itinerary" replace /></ProtectedRoute>} />
                <Route path="/admin/trips/:id/itinerary" element={<ProtectedRoute adminOnly><AdminItineraryPage /></ProtectedRoute>} />
                {/* <Route path="/wishlist" element={<WishlistPage />} /> */}
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <ChatWidget />
          <LeadCaptureModal />
        </div>
      </ProductsProvider>
      </CartProvider>
    </Router>
    </ErrorBoundary>
  );
}

export default App;