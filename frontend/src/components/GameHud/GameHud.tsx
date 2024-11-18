import './GameHud.css';
import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { IChatMessage, playersImages } from '../../interfaces/game';
import ChatMessage from '../ChatMessage/ChatMessage';
import { useUser } from '../../context/UserContext';
import formatHudTime from '../../utils/formatHudTime';

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
      <div className='game-info'>
        <p className='description'>Dificuldade: {difficulty}</p>
        <p className='description'>Tempo: {time}</p>
      </div>

      <div>
        <p className='players-title'>Jogadores</p>
        {!gameState ? (
          <p className="p">Carregando...</p>
        ) : (
          <div className="players-wrapper">
            {Object.entries(gameState.players).map(([id, player], index) => {
              // Encontra o planeta do jogador com base no `ownerId`
              const playerPlanet = gameState.planets.find(planet => planet.ownerId === id);

              // Calcula os valores para exibir como "6/6"
              const partsActive = playerPlanet ? playerPlanet.parts.filter(Boolean).length : 0; // Quantos são `true`
              const partsTotal = playerPlanet ? playerPlanet.parts.length : 0; // Total de `parts`

              const playerImage = playersImages[player.defendingPlanetId];

              return (
                <div key={id} className="player-info">
                  <div className="player-top-info">
                    <img
                      src={playerImage?.src}
                      alt={`Imagem do jogador ${player.username}`}
                      className="player-image"
                    />
                    <p className="player-username">{player.username}</p>
                  </div>
                  <div>
                    {playerPlanet ? (
                      <p className="player-planet">Planeta: {partsActive}/{partsTotal}</p>
                    ) : (
                      <p>Planeta destruído</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


    </div>
  );
};

export default GameHud;