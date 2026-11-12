declare module 'ws' {
  import { EventEmitter } from 'events';
  import * as http from 'http';

  export class WebSocket extends EventEmitter {
    static OPEN: number;
    static CLOSED: number;
    static CLOSING: number;
    static CONNECTING: number;

    readyState: number;
    send(data: any, cb?: (err?: Error) => void): void;
    close(code?: number, reason?: string): void;
  }

  export interface ServerOptions {
    server?: http.Server;
    port?: number;
    path?: string;
  }

  export class WebSocketServer extends EventEmitter {
    clients: Set<WebSocket>;
    constructor(options?: ServerOptions);
    close(cb?: (err?: Error) => void): void;
  }
}
