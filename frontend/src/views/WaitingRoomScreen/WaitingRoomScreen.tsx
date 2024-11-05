import './WaitingRoomScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const WaitingRoomScreen: React.FC<ScreenProps> = ({ setScreen }) => {
  const { startGame, socketId, roomState, closeRoom, leaveRoom } = useWebSocket();
  const [loading, setLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Inicia o estado de carregamento
    setLoading(true);

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


  const handleStartGame = () => {
    if (isHost) {
      setLoading(true);
      startGame();
    } else {
      console.log("Apenas o host pode iniciar o jogo.");
    }
  };

  const handleLeaveRoom = () => {
    //TODO: Loading
    console.log("Leave room ainda não implementado");
    //leaveRoom();
  };

  const handleCloseRoom = () => {
    if (isHost) {
      //TODO: Loading

      console.log("Close room ainda não implementado");
      //closeRoom();
    } else {
      console.log("Apenas o host pode iniciar o jogo.");
    }
  }



  return (
    <Box id="waiting-room">
      <h2>Sala de espera</h2>

      {loading && <p>Carregando...</p>}

      {!loading && roomState && (
        <>
          <Box sx={{ mt: 2 }}>
            <p>Id da sala: {roomState.roomId}</p>
          </Box>
          <Box sx={{ mt: 2 }}>
            {/* Exibir os jogadores existentes */}
            {roomState.players.map((player, index) => (
              <p key={player.playerId}>
                {index + 1}º jogador: {player.username}
                {player.isHost ? ' [Host]' : ''}
              </p>
            ))}

            {/* Exibir placeholders para jogadores ausentes */}
            {[...Array(4 - roomState.players.length)].map((_, index) => (
              <p key={`waiting-${index}`}>Aguardando {roomState.players.length + index + 1}º jogador</p>
            ))}
          </Box>

          <Box>
            {/* Botão para sair da sala */}
            <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>Sair da sala</Button>

            {/* Exibir o botão de iniciar jogo apenas para o host */}
            {isHost && (
              <>
                <Button variant="solid" size="md" onClick={handleCloseRoom}>Cancelar sala</Button>
                <Button variant="solid" size="md" onClick={handleStartGame}>Iniciar jogo</Button>
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