import { WebSocketServer, WebSocket } from 'ws';

class WebSocketService {
	private clients: { [key: string]: { ws: WebSocket, user: any } } = {};

	constructor(private wss: WebSocketServer) {
		this.initialize();
	}

	public getClient(clientId: string): WebSocket | undefined {
		return this.clients[clientId]?.ws;
	}

	private initialize() {
		console.log("Chegou aqui no websocketserver para criar um socketId")
		this.wss.on('connection', (ws: WebSocket, request: any) => {
			const user = request.user;  // Acessa o usuário autenticado

			console.log("Esse é o usuário autenticado", user)

			if (!user) {
				ws.close(); // Fecha a conexão se o usuário não estiver autenticado
				return;
			}

			const clientId = user.id; // Usando o ID do usuário como clientId

			console.log(`User connected with ID: ${clientId}`);

			// Armazena o WebSocket e os dados do usuário autenticado
			this.clients[clientId] = { ws, user };

			ws.send(JSON.stringify({ type: 'uuid', socketId: clientId }));

			ws.on('message', (message: string) => {
				console.log(`Received from ${clientId}:`, message);
			});

			ws.on('close', () => {
				console.log(`Connection closed for user: ${clientId}`);
				delete this.clients[clientId];
			});
		});
	}
}

export default WebSocketService;