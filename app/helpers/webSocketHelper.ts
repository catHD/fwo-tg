import {
  type ServerToClientMessage,
  serverToClientMessageSchema,
  type ClientToServerMessage,
} from '@fwo/schemas';

export class WebSocketHelper {
  ws: WebSocket;
  id = 0;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  private read(data: string) {
    return serverToClientMessageSchema.safeParse(JSON.parse(data)).data;
  }

  send(message: ClientToServerMessage) {
    this.ws.send(JSON.stringify(message));
  }

  async sendAsync(message: ClientToServerMessage) {
    const id = this.id++;
    this.ws.send(JSON.stringify({ id, ...message }));

    return await new Promise<ServerToClientMessage | undefined>((resolve) => {
      const waitForResponse = ({ data }: MessageEvent) => {
        if (data.id === id) {
          this.ws.removeEventListener('message', waitForResponse);
          resolve(this.read(data));
        }
      };
      this.ws.addEventListener('message', waitForResponse);
    });
  }

  subscribe(listener: (message: ServerToClientMessage) => void) {
    const wrappedListener = ({ data }: MessageEvent) => {
      const message = this.read(data);
      if (message) {
        listener(message);
      }
    };

    this.ws.addEventListener('message', wrappedListener);

    return () => {
      this.ws.removeEventListener('message', wrappedListener);
    };
  }
}
