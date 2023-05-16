import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();

    if (Object.keys(auth).length === 0)
        return <Navigate to="/signin" state={{ from: location }} replace />
    else if (auth?.roles?.find(role => allowedRoles.includes(role)))
        return <Outlet />
    else {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />
    }
}

export default RequireAuth;