import { Route, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useUser();

    if (loading) return <div>Loading...</div>;

    return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;