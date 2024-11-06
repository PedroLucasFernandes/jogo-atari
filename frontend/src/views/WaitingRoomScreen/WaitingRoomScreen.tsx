import './WaitingRoomScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const WaitingRoomScreen: React.FC<ScreenProps> = ({ setScreen }) => {
  const { startGame, socketId, roomState, toggleReadyStatus, removePlayer, closeRoom, leaveRoom } = useWebSocket();
  const [loading, setLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Inicia o estado de carregamento
    setLoading(true);

    console.log("estado de carregamento", JSON.stringify(roomState));

    // Configura o timeout para 5 segundos
    const timeoutId = setTimeout(() => {
      if (!roomState) {
        console.log("Não foi possível carregar a sala ou o usuário não pertence a ela");
        setScreen('lobby-screen'); // Redireciona ou notifica
      }
      setLoading(false); // Desativa o loading após a verificação
    }, 5000);

    // Se `gameState` for recebido antes do timeout, limpa o timeout e desativa o loading
    if (roomState) {
      setLoading(false);
      clearTimeout(timeoutId);

      // Define `isHost` com base no estado atual da sala
      setIsHost(roomState.host === socketId);
    }

    // Cleanup para evitar vazamentos de memória ao desmontar o componente
    return () => clearTimeout(timeoutId);
  }, [roomState, socketId, setScreen]);

  useEffect(() => {
    if (!roomState) return;
    if (roomState.status === 'inprogress') {
      setScreen('game');
      console.log("RoomState status inprogress")

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
    //TODO: Loading
    leaveRoom(roomId);
  };

  const handleCloseRoom = (roomId: string) => {
    if (isHost) {
      //TODO: Loading
      closeRoom(roomId);
    } else {
      console.log("Apenas o host pode iniciar o jogo.");
    }
  }



  return (
    <Box id="waiting-room">
      <h2>Sala de Espera</h2>

      {!roomState ? (
        <p>Carregando...</p>
      ) : (
        <>
          <Box sx={{ mt: 2 }}>
            <p>Id da sala: {roomState.roomId}</p>
          </Box>
          <Box sx={{ mt: 2 }}>
            <h3>Jogadores</h3>
            {roomState.players.map((player) => (
              <Box key={player.playerId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
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
              </Box>
            ))}

            {[...Array(4 - roomState.players.length)].map((_, index) => (
              <p key={`waiting-${index}`}>Aguardando {roomState.players.length + index + 1}º jogador</p>
            ))}
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="solid" size="md" onClick={() => handleLeaveRoom(roomState.roomId)}>
              Sair da sala
            </Button>

            {isHost && (
              <>
                <Button variant="solid" size="md" onClick={() => handleCloseRoom(roomState.roomId)}>
                  Cancelar sala
                </Button>
                <Button
                  variant="solid"
                  size="md"
                  onClick={() => handleStartGame(roomState.roomId)}
                  disabled={!roomState.players.every(player => player.ready)}
                >
                  Iniciar jogo
                </Button>
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}


{/* <Box sx={{ mt: 2 }}>
  {Object.entries(gameState.players).map(([id, player], index) => (
    <p key={id}>{index + 1}º jogador: {player.username}{id === gameState.room.host ? ' [Host]' : ''}</p>
  ))}

  {[...Array(4 - Object.keys(gameState.players).length)].map((_, index) => (
    <p key={`waiting-${index}`}>Aguardando {Object.keys(gameState.players).length + index + 1}º jogador</p>
  ))}
</Box> */}