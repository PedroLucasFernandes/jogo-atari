import { WebSocketServer, WebSocket } from 'ws';
import createGame from './game';
import { gameStatus, IGame, IGameMessage, IRoomState } from '../interfaces/game';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

interface ExtendedRequest extends Request {
	user?: any;
}

class WebSocketService {
	private clients: { [key: string]: { ws: WebSocket, user: any } } = {};
	//private rooms: { [key: string]: string[] } = {}; // roomId -> array of client IDs
	private rooms: {
		[key: string]: {
			players: { playerId: string; username: string; ready: boolean, isHost: boolean }[];
			code: string;
			status: gameStatus,
			host: string;
		}
	} = {};
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
			case 'getRooms':
				this.getRooms(clientId);
				break;
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
				this.handlePlayerMove(clientId, message.data.roomId, message.data.keyPressed);
				break;
			case 'closeRoom':
				this.closeRoom(clientId, message.data.roomId);
				break;
			case 'leaveRoom':
				this.leaveRoom(clientId, message.data.roomId);
				break;
			case 'toggleReadyStatus':
				this.toggleReadyStatus(clientId, message.data.roomId, message.data.playerId);
				break;
			case 'removePlayer':
				this.removePlayer(clientId, message.data.roomId, message.data.playerId);
			default:
				console.error(`Invalid message type received: ${message.type}`);
		}
	}

	private getRoomStates() {
		const roomStates: IRoomState[] = Object.entries(this.rooms).map(([roomId, room]) => ({
			roomId, // A chave é o id da sala
			code: null,
			status: room.status,
			host: room.host,
			players: room.players.map(player => ({
				playerId: player.playerId,
				username: player.username,
				ready: player.ready,
				isHost: player.isHost,
			})),
		}));

		return roomStates;
	}

	private getRooms(clientId: string) {
		this.notifyClient(clientId, {
			type: 'roomsReceived',
			data: { rooms: this.getRoomStates() }
		});
	}

	private createRoom(clientId: string, username: string, code: string) {
		console.log("creating room", code);

		const roomId = uuidv4().slice(0, 6).toLocaleUpperCase(); // Gera uma chave única com 6 caracteres
		if (!this.rooms[roomId]) {
			this.rooms[roomId] = {
				status: 'waiting',
				host: clientId,
				players: [{ playerId: clientId, username: username, ready: false, isHost: true }], code
			};

			console.log(`Sala criada: ${roomId}`);
		} else {
			console.log(`Erro: a sala ${roomId} já existe. Tente novamente.`);
			//return this.createRoom(clientId, code);
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao criar sala, tente novamente' }
			});
			return
		}

		const data = {
			roomState: {
				roomId: roomId,
				code: code,
				status: 'waiting',
				host: clientId,
				players: [{ playerId: clientId, username: username, ready: false, isHost: true }],
			},
			message: `Sala #${roomId} criada`
		}

		this.notifyClient(clientId, {
			type: 'roomCreated',
			data: data
		});
		/* this.notifyClient(clientId, {
			type: 'roomCreated',
			data: { roomId, gameState: { players: [{ playerId: clientId, username: username, ready: false }] } }
		}); */
	}

	private closeRoom(clientId: string, roomId: string) {
		console.log("closing room", roomId);
		const room = this.rooms[roomId];
		const playerIndex = room.players.findIndex(p => p.playerId === clientId);

		if (playerIndex === -1) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao encerrar sala. Unidentified Host' }
			});
			return;
		}

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao encerrar sala. Unidentified Room' }
			});
			return;
		}

		if (room.host === clientId) {
			room.players.forEach(player => {
				this.notifyClient(player.playerId, {
					type: 'roomClosed',
					data: { roomId, message: `Sala #${roomId} encerrada pelo host` }
				});
			});
			delete this.rooms[roomId];
			console.log(`Sala ${roomId} fechada.`);
			return;
		}
	}

	private joinRoom(clientId: string, username: string, roomId: string, code: string) {
		console.log("joining room", roomId, code);

		const room = this.rooms[roomId];

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao entrar na sala. Unidentified Room' }
			});
			return;
		}

		if (room.code !== code) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Código inválido' }
			});
			return;
		}

		if (room.players.length >= 4) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Esta sala já está cheia' }
			});
			return;
		}

		if (room.status === 'inprogress') {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Esta partida já está em andamento' }
			});
			return;
		}

		if (room.status === 'finished') {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Esta partida já terminou' }
			});
			return;
		}

		room.players.push({ playerId: clientId, username: username, ready: false, isHost: false });
		console.log(`Usuário ${clientId} adicionado à sala ${roomId}.`);
		//const room = this.rooms[roomId];

		const data = {
			roomState: {
				roomId: roomId,
				code: room.code,
				status: room.status,
				host: room.host,
				players: this.rooms[roomId].players
			},
			message: `${username} entrou na sala`
		}

		console.log("joinroom console", JSON.stringify(data));

		// Notify all players in the room about the new player
		room.players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'playerJoined',
				data: data
			});
		});
	}

	private leaveRoom(clientId: string, roomId: string) {
		console.log("leaving room", roomId);
		const room = this.rooms[roomId];
		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao sair da sala. Unidentified Room' }
			});
			return;
		}

		const playerIndex = room.players.findIndex(p => p.playerId === clientId);
		if (playerIndex === -1) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao sair da sala. Unidentified Player' }
			});
			return;
		}


		if (room.host === clientId) {
			// Se houver outros jogadores na sala, transfere o host para o próximo jogador
			if (room.players.length > 1) {
				const newHost = room.players.find(player => player.playerId !== clientId);
				if (newHost) {
					room.host = newHost.playerId;
					newHost.isHost = true;
				}
			} else {
				// Se não houver outros jogadores, a sala é removida
				delete this.rooms[roomId];
				return;
			}
		}

		const client = room.players[playerIndex];
		room.players.splice(playerIndex, 1);

		this.notifyClient(clientId, {
			type: 'youLeft',
			data: { message: 'Você saiu da sala' }
		});

		const data = {
			roomState: {
				roomId: roomId,
				code: room.code,
				status: room.status,
				host: room.host,
				players: this.rooms[roomId].players
			},
			message: `${client.username} saiu da sala`
		}

		room.players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'playerLeft',
				data: data
			});
		});
	}

	private toggleReadyStatus(clientId: string, roomId: string, playerId: string) {
		console.log("toggling ready status", roomId, playerId);
		const room = this.rooms[roomId];
		const player = room.players.find(p => p.playerId === playerId);

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao se preparar. Unidentified Room' }
			});
			return;
		}

		if (!player) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao se preparar. Unidentified Player' }
			});
			return;
		}

		player.ready = !player.ready;

		const data = {
			roomState: {
				roomId: roomId,
				code: room.code,
				status: room.status,
				host: room.host,
				players: this.rooms[roomId].players
			}
		}

		// Notify all players in the room about the new player
		room.players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'playerStatusChanged',
				data: data
			});
		});
	}

	private removePlayer(clientId: string, roomId: string, playerId: string) {
		console.log("removing player", roomId, playerId);
		const room = this.rooms[roomId];
		const player = room.players.find(p => p.playerId === playerId);

		if (room.host !== clientId) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Você não é o host desta sala' }
			});
			return;
		}

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao remover jogador. Unidentified Room' }
			});
			return;
		}

		if (!player) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao remover jogador. Unidentified Player' }
			});
			return;
		}

		room.players = room.players.filter(p => p.playerId !== playerId);

		this.notifyClient(playerId, {
			type: 'youAreRemoved',
			data: { message: 'Você foi removido da sala' }
		});

		const data = {
			roomState: {
				roomId: roomId,
				code: room.code,
				status: room.status,
				host: room.host,
				players: this.rooms[roomId].players
			},
			message: `${player.username} foi removido da sala`
		}

		// Notify all players in the room about the new player
		room.players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'playerRemoved',
				data: data
			});
		});
	}

	private startGame(clientId: string, roomId: string) {
		console.log("starting game", roomId);
		const room = this.rooms[roomId];

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao inciar partida. Unidentified Room' }
			});
			return;
		}

		if (room.host !== clientId) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Você não é host desta sala' }
			});
			return;
		}

		room.status = 'inprogress';

		const game = createGame();
		this.gamesByRoom[roomId] = game;

		// Add all players from the room to the game
		/* this.rooms[roomId].players.forEach((player, index) => {
			game.addPlayer(player.playerId, player.username, index);
		}); */

		game.addPlayers(this.rooms[roomId].players);

		game.start();

		// Subscribe to game events
		game.subscribe((message: IGameMessage) => {
			this.rooms[roomId].players.forEach(player => {
				this.notifyClient(player.playerId, message);
			});
		});

		const data = {
			roomState: {
				roomId: roomId,
				code: room.code,
				status: room.status,
				host: room.host,
				players: this.rooms[roomId].players
			},
			gameState: game.gameState
		}

		// Notify all players that the game has started
		this.rooms[roomId].players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'gameStarted',
				data: data
			});
		});
	}

	private handlePlayerMove(clientId: string, roomId: string, keyPressed: string) {

		const room = this.rooms[roomId];
		const gameRoom = this.gamesByRoom[roomId]

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha no jogo. Unidentified Room' }
			});
			return;
		}

		if (!gameRoom) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha no jogo. Match not found' }
			});
			return;
		}

		gameRoom.movePlayer(clientId, keyPressed)









		/* const roomId = Object.keys(this.rooms).find(roomId =>
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
		} */
	}

	private handleDisconnect(clientId: string) {
		// Itera sobre cada sala e remove o usuário desconectado
		Object.entries(this.rooms).forEach(([roomId, roomData]) => {
			const { players } = roomData;

			// Verifica se o usuário está na sala
			if (players.some(player => player.playerId === clientId)) {
				const client = players.find(player => player.playerId === clientId);
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
							data: {
								roomState: {
									roomId: roomId,
									code: this.rooms[roomId].code,
									status: this.rooms[roomId].status,
									host: this.rooms[roomId].host,
									players: this.rooms[roomId].players
								},
								message: `${client?.username} saiu da sala`
							}
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

	//TODO: Modificar as mensagens de atualizações dos clientes para enviar somente
	// os dados modificados ao invés de todo o estado.
	// Da forma que está pode gerar inconsitência nas informações se as mensagens chegarem fora de ordem.
}



export default WebSocketService;