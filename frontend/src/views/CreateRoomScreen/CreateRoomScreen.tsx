import './CreateRoomScreen.css'
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import CustomInput from '../../components/CustomInput/CustomInput';
import { gameAudio } from '../../utils/audioManager';
import { LogoutButton } from '../../components/LogoutButton/LogoutButton';
import { SoundToggleButton } from '../../components/SoundToggleButton/SoundToggleButton';
import Checkbox from '@mui/joy/Checkbox';
import Done from '@mui/icons-material/Done';

interface CreateRoomScreenProps {
    setScreen: (screen: string) => void;
}

const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({ setScreen }) => {
    const [roomCode, setRoomCode] = useState('');
    const { createRoom, roomState } = useWebSocket();
    const [loading, setLoading] = useState(false);
    const [noCode, setNoCode] = useState(false);

    const handleCreateRoom = () => {
        console.log("rrrr", roomState);
        if (!noCode && !roomCode) return;
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
        console.log("rom", roomState);
        if (!roomState) return;
        if (roomState.status === 'waiting') {
            console.log("rom2", roomState);
            setScreen('waiting-room');
            setRoomCode('');
            setLoading(false);
        }
    }, [roomState])

    const handleChangeNoCode = () => {
        setNoCode(!noCode);
        setRoomCode('');
    }

    return (
        <div id="create-room">
            <LogoutButton />
            <SoundToggleButton />
            <div className='square-create-room'>
                <h2 className="title-create">Criar sala</h2>
                <p style={{
                    fontFamily: '"Tilt Neon", sans-serif', fontSize: '1rem', margin: '15px', width: '15vw', textAlign: 'center', color: '#11205F'
                }}>Informe um código para criar uma sala</p>

                <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Código"
                    className="input-create"
                    maxLength={6}
                    style={{ margin: '15px', fontFamily: '"Tilt Neon", sans-serif', fontSize: '2.5vh' }}
                    disabled={noCode}
                />

                <Checkbox
                    uncheckedIcon={<Done />}
                    label="Criar sala sem senha"
                    checked={noCode}
                    onChange={handleChangeNoCode}
                    slotProps={{
                        root: ({ checked, focusVisible }) => ({
                            sx: {
                                margin: '4px 0 8px 0',
                                fontFamily: '"Tilt Neon", sans-serif',
                                fontSize: '2.5vh',
                                color: '#11205F',
                                ...(!checked && {
                                    '& svg': { opacity: focusVisible ? 1 : 0 },
                                    '&:hover svg': { opacity: 1 },
                                }),
                            },
                        }),
                    }}
                />



                <button
                    onClick={() => { gameAudio.playClickSound(); handleCreateRoom(); }}
                    className="button-create"
                    disabled={(!noCode && !roomCode) || loading}
                >
                    Criar nova sala
                </button>
                <button className="button-back" onClick={() => setScreen('main-menu')}>Voltar ao menu</button>
            </div>
        </div>
    );
};

export default CreateRoomScreen;