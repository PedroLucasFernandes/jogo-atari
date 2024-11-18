import './CreateRoomScreen.css'
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import CustomInput from '../../components/CustomInput/CustomInput';
import { gameAudio } from '../../utils/audioManager';
import { LogoutButton } from '../../components/LogoutButton/LogoutButton';
import { SoundToggleButton } from '../../components/SoundToggleButton/SoundToggleButton';

interface CreateRoomScreenProps {
    setScreen: (screen: string) => void;
}

const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({ setScreen }) => {
    const [roomCode, setRoomCode] = useState('');
    const { createRoom, roomState } = useWebSocket();
    const [loading, setLoading] = useState(false);

    const handleCreateRoom = () => {
        if (!roomCode) return;
        setLoading(true);
        createRoom(roomCode);
        //setScreen('game');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCreateRoom();
        }
    };

    useEffect(() => {
        if (!roomState) return;
        if (roomState.status === 'waiting') {
            setScreen('waiting-room');
            setRoomCode('');
            setLoading(false);
        }
    }, [roomState])

    return (
        <div id="create-room">
            <LogoutButton />
            <SoundToggleButton />
            <div className='square-create-room'>
            <h2 className="title-create">Criar sala</h2>
            <p style={{fontFamily: '"Tilt Neon", sans-serif', fontSize: '1rem', margin: '15px', width: '15vw', textAlign: 'center', color: '#11205F'
            }}>Informe um código para criar uma sala</p>

            <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyDown={handleKeyDown} 
                placeholder="Código"
                className="input-create"
                maxLength={6}
                style={{margin: '15px', fontFamily: '"Tilt Neon", sans-serif', fontSize: '2.5vh'}}
            />

                <button
                    onClick={() => { gameAudio.playClickSound(); handleCreateRoom(); }}
                    className="button-create"
                    disabled={!roomCode || loading}
                >
                    Criar nova sala
                </button>
            <button className="button-back" onClick={() => setScreen('main-menu')}>Voltar ao menu</button>
            </div>
        </div>
    );
};

export default CreateRoomScreen;