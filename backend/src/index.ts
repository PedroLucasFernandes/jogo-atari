import dotenv from "dotenv";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/routes";
import cors from 'cors';
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import createGame from "./services/game";
import { IGame, IGameMessage, IGameState } from "./interfaces/game";

dotenv.config();

const PORT = process.env.PORT;
const app: Express = express();

const corsOptions = {
	origin: "http://localhost:3000", // Substitua pela URL do seu front-end
	credentials: true, // Permitir cookies
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/api", routes);

const server = app.listen(PORT, () => {
	console.log(`Server running on: http://localhost:${PORT}`);
});

// Configuração do WebSocket
const wss = new WebSocketServer({ server });

const clients: Record<string, WebSocket> = {}; // Armazena os clientes conectados




interface Room {
	host: WebSocket;
	players: WebSocket[];
	gameState: Record<string, any>;
}
const rooms: Record<string, Room> = {};
const games: IGame[] = [];



wss.on("connection", (ws, req) => {
	// Middleware de autenticação do WebSocket
	const token = req.headers.cookie?.split("; ").find((c) => c.startsWith("session_id="))?.split("=")[1];

	if (!token) {
		ws.close(1008, "Unauthorized"); // Código de fechamento para autenticação falha
		return;
	}

	// Verificação do token JWT
	jwt.verify(token, process.env.SECRET_KEY!, (err, decoded: any) => {
		if (err) {
			ws.close(1008, "Unauthorized");
			return;
		}

		const socketId = `socket_${decoded.id}_${Date.now()}`;

		clients[socketId] = ws; // Armazena o cliente com seu socketId
		ws.send(JSON.stringify({ type: 'uuid', socketId })); // Adicionando o tipo aqui

		ws.on("message", (message) => {
			console.log(`Message received from client ${socketId}: ${message}`);

			const messageReceived = JSON.parse(
				typeof message === 'string' ? message : message.toString()
			);

			switch (messageReceived.type) {

				case 'startGame': //Testando single player sem criar a sala primeiro
					const game = createGame()
					game.addPlayer(messageReceived.data.playerId);
					game.start();
					games.push(game);
					console.log("Game started, sending message state... " + game);

					const dataToSend = { gameState: game.gameState }
					ws.send(JSON.stringify({ type: 'gameStarted', data: dataToSend }));


					game.subscribe((message: IGameMessage) => {
						//console.log(`> Emitting ${message.type}`)
						ws.send(JSON.stringify({ type: message.type, data: message.data }));
					})
					break;

				case 'movePlayer': //Testando single player sem criar a sala primeiro
					games[0].movePlayer(messageReceived)
					break;

				case 'createRoom': // Não utilizado ainda
					// Cria uma nova sala
					const roomCode = uuidv4().slice(0, 6); // Gera um código de sala curto
					rooms[roomCode] = { host: ws, players: [ws], gameState: {} };
					ws.send(JSON.stringify({ type: 'roomCreated', roomCode }));
					break;

				case 'joinRoom': // Não utilizado ainda
					const { roomCode: joinCode } = messageReceived;
					const room = rooms[joinCode];

					// Verifica se a sala existe e ainda tem vagas
					if (room && room.players.length < 4) {
						room.players.push(ws);
						ws.send(JSON.stringify({ type: 'roomJoined', roomCode: joinCode }));

						// Notifica todos os jogadores na sala sobre o novo jogador
						room.players.forEach(player => {
							if (player !== ws && player.readyState === WebSocket.OPEN) {
								player.send(JSON.stringify({ type: 'playerJoined', roomCode: joinCode }));
							}
						});

						// Se a sala está cheia, começa o jogo
						if (room.players.length === 4) {
							// startGame(room);
						}
					} else {
						ws.send(JSON.stringify({ type: 'error', message: 'Sala cheia ou inexistente' }));
					}
					break;

				case 'playerAction': // Não utilizado ainda
					// Ações do jogador, como movimento ou interação
					const { roomCode: actionRoom, payload } = messageReceived;
					const currentRoom = rooms[actionRoom];

					// Envia a ação para todos os outros jogadores na sala
					if (currentRoom) {
						currentRoom.players.forEach(player => {
							if (player !== ws && player.readyState === WebSocket.OPEN) {
								player.send(JSON.stringify({ type: 'updateGameState', payload }));
							}
						});
					}
					break;

				default:
					ws.send(JSON.stringify({ type: 'error', message: 'Ação desconhecida' }));
			}

		});

		ws.on("close", () => {
			console.log(`Client ${socketId} disconnected`);

			if (games.length > 0) {
				games.forEach(game => {
					game.stop();
				})
			}
			games.length = 0;

			console.log(`Closing game state... game state: ${games[0]}`);
			delete clients[socketId];
		});
	});
});

const getClient = (socketId: string) => clients[socketId];
export default { getClient };
