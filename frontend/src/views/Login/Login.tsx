import { useState } from "react";
import { loginApi } from "../../api/loginApi";
import { User, useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";


const Login: React.FC = () => {
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
      navigate('/game');

    }
  };

  return (
    <>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        disabled={!email || !password}
        onClick={handleLogin}
        value={'Entrar'}
      />
    </>
  );

}