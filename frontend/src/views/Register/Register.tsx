import './Register.css'
import { useState } from "react";
import { loginApi, registerApi } from "../../api/loginApi";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";


export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleRegister = async () => {
    const { data, error } = await registerApi({ username, email, password });

    if (error) {
      //TODO: Alerta
      console.error(error);
      return;
    }

    if (data) {
      console.log("Registrado com sucesso:", data);
      navigate('/login');
    }
  };

  return (
    <div id="register">
      <h1>Register</h1>
      <input
        placeholder='Username'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoFocus
      />
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
        disabled={!username || !email || !password}
        onClick={handleRegister}
        value={'Registrar'}
      >Registrar</button>
    </div>
  );
}