import { GoogleOAuthProvider } from '@react-oauth/google';
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
        <LoginButton />
      </GoogleOAuthProvider>
      <MainMenu /> {/* TESTE WEBSCOKET */}
    </WebSocketProvider>
  );
}

export default App;
