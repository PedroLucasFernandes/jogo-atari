import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import createGame from '../../services/game';
import renderScreen from './renderScreen';



interface ScreenProps {
	setScreen: Dispatch<SetStateAction<string>>;
}

const NewGameScreen: React.FC<ScreenProps> = ({ setScreen }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { socketId, gameState, movePlayer } = useWebSocket();
	//const game = createGame();
	const game = useRef(createGame()).current;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			console.error('Canvas não inciado');
			return;
		}
		if (!socketId) {
			console.error('Socket ID não encontrado');
			return;
		}

		if (gameState) {
			game.setState(gameState);
		}

		renderScreen(canvas, game, requestAnimationFrame, socketId);
	}, [gameState, socketId]);


	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const keyPressed = e.key.toLowerCase();
			const validKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']; // Adiciona as setas

			if (validKeys.includes(keyPressed)) {
				movePlayer(keyPressed);
			}
		};

		// Adiciona o listener de evento quando o componente monta
		document.addEventListener('keydown', handleKeyDown);

		// Remove o listener quando o componente desmonta
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [])

	return <canvas ref={canvasRef} width={800} height={600} style={{ background: 'black' }} />;
};

export default NewGameScreen;


