// components/StarRating.jsx
import React from 'react';
import PropTypes from 'prop-types';

const StarRating = ({ rating, max = 5 }) => {
  const filledStars = Math.round(rating); // Puedes usar Math.floor si prefieres ser más estricto

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[...Array(max)].map((_, index) => (
        <span key={index} style={{ fontSize: '1.2rem', color: '#fbb540' }}>
          {index < filledStars ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  max: PropTypes.number
};

export default StarRating;
