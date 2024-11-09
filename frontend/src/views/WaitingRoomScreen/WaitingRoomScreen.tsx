import './WaitingRoomScreen.css';
import Button from "@mui/joy/Button";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const WaitingRoomScreen: React.FC<ScreenProps> = ({ setScreen }) => {
  const { startGame, socketId, roomState, toggleReadyStatus, removePlayer, closeRoom, leaveRoom, lastMessage } = useWebSocket();
  const [loading, setLoading] = useState(true);  // Mantemos o loading como true inicialmente
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'youLeft' || lastMessage.type === 'roomClosed' || lastMessage.type === 'youAreRemoved')) {
      setScreen('join-room');
      return;
    }
    // Configura o timeout para 5 segundos
    const timeoutId = setTimeout(() => {
      /* if (!roomState) {
        console.log("Não foi possível carregar a sala ou o usuário não pertence a ela");
        setScreen('create-room'); // Redireciona ou notifica
      } */
      setLoading(false); // Desativa o loading após a verificação
    }, 5000);

    // Se `roomState` for recebido antes do timeout, limpa o timeout e desativa o loading
    if (roomState) {
      setLoading(false);
      clearTimeout(timeoutId);

      // Define `isHost` com base no estado atual da sala
      setIsHost(roomState.host === socketId);
    }

    // Cleanup para evitar vazamentos de memória ao desmontar o componente
    return () => clearTimeout(timeoutId);
  }, [roomState, socketId, setScreen, lastMessage]);

  useEffect(() => {
    if (!roomState) return;
    if (roomState.status === 'inprogress') {
      setScreen('game');

      setLoading(false);
      setIsHost(false); //Remover se apresentar algum problema.
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

  return (
    <div id="waiting-room">
      {/* Condicional de carregamento */}
      {loading ? (
        <div className="div-waiting-loading">
          <h2>Carregando...</h2>
        </div>
      ) : (
        <div className="div-waiting">
          <h2 className='title-create'>Sala de Espera</h2>

          {!roomState ? (
            <>
              <p>Não foi possível carregar a sala.</p>
              <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>
                Voltar
              </Button>
            </>
          ) : (
            <>
              <p>Id da sala: {roomState.roomId}</p>
              <p>Código da sala: {roomState.code}</p>
              <div className="player-list">
                <h3 className='title-create' style={{ margin: '10px' }}>Jogadores</h3>
                {roomState.players.map((player) => (
                  <div key={player.playerId} className="player-item">
                    <span>
                      {player.username} {player.isHost ? '[Host]' : ''} - {player.ready ? 'Pronto' : 'Aguardando'}
                    </span>

                    {player.playerId === socketId ? (
                      <Button variant="outlined" size="sm" onClick={() => handleToggleReady(roomState.roomId)}>
                        {player.ready ? 'Desmarcar Pronto' : 'Marcar Pronto'}
                      </Button>
                    ) : (
                      isHost && (
                        <Button variant="outlined" size="sm" color="danger" onClick={() => handleRemovePlayer(roomState.roomId, player.playerId)}>
                          Remover
                        </Button>
                      )
                    )}
                  </div>
                ))}

                {[...Array(4 - roomState.players.length)].map((_, index) => (
                  <p key={`waiting-${index}`}>Aguardando {roomState.players.length + index + 1}º jogador</p>
                ))}
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
