// WebSocketService.ts
class WebSocketService {
  private socket: WebSocket | null = null;
  private callbacks: { [key: string]: (data: any) => void } = {};
  private socketId: string | null = null;

  connect() {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket(`wss://alpha04.alphaedtech.org.br/ws/`);

      this.socket.onopen = () => {
        console.log('Conectado ao WebSocket');
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Salva o socketId enviado pelo servidor
        if (data.socketId) {
          this.socketId = data.socketId;
          console.log("Socket ID recebido:", this.socketId);
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





// class WebSocketService {
//   private socket: WebSocket | null = null;
//   private callbacks: { [key: string]: (data: any) => void } = {};

//   connect() {
//     console.log("proc", process.env.REACT_APP_URL_ADDRESS)
//     if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
//       this.socket = new WebSocket(`ws://${process.env.REACT_APP_URL_ADDRESS}`);
//       console.log("this socket", this.socket);

//       this.socket.onopen = () => {
//         console.log('Conectado ao WebSocket');
//       };

//       this.socket.onmessage = (event) => {
//         const data = JSON.parse(event.data);

//         console.log("Event data", data);

//         if (data.type && data.type === 'uuid') {
//           console.log('SockeId received');
//           if (this.callbacks['uuid']) {
//             this.callbacks['uuid'](data);
//           }
//         }

//         const callback = this.callbacks[data.noteId];
//         if (callback) {
//           callback(data);
//         }
//       };

//       this.socket.onerror = (error) => {
//         console.error('Erro no WebSocket:', error);
//       };

//       this.socket.onclose = (event) => {
//         console.log('Conexão WebSocket fechada. Código:', event.code, 'Motivo:', event.reason);
//         this.socket = null; // Limpa o socket ao fechá-lo
//       };
//     }
//   }

//   registerCallback(noteId: string, callback: (data: any) => void) {
//     this.callbacks[noteId] = callback;
//   }

//   send(message: any) {
//     if (this.socket && this.socket.readyState === WebSocket.OPEN) {
//       this.socket.send(JSON.stringify(message));
//     }
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.close();
//       this.socket = null;
//       this.callbacks = {};
//     }
//   }
// }

// export const webSocketService = new WebSocketService();
