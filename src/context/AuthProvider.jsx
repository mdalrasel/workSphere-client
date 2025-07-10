import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebase.init';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { AuthContext } from './AuthContext';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const googleProvider = new GoogleAuthProvider();

    // Create Account
    const createUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);
    
    // Login
    const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
    
    // Logout
    const logOut = () => signOut(auth);

    // Google Login
    const googleSignIn = () => signInWithPopup(auth, googleProvider);

    // Auth State Change Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const idToken = await currentUser.getIdToken();
                localStorage.setItem('access-token', idToken);
                setUser(currentUser);
            } else {
                setUser(null);
                localStorage.removeItem('access-token');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        googleSignIn,
        logOut,
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
