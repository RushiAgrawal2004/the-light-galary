import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import HomePage from './pages/HomePage.tsx';
import DiscoverPage from './pages/DiscoverPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import SignInPage from './pages/SignInPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import EditProfilePage from './pages/CreateProfilePage.tsx'; // Component is renamed internally
import ProtectedRoute from './components/ProtectedRoute.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import GigsPage from './pages/GigsPage.tsx';
import GigDetailPage from './pages/GigDetailPage.tsx';
import CreateGigPage from './pages/CreateGigPage.tsx';
import MyAgreementsPage from './pages/MyAgreementsPage.tsx';
import AgreementPage from './pages/AgreementPage.tsx';
import PortfolioShieldPage from './pages/PortfolioShieldPage.tsx';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="bg-brand-background text-brand-text font-sans flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/opportunities" element={<GigsPage />} />
              <Route path="/opportunities/:id" element={<GigDetailPage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route 
                path="/edit-profile" 
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                } 
              />
               <Route 
                path="/post-opportunity" 
                element={
                  <ProtectedRoute>
                    <CreateGigPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-agreements" 
                element={
                  <ProtectedRoute>
                    <MyAgreementsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/agreement/:id" 
                element={
                  <ProtectedRoute>
                    <AgreementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/portfolio-shield" 
                element={
                  <ProtectedRoute>
                    <PortfolioShieldPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
