import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

class WebSocketService {
	private clients: { [key: string]: WebSocket } = {};

	constructor(private wss: WebSocketServer) {
		this.initialize();
	}

	public getClient(clientId: string): WebSocket | undefined {
		return this.clients[clientId];
	}


	private initialize() {
		this.wss.on('connection', (ws: WebSocket) => {
			const clientId = uuidv4();
			console.log(`Client connected with ID: ${clientId}`);

			this.clients[clientId] = ws;

			ws.send(JSON.stringify({ type: 'uuid', socketId: clientId }));

			ws.on('message', (message: string) => {
				console.log(`received from ${clientId}:`, message);
			});

			ws.on('close', () => {
				console.log(`Client with ID: ${clientId} disconnected`);
				delete this.clients[clientId];
			});
		});
	}

}

export default WebSocketService;
