import { use } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../context/AuthContext";


const PrivateRoute = ({ children }) => {
    const { user, loading } = use(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    }

    if (!user) {
        return <Navigate to="/signIn" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default PrivateRoute;