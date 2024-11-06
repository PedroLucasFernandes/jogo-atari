import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import renderScreen from './renderScreen';

interface ScreenProps {
	setScreen: Dispatch<SetStateAction<string>>;
	roomCode?: string;
}

const NewGameScreen: React.FC<ScreenProps> = ({ setScreen, roomCode }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { socketId, gameState, movePlayer, startGame } = useWebSocket();
	const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
	const [isHost, setIsHost] = useState(false);

	// Load background image
	/* useEffect(() => {
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
		if (!canvas || !socketId || !gameState || !backgroundImage) return;

		const animationFrameId = requestAnimationFrame(() => {
			renderScreen(canvas, gameState, requestAnimationFrame, socketId, backgroundImage);
		});

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [gameState, socketId, backgroundImage]);

	// Handle keyboard input
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const keyPressed = e.key.toLowerCase();
			const validKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

			if (validKeys.includes(keyPressed)) {
				movePlayer(keyPressed);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [movePlayer]); */

	return (
		<div className="relative">
			<canvas ref={canvasRef} width={800} height={600} className="border border-gray-600 rounded-lg" />
			{isHost && (
				<button
					//onClick={() => startGame()}
					className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				>
					Start Game
				</button>
			)}
		</div>
	);
};

export default NewGameScreen;