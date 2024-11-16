import React, { useEffect, useState } from 'react';
import './GameOverScreen.css';
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { IWinner } from '../../interfaces/game';
import { useWebSocket } from '../../context/WebSocketContext';

interface GameOverScreenProps {
  setScreen: (screen: string) => void;
  winner: IWinner | null;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ setScreen, winner }) => {
  const { gameState, setGameState, setRoomState, setLastMessage } = useWebSocket();
  const [winnerPosition, setWinnerPosition] = useState<number | null>(null);

  useEffect(() => {
    if (gameState && winner) {
      console.log("winner", winner);
      setWinnerPosition(gameState?.players[`socket_${winner.id}`].defendingPlanetId);
    }
  }, [gameState, winner]);

  const handleBackToMenu = () => {
    setGameState(null);
    setRoomState(null);  // Limpar o estado da sala após a vitória
    setLastMessage(null);
    setScreen('menu');
  };

  return (
    <Box id="game-over-screen" sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#000000',
      backgroundOpacity: 0.75,
      position: 'relative',
    }}>

      <div id='modal'>
        <h1 className="game-over-title">O vencedor é {winner?.username}!</h1>
        {winnerPosition ? (
          <img src={`/assets/player${winnerPosition + 1}.svg`} alt="" style={{ maxWidth: '100px', height: 'auto' }} />
        ) : null}
        <h2 className="game-over-subtitle">Parabéns por salvar o seu planeta!!</h2>
        <Button
          className='button-menu'
          onClick={handleBackToMenu}
          sx={{
            backgroundColor: '#9D00FF',
            color: 'white',
            '&:hover': { backgroundColor: '#ff69b4' }
          }}
        >
          Voltar ao menu inicial
        </Button>
      </div>

    </Box>
  );
};
