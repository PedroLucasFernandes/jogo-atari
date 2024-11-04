import './Login.css';
import { useState } from "react";
import { loginApi } from "../../api/loginApi";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { User } from "../../interfaces/User";
import character from '../../assets/character.png'
import LoginGoogleButton from '../../components/LoginGoogleButton/LoginGoogleButton';
import CustomInput from '../../components/CustomInput/CustomInput';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async () => {
  
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
  
    const { data, error } = await loginApi({ email, password });
  
    if (error) {
      console.error("Erro da API:", error);
      toast.error("Erro ao fazer login. Verifique seu e-mail e senha.");
      return;
    }
  
    if (data) {
      toast.success("Logado com sucesso!");
      setUser(data as User);
      navigate('/monolito');
    }
  };
  

  return (
    <div id="login">
      <img src={character} alt="character" id="character" />
      <div id='square'>
      <h1>Login</h1>
      <CustomInput
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <CustomInput
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type='password'
      />

      <button className='button'
        disabled={!email || !password}
        onClick={handleLogin}
      >Entrar</button>
      <LoginGoogleButton />
      </div>
    </div>
  );
}
