import './MainMenu.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import React, { useEffect } from "react";
import { useWebSocket } from '../../context/WebSocketContext';
import { useNavigate } from 'react-router-dom';
import { logoutApi } from '../../api/logoutApi';



export const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { webSocketService, socketId } = useWebSocket();

  useEffect(() => {
    webSocketService.registerCallback('something', (data) => {
      console.log(`Something: ${data}`);
    });

  }, [webSocketService]);

  const handleLogout = async () => {
    const { success, error } = await logoutApi();

    if (error) {
      //TODO: Alerta
      console.error(error);
      return;
    }

    if (success) {
      console.log("Deslogado com sucesso");
      navigate('/login');
    }
  }

  return (
    <Box id="main-menu" sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2px',
    }}>
      <h1>Welcome to Main Menu!</h1>
      {socketId ? 'Socket Connected' : 'Socket not Connected'}
      <Button onClick={() => navigate('/game')}>Jogo - sem validação</Button>
      <Button>Criar partida</Button>
      <Button>Encontrar partida</Button>
      <Button onClick={handleLogout}>Logout</Button>
    </Box>
  );

};

