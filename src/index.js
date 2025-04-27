import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Navigate,
  Route,
  BrowserRouter as Router, Routes
} from 'react-router-dom';
import App from './App';
import Login from './components/Login';
import Profile from './components/Profile';
import RecipeCreator from './components/RecipeCreator';
import Recipes from './components/Recipes';
import './index.css';
import reportWebVitals from './reportWebVitals';
import RecipeDetail from './components/RecipeDetail';
import RecipeRatings from './components/RecipeRatings';
import AboutUs from './components/AboutUs';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/new_recipe" element={<RecipeCreator/>} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/recipes/*" element={<Navigate to="/recipes" replace />} />
        <Route path="/recipes/:recipeId/ratings" element={<RecipeRatings />} />
        <Route path="/about_us" element={<AboutUs />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
