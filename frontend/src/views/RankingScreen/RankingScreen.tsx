import './RankingScreen.css';
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';

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
  const { user, setUser } = useUser();

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

  return (
    <Box id="ranking-room">
      <h1>Melhores jogadores</h1>

      {isLoading && <p>Carregando...</p>}
      {error && <p>{error}</p>}

      {!isLoading && !error && (
        <>
          <Box id="header">
            <h2>JOGADORES</h2>
            <h2>PONTOS</h2>
          </Box>

          <Box id="ranking-box">
            {topJogadores.map((jogador, index) => (
              <Box key={jogador.user_id} className="ranking-item">
                <h2>{index + 1}º {jogador.username}</h2>
                <h2>{jogador.total_score}</h2>
              </Box>
            ))}
            {jogadorAtual && (
              <Box className="your-item">
                <h2>{posicaoAtual}º Você</h2>
                <h2>{pontosAtual}</h2>
              </Box>
            )}
          </Box>
        </>
      )}

      <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>VOLTAR</Button>
    </Box>
  );
};