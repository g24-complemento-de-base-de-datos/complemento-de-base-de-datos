import { getAuth } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import { db } from './firebase/firebase';
import logo from "./logo.png";

function App() {
  const [hover, setHover] = useState(false);
  const [userName, setUserName] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      if (user){
        const data = await getUserName(auth.currentUser.uid)
        setUserName(data.nombre)
      }
    });

    return () => unsubscribe();
  }, []);

  const buttonStyle = {
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
                style={buttonStyle}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                Iniciar sesión
              </button>
            )}
          </Link>
          {isAuthenticated && 
            <h3 style={{color: "#fbb540"}}>Bienvenid@ {userName}</h3>
          }
        </header>
      </div>
    </div>
  );
}

export default App;
