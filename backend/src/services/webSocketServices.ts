import { WebSocketServer, WebSocket } from 'ws';
import createGame from './game';
import { IGame, IGameMessage } from '../interfaces/game';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

interface ExtendedRequest extends Request {
	user?: any;
}

class WebSocketService {
	private clients: { [key: string]: { ws: WebSocket, user: any } } = {};
	//private rooms: { [key: string]: string[] } = {}; // roomId -> array of client IDs
	private rooms: { [key: string]: { players: { playerId: string; username: string; ready: boolean }[]; code: string } } = {};
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
				this.createRoom(clientId, message.data.username, message.data.code);
				break;
			case 'joinRoom':
				this.joinRoom(clientId, message.data.username, message.data.roomId, message.data.code);
				break;
			case 'startGame':
				this.startGame(clientId, message.data.roomId);
				break;
			case 'movePlayer':
				this.handlePlayerMove(clientId, message);
				break;
			case 'closeRoom':
				// TODO: Caso o host deseja cancelar a sala
				break;
			case 'exitRoom':
				// TODO: Caso algum player saia da sala
				break;
		}
	}

	private createRoom(clientId: string, username: string, code: string) {
		console.log("creating room", code);

		const roomId = uuidv4().slice(0, 6); // Gera uma chave única com 6 caracteres
		if (!this.rooms[roomId]) {
			this.rooms[roomId] = { players: [{ playerId: clientId, username: username, ready: false }], code };
			console.log(`Sala criada: ${roomId}`);
		} else {
			console.log(`Erro: a sala ${roomId} já existe. Tente novamente.`);
			//return this.createRoom(clientId, code);
			return
		}

		this.notifyClient(clientId, {
			type: 'roomCreated',
			data: { roomId, players: [{ playerId: clientId, username: username, ready: false }] }
		});
	}

	private joinRoom(clientId: string, username: string, roomId: string, code: string) {
		console.log("joining room", roomId, code);

		const room = this.rooms[roomId];

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Room not found' }
			});
			return;
		}

		if (room.code !== code) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Invalid code' }
			});
		}

		if (room.players.length >= 4) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Room is full' }
			});
			return;
		}

		room.players.push({ playerId: clientId, username: username, ready: false });
		console.log(`Usuário ${clientId} adicionado à sala ${roomId}.`);
		//const room = this.rooms[roomId];


		// Notify all players in the room about the new player
		room.players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'playerJoined',
				data: { roomId, players: this.rooms[roomId].players }
			});
		});
	}

	private startGame(clientId: string, roomId: string) {
		console.log("starting game", roomId);
		/* if (!this.rooms[roomId]?.includes(clientId)) {
			return;
		} */

		if (!this.rooms[roomId].players[0] == !clientId) {
			console.log("You are not the host of the room");
			return;
		}

		const game = createGame();
		this.gamesByRoom[roomId] = game;

		// Add all players from the room to the game
		this.rooms[roomId].players.forEach((player, index) => {
			game.addPlayer(player.playerId, player.username, index);
		});

		game.start();

		// Subscribe to game events
		game.subscribe((message: IGameMessage) => {
			this.rooms[roomId].players.forEach(player => {
				this.notifyClient(player.playerId, message);
			});
		});

		// Notify all players that the game has started
		this.rooms[roomId].players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'gameStarted',
				data: { gameState: game.gameState }
			});
		});
	}

	private handlePlayerMove(clientId: string, message: any) {
		// Find the room this player is in
		const roomId = Object.keys(this.rooms).find(roomId =>
			this.rooms[roomId].players.some(player => player.playerId === clientId)
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
		// Itera sobre cada sala e remove o usuário desconectado
		Object.entries(this.rooms).forEach(([roomId, roomData]) => {
			const { players } = roomData;

			// Verifica se o usuário está na sala
			if (players.some(player => player.playerId === clientId)) {
				// Remove o usuário da lista
				this.rooms[roomId].players = players.filter(player => player.playerId !== clientId);

				// Se a sala ficou vazia após a remoção, apaga a sala e para o jogo
				if (this.rooms[roomId].players.length === 0) {
					delete this.rooms[roomId];
					if (this.gamesByRoom[roomId]) {
						this.gamesByRoom[roomId].stop();
						delete this.gamesByRoom[roomId];
					}
				} else {
					// Notifica os demais usuários sobre a desconexão
					this.rooms[roomId].players.forEach(player => {
						this.notifyClient(player.playerId, {
							type: 'playerLeft',
							data: { roomId, players: this.rooms[roomId].players }
						});
					});
				}
			}
		});

		// Remove o cliente da lista de clientes ativos
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