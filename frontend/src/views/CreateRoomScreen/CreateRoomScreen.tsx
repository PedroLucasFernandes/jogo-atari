import './CreateRoomScreen.css'
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

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
            console.log("Movido para a sala de espera");

            setRoomCode('');
            setLoading(false);
        }
    }, [roomState])

    return (
        <div id="create-room">
            <h2 className="text-3xl font-bold text-white mb-8">Criar sala</h2>
            <p>Informe um código para criar uma sala</p>

            <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter Room Code"
                className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400"
                maxLength={6}
            />



            <div className="flex flex-col space-y-2">
                <button
                    onClick={handleCreateRoom}
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
                    disabled={!roomCode || loading}
                >
                    Create New Room
                </button>
            </div>
            <button onClick={() => setScreen('main-menu')}>Voltar ao menu</button>

        </div>
    );
};

export default CreateRoomScreen;