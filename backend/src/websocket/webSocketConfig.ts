import WebSocket from 'ws';
import WebSocketService from '../services/webSocketServices';

const clients: { [key: string]: WebSocket[] } = {};

export const initializeWebSocket = (server: any) => {
    const wss = new WebSocket.Server({ server });

    const webSocketService = new WebSocketService(wss);

};



