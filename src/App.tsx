/**
 * Main App Component
 * Simple routing for form submission
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FormProvider } from './contexts/FormContext';
import Form from './components/Form';

const App: React.FC = () => {
  return (
    <Router>
      <FormProvider>
        <Routes>
          {/* Main form route */}
          <Route path="/form" element={<Form />} />

          {/* Redirect root to form */}
          <Route path="/" element={<Navigate to="/form" replace />} />

          {/* Catch all - redirect to form */}
          <Route path="*" element={<Navigate to="/form" replace />} />
        </Routes>
      </FormProvider>
    </Router>
  );
};

export default App;
