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
	const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
	const activeKeysRef = useRef(new Set<string>());
	const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (gameState?.winner) {
			setWinner(gameState.winner);
			gameAudio.stopAll(); //Para caso o jogador reconecte após o jogo encerrar
			setScreen('game-over');
		}
	}, [gameState?.winner]);

	useEffect(() => {
		const bgImage = '/assets/bg-space.svg';
		const img = new Image();
		img.src = bgImage;

		img.onload = () => {
			setBackgroundImage(img);
		};

		img.onerror = () => {
			console.error("Error loading background image.");
		};
	}, []);

	// Setup game rendering
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !socketId || !roomState || !gameState || !backgroundImage) return;

		interpolate(0.5);

		const animationFrameId = requestAnimationFrame(() => {

			renderScreen(canvas, gameState, requestAnimationFrame, socketId, backgroundImage);
		});

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [roomState, gameState, socketId, backgroundImage, gameState?.winner]);

	// Exibe tela de vencedor se houver um ganhador
	// useEffect(() => {
	// 	if (gameState?.winner) {
	// 		setScreen('game-over');
	// 	return;
	// 	}
	// }, [gameState?.winner]);

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

	// Função para interpolar entre a posição inicial e a posição alvo
	function interpolate(interpolationFactor: number) {
		if (!gameState) return;

		Object.keys(gameState.players).forEach((playerId) => {
			const player = gameState.players[playerId];
			const interpolatedX = player.x + (player.toX - player.x) * interpolationFactor;
			const interpolatedY = player.y + (player.toY - player.x) * interpolationFactor;

			// Atualiza as posições de cada jogador no objeto interpolado
			gameState.players[playerId] = {
				...player,
				x: interpolatedX,
				y: interpolatedY,
			};
		});
	}
	/* 	function interpolate(this.x, this.toX, t) {
			return this.x + (this.toX - this.x) * t;
			//return 
		} */


	return (
		<div className="relative">
			<canvas ref={canvasRef} width={800} height={600} className="border border-gray-600 rounded-lg" />
		</div>
	);
};

export default NewGameScreen;