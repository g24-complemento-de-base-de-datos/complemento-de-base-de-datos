import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase/firebase';
import Navbar from './Navbar';
import RecipeSummary from './RecipeSummary';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [showSavedOnly, setShowSavedOnly]= useState(false);
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const location = useLocation();

  const containerStyle = {
    backgroundColor: '#282c34',
    color: '#ffffff',
    padding: '2rem'
  };

  const listStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const checkboxContainer = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '2rem',
  };

  const checkboxLabel = {
    color: '#fbb540',
    fontSize: '1.1rem',
    marginLeft: '0.5rem',
    cursor: 'pointer',
  };

  const checkboxInput = {
    width: '18px',
    height: '18px',
    accentColor: '#fbb540',
    cursor: 'pointer',
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setCurrentUserUid(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'recipes'));
        const recipesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipes(recipesData);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [location.key]);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (!currentUserUid) return;
      
      setLoading(true);
      try {
        const userRef = doc(db, "users", currentUserUid);
        const docSnap = await getDoc(userRef);
  
        if (docSnap.exists()) {
          setUser(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedRecipes();
  }, [currentUserUid, location.key]);
  
  let filteredRecipes = [];
  
  if (showMineOnly) {
    filteredRecipes = recipes.filter(recipe => recipe.autorUid === currentUserUid);
  } else if (showSavedOnly) {
    const savedRecipeIds = user.recetasGuardadas?.map(receta => receta.id) || [];
    filteredRecipes = recipes.filter(recipe => savedRecipeIds.includes(recipe.id));
  } else {
    filteredRecipes = recipes;
  }

  return (
    <>
      <Navbar />

      <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#fbb540' }}>
        {showMineOnly ? 'Mis Recetas' : 'Todas las Recetas'}{' '}
        <span style={{ fontSize: '1rem', color: '#ccc' }}>
          ({filteredRecipes.length} receta{filteredRecipes.length !== 1 ? 's' : ''})
        </span>
      </h1>

        <div style={{display: "flex", justifyContent: "center"}}>
        <div style={checkboxContainer}>
          <input
            type="checkbox"
            id="mineOnly"
            checked={showMineOnly}
            onChange={() => setShowMineOnly(prev => !prev)}
            style={checkboxInput}
          />
          <label htmlFor="mineOnly" style={checkboxLabel}>
            Mostrar solo mis recetas
          </label>
        </div>
        <div style={{checkboxContainer, paddingLeft: "1rem"}}>
          <input
            type="checkbox"
            id="savedOnly"
            checked={showSavedOnly}
            onChange={() => setShowSavedOnly(prev => !prev)}
            style={checkboxInput}
          />
          <label htmlFor="savedOnly" style={checkboxLabel}>
            Mostrar las recetas guardadas
          </label>
        </div>
        </div>

        {loading ? (
          <div>Cargando recetas...</div>
        ) : (
          <div style={listStyles}>
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map(recipe => (
                <RecipeSummary key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div style={{ color: '#ccc', marginTop: '2rem' }}>
                No se encontraron recetas.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Recipes;
