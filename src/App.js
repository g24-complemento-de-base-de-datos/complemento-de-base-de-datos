import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import { db } from "./firebase/firebase";
import logo from "./logo.png";

function App() {
  const [hover, setHover] = useState(false);
  const [userName, setUserName] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const location = useLocation();

  const getUserName = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.warn("El perfil del usuario no existe en la base de datos.");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el perfil del usuario:", error);
      return null;
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsAuthenticated(user);
      if (user) {
        const data = await getUserName(auth.currentUser.uid);
        setUserName(data.name);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (location.state?.showLoginSuccess) {
      setShowNotification(true);
      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const styles = {
    containerStyle: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "50px",
    },
    buttonStyle: {
      padding: "0.6rem 1.2rem",
      fontSize: "1.5rem",
      fontWeight: "bold",
      fontFamily: "Courier New",
      backgroundColor: hover ? "#ea9d2d" : "#fbb540",
      color: "#3c2f2f",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      marginTop: "1rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transform: hover ? "translateY(-3px)" : "translateY(0)",
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

  return (
    <div>
      <Navbar />
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Recetas de cocina</h1>
          <Link to="/login">
            {!isAuthenticated && (
              <button
                style={styles.buttonStyle}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                Iniciar sesión
              </button>
            )}
          </Link>
          {isAuthenticated && (
            <h3 style={{ color: "#fbb540" }}>Bienvenid@ {userName}</h3>
          )}
        </header>
      </div>
      {showNotification && (
        <div className="App" style={styles.containerStyle}>
          <div style={styles.notificationStyle}>¡Inicio de sesión exitoso!</div>
        </div>
      )}
    </div>
  );
}

export default App;
