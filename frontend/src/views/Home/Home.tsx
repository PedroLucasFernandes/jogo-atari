import './Home.css'
import { useNavigate } from "react-router-dom";


export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div id="home">
      <h1>Homepage</h1>
      <button onClick={() => navigate('/login')}>Login</button>
      <button onClick={() => navigate('/register')}>Cadastro</button>
    </div>
  );
}