import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import renderScreen from './renderScreen';

interface ScreenProps {
	setScreen: Dispatch<SetStateAction<string>>;
	roomCode?: string;
}

const NewGameScreen: React.FC<ScreenProps> = ({ setScreen, roomCode }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { socketId, roomState, gameState, movePlayer } = useWebSocket();
	const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

	// Load background image
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

		const animationFrameId = requestAnimationFrame(() => {
			renderScreen(canvas, gameState, requestAnimationFrame, socketId, backgroundImage);
		});

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [roomState, gameState, socketId, backgroundImage]);

	// Handle keyboard input
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!roomState) return;
			const keyPressed = e.key.toLowerCase();
			const validKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

			if (validKeys.includes(keyPressed)) {
				movePlayer(roomState.roomId, keyPressed);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [movePlayer]);

	return (
		<div className="relative">
			<canvas ref={canvasRef} width={800} height={600} className="border border-gray-600 rounded-lg" />
		</div>
	);
};

export default NewGameScreen;