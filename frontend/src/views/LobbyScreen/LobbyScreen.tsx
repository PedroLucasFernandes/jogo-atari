import React, { useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

interface LobbyScreenProps {
    setScreen: (screen: string) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ setScreen }) => {
    const [roomCode, setRoomCode] = useState('');
    const { createRoom, joinRoom } = useWebSocket();

    const handleCreateRoom = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        createRoom(code);
        setScreen('game');
    };

    const handleJoinRoom = () => {
        if (roomCode) {
            joinRoom(roomCode);
            setScreen('game');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-8">Multiplayer Game Lobby</h1>

                <div className="space-y-6">
                    <button
                        onClick={handleCreateRoom}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
                    >
                        Create New Room
                    </button>

                    <div className="flex flex-col space-y-2">
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            placeholder="Enter Room Code"
                            className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400"
                            maxLength={6}
                        />
                        <button
                            onClick={handleJoinRoom}
                            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded"
                            disabled={!roomCode}
                        >
                            Join Room
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LobbyScreen;