import './GameMonolito.css';
import { MainMenu } from "../MainMenu/MainMenu";

// Testando em como renderizar o conteúdo de uma rota dinamicamente


export const GameMonolito: React.FC = () => {
    return (
        <div id="monolito">
            <MainMenu />
        </div>
    );
};