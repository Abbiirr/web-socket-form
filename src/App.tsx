/**
 * Main App Component
 * Multi-page flow: Welcome → Registration
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FormProvider } from './contexts/FormContext';
import Welcome from './components/Welcome';
import RegisterForm from './components/RegisterForm';

const App: React.FC = () => {
  return (
    <Router>
      <FormProvider>
        <Routes>
          {/* Welcome page */}
          <Route path="/welcome" element={<Welcome />} />

          {/* Registration form */}
          <Route path="/register" element={<RegisterForm />} />

          {/* Redirect root to welcome */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />

          {/* Catch all - redirect to welcome */}
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </FormProvider>
    </Router>
  );
};

export default App;
