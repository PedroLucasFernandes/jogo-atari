import React, { useEffect, useRef, useState } from 'react';

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

const Game: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [lives, setLives] = useState<number[]>([4, 4, 4, 4]);

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

    const ball: Ball = { x: 400, y: 300, radius: 10, speedX: 2, speedY: 2, color: 'white' };

    const walls: Wall[] = [
        { x: 20, y: 20, width: 80, height: 80, active: true },
        { x: 700, y: 20, width: 80, height: 80, active: true },
        { x: 20, y: 500, width: 80, height: 80, active: true },
        { x: 700, y: 500, width: 80, height: 80, active: true }
    ];

    const checkWallCollision = () => {
        walls.forEach((wall, index) => {
            if (
                wall.active &&
                ball.x + ball.radius > wall.x &&
                ball.x - ball.radius < wall.x + wall.width &&
                ball.y + ball.radius > wall.y &&
                ball.y - ball.radius < wall.y + wall.height
            ) {
                // Invert direction with a slight random angle
                ball.speedX *= -1;
                ball.speedY *= -1;

                ball.speedX += (Math.random() - 0.5) * 0.5; // add randomness
                ball.speedY += (Math.random() - 0.5) * 0.5;

                setLives((prevLives) => {
                    const newLives = [...prevLives];
                    newLives[index] = Math.max(0, newLives[index] - 1);
                    return newLives;
                });
            }
        });
    };

    const checkPlayerCollision = () => {
        players.forEach((player) => {
            const dx = ball.x - player.x;
            const dy = ball.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ball.radius + player.size / 2) {
                // Invert speed with slight random angle for more dynamic movement
                ball.speedX *= -1;
                ball.speedY *= -1;

                ball.speedX += (Math.random() - 0.5) * 0.5; // add randomness
                ball.speedY += (Math.random() - 0.5) * 0.5;
            }
        });
    };

    const updateGame = () => {
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // Bouncing off the canvas edges
        if (ball.x <= ball.radius || ball.x >= 800 - ball.radius) ball.speedX *= -1;
        if (ball.y <= ball.radius || ball.y >= 600 - ball.radius) ball.speedY *= -1;

        // Check collisions
        checkWallCollision();
        checkPlayerCollision();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const speed = 10;
            const humanPlayer = players[3];

            // Movement within restricted zone for the human player
            if (e.key === 'w' && humanPlayer.y > 0 && humanPlayer.y >= initialY2 + 10) humanPlayer.y -= speed;
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
    }, []);

    const drawGame = (context: CanvasRenderingContext2D) => {
        context.clearRect(0, 0, 800, 600);

        // Draw the ball
        context.fillStyle = ball.color;
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.fill();

        // Draw the walls
        walls.forEach((wall) => {
            if (wall.active) {
                context.fillStyle = 'gray';
                context.fillRect(wall.x, wall.y, wall.width, wall.height);
            }
        });

        // Draw the players
        players.forEach((player) => {
            context.fillStyle = player.color;
            const centerX = player.x - player.size / 2;
            const centerY = player.y - player.size / 2;
            context.fillRect(centerX, centerY, player.size, player.size);
        });

        // Draw lives
        context.fillStyle = 'white';
        context.font = '16px Arial';
        lives.forEach((life, index) => {
            context.fillText(`Player ${index + 1} Vidas: ${life}`, 10, 20 + index * 20);
        });
    };

    return <canvas ref={canvasRef} width={800} height={600} style={{ background: 'black' }} />;
};

export default Game;