import './GameMonolito.css';
import { MainMenuScreen } from "../MainMenuScreen/MainMenuScreen";
import { useState } from 'react';
import { JoinRoomScreen } from '../JoinRoomScreen/JoinRoomScreen';
import { RankingScreen } from '../RankingScreen/RankingScreen';
import NewGameScreen from '../NewGameScreen/NewGameScreen';
import { WaitingRoomScreen } from '../WaitingRoomScreen/WaitingRoomScreen';
import CreateRoomScreen from '../CreateRoomScreen/CreateRoomScreen';

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