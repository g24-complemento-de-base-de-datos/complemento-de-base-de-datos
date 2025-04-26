import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase/firebase";
import Navbar from "./Navbar";
import RecipeSummary from "./RecipeSummary";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("all");
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const location = useLocation();
  const [showNotification, setShowNotification] = useState(false);
  const [buttonHovers, setButtonHovers] = useState({
    all: false,
    mine: false,
    saved: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [maxDuration, setMaxDuration] = useState("");

  const styles = {
    containerStyle: {
      backgroundColor: "#282c34",
      color: "#f1f1f1",
      padding: "2rem",
    },
    containerNotification: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "50px",
    },
    listStyles: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "20px",
      maxWidth: "1400px",
      margin: "0 auto",
    },
    buttonsContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      marginBottom: "1rem",
      flexWrap: "wrap",
    },
    buttonStyle: (isActive, hover) => ({
      padding: "0.6rem 1.2rem",
      fontSize: "1.1rem",
      fontWeight: "bold",
      fontFamily: "Courier New",
      backgroundColor: isActive
        ? hover
          ? "#ea9d2d"
          : "#fbb540"
        : hover
        ? "#666"
        : "#444",
      color: isActive ? "#3c2f2f" : "#f1f1f1",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transform: hover ? "translateY(-3px)" : "translateY(0)",
    }),
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
    searchContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "10px",
      marginBottom: "2rem",
      flexWrap: "wrap",
    },
    searchInput: {
      padding: "0.6rem",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "#4e525e",
      color: "#f1f1f1",
      minWidth: "250px",
    },
    durationInput: {
      padding: "0.6rem",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "#4e525e",
      color: "#f1f1f1",
      width: "250px",
    },
    counterText: {
      textAlign: "center",
      marginTop: "2rem",
      marginBottom: "2rem",
      color: "#f1f1f1",
    },
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserUid(user.uid);
      } else {
        setCurrentUserUid(null);
        setViewMode("all");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "recipes"));
        const recipesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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

  useEffect(() => {
    if (location.state?.showRecipeCreationSuccess) {
      setShowNotification(true);
      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const filterRecipes = () => {
    let filteredRecipes = [];

    const effectiveViewMode = currentUserUid ? viewMode : "all";

    switch (effectiveViewMode) {
      case "mine":
        filteredRecipes = recipes.filter(
          (recipe) => recipe.autorUid === currentUserUid
        );
        break;
      case "saved":
        const savedRecipeIds =
          user.savedRecipes?.map((receta) => receta.id) || [];
        filteredRecipes = recipes.filter((recipe) =>
          savedRecipeIds.includes(recipe.id)
        );
        break;
      default:
        filteredRecipes = recipes;
    }

    if (searchTerm) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (maxDuration) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.duration <= parseInt(maxDuration)
      );
    }

    return filteredRecipes;
  };

  const filteredRecipes = filterRecipes();

  const handleButtonHover = (button, isHovering) => {
    setButtonHovers((prev) => ({
      ...prev,
      [button]: isHovering,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <Navbar />
      <div style={styles.containerStyle}>
        <div style={styles.buttonsContainer}>
          <button
            style={styles.buttonStyle(viewMode === "all", buttonHovers.all)}
            onClick={() => setViewMode("all")}
            onMouseEnter={() => handleButtonHover("all", true)}
            onMouseLeave={() => handleButtonHover("all", false)}
          >
            Todas las recetas
          </button>

          {currentUserUid && (
            <>
              <button
                style={styles.buttonStyle(
                  viewMode === "mine",
                  buttonHovers.mine
                )}
                onClick={() => setViewMode("mine")}
                onMouseEnter={() => handleButtonHover("mine", true)}
                onMouseLeave={() => handleButtonHover("mine", false)}
              >
                Mis recetas
              </button>

              <button
                style={styles.buttonStyle(
                  viewMode === "saved",
                  buttonHovers.saved
                )}
                onClick={() => setViewMode("saved")}
                onMouseEnter={() => handleButtonHover("saved", true)}
                onMouseLeave={() => handleButtonHover("saved", false)}
              >
                Recetas guardadas
              </button>
            </>
          )}
        </div>

        <div style={styles.counterText}>
          Mostrando {filteredRecipes.length} receta
          {filteredRecipes.length !== 1 ? "s" : ""}
        </div>

        <form onSubmit={handleSearch} style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <input
            type="text"
            placeholder="Duración máxima en minutos"
            value={maxDuration}
            onChange={(e) => setMaxDuration(e.target.value)}
            style={styles.durationInput}
          />
        </form>

        {loading ? (
          <div>Cargando recetas...</div>
        ) : (
          <div style={styles.listStyles}>
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <RecipeSummary
                  key={recipe.id}
                  recipe={recipe}
                  isAuthenticated={currentUserUid}
                  currentUserUid={currentUserUid}
                />
              ))
            ) : (
              <div style={{ marginTop: "2rem", fontSize: "1.5rem", fontStyle: "bold", color: "#f1f1f1" }}>
                No se encontraron recetas
              </div>
            )}
          </div>
        )}
      </div>
      {showNotification && (
        <div className="App" style={styles.containerNotification}>
          <div style={styles.notificationStyle}>
            ¡Receta creada correctamente!
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;
