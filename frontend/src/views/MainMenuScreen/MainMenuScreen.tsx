import './MainMenuScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import AccountCircle from '@mui/icons-material/AccountCircle';
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useWebSocket } from '../../context/WebSocketContext';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { logoutApi } from '../../api/logoutApi';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Input from '@mui/joy/Input';
import DialogActions from '@mui/joy/DialogActions';
import { gameAudio } from '../../utils/audioManager';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const MainMenuScreen: React.FC<ScreenProps> = ({ setScreen }) => {
  const navigate = useNavigate();
  const { webSocketService, socketId, checkGameInProgress, roomState, gameState, leaveGame } = useWebSocket();
  const [showLogout, setShowLogout] = useState(false);
  const { user, setUser } = useUser();
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    webSocketService.registerCallback('something', (data) => {
    });

  }, [webSocketService]);

  useEffect(() => {
    if (!socketId) return;
    checkGameInProgress();
  }, [socketId]);

  useEffect(() => {
    if (!roomState || !gameState) return
    setOpenModal(true);

  }, [roomState, gameState])

  const handleLogout = async () => {
    const { success, error } = await logoutApi();

    if (error) {
      //TODO: Alerta
      console.error(error);
      return;
    }

    if (success) {
      console.log("Deslogado com sucesso");
      setUser(null);
      navigate('/');
    }
  }

  const handleAbandon = () => {
    if (!roomState) {
      setOpenModal(false);
      return;
    }
    leaveGame(roomState.roomId);
    setOpenModal(false);
  }

  const handleRejoin = () => {
    gameAudio.startBackgroundMusic();
    setScreen('game');
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
          <Button onClick={handleLogout} className='button-menu'>Logout</Button>
        </div>
      )}

      <div id='modal'>
        <h1 className='title-main-menu'>Olá, navegante {user?.username}!</h1>
        <h2 className='title-main-menu-2'>Qual será a aventura de hoje?</h2>
        <Button className='button-menu'
          onClick={() => setScreen('create-room')}
          sx={{ backgroundColor: '#9D00FF', color: 'white', '&:hover': { backgroundColor: '#8900ab' },fontFamily: '"Tilt Neon", sans-serif', fontSize: '2.5vh', borderRadius: '2rem', border: '1.6px solid #11205F' }}
        >
          Criar partida
        </Button>
        <Button className='button-menu'
          onClick={() => setScreen('join-room')}
          sx={{ backgroundColor: '#FF0062', color: 'white', '&:hover': { backgroundColor: '#d10065' },fontFamily: '"Tilt Neon", sans-serif', fontSize: '2.5vh', borderRadius: '2rem', border: '1.6px solid #11205F' }}
        >
          Encontrar partida
        </Button>
        <Button className='button-menu'
          onClick={() => setScreen('ranking-room')}
          sx={{ backgroundColor: '#03B46D', color: 'white', '&:hover': { backgroundColor: '#006400' }, fontFamily: '"Tilt Neon", sans-serif', fontSize: '2.5vh', borderRadius: '2rem', border: '1.6px solid #11205F' }}
        >
          Ranking
        </Button>
      </div>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Entrar na Sala</DialogTitle>
        <DialogContent>
          <p>Você está em uma partida em andamento, deseja continuá-la?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAbandon}>Abandonar</Button>
          <Button onClick={handleRejoin}>Continuar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};