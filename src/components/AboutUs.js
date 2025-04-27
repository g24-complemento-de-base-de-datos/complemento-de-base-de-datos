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
            fontSize: "2rem",
            marginBottom: "1.5rem",
        },
        subtitle: {
            fontWeight: "bold",
            color: "#fbb540",
            fontSize: "1.5rem",
            margin: "2rem 0 1rem",
        },
        paragraph: {
            marginBottom: "1.5rem",
            lineHeight: "1.6",
            textAlign: "left",
            maxWidth: "80%",
            margin: "0 auto 1.5rem",
        },
        techList: {
            textAlign: "left",
            maxWidth: "70%",
            margin: "0 auto 2rem",
            lineHeight: "1.8",
        },
        teamContainer: {
            display: "flex",
            justifyContent: "center",
            gap: "4rem",
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
            height: "250px",
            width: "250px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #fbb540",
        },
        memberName: {
            fontSize: "1.4rem",
            fontWeight: "bold",
            color: "#fbb540",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
        },
        memberHandle: {
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#f1f1f1",
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
                
                <p style={styles.paragraph}>
                    Esta aplicación forma parte del proyecto final de la asignatura "Complemento de Base de Datos",
                    cursada en el último año del Grado en Ingeniería Informática.
                </p>
                
                <p style={styles.paragraph}>
                    El proyecto consiste en el desarrollo de una aplicación web de gestión de recetas culinarias, 
                    permitiendo a los usuarios registrarse, iniciar sesión, subir recetas con imágenes y consultar 
                    recetas de otros usuarios.
                </p>
                
                <h3 style={{ ...styles.subtitle, marginTop: "3rem"}}>Tecnologías utilizadas:</h3>
                <ul style={styles.techList}>
                    <li>Frontend desarrollado con React.js</li>
                    <li>Firebase Authentication para la gestión segura del registro e inicio de sesión de usuarios</li>
                    <li>Cloud Firestore (Firebase) como base de datos NoSQL para almacenar la información estructurada de las recetas</li>
                    <li>Firebase Storage para el almacenamiento de imágenes de las recetas</li>
                </ul>
                
                <p style={{ ...styles.paragraph, marginTop: "5rem" }}>
                    El objetivo principal es integrar una base de datos moderna en una aplicación funcional, aplicar prácticas de ingeniería de software,
                    y demostrar conocimientos de diseño de sistemas de información y bases de datos NoSQL en un entorno de desarrollo web real.
                </p>
                
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