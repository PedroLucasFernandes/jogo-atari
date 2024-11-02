import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

interface Wall {
    x: number;
    y: number;
    width: number;
    height: number;
    active: boolean;
}

interface Player {
    x: number;
    y: number;
    size: number;
    color: string;
    isBot: boolean;
}

interface Ball {
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
    color: string;
}

interface ScreenProps {
    setScreen: Dispatch<SetStateAction<string>>;
}

const Game: React.FC<ScreenProps> = ({ setScreen }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [lives, setLives] = useState<number[]>([4, 4, 4, 4]);
    const { gameState, movePlayer } = useWebSocket();

    console.log("Game state na GameScreen.tsx", gameState);

    const players: Player[] = [
        { x: 110, y: 110, size: 20, color: 'blue', isBot: true },
        { x: 670, y: 110, size: 20, color: 'green', isBot: true },
        { x: 110, y: 470, size: 20, color: 'yellow', isBot: true },
        { x: 670, y: 470, size: 20, color: 'red', isBot: false }
    ];

    const initialY1 = 110;
    const initialX1 = 110;
    const initialY2 = 470;
    const initialX2 = 670;

    const ball: Ball = { x: 400, y: 300, radius: 10, speedX: 3, speedY: 3, color: 'white' };

    const walls: Wall[] = [
        { x: 20, y: 20, width: 80, height: 80, active: true },
        { x: 700, y: 20, width: 80, height: 80, active: true },
        { x: 20, y: 500, width: 80, height: 80, active: true },
        { x: 700, y: 500, width: 80, height: 80, active: true }
    ];

    const moveBots = () => {
        players.forEach((player) => {
            if (player.isBot) {

            }
        });
    };

    const updateGame = () => {
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        if (ball.x <= 0 || ball.x >= 800) ball.speedX *= -1;
        if (ball.y <= 0 || ball.y >= 600) ball.speedY *= -1;

        moveBots();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const handleKeyDown = (e: KeyboardEvent) => {

            //Código para efetuar o movimento pelo servidor
            //const keyPressed = e.key
            //movePlayer(keyPressed)


            const speed = 10;
            const humanPlayer = players[3];

            if (e.key === 'w' && humanPlayer.y > 0 && humanPlayer.y >= initialY2 + 10) { } humanPlayer.y -= speed;
            if (e.key === 's' && humanPlayer.y + humanPlayer.size / 2 < canvas.height && humanPlayer.y >= initialY2 && humanPlayer.x <= initialX2) humanPlayer.y += speed;
            if (e.key === 'a' && humanPlayer.x > 0 && humanPlayer.x >= initialX2 + 10) humanPlayer.x -= speed;
            if (e.key === 'd' && humanPlayer.x + humanPlayer.size / 2 < canvas.width && humanPlayer.y <= initialY2) humanPlayer.x += speed;
        };

        document.addEventListener('keydown', handleKeyDown);

        const gameLoop = () => {
            updateGame();
            drawGame(context);
            requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [ball.x, ball.y, players]);

    const drawGame = (context: CanvasRenderingContext2D) => {
        context.clearRect(0, 0, 800, 600);

        context.fillStyle = ball.color;
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.fill();

        walls.forEach((wall) => {
            if (wall.active) {
                context.fillStyle = 'gray';
                context.fillRect(wall.x, wall.y, wall.width, wall.height);
            }
        });

        players.forEach((player) => {
            context.fillStyle = player.color;
            const centerX = player.x - player.size / 2;
            const centerY = player.y - player.size / 2;
            context.fillRect(centerX, centerY, player.size, player.size);
        });

        context.fillStyle = 'white';
        context.font = '16px Arial';
        lives.forEach((life, index) => {
            context.fillText(`Player ${index + 1} Vidas: ${life}`, 10, 20 + index * 20);
        });
    };

    return <canvas ref={canvasRef} width={800} height={600} style={{ background: 'black' }} />;
};

export default Game;
