import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebase.init';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { AuthContext } from './AuthContext';
import axios from 'axios';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // ✅ role state
    const [loading, setLoading] = useState(true);
    const googleProvider = new GoogleAuthProvider();

    const axiosPublic = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    });

    // 🔐 Create Account
    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // 🔑 Login
    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    // 🚪 Logout
    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    };

    // 🔐 Google Login
    const googleSignIn = () => {
        return signInWithPopup(auth, googleProvider);
    };

    // 🔍 Role Fetch Function
    const fetchUserRole = async (email) => {
        try {
            const { data: userDataFromDB } = await axiosPublic.get(`/users?email=${email}`);
            setUserRole(userDataFromDB.role || 'Employee'); // fallback
        } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole('Employee');
        }
    };

    // 🔄 Auth State Change Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const idToken = await currentUser.getIdToken();
                localStorage.setItem('access-token', idToken);

                setUser(currentUser);
                await fetchUserRole(currentUser.email);
            } else {
                setUser(null);
                setUserRole(null);
                localStorage.removeItem('access-token');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const userInfo = {
        user,
        userRole,  // ✅ role now available from context
        loading,
        createUser,
        signIn,
        googleSignIn,
        logOut,
    };

    return (
        <AuthContext.Provider value={userInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
