import React, { useEffect, useState } from 'react';
import './GameOverScreen.css';
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { IWinner } from '../../interfaces/game';
import { useWebSocket } from '../../context/WebSocketContext';
import { gameAudio } from '../../utils/audioManager';

interface GameOverScreenProps {
  setScreen: (screen: string) => void;
  winner: IWinner | null;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ setScreen, winner }) => {
  const { gameState, socketId, setGameState, setRoomState, setLastMessage } = useWebSocket(); // Acessando o userId do contexto WebSocket
  const [winnerPosition, setWinnerPosition] = useState<number | null>(null);
  const [playerPosition, setPlayerPosition] = useState<number | null>(null);

    // Remove o prefixo "socket_" do id do player
    const playerId = socketId?.replace(/^socket_/, '');
  
    // Comparando o id do jogador com o id do vencedor
    const isWinner = winner?.id === playerId;

    useEffect(() => {
      if (gameState) {
        if (winner) {
          // Posição do vencedor
          setWinnerPosition(gameState?.players[`socket_${winner.id}`]?.defendingPlanetId);
        }
        // Posição do jogador atual
        setPlayerPosition(gameState?.players[`socket_${playerId}`]?.defendingPlanetId);
      }
  
      // Toca o som apropriado com base no resultado
      if (isWinner) {
        gameAudio.playVictorySound();
      } else {
        gameAudio.playDefeatSound();
      }
    }, [gameState, winner, playerId, isWinner]);

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
        {isWinner ? (
          <>
            <h1 className="game-over-title">Você venceu, {winner?.username}!</h1>
            {winnerPosition ? (
              <img src={`/assets/player${winnerPosition + 1}.svg`} alt="" style={{ maxWidth: '100px', height: 'auto' }} />
            ) : null}
            <h2 className="game-over-subtitle">Parabéns por salvar o seu planeta!!</h2>
          </>
        ) : (
          <>
            <h1 className="game-over-title">Seu planeta foi dizimado!</h1>
            {playerPosition !== null && (
              <img src={`/assets/player${playerPosition + 1}.svg`} alt="" style={{ maxWidth: '100px', height: 'auto' }} />
            )}
            <h2 className="game-over-subtitle">O vencedor dessa partida foi {winner?.username}!</h2>
          </>
        )}
        <Button
          className='button-menu'
          onClick={() => { gameAudio.playClickSound(); handleBackToMenu()}}
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