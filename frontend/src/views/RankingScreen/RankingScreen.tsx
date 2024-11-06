import './RankingScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { Dispatch, SetStateAction } from 'react';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const RankingScreen: React.FC<ScreenProps> = ({ setScreen }) => {

  const jogadores = [
    { nome: "Jogador 1", pontos: 120 },
    { nome: "Jogador 2", pontos: 150 },
    { nome: "Jogador 3", pontos: 90 },
    { nome: "Jogador 4", pontos: 200 },
    { nome: "Jogador 5", pontos: 170 },
    { nome: "Jogador 6", pontos: 80 },
    { nome: "Jogador 7", pontos: 210 },
    { nome: "Jogador 8", pontos: 110 },
    { nome: "Jogador 9", pontos: 95 },
    { nome: "Jogador 10", pontos: 160 },
  ];

  const topJogadores = [...jogadores]
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 5);

  return (

    <Box id="ranking-room">
      <h1>Ranking de jogadores</h1>

      <Box id="header">
        <h2>JOGADORES</h2>
        <h2>PONTOS</h2>
      </Box>

      <Box id="ranking-box">
        {topJogadores.map((jogador, index) => (
          <Box key={index} className="ranking-item">
            <h2>{jogador.nome}</h2>
            <h2>{jogador.pontos}</h2>
          </Box>
        ))}
        <Box className="your-item">
              <h2>Você</h2>
              <h2>40</h2>
        </Box>
      </Box>

      <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>VOLTAR</Button>

    </Box>
  );
}