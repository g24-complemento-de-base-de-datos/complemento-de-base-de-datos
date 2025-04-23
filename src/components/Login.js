import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, provider } from '../firebase/firebase';
import Navbar from './Navbar';

function Login() {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const fullName = user.displayName || '';
        const nameParts = fullName.split(' ').filter(Boolean);
        let name, surname;

        if (nameParts.length === 0) {
          name = '';
          surname = '';
        }
        if (nameParts.length > 3) {
          name = `${nameParts[0]} ${nameParts[1]}`;
          surname = nameParts.slice(2).join(' ');
        }
        else {
          name = nameParts[0];
          surname = nameParts.slice(1).join(' ') || '';
        }

        await setDoc(userRef, {
          nombre: name,
          apellido: surname,
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL,
          recetasGuardadas: []
        });
      }

      console.log('Usuario autenticado:', user);
      navigate("/", { state: { showLoginSuccess: true } });
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  const buttonStyle = {
    padding: '0.6rem 1.2rem',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    fontFamily: "Courier New",
    backgroundColor: hover ? '#ea9d2d' : '#fbb540',
    color: '#3c2f2f',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transform: hover ? 'translateY(-3px)' : 'translateY(0)',
    margin: '2rem auto',
    display: 'block'
  };

  const containerStyle = {
    backgroundColor: '#282c34',
    color: '#f1f1f1',
    textAlign: 'center',
    paddingTop: '5rem'
  };

  return (
    <div>
      <Navbar/>
    <div style={containerStyle}>
      <h2>
        Inicia sesión para guardar tus recetas
      </h2>
      <button
        onClick={handleGoogleLogin}
        style={buttonStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        Iniciar sesión con Google
      </button>
    </div>
    </div>
  );
}

export default Login;
