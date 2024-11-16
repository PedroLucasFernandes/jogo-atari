class WebSocketService {
  private socket: WebSocket | null = null;
  private callbacks: { [key: string]: (data: any) => void } = {};
  private socketId: string | null = null;
  private PING_INTERVAL = 25000; // 25 segundos
  private pingIntervalId: any = null;

  connect() {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket(`ws://localhost:3001`);

      this.socket.onopen = () => {
        console.log("Conexão WebSocket estabelecida.");

        // Iniciar o envio de pings periódicos para manter a conexão ativa
        this.startPing();
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'pong') {
          return;
        }

        // Salva o socketId enviado pelo servidor
        if (data.socketId) {
          this.socketId = data.socketId;
        }

        // Processa outros callbacks e mensagens
        if (data.type && this.callbacks[data.type]) {
          this.callbacks[data.type](data);
        }
      };

      // Quando a conexão é fechada
      this.socket.onclose = () => {
        console.log("Conexão WebSocket fechada.");
        this.stopPing();
        // Tentar reconectar após um breve intervalo
        setTimeout(() => this.connect(), 5000); // 5 segundos (ajustável)
      };

      // Quando ocorre um erro na conexão
      this.socket.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
      };
    }
  }

    // Função para enviar um ping periódico
    private startPing() {
      if (this.pingIntervalId) {
        clearInterval(this.pingIntervalId);
      }

      this.pingIntervalId = setInterval(() => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.send({ type: 'ping' });
        }
      }, this.PING_INTERVAL);
    }

    // Função para parar o envio de pings
    private stopPing() {
      if (this.pingIntervalId) {
        clearInterval(this.pingIntervalId);
        this.pingIntervalId = null;

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
    this.stopPing();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.callbacks = {};
    }
  }
}

export const webSocketService = new WebSocketService();