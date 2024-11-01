import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Game from './components/Game';
import LoginButton from './components/LoginGoogleButton/LoginGoogleButton';
import MainMenu from './views/MainMenu';
import { WebSocketProvider } from './context/WebSocketContext';

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not defined in .env file");
  }

  return (
    <WebSocketProvider>
    <GoogleOAuthProvider clientId={clientId}>
           <Router>
            <Routes>
                <Route path='/' element={<LoginButton/>} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </Router>
    </GoogleOAuthProvider>
    </WebSocketProvider>
  );
}

export default App;