import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import HistoryPage from './History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/History" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
