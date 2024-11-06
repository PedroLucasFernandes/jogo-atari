import './JoinRoomScreen.css'
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const JoinRoomScreen: React.FC<ScreenProps> = ({ setScreen }) => {
  const { rooms, getRooms, joinRoom, roomState } = useWebSocket();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Chama a função getRooms ao carregar a tela
    getRooms();
  }, []);

  const handleJoinRoom = () => {
    if (selectedRoomId && code) {
      joinRoom(selectedRoomId, code); // Passa o ID da sala e o código
      setLoading(true);
    }
  };

  useEffect(() => {
    if (!roomState) return;
    if (roomState.status === 'waiting') {
      setScreen('waiting-room');
      console.log("Movido para a sala de espera");

      setSelectedRoomId(null);
      setCode('');
      setOpenModal(false);
      setLoading(false);
    }
  }, [roomState])


  return (
    <Box id="join-room">
      <h2>Procurar sala</h2>

      <Button variant="solid" size="md" onClick={() => setScreen('main-menu')}>
        Voltar ao menu
      </Button>

      <Box sx={{ mt: 2 }}>
        {(!rooms || rooms.length === 0) ? (
          <p>Nenhuma sala disponível.</p>
        ) : (
          rooms.map(room => {
            // Encontre o jogador que é o host
            const hostPlayer = room.players.find(player => player.isHost);
            const hostUsername = hostPlayer ? hostPlayer.username : 'Desconhecido';

            return (
              <Box key={room.roomId} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
                <p><strong>ID da sala:</strong> {room.roomId}</p>
                <p><strong>Host:</strong> {hostUsername}</p>
                <p><strong>Jogadores:</strong> {room.players.length}/4</p>
                <Button
                  variant="outlined"
                  size="md"
                  onClick={() => {
                    setSelectedRoomId(room.roomId);
                    setOpenModal(true); // Abre o modal
                  }}
                  disabled={room.players.length === 4}
                >
                  Entrar na sala
                </Button>
              </Box>
            );
          })
        )}
      </Box>

      {/* Modal para inserir o código da sala */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Entrar na Sala</DialogTitle>
        <DialogContent>
          <Input
            placeholder="Insira o código da sala"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button onClick={handleJoinRoom} disabled={!code}>Entrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}