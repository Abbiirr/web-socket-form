/**
 * Main App Component
 * Multi-page flow: Welcome → Registration → Loading → Success/Fail/MFA
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FormProvider } from './contexts/FormContext';
import Welcome from './components/Welcome';
import RegisterForm from './components/RegisterForm';
import Loading from './components/Loading';
import Success from './components/Success';
import Fail from './components/Fail';
import MFA from './components/MFA';

const App: React.FC = () => {
  return (
    <Router>
      <FormProvider>
        <Routes>
          {/* Welcome page */}
          <Route path="/welcome" element={<Welcome />} />

          {/* Registration form */}
          <Route path="/register" element={<RegisterForm />} />

          {/* Direct form access with token (e.g., /form?token=xxx) */}
          <Route path="/form" element={<RegisterForm />} />

          {/* Loading page */}
          <Route path="/loading" element={<Loading />} />

          {/* Success page */}
          <Route path="/success" element={<Success />} />

          {/* Fail page */}
          <Route path="/fail" element={<Fail />} />

          {/* MFA page */}
          <Route path="/mfa" element={<MFA />} />

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
