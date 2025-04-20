import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import IdVerification from './pages/verification/IdVerification';
import SelfieCapture from './pages/verification/SelfieCapture';
import VerificationProcessing from './pages/verification/VerificationProcessing';
import VerificationConfirmation from './pages/verification/VerificationConfirmation';

// Import global styles
import './styles/global.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/id" element={<Home />} />
            <Route path="/verify/id" element={<IdVerification />} />
            <Route path="/verify/selfie" element={<SelfieCapture />} />
            <Route path="/verify/processing" element={<VerificationProcessing />} />
            <Route path="/verify/confirmation" element={<VerificationConfirmation />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
