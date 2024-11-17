import './GameMonolito.css';
import { MainMenuScreen } from "../MainMenuScreen/MainMenuScreen";
import { useState } from 'react';
import { JoinRoomScreen } from '../JoinRoomScreen/JoinRoomScreen';
import { RankingScreen } from '../RankingScreen/RankingScreen';
import NewGameScreen from '../NewGameScreen/NewGameScreen';
import { WaitingRoomScreen } from '../WaitingRoomScreen/WaitingRoomScreen';
import CreateRoomScreen from '../CreateRoomScreen/CreateRoomScreen';
import { GameOverScreen } from '../GameOverScreen/GameOverScreen';
import { IWinner } from '../../interfaces/game';
import { GlobalSound } from '../../components/GlobalSound/GlobalSound';
// Testando em como renderizar o conteúdo de uma rota dinamicamente


export const GameMonolito: React.FC = () => {
    const [screen, setScreen] = useState('main-menu'); // 'home', 'settings', ou 'profile'
    const [winner, setWinner] = useState<IWinner | null>(null);

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
                return <NewGameScreen setScreen={setScreen} setWinner={setWinner} />;
            case 'game-over':
                return <GameOverScreen setScreen={setScreen} winner={winner} />;
            default:
                return <MainMenuScreen setScreen={setScreen} />;
        }
    };

    return (
        <div id="monolito" className='slide-diagonal-bounce'>
            {/* Passar a tela atual para o GlobalSound */}
            <GlobalSound currentScreen={screen} />
            {renderScreen()}
        </div>
    );
};