import './Register.css';
import { useState } from "react";
import { registerApi } from "../../api/loginApi";
import { useNavigate } from "react-router-dom";
import CustomInput from '../../components/CustomInput/CustomInput';
import Toast from '../../components/Toast/Toast';
import { Link } from 'react-router-dom';
import character from '../../assets/character.png';
import LoginGoogleButton from '../../components/LoginGoogleButton/LoginGoogleButton'; 

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('#ff0000'); 
  const navigate = useNavigate();

  const showToast = (message: string, color: string = '#ff0000') => {
    setToastMessage(message);
    setToastColor(color);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false); 
    }, 1500);
  };

  const handleRegister = async () => {
    try {
      const { data, error } = await registerApi({ username, email, password });

      if (error) {
        showToast(error, '#ff0000');
        return;
      }

      if (data) {
        console.log("Registrado com sucesso:", data);
        navigate('/login');
      }
    } catch (err) {
      console.error('Erro ao conectar à API:', err);
      showToast('Erro de conexão com o servidor. Tente novamente mais tarde.', '#ff0000');
    }
  };

  return (
    <div id="register">
      <img src={character} alt="character" id="character" />
      <div id='square'>
        <h1>Registrar</h1>
        <CustomInput
          placeholder='Nome de usuário'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <CustomInput
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <CustomInput
          placeholder='Senha'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type='password'
        />
          <button
            className='button'
            disabled={!username || !email || !password}
            onClick={handleRegister}
          >
            Registrar
          </button>
        <LoginGoogleButton />
        <div id='text-div'>
          <h2 className='text'>
            Já possui uma conta?
            <Link
              to="/login"
              style={{ color: '#007bff', textDecoration: 'underline' }}
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className="text"
            >
              Faça login!
            </Link>
          </h2>
        </div>
      </div>
      <Toast message={toastMessage} color={toastColor} isActive={toastVisible} />
    </div>
  );
};
