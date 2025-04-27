import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import Navbar from "./Navbar";

const RecipeDetail = ({ recipe: propRecipe }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const recipe = propRecipe || location.state?.recipe;

  const [creatorName, setCreatorName] = useState("");
  const [loadingCreator, setLoadingCreator] = useState(true);
  const [averageRating, setAverageRating] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isRecipeSaved, setIsRecipeSaved] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${
      remainingMinutes > 0 ? `${remainingMinutes}min` : ""
    }`.trim();
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const styles = {
    outerContainer: {
      backgroundColor: "#282c34",
      display: "flex",
      flexDirection: "column",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    ratingContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    container: {
      color: "#f1f1f1",
      padding: "2rem",
      maxWidth: "1000px",
      margin: "0 auto",
      width: "100%",
      flex: 1,
    },
    buttonStyle: {
      padding: "0.6rem 1.2rem",
      fontSize: "1rem",
      fontWeight: "bold",
      fontFamily: "Courier New",
      backgroundColor: "#fbb540",
      color: "#3c2f2f",
      border: "none",
      borderRadius: "15px",
      cursor: "pointer",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
      transform: "translateY(0)",
    },
    backButton: {
      "&:hover": {
        backgroundColor: "#e6ac00",
      },
    },
    saveButton: {
      backgroundColor: "#4CAF50",
      color: "white",
      "&:hover": {
        backgroundColor: "#45a049",
      },
    },
    loginButton: {
      "&:hover": {
        backgroundColor: "#e6ac00",
      },
    },
    ratingButton: {
      "&:hover": {
        backgroundColor: "#e6ac00",
      },
    },
    deleteButton: {
      backgroundColor: "#d12a37",
      color: "white",
      "&:hover": {
        backgroundColor: "#961b20",
      },
    },
    hoveredButton: {
      transform: "translateY(-3px)",
      boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
      backgroundColor: "#ea9d2d",
    },
    hoveredDeleteButton: {
      transform: "translateY(-3px)",
      boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
      backgroundColor: "#a81f2a",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "2rem",
    },
    title: {
      color: "#fbb540",
      marginBottom: "1rem",
      textAlign: "center",
    },
    meta: {
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: "0.15rem",
      color: "#cccccc",
      fontSize: 20,
    },
    image: {
      width: "100%",
      maxHeight: "400px",
      objectFit: "cover",
      borderRadius: "8px",
      marginBottom: "1.5rem",
    },
    section: {
      marginBottom: "2rem",
      backgroundColor: "#3c3f4a",
      padding: "1.5rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    },
    sectionTitle: {
      color: "#fbb540",
      borderBottom: "1px solid #fbb540",
      paddingBottom: "0.5rem",
      marginBottom: "1rem",
    },
    ingredientList: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "1rem",
      marginBottom: "1rem",
    },
    ingredientItem: {
      backgroundColor: "#4e525e",
      padding: "1rem",
      borderRadius: "5px",
    },
    stepItem: {
      display: "flex",
      marginBottom: "1rem",
      alignItems: "flex-start",
    },
    stepNumber: {
      backgroundColor: "#fbb540",
      color: "#3c2f2f",
      borderRadius: "50%",
      width: "25px",
      height: "25px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginRight: "1rem",
      flexShrink: 0,
    },
    tag: {
      background: "#fbb540",
      color: "#3c2f2f",
      fontSize: "1.2rem",
      fontWeight: "bold",
      padding: "3px 8px",
      borderRadius: "12px",
    },
    creatorInfo: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "2rem",
      paddingTop: "1rem",
      borderTop: "1px solid #4e525e",
    },
    creatorImage: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      marginRight: "1rem",
      objectFit: "cover",
    },
    notificationStyle: {
      position: "fixed",
      top: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "green",
      color: "#f1f1f1",
      fontSize: "1.2rem",
      fontWeight: "bold",
      padding: "12px 24px",
      borderRadius: "15px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      zIndex: 1000,
      animation: "fadeInOut 3s ease-in-out",
    },
  };

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!auth.currentUser || !recipe) return;

      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const savedRecipes = userSnap.data().savedRecipes || [];
          const alreadySaved = savedRecipes.some(
            (savedRecipe) => savedRecipe.id === recipe.id
          );
          setIsRecipeSaved(alreadySaved);
        }
      } catch (error) {
        console.error("Error comprobando si la receta está guardada:", error);
      }
    };

    checkIfSaved();
  }, [currentUser, recipe]);

  useEffect(() => {
    const fetchCreatorName = async () => {
      if (!recipe?.autorUid) {
        setLoadingCreator(false);
        return;
      }

      try {
        const userRef = doc(db, "users", recipe.autorUid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const fullName = `${userData.name || ""} ${
            userData.surname || ""
          }`.trim();
          setCreatorName(fullName || "Usuario desconocido");
        } else {
          setCreatorName("Usuario eliminado");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setCreatorName("Error al cargar usuario");
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
        const ratingsRef = collection(db, "ratings");
        const q = query(ratingsRef, where("recipeId", "==", recipe.id));
        const querySnapshot = await getDocs(q);
        const ratings = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (typeof data.score === "number") {
            ratings.push(data.score);
          }
        });

        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, val) => acc + val, 0);
          const avg = sum / ratings.length;
          setAverageRating(avg.toFixed(1));
        } else {
          setAverageRating("Sin valoraciones");
        }
      } catch (error) {
        console.error("Error al obtener valoraciones:", error);
        setAverageRating("Error al cargar");
      }
    };

    fetchRatings();
  }, [recipe?.id]);

  const showSuccessNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);

    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 3000);

    return () => clearTimeout(timer);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar esta receta y todas sus valoraciones?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "recipes", recipe.id));

      const ratingsQuery = query(
        collection(db, "ratings"),
        where("recipeId", "==", recipe.id)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);

      const deletePromises = ratingsSnapshot.docs.map((docu) =>
        deleteDoc(doc(db, "ratings", docu.id))
      );
      await Promise.all(deletePromises);

      showSuccessNotification("Receta y valoraciones eliminadas con éxito");
      navigate("/recipes");
    } catch (error) {
      console.error("Error eliminando receta o valoraciones:", error);
      showSuccessNotification("Hubo un problema al eliminar la receta");
    }
  };

  const handleBack = () => {
    navigate("/recipes");
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      showSuccessNotification("Debes iniciar sesión para guardar recetas");
      navigate("/login");
      return;
    }

    if (!recipe) {
      showSuccessNotification(
        "No se puede guardar esta receta: ID no disponible"
      );
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        showSuccessNotification("No se encontró tu perfil de usuario");
        return;
      }

      const currentSavedRecipes = userDoc.data().savedRecipes || [];
      const isAlreadySaved = currentSavedRecipes.some(
        (savedRecipe) => savedRecipe.id === recipe.id
      );

      if (isAlreadySaved) {
        showSuccessNotification("Esta receta ya está guardada en tu perfil");
        return;
      }

      const updatedSavedRecipes = [...currentSavedRecipes, recipe];

      await updateDoc(userRef, {
        savedRecipes: updatedSavedRecipes,
      });

      setIsRecipeSaved(true);
      showSuccessNotification("Receta guardada con éxito en tu perfil");
    } catch (error) {
      console.error("Error al guardar la receta:", error);
      showSuccessNotification("Hubo un problema al guardar la receta");
    }
  };

  if (!recipe) {
    return (
      <div style={styles.outerContainer}>
        <Navbar />
        <div style={styles.container}>
          <button
            onClick={handleBack}
            style={{
              ...styles.buttonStyle,
              ...styles.backButton,
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
              e.target.style.backgroundColor = "#ea9d2d";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              e.target.style.backgroundColor = "#fbb540";
            }}
          >
            <svg
              width="18"
              height="18"
              fontSize="1.5rem"
              fontStyle="bold"
              viewBox="0 0 24 24"
              fill="auto"
              style={{ verticalAlign: "middle", marginRight: "8px" }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Volver a todas las recetas
          </button>
          <div style={{ textAlign: "center" }}>Receta no encontrada</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.outerContainer}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.buttonContainer}>
          <button
            onClick={handleBack}
            style={{ ...styles.buttonStyle, ...styles.backButton }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 6px 8px rgba(0,0,0,0.15)";
              e.target.style.backgroundColor = "#ea9d2d";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              e.target.style.backgroundColor = "#fbb540";
            }}
          >
            <svg
              width="18"
              height="18"
              fontSize="1.5rem"
              fontStyle="bold"
              viewBox="0 0 24 24"
              fill="auto"
              style={{ verticalAlign: "middle", marginRight: "8px" }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Volver a todas las recetas
          </button>

          {currentUser ? (
            <button
              onClick={handleSave}
              disabled={isRecipeSaved}
              style={{
                ...styles.buttonStyle,
                ...(isRecipeSaved
                  ? {
                      backgroundColor: "grey",
                      color: "#f1f1f1",
                      cursor: "not-allowed",
                    }
                  : styles.saveButton),
              }}
              onMouseEnter={(e) => {
                if (!isRecipeSaved) {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 6px 8px rgba(0,0,0,0.15)";
                  e.target.style.backgroundColor = "#006400";
                }
              }}
              onMouseLeave={(e) => {
                if (!isRecipeSaved) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                  e.target.style.backgroundColor = "green";
                }
              }}
            >
              {isRecipeSaved ? "Receta guardada" : "Guardar receta"}
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={{
                ...styles.buttonStyle,
                ...styles.loginButton,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 6px 8px rgba(0,0,0,0.15)";
                e.target.style.backgroundColor = "#ea9d2d";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                e.target.style.backgroundColor = "#fbb540";
              }}
            >
              Iniciar sesión para guardar
            </button>
          )}
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>{recipe.name}</h1>

          <div
            style={{
              ...styles.meta,
              ...styles.ratingContainer,
              marginBottom: "0.5rem",
            }}
          >
            <span>Duración: {formatDuration(recipe.duration)}</span>
            <span>
              {averageRating ? `⭐ ${averageRating}` : "Sin valoraciones"}
            </span>

            {currentUser && (
              <button
                onClick={() =>
                  navigate(`/recipes/${recipe.id}/ratings`, {
                    state: { recipe },
                  })
                }
                style={{
                  ...styles.buttonStyle,
                  ...styles.ratingButton,
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
                  e.target.style.backgroundColor = "#ea9d2d";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                  e.target.style.backgroundColor = "#fbb540";
                }}
              >
                Valoraciones
              </button>
            )}
          </div>

          {recipe.photoURL && (
            <img
              src={recipe.photoURL}
              alt={recipe.name}
              style={styles.image}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x400?text=Imagen+no+disponible";
              }}
            />
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Descripción</h2>
          <p style={{ lineHeight: "1.6" }}>{recipe.description}</p>
        </div>

        <div style={styles.section}>
          <h2 style={{ ...styles.sectionTitle }}>Ingredientes</h2>
          <div style={styles.ingredientList}>
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} style={styles.ingredientItem}>
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "4px",
                    color: "#fbb540",
                  }}
                >
                  {ingredient.name}
                </div>
                <div style={{ marginBottom: "4px" }}>{ingredient.quantity}</div>
                {ingredient.type && (
                  <div style={{ fontStyle: "italic", color: "#cccccc" }}>
                    {ingredient.type}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Preparación</h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {recipe.steps.map((step, index) => (
              <div key={index} style={styles.stepItem}>
                <div style={styles.stepNumber}>{index + 1}</div>
                <p style={{ margin: 0, lineHeight: "1.6" }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {recipe.tags?.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Etiquetas</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {recipe.tags.map((tag, index) => (
                <span key={index} style={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {(recipe.autorUid || recipe.surname) && (
          <div style={styles.creatorInfo}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {recipe.userPhoto && (
                <img
                  src={recipe.userPhoto}
                  alt="Creador"
                  style={styles.creatorImage}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div>
                <div style={{ color: "#aaaaaa", fontSize: "0.9rem" }}>
                  Receta creada por:
                </div>
                <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  {loadingCreator ? "Cargando..." : creatorName || "Anónimo"}
                </div>
              </div>
            </div>

            {currentUser?.uid === recipe?.autorUid && (
              <button
                onClick={handleDelete}
                style={{
                  ...styles.buttonStyle,
                  ...styles.deleteButton,
                  padding: "0.6rem 1.2rem",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
                  e.target.style.backgroundColor = "#961b20";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                  e.target.style.backgroundColor = "#d12a37";
                }}
              >
                Eliminar receta
              </button>
            )}
          </div>
        )}
      </div>
      {showNotification && (
        <div style={styles.notificationStyle}>{notificationMessage}</div>
      )}
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
        type: PropTypes.string,
      })
    ),
    tags: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number,
    autorUid: PropTypes.string,
    userName: PropTypes.string,
    userPhoto: PropTypes.string,
  }),
};

export default RecipeDetail;
