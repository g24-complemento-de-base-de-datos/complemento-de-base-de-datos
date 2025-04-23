import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase/firebase";
import defaultDish from "./../static/dish.png";
import editPhoto from "./../static/edit.png";
import Navbar from "./Navbar";

const RecipeCreator = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    photoURL: "",
    steps: [""],
    ingredients: [{ name: "", quantity: "", type: "" }],
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [recipeImage, setRecipeImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredDelete, setHoveredDelete] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = (index) => {
    setHoveredItem(index);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleDeleteMouseEnter = (index, type) => {
    setHoveredDelete(`${type}-${index}`);
  };

  const handleDeleteMouseLeave = () => {
    setHoveredDelete(null);
  };

  const styles = {
    container: {
      backgroundColor: "#282c34",
      color: "#f1f1f1",
      padding: "2rem",
      paddingTop: "2rem",
      textAlign: "center",
    },
    formContainer: {
      maxWidth: "800px",
      margin: "0 auto",
      backgroundColor: "#3c3f4a",
      padding: "2rem",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
      textAlign: "left",
    },
    title: {
      color: "#fbb540",
      marginBottom: "2rem",
      textAlign: "center",
    },
    formGroup: {
      marginBottom: "1.5rem",
    },
    formRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
    },
    formTitle: {
      fontWeight: "bold",
      flex: "1",
    },
    formActions: {
      display: "flex",
      gap: "0.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "bold",
    },
    input: {
      width: "98%",
      alignItems: "center",
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
      minHeight: "50px",
      resize: "vertical",
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
    },
    button: {
      padding: "0.5rem 0.5rem",
      fontSize: "0.9rem",
      fontWeight: "bold",
      fontFamily: "Courier New",
      backgroundColor: "#fbb540",
      color: "#3c2f2f",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    cancelButton: {
      fontSize: "0.9rem",
      padding: "0.5rem 0.5rem",
      backgroundColor: "#d12a37",
      color: "white",
    },
    hoveredButton: {
      transform: "translateY(-3px)",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      backgroundColor: "#ea9d2d",
    },
    hoveredDeleteButton: {
      transform: "translateY(-3px)",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      backgroundColor: "#a81f2a",
    },
    stepItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "0.75rem",
      gap: "0.5rem",
    },
    ingredientItem: {
      display: "flex",
      gap: "0.5rem",
      alignItems: "center",
    },
    tagItem: {
      display: "inline-block",
      backgroundColor: "#fbb540",
      color: "#3c2f2f",
      padding: "0.3rem 0.6rem",
      borderRadius: "15px",
      margin: "0.3rem",
      fontSize: "0.9rem",
      fontWeight: "bold",
    },
    tagRemove: {
      marginLeft: "0.3rem",
      cursor: "pointer",
      fontWeight: "bold",
    },
    requiredStar: {
      color: "red",
      fontSize: "1.2rem",
    },
    imageContainer: {
      height: "200px",
      width: "200px",
      margin: "1rem auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fbb540",
      borderRadius: "10px",
      position: "relative",
      cursor: "pointer",
    },
    imagePreview: {
      height: "180px",
      width: "180px",
      objectFit: "cover",
      borderRadius: "8px",
    },
    editImage: {
      height: "250px",
      objectFit: "cover",
      cursor: "pointer",
    },
    editImageButton: {
      height: "70px",
      position: "absolute",
      bottom: "5px",
      right: "5px",
      cursor: "pointer",
    },
    uploadLabel: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "bold",
    },
    progressBar: {
      width: "100%",
      height: "10px",
      backgroundColor: "#ddd",
      borderRadius: "5px",
      margin: "0.5rem 0",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#4CAF50",
      borderRadius: "5px",
      width: `${uploadProgress}%`,
    },
    formInputGroup: {
      display: "flex",
      gap: "0.5rem",
      width: "100%",
    },
    formInput: {
      flex: "1",
      padding: "0.6rem",
      borderRadius: "5px",
      border: "none",
      backgroundColor: "#4e525e",
      color: "#f1f1f1",
      marginBottom: "0.5rem",
    },
    tagInputContainer: {
      display: "flex",
      gap: "0.5rem",
      width: "100%",
      alignItems: "center",
    },
    tagInput: {
      flex: "1",
      padding: "0.6rem",
      borderRadius: "5px",
      border: "none",
      backgroundColor: "#4e525e",
      color: "#f1f1f1",
    },
    tagButton: {
      padding: "0.6rem 1rem",
      fontSize: "0.9rem",
      fontWeight: "bold",
      fontFamily: "Courier New",
      backgroundColor: "#fbb540",
      color: "#3c2f2f",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    deleteButton: {
      padding: "0.4rem 0.8rem",
      fontSize: "0.8rem",
      height: "fit-content",
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({
      ...formData,
      steps: newSteps,
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, ""],
    });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      steps: newSteps,
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { name: "", quantity: "", type: "" },
      ],
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const uploadImage = async (file, uid) => {
    try {
      const storageRef = ref(
        storage,
        `images/${uid}/recipes/${formData.name}`
      );
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

      setRecipeImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = formData.photoURL;
      if (recipeImage) {
        imageUrl = await uploadImage(recipeImage, auth.currentUser.uid);
      }

      const recipeData = {
        name: formData.name,
        description: formData.description,
        duration: parseInt(formData.duration),
        photoURL: imageUrl || "",
        steps: formData.steps.filter((step) => step.trim() !== ""),
        ingredients: formData.ingredients.filter(
          (ing) => ing.name.trim() !== ""
        ),
        tags: formData.tags,
        autorUid: auth.currentUser.uid,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "recipes"), recipeData);

      setSubmitSuccess(true);
      setFormData({
        name: "",
        description: "",
        duration: "",
        photoURL: "",
        steps: [""],
        ingredients: [{ name: "", quantity: "", type: "" }],
        tags: [],
      });
      setRecipeImage(null);
      setImagePreview(null);
      setUploadProgress(0);
      navigate("/recipes", { state: { showRecipeCreationSuccess: true } });
    } catch (error) {
      console.error("Error al crear la receta:", error);
      alert("Hubo un error al crear la receta. Por favor, intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>Crear nueva receta</h2>
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Nombre<span style={styles.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="name"
                className="input-placeholder"
                value={formData.name}
                placeholder="Nombre de la receta"
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Descripción<span style={styles.requiredStar}>*</span>
              </label>
              <textarea
                name="description"
                className="input-placeholder"
                value={formData.description}
                placeholder="Descripción de la receta"
                onChange={handleInputChange}
                required
                style={styles.textarea}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...styles.formTitle }}>
                Duración (minutos)<span style={styles.requiredStar}>*</span>
              </label>
              <input
                type="number"
                name="duration"
                className="input-placeholder"
                value={formData.duration}
                placeholder="Duración en minutos"
                onChange={handleInputChange}
                min="1"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...styles.formTitle }}>
                Pasos de preparación<span style={styles.requiredStar}>*</span>
              </label>
              {formData.steps.map((step, index) => (
                <div key={index} style={styles.stepItem}>
                  <textarea
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Paso ${index + 1}`}
                    required={index === 0}
                    style={{ ...styles.textarea, flexGrow: 1 }}
                  />
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      style={{ 
                        ...styles.buttonStyle, 
                        ...styles.cancelButton,
                        ...styles.deleteButton,
                        ...(hoveredDelete === `step-${index}` ? styles.hoveredDeleteButton : {})
                      }}
                      onMouseEnter={() => handleDeleteMouseEnter(index, 'step')}
                      onMouseLeave={handleDeleteMouseLeave}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={addStep}
                  style={{ ...styles.button, ...(hoveredItem === 0 ? styles.hoveredButton : {}) }}
                  onMouseEnter={() => handleMouseEnter(0)}
                  onMouseLeave={handleMouseLeave}
                >
                  Añadir paso
                </button>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...styles.formTitle }}>
                Ingredientes<span style={styles.requiredStar}>*</span>
              </label>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} style={styles.ingredientItem}>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    required={index === 0}
                    style={{ ...styles.input, flex: 2 }}
                  />
                  <input
                    type="text"
                    placeholder="Cantidad"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(index, "quantity", e.target.value)
                    }
                    required={index === 0}
                    style={{ ...styles.input, flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Tipo (opcional)"
                    value={ingredient.type}
                    onChange={(e) =>
                      handleIngredientChange(index, "type", e.target.value)
                    }
                    style={{ ...styles.input, flex: 1 }}
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      style={{ 
                        ...styles.buttonStyle, 
                        ...styles.cancelButton,
                        ...styles.deleteButton,
                        ...(hoveredDelete === `ingredient-${index}` ? styles.hoveredDeleteButton : {})
                      }}
                      onMouseEnter={() => handleDeleteMouseEnter(index, 'ingredient')}
                      onMouseLeave={handleDeleteMouseLeave}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={addIngredient}
                  style={{ ...styles.button, ...(hoveredItem === 1 ? styles.hoveredButton : {}), marginTop: "0.8rem" }}
                  onMouseEnter={() => handleMouseEnter(1)}
                  onMouseLeave={handleMouseLeave}
                >
                  Añadir ingrediente
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...styles.formTitle }}>
                Etiquetas (Tags)
              </label>
              <div style={styles.tagInputContainer}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Añadir etiqueta"
                  onKeyUp={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleTagAdd())
                  }
                  style={styles.tagInput}
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  style={{ ...styles.tagButton, ...(hoveredItem === 2 ? styles.hoveredButton : {}) }}
                  onMouseEnter={() => handleMouseEnter(2)}
                  onMouseLeave={handleMouseLeave}
                >
                  Añadir etiqueta
                </button>
              </div>
              <div>
                {formData.tags.map((tag, index) => (
                  <span key={index} style={styles.tagItem}>
                    {tag}
                    <span
                      style={styles.tagRemove}
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div style={{ ...styles.formGroup, paddingTop: "1rem" }}>
              <label style={styles.uploadLabel}>Imagen</label>
              <div style={styles.imageContainer}>
                <label htmlFor="profileImage">
                  <img
                    src={imagePreview ? imagePreview : defaultDish}
                    alt="Foto de perfil"
                    style={styles.imagePreview}
                  />
                  <img
                    src={editPhoto}
                    alt="Foto de perfil"
                    style={styles.editImageButton}
                  />
                </label>
              </div>
              <input
                id="recipeImage"
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={styles.progressBar}>
                  <div style={styles.progressFill}></div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ ...styles.buttonStyle, ...(hoveredItem === 3 ? styles.hoveredButton : {}) }}
                onMouseEnter={() => handleMouseEnter(3)}  
                onMouseLeave={handleMouseLeave}
              >
                {isSubmitting ? "Creando receta..." : "Crear receta"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecipeCreator;