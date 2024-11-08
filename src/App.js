// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TextEditor from './components/TextEditor';
import WelcomePage from './components/WelcomePage';

// Generate a random URL-friendly string
const generateRandomUrl = () => {
  return Math.random().toString(36).substring(2, 8);
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/:id" element={<TextEditor />} />
        <Route path="/new" element={<Navigate to={`/${generateRandomUrl()}`} replace />} />
      </Routes>
    </Router>
  );
}
export default App;