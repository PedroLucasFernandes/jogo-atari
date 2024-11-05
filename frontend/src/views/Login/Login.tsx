import './Login.css';
import { useState } from "react";
import { loginApi } from "../../api/loginApi";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { User } from "../../interfaces/User";
import character from '../../assets/character.png';
import LoginGoogleButton from '../../components/LoginGoogleButton/LoginGoogleButton';
import CustomInput from '../../components/CustomInput/CustomInput';
import Toast from '../../components/Toast/Toast';
import { Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('#ff0000'); 
  const { setUser } = useUser();
  const navigate = useNavigate();

  const showToast = (message: string, color: string = '#ff0000') => {
    setToastMessage(message);
    setToastColor(color);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false); 
    }, 1500);
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await loginApi({ email, password });

      if (error) {
        console.error('Erro da API:', error);
        showToast(error, '#ff0000');
        return;
      }

      if (data) {
        setUser(data as User);
        navigate('/monolito');
      }
    } catch (err) {
      console.error('Erro ao conectar à API:', err);
      showToast('Erro de conexão com o servidor. Tente novamente mais tarde.', '#ff0000');
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
          <button
            className='button'
            disabled={!email || !password}
            onClick={handleLogin}
          >
            Entrar
          </button>
          <LoginGoogleButton />
        <div id='text-div'>
          <h2 className='text'>
            Não possui uma conta?
            <Link
              to="/register"
              style={{ color: '#007bff', textDecoration: 'underline' }}
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
              className="text"
            >
              Faça seu cadastro!
            </Link>
          </h2>
        </div>
      </div>
      <Toast message={toastMessage} color={toastColor} isActive={toastVisible} />
    </div>
  );
};
