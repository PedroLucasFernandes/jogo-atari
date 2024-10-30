import WebSocket from 'ws';

const clients: { [key: string]: WebSocket[] } = {};

export const initializeWebSocket = (server: any) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Client connected');
        ws.on('message', (message) => {
            console.log('Received message:', message);
        });
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    return wss;
};
