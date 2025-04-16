import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router, Routes, Route
} from 'react-router-dom';
import App from './App'
import './index.css';
import reportWebVitals from './reportWebVitals';
import Login from './components/login'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  </React.StrictMode>
);



reportWebVitals();
