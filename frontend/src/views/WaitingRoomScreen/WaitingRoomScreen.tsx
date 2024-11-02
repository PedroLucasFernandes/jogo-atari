import './WaitingRoomScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const WaitingRoomScreen: React.FC<ScreenProps> = ({ setScreen }) => {
  const { startGame, gameState } = useWebSocket();

  const handleStartGame = () => {
    startGame();
    //TODO: Loading
  };

  useEffect(() => {
    if (gameState) {
      setScreen('game');
      console.log("Game screen setada");
    }
  }, [gameState]);

  return (
    <Box id="waiting-room">
      <h2>Sala de espera</h2>

      <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>Sair da sala</Button>
      <Button variant="solid" size="md" onClick={handleStartGame}>Iniciar jogo - Teste Websocket</Button>
    </Box>
  );
}