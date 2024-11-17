import { Route, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Login } from '../../views/Login/Login';

const RedirectRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  return user ? <Navigate to="/monolito" /> : children;
};

export default RedirectRoute;