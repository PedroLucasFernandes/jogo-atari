import './JoinRoomScreen.css';
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
    getRooms();
  }, []);

  const handleJoinRoom = () => {
    if (selectedRoomId && code) {
      joinRoom(selectedRoomId, code);
      setLoading(true);
    }
  };

  useEffect(() => {
    if (!roomState) return;
    if (roomState.status === 'waiting') {
      setScreen('waiting-room');
      setSelectedRoomId(null);
      setCode('');
      setOpenModal(false);
      setLoading(false);
    }
  }, [roomState]);

  return (
    <div id="join-room">
  <div className="div-join">
    <h2 className="title-join">Procurar sala</h2>

    {/* Div de rolagem para lista de salas */}
    <div className="scrollable-room-list">
      {(!rooms || rooms.length === 0) ? (
        <p className="p-join">Nenhuma sala disponível.</p>
      ) : (
        rooms.map(room => {
          const hostPlayer = room.players.find(player => player.isHost);
          const hostUsername = hostPlayer ? hostPlayer.username : 'Desconhecido';

          return (
            <div key={room.roomId} className="room-item">
              <div className='room-item-2'>
                <p><strong className='title-strong'>ID da sala:</strong> {room.roomId} | <strong className='title-strong'>Host:</strong> {hostUsername} | <strong className='title-strong'>Jogadores:</strong> {room.players.length}/4 </p>
                <p style={{color: "#4C3C7F"}}><strong>Status:</strong>
                  {room.status === 'waiting'
                    ? 'Aguardando jogadores'
                    : room.status === 'inprogress'
                      ? 'Em andamento'
                      : 'Não identificado'}
                </p>
              </div>
              <button className='button-search-room-2'
                onClick={() => {
                  setSelectedRoomId(room.roomId);
                  setOpenModal(true);
                }}
                disabled={room.players.length === 4}
              >
                Entrar na sala
              </button>
            </div>
          );
        })
      )}
    </div>

    {/* Dialog para entrar na sala */}
    <Dialog open={openModal} onClose={() => setOpenModal(false)} className="custom-dialog">
      <DialogTitle className="custom-dialog-title">Entrar na Sala</DialogTitle>
      <DialogContent className="custom-dialog-content">
        <Input
          placeholder="Insira o código da sala"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions className="custom-dialog-actions">
        <button className="button-search-room" onClick={() => setOpenModal(false)}>Cancelar</button>
        <button className="button-search-room" onClick={handleJoinRoom} disabled={!code}>Entrar</button>
      </DialogActions>
    </Dialog>

    {/* Botão para voltar ao menu */}
    <button className='button-search-room' onClick={() => setScreen('main-menu')}>
      Voltar ao menu
    </button>
  </div>
</div>

  );
};
