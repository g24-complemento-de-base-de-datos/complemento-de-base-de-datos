import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./../logo.png";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const [confirmHover, setConfirmHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate("/");
        setShowLogoutModal(false);
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleMouseEnter = (index) => {
    setHoveredItem(index);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const styles = {
    navbar: {
      backgroundColor: "#fbb540",
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.5rem 0rem",
      boxShadow: "0 5px 15px rgba(251, 181, 64, 0.5)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    },
    leftSection: {
      marginLeft: "1%",
      display: "flex",
      alignItems: "center",
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      color: "#3c2f2f",
    },
    logo: {
      height: "50px",
      marginRight: "0.5rem",
    },
    appName: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginLeft: "1rem",
    },
    rightSection: {
      marginRight: "2%",
      display: "flex",
      alignItems: "center",
      gap: "1.5rem",
    },
    navItem: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      color: "#3c2f2f",
      cursor: "pointer",
      textDecoration: "none",
    },
    navItemHover: {
      color: "#f1f1f1",
    },
    dropdownContainer: {
      position: "relative",
    },
    dropdown: {
      position: "absolute",
      top: "2.5rem",
      right: "-0.5rem",
      backgroundColor: "#fff",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      borderRadius: "10px",
      overflow: "hidden",
      zIndex: 1000,
      minWidth: "200 px",
    },
    dropdownItem: {
      display: "block",
      fontWeight: "bold",
      padding: "0.65rem 0.75rem",
      color: "#3c2f2f",
      backgroundColor: "#fbb540",
      textDecoration: "none",
      fontSize: "0.95rem",
      whiteSpace: "nowrap",
      transition: "background-color 0.3s ease",
    },
    dropdownItemHover: {
      color: "#f1f1f1",
    },
    buttonStyle: {
      padding: "0.6rem 1.2rem",
      fontSize: "1.25rem",
      fontWeight: "bold",
      fontFamily: "Courier New",
      backgroundColor: confirmHover ? "#ea9d2d" : "#fbb540",
      color: "#3c2f2f",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transform: confirmHover ? "translateY(-3px)" : "translateY(0)",
      display: "block",
    },
    cancelButton: {
      backgroundColor: cancelHover ? "#961b20" : "#d12a37",
      transform: cancelHover ? "translateY(-3px)" : "translateY(0)",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      color: "white",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
    },
    modal: {
      backgroundColor: "#f1f1f1",
      borderRadius: "30px",
      padding: "0.5rem 0.5rem 2rem 0.5rem",
      maxWidth: "400px",
      width: "90%",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
      textAlign: "center",
    },
    modalTitle: {
      color: "#3c2f2f",
      fontSize: "1.75rem",
    },
    modalText: {
      color: "#3c2f2f",
      marginBottom: "2rem",
      fontSize: "1.2rem",
    },
    modalButtons: {
      display: "flex",
      justifyContent: "center",
      gap: "1rem",
    },
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.leftSection}>
          <Link to="/" style={styles.logoContainer}>
            <img
              src={logo}
              className="App-logo-navbar"
              alt="logo"
              style={styles.logo}
            />
            <span style={{ 
              ...styles.appName, 
              ...(hoveredItem === 0 ? styles.navItemHover : {})}}
              onMouseEnter={() => handleMouseEnter(0)}
              onMouseLeave={handleMouseLeave}
              >
              Mi recetario</span>
          </Link>
        </div>
        <div style={styles.rightSection}>
          {isAuthenticated && (
            <>
              <Link
                to="/new_recipe"
                style={{
                  ...styles.navItem,
                  ...(hoveredItem === 1 ? styles.navItemHover : {})
                }}
                onMouseEnter={() => handleMouseEnter(1)}
                onMouseLeave={handleMouseLeave}
              >
                Añadir receta
              </Link>
            </>
          )}

          <Link
            to="/recipes"
            style={{
              ...styles.navItem,
              ...(hoveredItem === 2 ? styles.navItemHover : {}),
            }}
            onMouseEnter={() => handleMouseEnter(2)}
            onMouseLeave={handleMouseLeave}
          >
            Recetas
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/profile"
                style={{
                  ...styles.navItem,
                  ...(hoveredItem === 3 ? styles.navItemHover : {}),
                }}
                onMouseEnter={() => handleMouseEnter(3)}
                onMouseLeave={handleMouseLeave}
              >
                Perfil
              </Link>
            </>
          )}
          {isAuthenticated && (
            <div style={styles.dropdownContainer}>
              <span
                style={{
                  ...styles.navItem,
                  ...(hoveredItem === 4 ? styles.navItemHover : {}),
                }}
                onClick={toggleDropdown}
                onMouseEnter={() => handleMouseEnter(4)}
                onMouseLeave={handleMouseLeave}
              >
                Más ▾
              </span>
              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <>
                    <Link
                      to="/about_us"
                      style={{
                        ...styles.dropdownItem,
                        ...(hoveredItem === 5 ? styles.dropdownItemHover : {}),
                      }}
                      onMouseEnter={() => handleMouseEnter(5)}
                      onMouseLeave={handleMouseLeave}
                    >
                      Sobre nosotros
                    </Link>
                    <Link
                      style={{
                        ...styles.dropdownItem,
                        ...(hoveredItem === 6
                          ? { ...styles.dropdownItemHover, color: "#d12a37" }
                          : {}),
                      }}
                      onMouseEnter={() => handleMouseEnter(6)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowLogoutModal(true);
                      }}
                    >
                      Cerrar sesión
                    </Link>
                  </>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Cerrar sesión</h3>
            <p style={styles.modalText}>
              ¿Estás seguro de que quieres cerrar tu sesión?
            </p>
            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.buttonStyle, ...styles.cancelButton }}
                onClick={() => {
                  setCancelHover(false);
                  setShowLogoutModal(false);
                }}
                onMouseEnter={() => setCancelHover(true)}
                onMouseLeave={() => setCancelHover(false)}
              >
                Cancelar
              </button>
              <button
                style={{ ...styles.buttonStyle }}
                onClick={() => {
                  setConfirmHover(false);
                  handleLogout();
                }}
                onMouseEnter={() => setConfirmHover(true)}
                onMouseLeave={() => setConfirmHover(false)}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
