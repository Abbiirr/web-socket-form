/**
 * Main App Component
 * Multi-room Chat Application
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatApp from './components/ChatApp';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Chat application */}
        <Route path="/chat" element={<ChatApp />} />

        {/* Redirect root to chat */}
        <Route path="/" element={<Navigate to="/chat" replace />} />

        {/* Catch all - redirect to chat */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
