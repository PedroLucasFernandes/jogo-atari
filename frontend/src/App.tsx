import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginButton from './components/LoginButton';

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not defined in .env file");
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginButton />
    </GoogleOAuthProvider>
  );
}

export default App;
