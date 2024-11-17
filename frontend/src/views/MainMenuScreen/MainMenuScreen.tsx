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

  gameAudio.stopAll();

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
    <Box id="main-menu">
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
          <Button onClick={handleLogout} className='button-menu neon-button'>Logout</Button>
        </div>
      )}

      {/* <div id='modal'>
        <h1 className='title-main-menu'>Olá, navegante {user?.username}!</h1>
        <h2 className='title-main-menu-2'>Qual será a aventura de hoje?</h2>
        <Button className='button-menu neon-button-1'
          onClick={() => setScreen('create-room')}
          sx={{ backgroundColor: '#a721fa', color: 'white', boxShadow: '0 0 15px rgba(157, 0, 255, 0.7), inset 0 0 10px rgba(157, 0, 255, 0.6)', '&:hover': { backgroundColor: '#8900ab' , boxShadow: '0 0 25px rgba(157, 0, 255, 1), 0 0 35px rgba(157, 0, 255, 0.8)' }}}
        >
          Criar partida
        </Button>
        <Button className='button-menu neon-button-2'
          onClick={() => setScreen('join-room')}
          sx={{ backgroundColor: '#fd68a1', color: 'white', boxShadow: '0 0 15px rgba(255, 0, 98, 0.7), inset 0 0 10px rgba(255, 0, 98, 0.6)', '&:hover': { backgroundColor: '#d10065' , boxShadow: '0 0 25px rgba(255, 0, 98, 1), 0 0 35px rgba(255, 0, 98, 0.8)' }}}
        >
          Encontrar partida
        </Button>
        <Button className='button-menu neon-button-3'
          onClick={() => setScreen('ranking-room')}
          sx={{ backgroundColor: '#03B46D', color: 'white', boxShadow: '0 0 15px rgba(3, 180, 109, 0.7), inset 0 0 10px rgba(3, 180, 109, 0.6)', '&:hover': { backgroundColor: '#006400' , boxShadow: '0 0 25px rgba(3, 180, 109, 1), 0 0 35px rgba(3, 180, 109, 0.8)' }}}
        >
          Ranking
        </Button>
      </div> */}

      <div id='modal' className="relative min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-4 overflow-hidden">
  {/* Efeito de fundo estrelado */}
  <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

  {/* Conteúdo do modal */}
  <div className="modal-content">
    <h1 className='title-main-menu'>Olá, navegante {user?.username}!</h1>
    <h2 className='title-main-menu-2'>Qual será a aventura de hoje?</h2>

    <Button className='button-menu neon-button-1'
      onClick={() => setScreen('create-room')}
      sx={{
        backgroundColor: '#a721fa',
        color: 'white',
        padding: '10px',
        boxShadow: '0 0 15px rgba(157, 0, 255, 0.7), inset 0 0 10px rgba(157, 0, 255, 0.6)',
        '&:hover': {
          backgroundColor: '#8900ab',
          boxShadow: '0 0 25px rgba(157, 0, 255, 1), 0 0 35px rgba(157, 0, 255, 0.8)'
        }
      }}
    >
      Criar partida
    </Button>

    <Button className='button-menu neon-button-2'
      onClick={() => setScreen('join-room')}
      sx={{
        backgroundColor: '#fd68a1',
        color: 'white',
        padding: '10px',
        boxShadow: '0 0 15px rgba(255, 0, 98, 0.7), inset 0 0 10px rgba(255, 0, 98, 0.6)',
        '&:hover': {
          backgroundColor: '#d10065',
          boxShadow: '0 0 25px rgba(255, 0, 98, 1), 0 0 35px rgba(255, 0, 98, 0.8)'
        }
      }}
    >
      Encontrar partida
    </Button>

    <Button className='button-menu neon-button-3'
      onClick={() => setScreen('ranking-room')}
      sx={{
        backgroundColor: '#03B46D',
        color: 'white',
        padding: '10px',
        boxShadow: '0 0 15px rgba(3, 180, 109, 0.7), inset 0 0 10px rgba(3, 180, 109, 0.6)',
        '&:hover': {
          backgroundColor: '#006400',
          boxShadow: '0 0 25px rgba(3, 180, 109, 1), 0 0 35px rgba(3, 180, 109, 0.8)'
        }
      }}
    >
      Ranking
    </Button>
  </div>

  {/* Estilos personalizados */}
  <style>{`
    .modal-background {
      position: relative;
      padding: 20px;
      border-radius: 15px;
      overflow: hidden;
      background-color: rgba(0, 0, 0, 0.5); /* Fundo preto semi-transparente */
    }

    #modal h1,
    #modal h2 {
      color: #ffffff;
    }

   .stars, .twinkling {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
        }

        .stars {
          background: #000 url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png') repeat top center;
          z-index: 0;
        }

        .twinkling {
          background: transparent url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/twinkling.png') repeat top center;
          z-index: 1;
          animation: move-twink-back 200s linear infinite;
        }

        @keyframes move-twink-back {
          from {background-position: 0 0;}
          to {background-position: -10000px 5000px;}
        }

      .modal-content {
           position: relative;
    z-index: 2;
    text-align: center;
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
      }
  `}</style>
</div>


      <Dialog open={openModal} onClose={(event, reason) => {
        if (reason === "backdropClick") return; // Ignora o fechamento ao clicar fora para evitar fechar sem sair da sala
        setOpenModal(false);
      }} className="custom-dialog">
        <DialogTitle className="custom-dialog-title" sx={{ fontFamily: '"Chewy", system-ui', fontSize: '3.5vh', marginBottom: '1.5vh', color: '#11205f' }}>Entrar na Sala</DialogTitle>
        <DialogContent sx={{ fontFamily: '"Tilt Neon", sans-serif', fontSize: '3vh', maxWidth: '22vw', alignSelf: 'center', borderRadius: '2rem', textAlign: 'center', width: '25vw' }}>
          <p>Você está em uma partida em andamento, deseja continuá-la?</p>
        </DialogContent>
        <DialogActions>
          <button className="button-search-room-3 neon-button" onClick={handleAbandon}>Abandonar</button>
          <button className="button-search-room-3 neon-button" onClick={handleRejoin}>Continuar</button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};