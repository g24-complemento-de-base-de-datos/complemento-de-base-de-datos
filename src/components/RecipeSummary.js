import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import defaultDish from "./../static/dish.png";

const RecipeSummary = ({ recipe }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipes/${recipe.id}`, {
      state: { recipe },
    });
  };

  const styles = {
    summary: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      overflow: "hidden",
      width: "300px",
      margin: "10px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      background: "white",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    summaryHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    },
    imageContainer: {
      width: "100%",
      height: "180px",
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.3s ease",
    },
    imageHover: {
      transform: "scale(1.05)",
    },
    defaultImageStyle: {
      opacity: 0.6,
      filter: "grayscale(20%)",
      width: "162px",
      height: "90%",
    },
    customImageStyle: {
      boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
    },
    content: {
      padding: "15px",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
    },
    name: {
      margin: "0 0 10px 0",
      fontSize: "1.2rem",
      color: "#333",
    },
    description: {
      margin: "0 0 15px 0",
      color: "#666",
      fontSize: "0.9rem",
      flexGrow: 1,
    },
    meta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "10px",
    },
    duration: {
      fontSize: "0.85rem",
      color: "#888",
      display: "flex",
      alignItems: "center",
    },
    tags: {
      display: "flex",
      flexWrap: "wrap",
      gap: "5px",
    },
    tag: {
      background: "#f0f0f0",
      color: "#555",
      padding: "3px 8px",
      borderRadius: "12px",
      fontSize: "0.75rem",
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      style={{
        ...styles.summary,
        ...(isHovered ? styles.summaryHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div style={styles.imageContainer}>
        <img
          src={recipe.photoURL || defaultDish}
          alt={recipe.name}
          style={{
            ...styles.image,
            ...(isHovered ? styles.imageHover : {}),
            ...(!recipe.photoURL ? styles.defaultImageStyle : {}),
          }}
          onError={(e) => {
            e.target.src = defaultDish;
            e.target.style.opacity = "0.8";
          }}
        />
      </div>
      <div style={styles.content}>
        <h3 style={styles.name}>{recipe.name}</h3>
        <p style={styles.description}>
          {recipe.description.length > 150
            ? `${recipe.description.substring(0, 150)}...`
            : recipe.description}
        </p>
        <div style={styles.meta}>
          <span style={styles.duration}>⏱️ {recipe.duration} min</span>

          {recipe.tags && recipe.tags.length > 0 && (
            <div style={styles.tags}>
              {recipe.tags.map((tag, index) => (
                <span key={index} style={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

RecipeSummary.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    duration: PropTypes.number,
    image: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default RecipeSummary;
