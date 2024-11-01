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
		this.wss.on('connection', (ws: WebSocket, request: any) => {
			const user = request.user;  // Acessa o usuário autenticado

			if (!user) {
				ws.close();
				return;
			}

			const clientId = user.id;

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