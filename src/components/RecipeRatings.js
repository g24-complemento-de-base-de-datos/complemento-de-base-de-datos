import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import Navbar from "./Navbar";

const StarRating = ({ rating, editable, onRatingChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: "flex", gap: "5px" }}>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <span
            key={index}
            style={{
              cursor: editable ? "pointer" : "default",
              color: ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9",
              fontSize: "1.5rem",
            }}
            onMouseEnter={() => editable && setHover(ratingValue)}
            onMouseLeave={() => editable && setHover(0)}
            onClick={() => editable && onRatingChange(ratingValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

const RecipeRatings = () => {
  const location = useLocation();
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const recipe = location.state?.recipe;
  const [currentUser, setCurrentUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(5);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const styles = {
    outerContainer: {
      backgroundColor: "#282c34",
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
    },
    container: {
      color: "#f1f1f1",
      padding: "2rem",
      maxWidth: "1000px",
      margin: "0 auto",
      width: "100%",
      flex: 1,
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-start",
      marginBottom: "20px",
    },
    title: {
      color: "#fbb540",
      marginBottom: "2rem",
      textAlign: "center",
    },
    formGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "bold",
    },
    input: {
      width: "98%",
      padding: "0.6rem",
      borderRadius: "5px",
      border: "none",
      backgroundColor: "#4e525e",
      color: "#f1f1f1",
      marginTop: "0.3rem",
      marginBottom: "0.3rem",
    },
    textarea: {
      width: "98%",
      padding: "0.6rem",
      borderRadius: "5px",
      border: "none",
      backgroundColor: "#4e525e",
      color: "#f1f1f1",
      minHeight: "100px",
      resize: "vertical",
      fontSize: "1rem",
    },
    buttonStyle: {
      padding: "0.6rem 1.2rem",
      fontSize: "1rem",
      fontWeight: "bold",
      fontFamily: "Courier New",
      backgroundColor: "#fbb540",
      color: "#3c2f2f",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
    },
    backButton: {
      display: "flex",
      alignItems: "center",
    },
    ratingCard: {
      marginBottom: "1.5rem",
      backgroundColor: "#4e525e",
      padding: "1.5rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    },
    ratingDate: {
      color: "#aaaaaa",
      fontSize: "0.8rem",
      marginTop: "0.5rem",
    },
    disabledForm: {
      opacity: 0.6,
      pointerEvents: "none",
    },
    ownerMessage: {
      backgroundColor: "#fbb540",
      color: "#3c2f2f",
      padding: "0.6rem",
      borderRadius: "15px",
      marginBottom: "4rem",
      fontWeight: "bold",
      textAlign: "center",
      width: "60%",
      margin: "0 auto",
      fontSize: "1.4rem",
      fontFamily: "Courier New",
    },
    userName: {
      fontWeight: "bold",
      marginBottom: "0.5rem",
      color: "#fbb540",
    },
    notificationStyle: {
      position: "fixed",
      top: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "green",
      color: "#f1f1f1",
      fontSize: "1.5rem",
      fontWeight: "bold",
      padding: "15px 15px",
      borderRadius: "15px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      zIndex: 1000,
    },
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user && recipe) {
        setIsOwner(user.uid === recipe.autorUid);
      }
    });
    return unsubscribe;
  }, [recipe]);

  const handleBackToRecipe = () => {
    navigate(`/recipes/${recipeId}`, { state: { recipe } });
  };

  const fetchUserData = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return (
          `${userData.name || ""} ${userData.surname || ""}`.trim() ||
          "Usuario anónimo"
        );
      }
      return "Usuario eliminado";
    } catch (error) {
      console.error("Error fetching user data:", error);
      return "Error al cargar usuario";
    }
  };

  const fetchRatings = async () => {
    const q = query(
      collection(db, "ratings"),
      where("recipeId", "==", recipeId)
    );
    const snapshot = await getDocs(q);

    const ratingsData = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userName = await fetchUserData(data.userId);
        return {
          id: doc.id,
          ...data,
          userName,
          date: data.createdAt?.toDate(),
        };
      })
    );

    setRatings(ratingsData.sort((a, b) => b.date - a.date));
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "ratings"), {
        recipeId,
        message,
        score,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
      });

      setMessage("");
      setScore(5);
      fetchRatings();

      // Mostrar notificación de éxito
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error al enviar valoración:", error);
      alert(
        "Hubo un error al enviar tu valoración. Por favor, intenta nuevamente."
      );
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  return (
    <div style={styles.outerContainer}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.buttonContainer}>
          <button
            onClick={handleBackToRecipe}
            style={{
              ...styles.buttonStyle,
              ...styles.backButton,
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
            Volver a la receta
          </button>
        </div>

        <div>
          <h1 style={{ ...styles.title, marginTop: "3.5rem" }}>
            Valoraciones para {recipe?.name}
          </h1>

          {isOwner && (
            <div style={styles.ownerMessage}>
              No puedes valorar tu propia receta
            </div>
          )}

          {!isOwner && (
            <form onSubmit={handleSubmit} style={styles.formGroup}>
              <h2 style={{ color: "#fbb540", marginBottom: "1rem" }}>
                Deja tu valoración
              </h2>
              <div style={styles.formGroup}>
                <label style={styles.label}>Puntuación:</label>
                <StarRating
                  rating={score}
                  editable={true}
                  onRatingChange={setScore}
                />
              </div>
              <div style={{ ...styles.formGroup, marginBottom: "0.5rem" }}>
                <label style={styles.label}>Comentario:</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={styles.textarea}
                  placeholder="Escribe tu comentario sobre la receta..."
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  style={styles.buttonStyle}
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
                  Enviar valoración
                </button>
              </div>
            </form>
          )}

          <div style={styles.formGroup}>
            <h2 style={{ color: "#fbb540", marginBottom: "1rem" }}>
              Valoraciones
            </h2>
            {loading ? (
              <p>Cargando valoraciones...</p>
            ) : ratings.length === 0 ? (
              <p>No hay valoraciones aún</p>
            ) : (
              ratings.map((rating, index) => (
                <div key={index} style={styles.ratingCard}>
                  <p style={styles.userName}>{rating.userName}</p>
                  <StarRating rating={rating.score} editable={false} />
                  <p style={{ margin: "1rem 0" }}>{rating.message}</p>
                  <small style={styles.ratingDate}>
                    {rating.date?.toLocaleDateString()} -{" "}
                    {rating.date?.toLocaleTimeString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showNotification && (
        <div style={styles.notificationStyle}>
          ¡Valoración enviada correctamente!
        </div>
      )}
    </div>
  );
};

export default RecipeRatings;
