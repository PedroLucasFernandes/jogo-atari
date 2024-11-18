import './Login.css';
import { useState } from "react";
import { loginApi } from "../../api/loginApi";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { User } from "../../interfaces/User";
import LoginGoogleButton from '../../components/LoginGoogleButton/LoginGoogleButton';
import CustomInput from '../../components/CustomInput/CustomInput';
import Toast from '../../components/Toast/Toast';
import { Link } from 'react-router-dom';
import { useEffect } from "react";


export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('#ff0000');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const { user } = useUser();

  useEffect(() => {
    if (user) {
      navigate("/monolito");
    }
  }, [user, navigate]);

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

   // Função para lidar com Enter
   const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div id="login">
      <div id="part-1">
          <h1>Login</h1>
          <CustomInput
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown} // Adiciona o evento de teclado
          />
          <CustomInput
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            onKeyDown={handleKeyDown} // Adiciona o evento de teclado
          />
          <button
            className="button"
            disabled={!email || !password}
            onClick={handleLogin}
          >
            Entrar
          </button>
          <LoginGoogleButton />
          <div id="text-div">
            <h2 className="text">
              Não possui uma conta?
              <Link
                to="/register"
                style={{ color: '#007bff', textDecoration: 'underline' }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
                className="text"
              >
                Faça seu cadastro!
              </Link>
            </h2>
        </div>
      </div>
      <div id="part-2"><div className="content">
      <h2 style={{ fontFamily: '"Chewy", system-ui' }}>COSMIC DEFENDERS</h2>
<p>Em um combate multiplayer, cada jogador deve defender seu planeta contra a iminente destruição do cometa!</p>
<p><strong>Defenda o seu planeta, enfrente o cometa e salve sua espécie!</strong></p>
  </div></div>
      <Toast message={toastMessage} color={toastColor} isActive={toastVisible} />
    </div>
  );
};
