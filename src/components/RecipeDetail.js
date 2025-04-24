import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import Navbar from './Navbar';

const RecipeDetail = ({ recipe: propRecipe }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const recipe = propRecipe || location.state?.recipe;

  const [creatorName, setCreatorName] = useState('');
  const [loadingCreator, setLoadingCreator] = useState(true);
  const [averageRating, setAverageRating] = useState(null);


  const styles = {
    outerContainer: {
      backgroundColor: '#282c34',
      display: 'flex',
      flexDirection: 'column'
    },
    container: {
      color: '#f1f1f1',
      padding: '2rem',
      maxWidth: '1000px',
      margin: '0 auto',
      width: '100%',
      flex: 1
    },
    backButton: {
      padding: '10px 20px',
      backgroundColor: '#fbb540',
      color: '#3c2f2f',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginBottom: '20px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#ea9d2d'
      }
    },
    saveButton: {
      padding: '10px 20px',
      backgroundColor: '#3aabbd',
      color: '#3c2f2f',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginBottom: '20px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#ea9d2d'
      }
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      color: '#fbb540',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    meta: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: '0.15rem',
      color: '#cccccc',
      fontSize:20
    },
    image: {
      width: '100%',
      maxHeight: '400px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginBottom: '1.5rem'
    },
    section: {
      marginBottom: '2rem',
      backgroundColor: '#3c3f4a',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    },
    sectionTitle: {
      color: '#fbb540',
      borderBottom: '1px solid #fbb540',
      paddingBottom: '0.5rem',
      marginBottom: '1rem'
    },
    ingredientList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    ingredientItem: {
      backgroundColor: '#4e525e',
      padding: '1rem',
      borderRadius: '5px'
    },
    stepItem: {
      display: 'flex',
      marginBottom: '1rem',
      alignItems: 'flex-start'
    },
    stepNumber: {
      backgroundColor: '#fbb540',
      color: '#3c2f2f',
      borderRadius: '50%',
      width: '25px',
      height: '25px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: '1rem',
      flexShrink: 0
    },
    tag: {
      display: 'inline-block',
      backgroundColor: '#fbb540',
      color: '#3c2f2f',
      padding: '0.3rem 0.6rem',
      borderRadius: '15px',
      marginRight: '0.5rem',
      marginBottom: '0.5rem'
    },
    creatorInfo: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '2rem',
      paddingTop: '1rem',
      borderTop: '1px solid #4e525e'
    },
    creatorImage: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      marginRight: '1rem',
      objectFit: 'cover'
    }
  };

  useEffect(() => {
    const fetchCreatorName = async () => {
      if (!recipe?.autorUid) {
        setLoadingCreator(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', recipe.autorUid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const fullName = `${userData.nombre || ''} ${userData.apellido || ''}`.trim();
          setCreatorName(fullName || 'Usuario desconocido');
        } else {
          setCreatorName('Usuario eliminado');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setCreatorName('Error al cargar usuario');
      } finally {
        setLoadingCreator(false);
      }
    };

    

    fetchCreatorName();
  }, [recipe?.autorUid]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!recipe?.id) return;
  
      try {
        const ratingsRef = collection(db, 'ratings');
        const q = query(ratingsRef, where('recipeId', '==', recipe.id));
        const querySnapshot = await getDocs(q);
        const ratings = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (typeof data.score === 'number') {
            ratings.push(data.score);
          }
        });
  
        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, val) => acc + val, 0);
          const avg = sum / ratings.length;
          setAverageRating(avg.toFixed(1));
        } else {
          setAverageRating('Sin valoraciones');
        }
      } catch (error) {
        console.error('Error al obtener valoraciones:', error);
        setAverageRating('Error al cargar');
      }
    };
  
    fetchRatings();
  }, [recipe?.id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar esta receta y todas sus valoraciones?");
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "recipes", recipe.id));
  
      const ratingsQuery = query(
        collection(db, "ratings"),
        where("recipeId", "==", recipe.id)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);
  
      const deletePromises = ratingsSnapshot.docs.map((docu) => deleteDoc(doc(db, "ratings", docu.id)));
      await Promise.all(deletePromises);
  
      alert("Receta y valoraciones eliminadas con éxito.");
      navigate("/recipes");
    } catch (error) {
      console.error("Error eliminando receta o valoraciones:", error);
      alert("Hubo un problema al eliminar la receta o sus valoraciones.");
    }
  };
  

  
  const handleBack = () => {
    navigate('/recipes');
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      alert('Debes iniciar sesión para guardar recetas');
      return;
    }
  
    if (!recipe) {
      alert('No se puede guardar esta receta: ID no disponible');
      return;
    }
  
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        alert('No se encontró tu perfil de usuario');
        return;
      }
      const currentSavedRecipes = userDoc.data().recetasGuardadas || [];
      
      if (currentSavedRecipes.includes(recipe)) {
        alert('Esta receta ya está guardada en tu perfil');
        return;
      }
  
      const updatedSavedRecipes = [...currentSavedRecipes, recipe];
      
      await updateDoc(userRef, {
        recetasGuardadas: updatedSavedRecipes
      });
  
      alert('Receta guardada con éxito en tu perfil');
    } catch (error) {
      console.error("Error al guardar la receta:", error);
      alert("Hubo un problema al guardar la receta. Por favor, inténtalo de nuevo.");
    }
  };

  if (!recipe) {
    return (
      <div style={styles.outerContainer}>
        <Navbar />
        <div style={styles.container}>
          <button onClick={handleBack} style={styles.backButton}>
            ← Volver a todas las recetas
          </button>
          <div style={{ textAlign: 'center' }}>Receta no encontrada</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.outerContainer}>
      <Navbar />
      <div style={styles.container}>
        <div style={{justifyContent:'space-around'}}>
          <button 
            onClick={handleBack} 
            style={styles.backButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#ea9d2d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#fbb540'}
          >
            ← Volver a todas las recetas
          </button>
          <button 
            onClick={handleSave} 
            style={styles.saveButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#ea9d2d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#fbb540'}
          >
            Guardar receta
          </button>
        </div>
        <div style={styles.header}>
          <h1 style={styles.title}>{recipe.name}</h1>
          <div style={styles.meta}>
            <span>⏱️ {recipe.duration} minutos</span>
            <span>⭐ {averageRating || 'Sin valoraciones'}</span>
          </div>
          {recipe.photoURL && (
            <img 
              src={recipe.photoURL} 
              alt={recipe.name} 
              style={styles.image}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=Imagen+no+disponible';
              }}
            />
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Descripción</h2>
          <p>{recipe.description}</p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Ingredientes</h2>
          <div style={styles.ingredientList}>
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} style={styles.ingredientItem}>
                <div><strong>{ingredient.name}</strong></div>
                <div>{ingredient.quantity}</div>
                {ingredient.type && <div><em>{ingredient.type}</em></div>}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Preparación</h2>
          {recipe.steps.map((step, index) => (
            <div key={index} style={styles.stepItem}>
              <div style={styles.stepNumber}>{index + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Etiquetas</h2>
            <div>
              {recipe.tags.map((tag, index) => (
                <span key={index} style={styles.tag}>#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {(recipe.autorUid || recipe.userName) && (
          <div style={styles.creatorInfo}>
            {recipe.userPhoto && (
              <img 
                src={recipe.userPhoto} 
                alt="Creador" 
                style={styles.creatorImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div>
              <div>Receta creada por:</div>
              <div>
                <strong>
                  {loadingCreator 
                    ? 'Cargando...' 
                    : creatorName || 'Anónimo'
                  }
                </strong>
              </div>
            </div>
          </div>
        )}
        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(`/recipes/${recipe.id}/ratings`, { state: { recipe } })}
            style={{
              ...styles.saveButton,
              backgroundColor: '#fbb540',
              fontSize: '1.2rem',
              padding: '1rem 2rem',
              minWidth: '250px',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#ea9d2d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#fbb540'}
          >
            Ver y dejar una valoración
          </button>
        </div>
        {auth.currentUser.uid === recipe.autorUid && (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleDelete}
            style={{
              ...styles.saveButton,
              backgroundColor: '#ff4d4d',
              color: 'white',
              fontSize: '1.1rem',
              padding: '0.8rem 1.5rem',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e60000'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ff4d4d'}
          >
            Eliminar receta
          </button>
        </div>
      )}

      </div>
    </div>
  );
};

RecipeDetail.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    duration: PropTypes.number,
    photoURL: PropTypes.string,
    steps: PropTypes.arrayOf(PropTypes.string),
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        quantity: PropTypes.string,
        type: PropTypes.string
      })
    ),
    tags: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number,
    autorUid: PropTypes.string,
    userName: PropTypes.string,
    userPhoto: PropTypes.string
  })
};

export default RecipeDetail;