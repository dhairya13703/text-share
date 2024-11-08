// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TextEditor from './components/TextEditor';

// Generate a random room ID
const generateRoomId = () => Math.random().toString(36).substr(2, 9);

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Navigate to={`/room/${generateRoomId()}`} replace />} 
        />
        <Route 
          path="/room/:roomId" 
          element={<TextEditor roomId={window.location.pathname.split('/').pop()} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;