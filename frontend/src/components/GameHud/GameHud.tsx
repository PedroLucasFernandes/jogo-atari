import './GameHud.css';
import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { IChatMessage } from '../../interfaces/game';
import ChatMessage from '../ChatMessage/ChatMessage';
import { useUser } from '../../context/UserContext';
import formatHudTime from '../../utils/formatHudTime';

interface GameHudProps {
  roomId: string;
  onFocusChange: (isFocused: boolean) => void;
}

const GameHud: React.FC = () => {
  const [difficulty, setDifficulty] = useState(1);
  const [time, setTime] = useState('00:00');
  const { gameState } = useWebSocket();

  useEffect(() => {
    if (!gameState) return;
    const time = formatHudTime(gameState.info.elapsedSeconds);

    setDifficulty(gameState.info.difficulty);
    setTime(time);
  }, [gameState?.info]);


  return (
    <div id="gamehud-container">
      <p className='description'>Dificuldade: {difficulty}</p>
      <p className='description'>Tempo: {time}</p>
    </div>
  );
};

export default GameHud;