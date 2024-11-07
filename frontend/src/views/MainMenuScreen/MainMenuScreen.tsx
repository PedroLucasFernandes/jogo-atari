import './MainMenuScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import AccountCircle from '@mui/icons-material/AccountCircle';
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useWebSocket } from '../../context/WebSocketContext';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { logoutApi } from '../../api/logoutApi';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const MainMenuScreen: React.FC<ScreenProps> = ({ setScreen }) => {
  const navigate = useNavigate();
  const { webSocketService, socketId } = useWebSocket();
  const [showLogout, setShowLogout] = useState(false);
  const { user } = useUser();

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
      navigate('/');
    }
  }

  return (
    <Box id="main-menu" sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2px',
      position: 'relative',
    }}>

      <Box
        onClick={() => setShowLogout(!showLogout)}
        sx={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          cursor: 'pointer',
          color: 'white',
          zIndex: 10,
        }}
      >
        <AccountCircle fontSize="large" />
      </Box>

      {showLogout && (
        <div id="logout-button" style={{
          position: 'fixed',
          top: '60px',
          right: '16px',
          zIndex: 9,
        }}>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      )}

      <div id='modal'>
        <h1>Olá, navegante {user?.username}!</h1>
        <h2>Qual será a aventura de hoje?</h2>
        {socketId ? 'Socket Connected' : 'Socket not Connected'}
        <Button onClick={() => navigate('/game')}>Jogo - sem validação</Button>
        <Button
          onClick={() => setScreen('create-room')}
          sx={{ backgroundColor: '#9D00FF', color: 'white', '&:hover': { backgroundColor: '#ff69b4' } }}
        >
          Criar partida
        </Button>
        <Button
          onClick={() => setScreen('join-room')}
          sx={{ backgroundColor: '#FF0062', color: 'white', '&:hover': { backgroundColor: '#800080' } }}
        >
          Encontrar partida
        </Button>
        <Button
          onClick={() => setScreen('ranking-room')}
          sx={{ backgroundColor: '#03B46D', color: 'white', '&:hover': { backgroundColor: '#006400' } }}
        >
          Ranking
        </Button>
      </div>

    </Box>
  );
};