import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Navbar from './Navbar';
import StarRating from './StarRating';

const RecipeRatings = () => {
  const location = useLocation();
  const { recipeId } = useParams();
  const recipe = location.state?.recipe;

  const [ratings, setRatings] = useState([]);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    const q = query(collection(db, 'ratings'), where('recipeId', '==', recipeId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRatings(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, 'ratings'), {
      recipeId,
      message,
      score,
      createdAt: Timestamp.now()
    });

    setMessage('');
    setScore(5);
    fetchRatings();
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  return (
    <div style={{ backgroundColor: '#282c34', color: 'white' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#fbb540' }}>Valoraciones para {recipe?.name}</h1>

        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <h2>Deja tu valoración</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label>Puntuación:</label>
            <input
              type="number"
              min="1"
              max="5"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              style={{ marginLeft: '1rem', width: '50px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Comentario:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{ width: '100%', height: '100px', padding: '0.5rem' }}
            />
          </div>
          <button type="submit" style={{ backgroundColor: '#3aabbd', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Enviar valoración
          </button>
        </form>

        <div>
          <h2>Valoraciones existentes</h2>
          {loading ? (
            <p>Cargando valoraciones...</p>
          ) : ratings.length === 0 ? (
            <p>No hay valoraciones aún.</p>
          ) : (
            ratings.map((r, i) => (
              <div key={i} style={{ marginBottom: '1rem', backgroundColor: '#3c3f4a', padding: '1rem', borderRadius: '5px' }}>
                <StarRating rating={r.score} />
                <p>{r.message}</p>
                <small>{r.createdAt?.toDate().toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeRatings;
