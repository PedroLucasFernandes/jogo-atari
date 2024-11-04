import { WebSocketServer, WebSocket } from 'ws';
import createGame from './game';
import { IGame, IGameMessage } from '../interfaces/game';
import jwt from 'jsonwebtoken';

interface ExtendedRequest extends Request {
	user?: any;
}

class WebSocketService {
	private clients: { [key: string]: { ws: WebSocket, user: any } } = {};
	private rooms: { [key: string]: string[] } = {}; // roomId -> array of client IDs
	private gamesByRoom: { [key: string]: IGame } = {}; // roomId -> game instance

	constructor(private wss: WebSocketServer) {
		this.initialize();
	}

	public getClient(clientId: string): WebSocket | undefined {
		return this.clients[clientId]?.ws;
	}

	private initialize() {
		this.wss.on('connection', (ws: WebSocket, req: any) => {
			// Extrair o token do cookie
			const token = req.headers.cookie
				?.split("; ")
				.find((c: string) => c.startsWith("session_id="))
				?.split("=")[1];

			if (!token) {
				ws.close(1008, "Unauthorized");
				return;
			}

			// Verificar o token JWT
			jwt.verify(token, process.env.SECRET_KEY!, (err: any, decoded: any) => {
				if (err) {
					ws.close(1008, "Unauthorized");
					return;
				}

				const clientId = `socket_${decoded.id}_${Date.now()}`;
				this.clients[clientId] = {
					ws,
					user: {
						id: decoded.id,
						// Adicione outros dados do usuário que você precise
					}
				};

				// Enviar o ID do socket para o cliente
				ws.send(JSON.stringify({ type: 'uuid', socketId: clientId }));

				// Configurar listeners de mensagens
				ws.on('message', (message) => {
					try {
						const parsedMessage = JSON.parse(
							typeof message === 'string' ? message : message.toString()
						);
						this.handleMessage(clientId, parsedMessage);
					} catch (error) {
						console.error('Error parsing message:', error);
						ws.send(JSON.stringify({
							type: 'error',
							data: { message: 'Invalid message format' }
						}));
					}
				});

				ws.on('close', () => {
					this.handleDisconnect(clientId);
				});

				ws.on('error', (error) => {
					console.error(`WebSocket error for client ${clientId}:`, error);
					this.handleDisconnect(clientId);
				});
			});
		});
	}


	private handleMessage(clientId: string, message: any) {
		switch (message.type) {
			case 'createRoom':
				this.createRoom(clientId, message.data.code);
				break;
			case 'joinRoom':
				this.joinRoom(clientId, message.data.code);
				break;
			case 'startGame':
				this.startGame(clientId, message.data.roomId);
				break;
			case 'movePlayer':
				this.handlePlayerMove(clientId, message);
				break;
		}
	}

	private createRoom(clientId: string, roomId: string) {
		console.log("creating room", roomId);
		this.rooms[roomId] = [clientId];
		this.notifyClient(clientId, {
			type: 'roomCreated',
			data: { roomId, players: [clientId] }
		});
	}

	private joinRoom(clientId: string, roomId: string) {
		console.log("joining room", roomId);
		if (!this.rooms[roomId]) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Room not found' }
			});
			return;
		}

		if (this.rooms[roomId].length >= 4) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Room is full' }
			});
			return;
		}

		this.rooms[roomId].push(clientId);

		// Notify all players in the room about the new player
		this.rooms[roomId].forEach(playerId => {
			this.notifyClient(playerId, {
				type: 'playerJoined',
				data: { roomId, players: this.rooms[roomId] }
			});
		});
	}

	private startGame(clientId: string, roomId: string) {
		console.log("starting game", roomId);
		if (!this.rooms[roomId]?.includes(clientId)) {
			return;
		}

		const game = createGame();
		this.gamesByRoom[roomId] = game;

		// Add all players from the room to the game
		this.rooms[roomId].forEach((playerId, index) => {
			game.addPlayer(playerId, index);
		});

		game.start();

		// Subscribe to game events
		game.subscribe((message: IGameMessage) => {
			this.rooms[roomId].forEach(playerId => {
				this.notifyClient(playerId, message);
			});
		});

		// Notify all players that the game has started
		this.rooms[roomId].forEach(playerId => {
			this.notifyClient(playerId, {
				type: 'gameStarted',
				data: { gameState: game.gameState }
			});
		});
	}

	private handlePlayerMove(clientId: string, message: any) {
		// Find the room this player is in
		const roomId = Object.keys(this.rooms).find(roomId =>
			this.rooms[roomId].includes(clientId)
		);

		if (roomId && this.gamesByRoom[roomId]) {
			this.gamesByRoom[roomId].movePlayer({
				type: 'movePlayer',
				data: {
					playerId: clientId,
					keyPressed: message.data.keyPressed
				}
			});
		}
	}

	private handleDisconnect(clientId: string) {
		// Find and clean up rooms where this client was present
		Object.entries(this.rooms).forEach(([roomId, players]) => {
			if (players.includes(clientId)) {
				this.rooms[roomId] = players.filter(id => id !== clientId);

				if (this.rooms[roomId].length === 0) {
					delete this.rooms[roomId];
					if (this.gamesByRoom[roomId]) {
						this.gamesByRoom[roomId].stop();
						delete this.gamesByRoom[roomId];
					}
				} else {
					// Notify remaining players about disconnection
					this.rooms[roomId].forEach(playerId => {
						this.notifyClient(playerId, {
							type: 'playerLeft',
							data: { roomId, players: this.rooms[roomId] }
						});
					});
				}
			}
		});

		delete this.clients[clientId];
	}

	private notifyClient(clientId: string, message: any) {
		const client = this.clients[clientId];
		if (client && client.ws.readyState === WebSocket.OPEN) {
			client.ws.send(JSON.stringify(message));
		}
	}
}



export default WebSocketService;