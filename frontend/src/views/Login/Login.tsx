import './Login.css'
import { useState } from "react";
import { loginApi } from "../../api/loginApi";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { User } from "../../interfaces/User";
import LoginGoogleButton from '../../components/LoginGoogleButton/LoginGoogleButton';


export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await loginApi({ email, password });

    if (error) {
      //TODO: Alerta
      console.error(error);
      return;
    }

    if (data) {
      console.log("Logado com sucesso:", data);
      setUser(data as User);
      navigate('/monolito');

    }
  };

  return (
    <div id="login">
      <h1>Login</h1>
      <input
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        disabled={!email || !password}
        onClick={handleLogin}
      >Entrar</button>
    <LoginGoogleButton/>
    </div>
  );

}