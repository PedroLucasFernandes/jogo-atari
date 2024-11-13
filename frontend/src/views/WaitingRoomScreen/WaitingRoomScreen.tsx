import './WaitingRoomScreen.css';
import Button from "@mui/joy/Button";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const WaitingRoomScreen: React.FC<ScreenProps> = ({ setScreen }) => {
  const { startGame, socketId, roomState, toggleReadyStatus, removePlayer, closeRoom, leaveRoom, lastMessage, setLastMessage } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'youLeft' || lastMessage.type === 'roomClosed' || lastMessage.type === 'youAreRemoved')) {
      setLastMessage(null);
      setScreen('join-room');
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    if (roomState) {
      setLoading(false);
      clearTimeout(timeoutId);
      setIsHost(roomState.host === socketId);
    }

    return () => clearTimeout(timeoutId);
  }, [roomState, socketId, setScreen, lastMessage]);

  useEffect(() => {
    if (roomState && roomState.status === 'inprogress') {
      setScreen('game');
      setLoading(false);
      setIsHost(false);
    }
  }, [roomState, roomState?.status, setScreen]);

  const handleStartGame = (roomId: string) => {
    if (!roomState) return;
    if (isHost && roomState.players.every(player => player.ready)) {
      setLoading(true);
      startGame(roomId);
    } else {
      console.log("Apenas o host pode iniciar o jogo, e todos os jogadores devem estar prontos.");
    }
  };

  const handleToggleReady = (roomId: string) => {
    if (!roomState) return;
    toggleReadyStatus(roomId);
  };

  const handleRemovePlayer = (roomId: string, playerId: string) => {
    if (!roomState) return;
    if (isHost && playerId !== roomState.host) {
      removePlayer(roomId, playerId);
    }
  };

  const handleLeaveRoom = (roomId: string) => {
    leaveRoom(roomId);
  };

  const handleCloseRoom = (roomId: string) => {
    if (isHost) {
      closeRoom(roomId);
    } else {
      console.log("Apenas o host pode iniciar o jogo.");
    }
  };

  const avatarAssets = [
    '/assets/player1.svg', 
    '/assets/player2.svg', 
    '/assets/player3.svg', 
    '/assets/player4.svg'
  ];

  return (
    <div id="waiting-room">
      {loading ? (
        <div className="div-waiting-loading">
          <h2>Carregando...</h2>
        </div>
      ) : (
        <div className="div-waiting">
          <h2 className='title-create'>Sala de Espera</h2>

          {!roomState ? (
            <>
              <p className='p-waiting'>Não foi possível carregar a sala.</p>
              <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>
                Voltar
              </Button>
            </>
          ) : (
            <>
              <p className='p-waiting'>Id da sala: {roomState.roomId} | Código da sala: {roomState.code}</p>
              <div className="player-list">
  {avatarAssets.map((avatar, index) => {
    const player = roomState.players[index];
    return (
      <div key={index} className="player-item">
        <img src={avatar} alt={`Avatar do jogador ${index + 1}`} className="image" />
        <span className="player-name" style={{fontFamily: '"Chewy", system-ui', fontSize: '2.5vh'}}>
          {player ? player.username : `Jogador ${index + 1}`} - {player?.ready ? 'Pronto' : 'Aguardando'}
        </span>

        {player?.isHost && (
          <span className="host-crown-container">
            <img src="/assets/crown-svgrepo-com.svg" alt="Coroa de Host" className="host-crown" />
          </span>
        )}

        {player?.playerId === socketId ? (
          <Button
          variant="outlined"
          size="sm"
          onClick={() => handleToggleReady(roomState.roomId)}
          sx={{
            backgroundColor: '#FF0062',
            color: 'white',
            border: '1.2px solid #11205F',
            opacity: 0.8, 
            '&:hover': {
              backgroundColor: '#d10065',
              opacity: 1, 
            },
            fontFamily: '"Tilt Neon", sans-serif',
            fontSize: '2.5vh',
            fontWeight:'300',
            borderRadius: '2rem'
          }}
        >
          {player.ready ? 'Desmarcar Pronto' : 'Marcar Pronto'}
        </Button>
        
        ) : (
          isHost && player && (
            <Button variant="outlined" size="sm" color="danger" onClick={() => handleRemovePlayer(roomState.roomId, player.playerId)}>
              Remover
            </Button>
          )
        )}
      </div>
    );
  })}
</div>



              <div className="buttons">
                <button className='button-waiting-final' onClick={() => handleLeaveRoom(roomState.roomId)}>
                  Sair da sala
                </button>

                {isHost && (
                  <>
                    <button className='button-waiting-final' onClick={() => handleCloseRoom(roomState.roomId)}>
                      Cancelar sala
                    </button>
                    <button
                      className='button-waiting-final'
                      onClick={() => handleStartGame(roomState.roomId)}
                      disabled={!roomState.players.every(player => player.ready)}
                    >
                      Iniciar jogo
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
