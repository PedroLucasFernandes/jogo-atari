import './GameMonolito.css';
import { MainMenuScreen } from "../MainMenuScreen/MainMenuScreen";
import { Dispatch, SetStateAction, useState } from 'react';
import { CreateRoomScreen } from '../CreateRoomScreen/CreateRoomScreen';
import { JoinRoomScreen } from '../JoinRoomScreen/JoinRoomScreen';
import { WaitingRoomScreen } from '../WaitingRoomScreen/WaitingRoomScreen';
import { RankingScreen } from '../RankingScreen/RankingScreen';
import GameScreen from '../GameScreen/GameScreen';
import NewGameScreen from '../NewGameScreen/NewGameScreen';
import LobbyScreen from '../LobbyScreen/LobbyScreen';

// Testando em como renderizar o conteúdo de uma rota dinamicamente


export const GameMonolito: React.FC = () => {
    const [screen, setScreen] = useState('main-menu'); // 'home', 'settings', ou 'profile'

    const renderScreen = () => {
        switch (screen) {
            case 'main-menu':
                return <MainMenuScreen setScreen={setScreen} />;
            case 'create-room':
                return <CreateRoomScreen setScreen={setScreen} />;
            case 'join-room':
                return <JoinRoomScreen setScreen={setScreen} />;
            case 'waiting-room':
                return <WaitingRoomScreen setScreen={setScreen} />;
            case 'ranking-room':
                return <RankingScreen setScreen={setScreen} />;
            case 'lobby':
                return <LobbyScreen setScreen={setScreen} />;
            case 'game':
                return <NewGameScreen setScreen={setScreen} />;
            default:
                return <MainMenuScreen setScreen={setScreen} />;
        }
    };

    return (
        <div id="monolito">
            {renderScreen()}
        </div>
    );
};