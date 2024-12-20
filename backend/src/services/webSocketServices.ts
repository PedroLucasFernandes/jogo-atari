import { WebSocketServer, WebSocket } from 'ws';
import createGame from './game';
import { chatColors, gameStatus, IGame, IGameMessage, IRoomState } from '../interfaces/game';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

interface ExtendedRequest extends Request {
	user?: any;
}

class WebSocketService {
	private clients: { [key: string]: { ws: WebSocket, user: any, isAlive: boolean } } = {};
	//private rooms: { [key: string]: string[] } = {}; // roomId -> array of client IDs
	private rooms: {
		[key: string]: {
			players: { playerId: string; username: string; ready: boolean, isHost: boolean }[];
			hasCode: boolean;
			code: string;
			status: gameStatus,
			host: string;
		}
	} = {};
	private gamesByRoom: { [key: string]: IGame } = {}; // roomId -> game instance
	private roomObservers: Set<string> = new Set(); // Armazena os clientIds dos observadores
	private PING_INTERVAL = 30000;

	constructor(private wss: WebSocketServer) {
		this.initialize();
		this.startRoomCleanup();
	}

	public getClient(clientId: string): WebSocket | undefined {
		return this.clients[clientId]?.ws;
	}

	public clearGameSession(roomId: string): void {
		const game = this.gamesByRoom[roomId];
		const room = this.rooms[roomId];

		if (game) {
			console.log("game session cleared");
			delete this.gamesByRoom[roomId];
		}

		if (room) {
			console.log("room cleared");
			delete this.rooms[roomId];

			this.notifyRoomObservers();
		}
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

				//const clientId = `socket_${decoded.id}_${Date.now()}`;
				const clientId = `socket_${decoded.id}`;
				const color = this.getRandomColor()
				this.clients[clientId] = {
					ws,
					user: {
						id: decoded.id,
						color,
						// Adicione outros dados do usuário que você precise
					},
					isAlive: true
				};

				// Enviar o ID do socket para o cliente
				ws.send(JSON.stringify({ type: 'uuid', socketId: clientId, color }));

				// Configurar listeners de mensagens
				ws.on('message', (message) => {
					try {
						const parsedMessage = JSON.parse(
							typeof message === 'string' ? message : message.toString()
						);
						if (parsedMessage.type === 'ping') {
							// Responder ao ping sem encerrar a conexão
							ws.send(JSON.stringify({ type: 'pong' }));
						} else {
							this.handleMessage(clientId, parsedMessage);
						}
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
			case 'movePlayer':
				this.handlePlayerMove(clientId, message.data.roomId, message.data.keyPressed, message.data.moveNumber);
				break;
			case 'checkGameInProgress':
				this.checkGameInProgress(clientId);
				break;
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
			case 'closeRoom':
				this.closeRoom(clientId, message.data.roomId);
				break;
			case 'leaveRoom':
				this.leaveRoom(clientId, message.data.roomId);
				break;
			case 'toggleReadyStatus':
				this.toggleReadyStatus(clientId, message.data.roomId, message.data.playerId);
				break;
			case 'sendChatMessage':
				this.sendChatMessage(clientId, message.data.roomId, message.data.chatMessage);
				break;
			case 'removePlayer':
				this.removePlayer(clientId, message.data.roomId, message.data.playerId);
				break;
			case 'leaveGame':
				this.leaveGame(clientId, message.data.roomId);
				break;
			default:
				console.error(`Invalid message type received: ${message.type}`);
		}
	}

	private checkGameInProgress(clientId: string) {
		const client = this.clients[clientId];
		if (!client) {
			return;
		}

		// Itera sobre cada sala para verificar se o jogador está em uma sala e se o jogo está em andamento
		Object.entries(this.rooms).forEach(([roomId, roomData]) => {
			const { players, status } = roomData;

			// Verifica se o jogador está presente na sala
			const playerInRoom = players.find(player => player.playerId === clientId);

			if (playerInRoom) {
				// Verifica se o jogo da sala está em progresso e se a sala possui um jogo ativo em gamesByRoom
				const gameInProgress = this.gamesByRoom[roomId] && status === 'inprogress';

				if (gameInProgress) {
					// Monta os estados para notificação
					const roomState = {
						roomId,
						hasCode: roomData.hasCode,
						code: roomData.code,
						status: roomData.status,
						host: roomData.host,
						players: roomData.players
					};

					const gameState = this.gamesByRoom[roomId].gameState;

					// Notifica o cliente sobre o estado do jogo e da sala
					this.notifyClient(clientId, {
						type: 'gameInProgress',
						data: {
							roomState,
							gameState
						}
					});
				}
			}
		});
	}

	private getRoomStates() {
		const roomStates: IRoomState[] = Object.entries(this.rooms).map(([roomId, room]) => ({
			roomId, // A chave é o id da sala
			hasCode: room.hasCode,
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
		this.subscribeToRoomUpdates(clientId);
	}

	// Adiciona um cliente ao observer
	public subscribeToRoomUpdates(clientId: string) {
		this.roomObservers.add(clientId);
		//this.getRooms(clientId); // Envia o estado inicial das salas para o cliente
	}

	// Remove um cliente do observer
	public unsubscribeFromRoomUpdates(clientId: string) {
		this.roomObservers.delete(clientId);
	}

	// Notifica todos os observadores sobre a atualização das salas
	private notifyRoomObservers() {
		const roomStates = this.getRoomStates();
		this.roomObservers.forEach(observerId => {
			this.notifyClient(observerId, {
				type: 'roomsReceived', //Adicionar outra mensagem diferente se for preciso
				data: { rooms: roomStates }
			});
		});
	}

	private createRoom(clientId: string, username: string, code: string) {
		console.log("createRoom", clientId, username, code);
		const roomId = uuidv4().slice(0, 6).toLocaleUpperCase(); // Gera uma chave única com 6 caracteres
		if (!this.rooms[roomId]) {
			this.rooms[roomId] = {
				status: 'waiting',
				host: clientId,
				players: [{ playerId: clientId, username: username, ready: false, isHost: true }],
				hasCode: code !== '' ? true : false,
				code
			};

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
				hasCode: this.rooms[roomId].hasCode,
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

		this.notifyClient(clientId, {
			type: 'receivedChatMessage',
			data: {
				chatMessage: {
					type: 'join',
					playerId: clientId,
					username: username,
					content: 'entrou!',
					color: this.clients[clientId].user.color,
				}
			}
		});

		this.notifyRoomObservers();
	}

	private closeRoom(clientId: string, roomId: string) {
		const room = this.rooms[roomId];
		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao encerrar sala. Unidentified Room' }
			});
			return;
		}
		const playerIndex = room.players.findIndex(p => p.playerId === clientId);

		if (playerIndex === -1) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao encerrar sala. Unidentified Host' }
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

			this.notifyRoomObservers();
			return;
		}
	}

	private joinRoom(clientId: string, username: string, roomId: string, code: string) {

		const room = this.rooms[roomId];

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao entrar na sala. Unidentified Room' }
			});
			return;
		}

		if (room.hasCode && room.code !== code) {
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

		const data = {
			roomState: {
				roomId: roomId,
				hasCode: room.hasCode,
				code: room.code,
				status: room.status,
				host: room.host,
				players: this.rooms[roomId].players
			},
			message: `${username} entrou na sala`
		}

		room.players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'playerJoined',
				data: data
			});
		});

		room.players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'receivedChatMessage',
				data: {
					chatMessage: {
						type: 'join',
						playerId: clientId,
						username: room.players.find(p => p.playerId === clientId)?.username,
						content: 'entrou!',
						color: this.clients[clientId].user.color,
					}
				}
			});
		});

		this.unsubscribeFromRoomUpdates(clientId);
		this.notifyRoomObservers();
	}

	private leaveRoom(clientId: string, roomId: string) {
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

				this.notifyClient(clientId, {
					type: 'youLeft',
					data: { message: 'Você saiu da sala' }
				});

				this.notifyRoomObservers();
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
				hasCode: room.hasCode,
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

		room.players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'receivedChatMessage',
				data: {
					chatMessage: {
						type: 'left',
						playerId: clientId,
						username: client.username,
						content: 'saiu!',
						color: this.clients[clientId].user.color,
					}
				}
			});
		});

		this.notifyRoomObservers();
	}

	private toggleReadyStatus(clientId: string, roomId: string, playerId: string) {
		const room = this.rooms[roomId];

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao se preparar. Unidentified Room' }
			});
			return;
		}
		const player = room.players.find(p => p.playerId === playerId);

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
				hasCode: room.hasCode,
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

	private sendChatMessage(clientId: string, roomId: string, chatMessage: string) {
		const room = this.rooms[roomId];
		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao enviar mensagem. Unidentified Room' }
			});
			return;
		}

		if (!chatMessage) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao enviar mensagem. Empty message' }
			});
			return;
		}

		const data = {
			chatMessage: {
				type: 'message',
				playerId: clientId,
				username: room.players.find(p => p.playerId === clientId)?.username,
				content: chatMessage,
				color: this.clients[clientId].user.color,
			}
		}

		this.rooms[roomId].players.forEach(player => {
			if (player.playerId === clientId) return;

			this.notifyClient(player.playerId, {
				type: 'receivedChatMessage',
				data: data
			});
		});
	}

	private removePlayer(clientId: string, roomId: string, playerId: string) {
		const room = this.rooms[roomId];

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao remover jogador. Unidentified Room' }
			});
			return;
		}

		const player = room.players.find(p => p.playerId === playerId);

		if (room.host !== clientId) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Você não é o host desta sala' }
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
				hasCode: room.hasCode,
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

		room.players.forEach(player => {
			this.notifyClient(player.playerId, {
				type: 'receivedChatMessage',
				data: {
					chatMessage: {
						type: 'removed',
						playerId: playerId,
						username: player.username,
						content: 'foi removido!',
						color: this.clients[playerId].user.color,
					}
				}
			});
		});

		this.notifyRoomObservers();
	}

	private startGame(clientId: string, roomId: string) {
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

		if (room.players.length < 2) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'A sala precisa ter pelo menos 2 jogadores' }
			});
			return;
		}

		//verificar se todos os jogdores estão com o status ready
		const allPlayersReady = room.players.every(player => player.ready);
		if (!allPlayersReady) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Todos os jogadores devem estar prontos para iniciar a partida' }
			});
			return;
		}

		room.status = 'inprogress';

		const game = createGame({
			roomId,
			hasCode: room.hasCode,
			code: room.code,
			status: room.status,
			host: room.host,
			players: room.players
		});
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
				hasCode: room.hasCode,
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

		this.notifyRoomObservers();
	}

	private handlePlayerMove(clientId: string, roomId: string, keyPressed: string, moveNumber: number) {
		//console.log(this.gamesByRoom[roomId].gameState);
		console.log("moveNumber1: " + moveNumber);

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

		gameRoom.movePlayer(clientId, keyPressed, moveNumber);

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

	private leaveGame(clientId: string, roomId: string) {
		console.log("leaving game", roomId);
		const room = this.rooms[roomId];

		if (!room) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao deixar sala do jogo. Unidentified Room' }
			});
			return;
		}

		const game = this.gamesByRoom[roomId];
		if (!game) {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao sair da partida. Match not found' }
			});
			return;
		}

		// Remover jogador da lista de `players` da sala
		const playerIndex = room.players.findIndex(player => player.playerId === clientId);
		if (playerIndex !== -1) {
			const removedPlayer = room.players.splice(playerIndex, 1)[0];

			// Se o jogador que saiu era o host, transfere a posição de host para outro jogador
			if (removedPlayer.isHost && room.players.length > 0) {
				room.players[0].isHost = true;
				room.host = room.players[0].playerId; // Atualiza o novo host no estado da sala
			}

			// Remover jogador do estado do jogo
			const updatedPlayers = { ...game.gameState.players };
			delete updatedPlayers[clientId];

			// Remover planetas associados ao jogador que saiu
			const updatedPlanets = game.gameState.planets.filter(planet => planet.ownerId !== clientId);

			game.setState({
				players: updatedPlayers,
				planets: updatedPlanets // Atualiza o estado do jogo sem os planetas do jogador removido
			});

			this.notifyClient(clientId, {
				type: 'youLeftGame',
				data: {
					roomId,
					message: `Você abandonou a partida`
				}
			});

			// Notificar os demais jogadores sobre a saída e a atualização do estado
			room.players.forEach(player => {
				this.notifyClient(player.playerId, {
					type: 'playerLeftGame',
					data: {
						roomState: {
							roomId: roomId,
							hasCode: room.hasCode,
							code: room.code,
							status: room.status,
							host: room.host,
							players: room.players
						},
						gameState: game.gameState,
						message: `${removedPlayer.username} abandonou a partida`
					}
				});
			});
		} else {
			this.notifyClient(clientId, {
				type: 'error',
				data: { message: 'Falha ao sair do jogo. Unidentified Player' }
			});
		}
	}

	private handleDisconnect(clientId: string) {
		// Itera sobre cada sala e remove o usuário desconectado
		Object.entries(this.rooms).forEach(([roomId, roomData]) => {
			const { players, status } = roomData;

			// Verifica se o usuário está na sala
			if (players.some(player => player.playerId === clientId)) {
				const client = players.find(player => player.playerId === clientId);

				// Verifica se o jogo já iniciou (status == 'inprogress')
				if (status !== 'inprogress') {
					// Se o jogo não estiver em andamento, remove o usuário da lista
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
										hasCode: this.rooms[roomId].hasCode,
										code: this.rooms[roomId].code,
										status: this.rooms[roomId].status,
										host: this.rooms[roomId].host,
										players: this.rooms[roomId].players
									},
									message: `${client?.username} saiu da sala`
								}
							});
						});

						this.rooms[roomId].players.forEach(player => {
							this.notifyClient(player.playerId, {
								type: 'receivedChatMessage',
								data: {
									chatMessage: {
										type: 'left',
										playerId: player.playerId,
										username: player.username,
										content: 'saiu!',
										color: this.clients[player.playerId].user.color,
									}
								}
							});
						});
					}

					this.notifyRoomObservers();
				} else {
					// Caso o jogo tenha iniciado, apenas notifique os outros jogadores
					this.rooms[roomId].players.forEach(player => {
						this.notifyClient(player.playerId, {
							type: 'playerDisconnected',
							data: {
								roomState: {
									roomId: roomId,
									hasCode: this.rooms[roomId].hasCode,
									code: this.rooms[roomId].code,
									status: this.rooms[roomId].status,
									host: this.rooms[roomId].host,
									players: this.rooms[roomId].players
								},
								message: `${client?.username} perdeu a conexão`
							}
						});
					});

					this.rooms[roomId].players.forEach(player => {
						this.notifyClient(player.playerId, {
							type: 'receivedChatMessage',
							data: {
								chatMessage: {
									type: 'disconnected',
									playerId: player.playerId,
									username: player.username,
									content: 'perdeu a conexão!',
									color: this.clients[player.playerId].user.color,
								}
							}
						});
					});
				}
			}
		});

		// Remove o cliente da lista de clientes ativos
		delete this.clients[clientId];
	}

	public notifyClient(clientId: string, message: any) {
		const client = this.clients[clientId];
		if (client && client.ws.readyState === WebSocket.OPEN) {
			client.ws.send(JSON.stringify(message));
		}
	}

	private getRandomColor(): string {
		const randomIndex = Math.floor(Math.random() * chatColors.length);
		return chatColors[randomIndex];
	}

	//Exclui salas bugadas (sem jogadores)
	private startRoomCleanup() {
		setInterval(() => {
			Object.keys(this.rooms).forEach((roomId) => {
				const room = this.rooms[roomId];
				if (room.players.length === 0 && room.status === 'inprogress') {
					if (this.gamesByRoom[roomId]) {
						delete this.gamesByRoom[roomId];
					}
					delete this.rooms[roomId];
					this.notifyRoomObservers();
				}
			});
		}, 15000);
	}

	//TODO: Modificar as mensagens de atualizações dos clientes para enviar somente
	// os dados modificados ao invés de todo o estado.
	// Da forma que está pode gerar inconsitência nas informações se as mensagens chegarem fora de ordem.
}



export default WebSocketService;