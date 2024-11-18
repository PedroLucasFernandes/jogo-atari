import './RankingScreen.css';
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { LogoutButton } from '../../components/LogoutButton/LogoutButton';
import { SoundToggleButton } from '../../components/SoundToggleButton/SoundToggleButton';
import { gameAudio } from '../../utils/audioManager';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

interface Jogador {
  user_id: string;
  username: string;
  total_score: number;
  total_games_played: number;
  position: string;
}

export const RankingScreen: React.FC<ScreenProps> = ({ setScreen }) => {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const currentUserId = user?.id;

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_API_ADDRESS}/leaderboard?sortBy=total_score`);
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do ranking');
        }
        const data = await response.json();

        if (Array.isArray(data.data)) {
          setJogadores(data.data);
        } else {
          throw new Error('Formato de resposta inválido');
        }

        setIsLoading(false);
      } catch (error: any) {
        setError(error.message || 'Erro desconhecido');
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const topJogadores = jogadores.length > 0
    ? [...jogadores].sort((a, b) => b.total_score - a.total_score).slice(0, 5)
    : [];

  const jogadorAtual = jogadores.find(jogador => jogador.user_id === currentUserId);
  const posicaoAtual = jogadorAtual ? jogadores.indexOf(jogadorAtual) + 1 : null;
  const pontosAtual = jogadorAtual ? jogadorAtual.total_score : null;

  const estaNoTop5 = topJogadores.some(jogador => jogador.user_id === currentUserId);

  return (
    <Box id="ranking-room">
         <LogoutButton />
         <SoundToggleButton />
      <h1 className='title-ranking'style={{fontFamily: '"Chewy", system-ui', color: '#11205f' }}>Ranking - Top 5</h1>

      {isLoading && <p style={{fontFamily: '"Chewy", system-ui', color: '#11205f' }}>Carregando...</p>}
      {error && <p>{error}</p>}

      {!isLoading && !error && (
        <>
          <Box id="header" 
          sx={{fontFamily: '"Tilt Neon" , system-ui', boxShadow: '0 0 15px rgba(255, 0, 98, 0.7), inset 0 0 10px rgba(255, 0, 98, 0.6)'}}>
            <h2>JOGADORES</h2>
            <h2>PONTOS</h2>
          </Box>

          <Box id="ranking-box" sx={{fontFamily: '"Tilt Neon", sans-serif', boxShadow: '0 0 15px rgba(255, 0, 98, 0.7), inset 0 0 10px rgba(255, 0, 98, 0.6)'}}>
            {topJogadores.map((jogador, index) => (
              <Box key={jogador.user_id} className={`ranking-item ${jogador.user_id === currentUserId ? 'highlight' : ''}`}>
                <h2>{index + 1}º {jogador.username}</h2>
                <h2>{jogador.total_score}</h2>
              </Box>
            ))}
            {!estaNoTop5 && jogadorAtual && (
              <Box className="your-item">
                <h2>{posicaoAtual}º Você</h2>
                <h2>{pontosAtual}</h2>
              </Box>
            )}
          </Box>
        </>
      )}

      <Button variant="solid" size="md" sx={{fontFamily:}} onClick={() =>{gameAudio.playClickSound(); setScreen('main-menu')}}>Voltar</Button>
    </Box>
  );
};