class WebSocketService {
  private socket: WebSocket | null = null;
  private callbacks: { [key: string]: (data: any) => void } = {};
  private socketId: string | null = null;

  connect() {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket(`ws://localhost:3001`);

      this.socket.onopen = () => {
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Salva o socketId enviado pelo servidor
        if (data.socketId) {
          this.socketId = data.socketId;
        }

        // Processa outros callbacks e mensagens
        if (data.type && this.callbacks[data.type]) {
          this.callbacks[data.type](data);
        }
      };
    }
  }

  getSocketId() {
    return this.socketId;
  }


  registerCallback(eventType: string, callback: (data: any) => void) {
    this.callbacks[eventType] = callback;
  }

  send(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.callbacks = {};
    }
  }
}

export const webSocketService = new WebSocketService();