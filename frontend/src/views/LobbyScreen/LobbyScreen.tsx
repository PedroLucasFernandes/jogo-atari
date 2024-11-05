import React, { useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

interface LobbyScreenProps {
    setScreen: (screen: string) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ setScreen }) => {
    const [roomCode, setRoomCode] = useState('');
    const { createRoom, joinRoom } = useWebSocket();

    const handleCreateRoom = () => {
        if (!roomCode) return;
        createRoom(roomCode);
        //setScreen('game');
    };

    const handleJoinRoom = () => {
        if (!roomCode) return;
        joinRoom(roomCode);
        //setScreen('game');
    };

    return (
        <div id="loby-screen">
            <h2 className="text-3xl font-bold text-white mb-8">Multiplayer Game Lobby</h2>
            <p>Informe um código para criar uma sala ou entrar em uma existente</p>

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
                    disabled={!roomCode}
                >
                    Create New Room
                </button>

                <button
                    onClick={handleJoinRoom}
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded"
                    disabled={!roomCode}
                >
                    Join Room
                </button>
            </div>

        </div>
    );
};

export default LobbyScreen;