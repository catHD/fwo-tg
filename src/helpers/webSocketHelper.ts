import { clientToServerMessageSchema, type ServerToClientMessage } from '@fwo/schemas';
import type { Server, ServerWebSocket } from 'bun';

export class WebSocketHelper {
  public raw!: ServerWebSocket;
  static server: Server;

  static setServer(server: Server) {
    WebSocketHelper.server = server;
  }

  static read(message: string) {
    const { data, error } = clientToServerMessageSchema.safeParse(JSON.parse(message));

    if (error) {
      console.log(error);
    }

    return data;
  }

  setWs(ws: ServerWebSocket) {
    this.raw = ws;
  }

  send(message: ServerToClientMessage) {
    return this.raw.send(JSON.stringify(message));
  }

  // broadcast(message: ServerToClientMessage) {
  //   WebSocketHelper.server.publish(message.type, JSON.stringify(message));
  // }

  publish(message: ServerToClientMessage) {
    WebSocketHelper.server.publish(message.type, JSON.stringify(message));
  }
}
