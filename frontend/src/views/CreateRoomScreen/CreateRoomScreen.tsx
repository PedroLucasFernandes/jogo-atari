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
            <p>Informe um código para criar uma sala</p>

            <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Código"
                className="input-create"
                maxLength={6}
            />

                <button
                    onClick={handleCreateRoom}
                    className="button-create"
                    disabled={!roomCode || loading}
                    style={{backgroundColor: "#00a447"}}
                >
                    Criar nova sala
                </button>
            <button className="button-create" onClick={() => setScreen('main-menu')}>Voltar ao menu</button>
            </div>

        </div>
    );
};

export default CreateRoomScreen;