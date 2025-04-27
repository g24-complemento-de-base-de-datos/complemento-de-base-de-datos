import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

const AboutUs = () => {
    const [angelImage, setAngelImage] = useState("");
    const [juanImage, setJuanImage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storage = getStorage();
        
        const angelRef = ref(storage, 'images/about_us/angel.jpg');
        getDownloadURL(angelRef)
            .then((url) => {
                setAngelImage(url);
            })
            .catch((error) => {
                console.error("Error al obtener imagen de Ángel:", error);
            });

        const juanRef = ref(storage, 'images/about_us/juan.jpeg');
        getDownloadURL(juanRef)
            .then((url) => {
                setJuanImage(url);
            })
            .catch((error) => {
                console.error("Error al obtener imagen de Juan:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const styles = {
        container: {
            backgroundColor: "#282c34",
            color: "#f1f1f1",
            padding: "2rem",
            paddingTop: "2rem",
            textAlign: "center",
            maxWidth: "1500px",
            margin: "0 auto",
        },
        title: {
            fontWeight: "bold",
            color: "#fbb540",
            fontSize: "2.5rem",
            marginBottom: "2rem",
        },
        subtitle: {
            fontWeight: "bold",
            color: "#fbb540",
            fontSize: "1.8rem",
            margin: "3rem 0 1.5rem",
            textAlign: "center",
        },
        paragraph: {
            marginBottom: "1.5rem",
            lineHeight: "1.6",
            textAlign: "left",
            maxWidth: "100%",
            margin: "0 auto 2rem",
            fontSize: "1.1rem",
        },
        techList: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            maxWidth: "90%",
            margin: "0 auto 3rem",
        },
        techItem: {
            backgroundColor: "#3a3f4b",
            borderRadius: "15px",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            transition: "transform 0.3s ease",
            '&:hover': {
                transform: "translateY(-5px)",
            }
        },
        techIcon: {
            fontSize: "3rem",
            color: "#fbb540",
            marginBottom: "1rem",
        },
        techTitle: {
            fontWeight: "bold",
            color: "#fbb540",
            fontSize: "1.3rem",
            marginBottom: "0.8rem",
        },
        techDescription: {
            fontSize: "1rem",
            lineHeight: "1.5",
        },
        teamContainer: {
            display: "flex",
            justifyContent: "center",
            gap: "6rem",
            marginTop: "3rem",
            flexWrap: "wrap",
        },
        memberContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
        },
        memberImage: {
            height: "350px",
            width: "350px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #fbb540",
            boxShadow: "0 4px 15px rgba(251, 181, 64, 0.3)",
        },
        memberName: {
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#fbb540",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
        },
        memberHandle: {
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#f1f1f1",
            backgroundColor: "#3a3f4b",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
        },
        highlightBox: {
            backgroundColor: "#3a3f4b",
            borderRadius: "15px",
            padding: "2rem",
            margin: "3rem auto",
            maxWidth: "80%",
            borderLeft: "5px solid #fbb540",
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={styles.container}>
                    <p>Cargando imágenes...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1 style={styles.title}>Sobre Mi Recetario</h1>
                
                <div style={styles.highlightBox}>
                <p style={styles.paragraph}>
                    Esta aplicación forma parte del proyecto final de la asignatura "Complemento de Base de Datos",
                    cursada en el último año del Grado en Ingeniería Informática Ingeniería del Software en la Universidad de Sevilla.
                </p>
                
                <p style={styles.paragraph}>
                    El proyecto consiste en el desarrollo de una aplicación web de gestión de recetas culinarias, 
                    permitiendo a los usuarios registrarse, iniciar sesión, subir recetas con imágenes y consultar 
                    recetas de otros usuarios.
                </p>
                </div>
                <h3 style={styles.subtitle}>Tecnologías utilizadas</h3>
                <div style={styles.techList}>
                    <div style={styles.techItem}>
                        <div style={styles.techIcon}>⚛️</div>
                        <h4 style={styles.techTitle}>React.js</h4>
                        <p style={styles.techDescription}>
                            Biblioteca JavaScript para construir interfaces de usuario modernas y reactivas
                        </p>
                    </div>
                    <div style={styles.techItem}>
                        <div style={styles.techIcon}>🔐</div>
                        <h4 style={styles.techTitle}>Firebase Auth</h4>
                        <p style={styles.techDescription}>
                            Autenticación segura a través de Google y gestión de usuarios
                        </p>
                    </div>
                    <div style={styles.techItem}>
                        <div style={styles.techIcon}>🔥</div>
                        <h4 style={styles.techTitle}>Cloud Firestore</h4>
                        <p style={styles.techDescription}>
                            Base de datos NoSQL en tiempo real para almacenar todas las recetas
                        </p>
                    </div>
                    <div style={styles.techItem}>
                        <div style={styles.techIcon}>📦</div>
                        <h4 style={styles.techTitle}>Firebase Storage</h4>
                        <p style={styles.techDescription}>
                            Almacenamiento seguro de imágenes y archivos multimedia
                        </p>
                    </div>
                </div>
                <div style={styles.highlightBox}>
                    <p style={{...styles.paragraph, margin: 0, textAlign: "center"}}>
                        El objetivo principal es integrar una base de datos moderna en una aplicación funcional, aplicar las prácticas aprendidas en la asignatura,
                        y demostrar conocimientos de diseño de sistemas de información y bases de datos NoSQL en un entorno de desarrollo web real.
                    </p>
                </div>
                
                <h3 style={styles.subtitle}>Equipo de desarrollo</h3>
                <div style={styles.teamContainer}>
                    <div style={styles.memberContainer}>
                        {juanImage && <img src={juanImage} alt="Juan García" style={styles.memberImage} />}
                        <span style={styles.memberName}>Juan García Carballo</span>
                        <span style={styles.memberHandle}>@juagarcar4</span>
                    </div>
                    <div style={styles.memberContainer}>
                        {angelImage && <img src={angelImage} alt="Ángel García" style={styles.memberImage} />}
                        <span style={styles.memberName}>Ángel García Escudero</span>
                        <span style={styles.memberHandle}>@anggaresc1</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutUs;