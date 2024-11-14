import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import renderScreen from './renderScreen';
import { IWinner } from '../../interfaces/game';
import { gameAudio } from '../../utils/audioManager';

interface ScreenProps {
	setScreen: Dispatch<SetStateAction<string>>;
	roomCode?: string;
	setWinner: (winner: IWinner) => void;
}

const NewGameScreen: React.FC<ScreenProps> = ({ setScreen, setWinner, roomCode }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { socketId, roomState, gameState, movePlayer } = useWebSocket();
	const activeKeysRef = useRef(new Set<string>());
	const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
	const gameStateRef = useRef(gameState);
	const animationFrameIdRef = useRef<number | null>(null);
	const lastRenderTimeRef = useRef<number>(0);  // Armazena o timestamp do último frame
	const FPS = 60;
	const interval = 1000 / FPS;

	useEffect(() => {
		gameStateRef.current = gameState;
	}, [gameState]);

	useEffect(() => {
		if (gameState?.winner) {
			if (intervalIdRef.current) clearInterval(intervalIdRef.current);
			setWinner(gameState.winner);
			gameAudio.stopAll(); //Para caso o jogador reconecte após o jogo encerrar
			setScreen('game-over');
		}
	}, [gameState?.winner]);

	useEffect(() => {
		const img = new Image();
		img.src = '/assets/bg-space.svg';

		img.onload = () => {
			if (canvasRef.current) {
				canvasRef.current.style.backgroundImage = `url(${img.src})`;
			}
		};

		img.onerror = () => {
			console.error("Error loading background image.");
		};
	}, []);

	// Setup game rendering
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !socketId || !roomState || !gameStateRef.current) return;

		/* const animationFrameId = requestAnimationFrame(() => {
			renderScreen(canvas, gameState, requestAnimationFrame, socketId, backgroundImage);
		});

		return () => {
			cancelAnimationFrame(animationFrameId);
		}; */

		// Função de loop de renderização com controle de taxa de atualização
		const renderLoop = (timestamp: number) => {
			const timeSinceLastRender = timestamp - lastRenderTimeRef.current;

			if (timeSinceLastRender >= interval) {
				// Renderiza apenas se o tempo decorrido for maior que o intervalo desejado
				renderScreen(canvas, gameStateRef, socketId);
				lastRenderTimeRef.current = timestamp;
			}

			// Solicita o próximo frame
			animationFrameIdRef.current = requestAnimationFrame(renderLoop);
		};

		// Certifique-se de cancelar qualquer animação pendente para evitar loops duplicados
		if (animationFrameIdRef.current !== null) {
			cancelAnimationFrame(animationFrameIdRef.current);
		}

		// Inicia o loop de renderização
		animationFrameIdRef.current = requestAnimationFrame(renderLoop);

		// Limpa o requestAnimationFrame quando o componente é desmontado
		return () => {
			if (animationFrameIdRef.current !== null) {
				cancelAnimationFrame(animationFrameIdRef.current);
				animationFrameIdRef.current = null;
			}
		};
	}, [roomState, socketId, interval]);

	// Cria uma versão estável de movePlayer
	const stableMovePlayer = useCallback((direction: string) => {
		if (roomState) {
			movePlayer(roomState.roomId, direction);
		}
	}, [movePlayer, roomState]);

	// Lida com o input do teclado
	useEffect(() => {
		const validKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

		const handleKeyDown = (e: KeyboardEvent) => {
			const keyPressed = e.key.toLowerCase();
			if (validKeys.includes(keyPressed)) {
				activeKeysRef.current.add(keyPressed);
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			const keyReleased = e.key.toLowerCase();
			activeKeysRef.current.delete(keyReleased);
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);

		// Inicia o intervalo de movimento contínuo uma vez, sem ser desmontado
		if (!intervalIdRef.current) {
			intervalIdRef.current = setInterval(() => {
				activeKeysRef.current.forEach((key) => stableMovePlayer(key));
			}, 50);
		}

		// Limpa os eventos quando o componente é desmontado
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
		};
	}, [stableMovePlayer]); // `stableMovePlayer` é uma dependência estável

	return (
		<div className="relative">
			<canvas ref={canvasRef} width={800} height={600} style={{
				backgroundSize: 'cover',
				backgroundPosition: 'center'
			}} />
		</div>
	);
};

export default NewGameScreen;