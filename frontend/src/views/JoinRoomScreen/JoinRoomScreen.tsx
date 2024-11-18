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
import Toast from '../../components/Toast/Toast';
import { LogoutButton } from '../../components/LogoutButton/LogoutButton';
import { SoundToggleButton } from '../../components/SoundToggleButton/SoundToggleButton';
import { gameAudio } from '../../utils/audioManager';

interface ScreenProps {
  setScreen: Dispatch<SetStateAction<string>>;
}

export const JoinRoomScreen: React.FC<ScreenProps> = ({ setScreen }) => {
  const { rooms, getRooms, joinRoom, roomState, lastMessage } = useWebSocket();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('#ff0000');

  const showToast = (message: string, color: string = '#ff0000') => {
    setToastMessage(message)
    setToastColor(color)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 1500)
  }

  useEffect(() => {
    getRooms(); // Fixar dessa forma pois possui um observer definido
  }, []);

  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        setLoading(false)
        showToast('Tempo esgotado ao tentar entrar na sala', '#ff0000')
      }, 5000)
      return () => clearTimeout(timeoutId)
    }
  }, [loading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      gameAudio.playClickSound();
      validate();
    }
  };

  useEffect(() => {
    if (roomState && roomState.roomId === selectedRoomId) {
      if (roomState.status === 'waiting') {
        setScreen('waiting-room')
        resetModalState()
      }
    }

    if (lastMessage?.type === 'error') {
      const message = lastMessage.data?.message === 'Código inválido'
        ? 'Código inválido'
        : 'Erro ao entrar na sala'
      showToast(message, '#ff0000')
      setLoading(false)
    }

    if (lastMessage?.type === 'success') {
      showToast('Código inválido', '#ff0000')
      setLoading(false)
    }
  }, [roomState, lastMessage, setScreen, selectedRoomId])

  const resetModalState = () => {
    setSelectedRoomId(null)
    setCode('')
    setOpenModal(false)
    setLoading(false)
  }



  const validate = (roomId?: string) => {
    console.log("oi");
    const id = selectedRoomId || roomId;

    if (!rooms || rooms.length === 0) {
      showToast('Nenhuma sala disponível', '#ff0000');
      return;
    }
    console.log("1", selectedRoomId);
    const room2 = rooms.find(r => r.roomId === id);

    if (!room2) {
      showToast('Selecione uma sala e insira o código', '#ff0000');
      return;
    }
    console.log("2");
    if (!code && room2.hasCode) {
      showToast('Selecione uma sala e insira o código', '#ff0000');
      return;
    }
    console.log("3");
    const originalcode = room2?.code;
    console.log(originalcode);
    console.log(room2);
    console.log(room2?.code);

    // Tenta entrar na sala
    joinRoom(room2.roomId, code);

    // Verifica o estado do último erro ou sucesso
    if (lastMessage?.type === 'error') {
      const message = lastMessage.data.message || 'Ocorreu um erro desconhecido';
      showToast(message, '#ff0000');
    } else if (lastMessage?.type === 'success') {
      const message = lastMessage.data.message || 'Operação realizada com sucesso';
      showToast(message, '#00ff00');
    }
  };

  const handleOpenModal = (roomId: string) => {
    if (!rooms) return;
    const room = rooms.find(r => r.roomId === roomId);

    if (!room) return;

    if (room.hasCode) {
      gameAudio.playClickSound();
      setSelectedRoomId(roomId);
      setOpenModal(true);
    } else {
      setSelectedRoomId(roomId);
      validate(roomId);
    }
  }

  return (
    <div id="join-room">
      <LogoutButton />
      <SoundToggleButton />
      <div className="div-join">
        <h2 className="title-join">Procurar sala</h2>
        <div className="scrollable-room-list">
          {(!rooms || rooms.length === 0) ? (
            <p className="p-join">Nenhuma sala disponível.</p>
          ) : (
            rooms.map(room => {
              const hostPlayer = room.players?.find(player => player.isHost);
              const hostUsername = hostPlayer ? hostPlayer.username : 'Desconhecido';

              return (
                <div key={room.roomId} className="room-item">
                  <div className='room-item-2'>
                    <p>
                      <strong className='title-strong'>ID da sala:</strong> {room.roomId} |
                      <strong className='title-strong'>Host:</strong> {hostUsername} |
                      <strong className='title-strong'>Jogadores:</strong> {room.players.length}/4
                    </p>
                    <p style={{ color: "#4C3C7F" }}>
                      <strong>Status:</strong> {room.status === 'waiting' ? 'Aguardando jogadores' : room.status === 'inprogress' ? 'Em andamento' : 'Não identificado'}
                    </p>
                  </div>
                  <button
                    className='button-search-room-2'
                    onClick={() => {
                      handleOpenModal(room.roomId)
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

        <Dialog open={openModal} onClose={() => setOpenModal(false)} className="custom-dialog">
          <DialogTitle className="custom-dialog-title" sx={{ fontFamily: '"Chewy", system-ui', fontSize: '3.5vh', marginBottom: '1.5vh', color: '#11205f' }}>Entrar na Sala</DialogTitle>
          <DialogContent className="custom-dialog-content">
            <Input
              placeholder="Insira o código da sala"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
              sx={{ fontFamily: '"Tilt Neon", sans-serif', fontSize: '3vh', maxWidth: '15vw', alignSelf: 'center', borderRadius: '2rem' }}
            />
          </DialogContent>
          <DialogActions className="custom-dialog-actions">
            <button
              className="button-search-room-3"
              onClick={() => validate()}
              disabled={!code || loading}
              style={{ backgroundColor: '#00a447' }}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </button>
            <button className="button-search-room-3" onClick={() => { gameAudio.playClickSound(); setOpenModal(false); }}>Cancelar</button>
          </DialogActions>
        </Dialog>

        <button className='button-search-room' onClick={() => { gameAudio.playClickSound(); setScreen('main-menu'); }}>
          Voltar ao menu
        </button>
      </div>
      <Toast message={toastMessage} color={toastColor} isActive={toastVisible} />
    </div>
  );
};
