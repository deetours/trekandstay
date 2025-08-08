import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/sections/Footer';
import { Suspense, lazy } from 'react';
import { FullPageLoader } from './components/common/FullPageLoader';

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const DestinationsPage = lazy(() => import('./pages/DestinationsPage').then(m => ({ default: m.DestinationsPage })));
const TripDetailsPage = lazy(() => import('./pages/TripDetailsPage').then(m => ({ default: m.TripDetailsPage })));
const PaymentPage = lazy(() => import('./pages/PaymentPage').then(m => ({ default: m.PaymentPage })));
const BookingsPage = lazy(() => import('./pages/BookingsPage').then(m => ({ default: m.BookingsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const CreateStoryPage = lazy(() => import('./pages/CreateStoryPage').then(m => ({ default: m.CreateStoryPage })));
const StoriesPage = lazy(() => import('./pages/StoriesPage').then(m => ({ default: m.StoriesPage })));
const StoryDetailPage = lazy(() => import('./pages/StoryDetailPage').then(m => ({ default: m.StoryDetailPage })));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-[#0B0F10]">
        <Header />
        <main>
          <Suspense fallback={<FullPageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/trip/:id" element={<TripDetailsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/stories/new" element={<CreateStoryPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/stories/:id" element={<StoryDetailPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;