// App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginButton from './components/LoginGoogleButton/LoginGoogleButton';
import { WebSocketProvider } from './context/WebSocketContext';
import { GameMonolito } from './views/GameMonolito/GameMonolito';
import { Login } from './views/Login/Login';
import { Register } from './views/Register/Register';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoutes/ProtectedRoutes';
import { ToastContainer } from 'react-toastify';
import RedirectRoute from './components/RedirectRoute/RedirectRoute';

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not defined in .env file");
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <UserProvider>
        <WebSocketProvider>
          <Router>
            <Routes>
              <Route path='/' element={<RedirectRoute children={<Login />} />} />
              <Route path='/register' element={<Register />} />
              <Route path="/monolito" element={<ProtectedRoute children={<GameMonolito />} />} />
            </Routes>
          </Router>
        </WebSocketProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
