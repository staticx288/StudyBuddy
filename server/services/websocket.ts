import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { parse } from 'url';

export interface WebSocketMessage {
  type: 'typing' | 'message' | 'error' | 'connection';
  conversationId?: string;
  userId?: string;
  data?: any;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, { ws: WebSocket; userId: string; conversationId?: string }> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      verifyClient: (info: any) => {
        // Basic verification - in production, you'd want to verify the session/token
        return true;
      }
    });

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(ws: WebSocket, request: any) {
    const clientId = this.generateClientId();
    
    ws.on('message', (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(clientId, message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
        this.sendToClient(clientId, {
          type: 'error',
          data: { message: 'Invalid message format' }
        });
      }
    });

    ws.on('close', () => {
      this.clients.delete(clientId);
      console.log(`WebSocket client ${clientId} disconnected`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.clients.delete(clientId);
    });

    // Store client connection
    this.clients.set(clientId, { ws, userId: '' });

    // Send connection confirmation
    this.sendToClient(clientId, {
      type: 'connection',
      data: { clientId, message: 'Connected to Learning VI' }
    });

    console.log(`WebSocket client ${clientId} connected`);
  }

  private handleMessage(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'typing':
        // Update client info and broadcast typing status
        if (message.userId && message.conversationId) {
          client.userId = message.userId;
          client.conversationId = message.conversationId;
          this.broadcastToConversation(message.conversationId, {
            type: 'typing',
            userId: message.userId,
            data: message.data
          }, clientId);
        }
        break;
      
      default:
        console.log(`Unhandled WebSocket message type: ${message.type}`);
    }
  }

  public sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  public broadcastToConversation(conversationId: string, message: WebSocketMessage, excludeClientId?: string) {
    this.clients.forEach((client, clientId) => {
      if (
        client.conversationId === conversationId &&
        clientId !== excludeClientId &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  public notifyNewMessage(conversationId: string, messageData: any) {
    this.broadcastToConversation(conversationId, {
      type: 'message',
      conversationId,
      data: messageData
    });
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

let websocketService: WebSocketService;

export function initializeWebSocket(server: Server): WebSocketService {
  websocketService = new WebSocketService(server);
  return websocketService;
}

export function getWebSocketService(): WebSocketService {
  return websocketService;
}
