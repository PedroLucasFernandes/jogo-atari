import './CreateRoomScreen.css'
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import CustomInput from '../../components/CustomInput/CustomInput';

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
            <div className='square-create-room'>
            <h2 className="title-create">Criar sala</h2>
            <p style={{fontFamily: '"Tilt Neon", sans-serif', fontSize: '3vh', margin: '15px', width: '15vw', textAlign: 'center', color: '#11205F'
            }}>Informe um código para criar uma sala</p>

            <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Código"
                className="input-create"
                maxLength={6}
                style={{margin: '15px', fontFamily: '"Tilt Neon", sans-serif', fontSize: '2.5vh'}}
            />

                <button
                    onClick={handleCreateRoom}
                    className="button-create"
                    disabled={!roomCode || loading}
                    style={{backgroundColor: "#00a447", borderRadius: '2rem',  border: '1.6px solid #11205F'}}
                >
                    Criar nova sala
                </button>
            <button className="button-create" style={{borderRadius: '2rem', border: '1.6px solid #11205F'}} onClick={() => setScreen('main-menu')}>Voltar ao menu</button>
            </div>

        </div>
    );
};

export default CreateRoomScreen;