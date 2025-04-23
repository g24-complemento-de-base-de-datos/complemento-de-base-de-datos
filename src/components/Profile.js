import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase/firebase";
import editPhoto from "./../static/edit.png";
import defaultImage from "./../static/user.png";
import Navbar from "./Navbar";

function Login() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [buttonHover, setButtonHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);
  const navigate = useNavigate();

  const getUserProfile = async (uid) => {
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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await getUserProfile(user.uid);
          if (data) {
            setProfile(data);
            setFormData({
              nombre: data.nombre || "",
              apellido: data.apellido || "",
              email: data.email || "",
            });
            if (data.photoURL) {
              setImagePreview(data.photoURL);
            }
          }
        } catch (error) {
          console.error("Error al cargar el perfil:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        navigate("/");
      }
    });
  
    return () => unsubscribe();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setImagePreview(profile?.photoURL || null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        alert("Por favor, sube una imagen en formato JPG, JPEG o PNG");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe exceder los 5MB");
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file, uid) => {
    try {
      const storageRef = ref(storage, `images/${uid}/profile_photo`);
      const uploadTask = uploadBytes(storageRef, file);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      await uploadTask;
      clearInterval(interval);
      setUploadProgress(100);

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    }
  };

  const handleSaveClick = async () => {
    try {
      let imageUrl = profile?.photoURL || null;

      if (profileImage) {
        imageUrl = await uploadImage(profileImage, auth.currentUser.uid);
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        ...formData,
        photoURL: imageUrl,
      });

      const updatedProfile = {
        ...profile,
        ...formData,
        photoURL: imageUrl,
      };

      setProfile(updatedProfile);
      setIsEditing(false);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      alert(
        "Hubo un error al actualizar el perfil. Por favor, intenta nuevamente."
      );
    }
  };

  const styles = {
    container: {  
      color: "#ffffff",
      textAlign: "center",
      paddingTop: "5rem",
      width: "100%",
    },
    buttonsContainer: {
      display: "flex",
      justifyContent: "center",
    },
    buttonStyle: {
      padding: "0.6rem 1.2rem",
      fontSize: "1.25rem",
      fontWeight: "bold",
      fontFamily: "Courier New",
      backgroundColor: "#fbb540",
      color: "#3c2f2f",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      margin: "auto",
      display: "block",
    },
    buttonHover: {
      backgroundColor: buttonHover ? "#ea9d2d" : "#fbb540",
      transform: buttonHover ? "translateY(-3px)" : "translateY(0)",
      transition: "background-color 0.3s ease, transform 0.2s ease",
    },
    imageContainer: {
      height: "300px",
      width: "300px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fbb540",
      borderRadius: "30px",
      position: "relative",
    },
    image: {
      height: "250px",
      objectFit: "cover",
    },
    editImage: {
      height: "250px",
      objectFit: "cover",
      cursor: "pointer",
    },
    editImageButton: {
      height: "75px",
      position: "absolute",
      bottom: "10px",
      right: "10px",
      cursor: "pointer",
    },
    editButton: {
      backgroundColor: "#4CAF50",
      color: "white",
    },
    cancelButton: {
      backgroundColor: cancelHover ? "#961b20" : "#d12a37",
      transform: cancelHover ? "translateY(-3px)" : "translateY(0)",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      color: "white",
    },
    input: {
      padding: "0.5rem",
      margin: "0.5rem 0",
      borderRadius: "10px",
      border: "none",
      width: "250px",
      color: "white",
      backgroundColor: "grey",
      fontWeight: "bold",
      fontSize: "1.2rem"
    },
    progressBar: {
      width: "300px",
      height: "10px",
      backgroundColor: "#ddd",
      borderRadius: "5px",
      margin: "1rem auto",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#4CAF50",
      borderRadius: "5px",
      width: `${uploadProgress}%`,
    },
    profileField: {
      display: "flex",
      alignItems: "center",
      fontSize: "1.5rem",
      justifyContent: "center",
      gap: "0.5rem",
      margin: "0.5rem 0",
    },
    profileLabel: {
      margin: "0.5rem 0.5rem",
      fontSize: "1.5rem",
    },
    profileValue: {
      margin: "0.5rem 0.5rem",
      fontSize: "1.5rem",
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <p>No se pudo cargar el perfil o el usuario no existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar/>
      <div style={styles.container}>
        <h1>Mi perfil</h1>
        {isEditing ? (
          <>
            <div style={styles.imageContainer}>
            <label htmlFor="profileImage">
                <img
                  src={imagePreview || defaultImage}
                  alt="Foto de perfil"
                  style={styles.editImage}
                />
                <img
                  src={editPhoto}
                  alt="Foto de perfil"
                  style={styles.editImageButton}
                />
            </label>
            </div>
            <input
              id="profileImage"
              type="file"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            {uploadProgress > 0 && (
              <div style={styles.progressBar}>
                <div style={styles.progressFill}>
                </div>
              </div>
            )}
            <div style={{fontSize: "1.5rem"}}>
              <p>
                <strong>Nombre:</strong>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </p>
              <p>
                <strong>Apellidos:</strong>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </p>
              <p style={{ paddingBottom: "1.5rem" }}>
                <strong>Email:</strong> {profile.email}
              </p>
            </div>
            <div style={styles.buttonsContainer}>
              <button
                onClick={handleCancelClick}
                style={{...styles.buttonStyle, ...styles.cancelButton, margin: "0 1rem"}}
                onMouseEnter={() => setCancelHover(true)}
                onMouseLeave={() => setCancelHover(false)}
              >
                Cancelar
              </button>
              <button onClick={handleSaveClick} 
               style={{...styles.buttonStyle, ...styles.buttonHover, margin: 0}}
               onMouseEnter={() => setButtonHover(true)}
               onMouseLeave={() => setButtonHover(false)}
              >
                Guardar
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.imageContainer}>
              <img
                src={profile.photoURL || defaultImage}
                alt="Foto de perfil"
                style={styles.image}
              />
            </div>
            <div style={{ ...styles.profileField, paddingTop: "1.5rem" }}>
              <strong style={styles.profileLabel}>Nombre:</strong>
              <p style={styles.profileValue}>{profile.nombre}</p>
            </div>
            <div style={styles.profileField}>
              <strong style={styles.profileLabel}>Apellidos:</strong>
              <p style={styles.profileValue}>{profile.apellido}</p>
            </div>
            <div style={{ ...styles.profileField, paddingBottom: "1.5rem" }}>
              <strong style={styles.profileLabel}>Email:</strong>
              <p style={styles.profileValue}>{profile.email}</p>
            </div>
            <button 
            onClick={handleEditClick} 
            style={{...styles.buttonStyle, ...styles.buttonHover}}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}>
              Editar perfil
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
