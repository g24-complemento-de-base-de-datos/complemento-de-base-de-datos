import { auth, provider, db } from '../firebase/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function Login() {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          nombre: user.displayName?.split(' ')[0] || '',
          apellido: user.displayName?.split(' ')[1] || '',
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL,
          recetasGuardadas: []
        });
      }

      console.log('Usuario autenticado:', user);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  return (
    <button onClick={handleGoogleLogin}>
      Iniciar sesión con Google
    </button>
  );
}

export default Login;
