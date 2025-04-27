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
          },
        title: {
            fontWeight: "bold",
            color: "#fbb540",
            fontSize: "2rem",
            flex: "1",
          },
        teamContainer: {
            display: "flex",
            justifyContent: "center",
            gap: "4rem",
            marginTop: "1.5rem",
            flexWrap: "wrap",
        },
        memberContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
        },
        memberImage: {
            height: "300px",
            width: "300px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #fbb540",
        },
        memberName: {
            fontSize: "1.4rem",
            fontWeight: "bold",
            color: "#fbb540",
            marginTop: "2rem",
            marginBottom: "0.5rem",
        },
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
                <h1 style={styles.title}>Sobre Mi recetario</h1>
                <div style={{ marginTop: "2rem" }}>
                    <h3 style={styles.title}>Equipo</h3>
                    <div style={styles.teamContainer}>
                    <div style={styles.memberContainer}>
                            {juanImage && <img src={juanImage} alt="Juan García" style={styles.memberImage} />}
                            <span style={styles.memberName}>Juan García Carballo</span>
                            <span style={{ fontWeight:"bold", fontSize:"1.2rem"}}>@juagarcar4</span>
                        </div>
                        <div style={styles.memberContainer}>
                            {angelImage && <img src={angelImage} alt="Ángel García" style={styles.memberImage} />}
                            <span style={styles.memberName}>Ángel García Escudero</span>
                            <span style={{ fontWeight:"bold", fontSize:"1.2rem"}}>@anggaresc1</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutUs;