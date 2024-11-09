import React from 'react';
import './GameOverScreen.css';
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { IWinner } from '../../interfaces/game';

interface GameOverScreenProps {
  setScreen: (screen: string) => void;
  winner: IWinner | null;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ setScreen, winner }) => {
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
        <h2 className="game-over-subtitle">Parabéns por salvar o seu planeta!!</h2>
        <Button
          className='button-menu'
          onClick={() => setScreen('main-menu')}
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
