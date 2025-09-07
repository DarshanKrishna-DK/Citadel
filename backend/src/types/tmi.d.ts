declare module 'tmi.js' {
  export interface ClientOptions {
    options?: {
      debug?: boolean;
    };
    connection?: {
      secure?: boolean;
      reconnect?: boolean;
    };
    identity?: {
      username?: string;
      password?: string;
    };
    channels?: string[];
  }

  export interface ChatUserstate {
    id?: string;
    username?: string;
    'display-name'?: string;
    mod?: boolean;
    subscriber?: boolean;
    badges?: { [key: string]: string };
    color?: string;
    'user-type'?: string;
    'room-id'?: string;
    'user-id'?: string;
  }

  export class Client {
    constructor(options?: ClientOptions);
    connect(): Promise<[string, number]>;
    disconnect(): Promise<[string, number]>;
    on(event: 'message', listener: (channel: string, tags: ChatUserstate, message: string, self: boolean) => void): this;
    on(event: 'connected', listener: (address: string, port: number) => void): this;
    on(event: 'disconnected', listener: (reason: string) => void): this;
    on(event: 'timeout', listener: (channel: string, username: string, reason: string, duration: number) => void): this;
    on(event: 'ban', listener: (channel: string, username: string, reason: string) => void): this;
    timeout(channel: string, username: string, duration: number, reason?: string): Promise<[string, string, number, string]>;
    ban(channel: string, username: string, reason?: string): Promise<[string, string, string]>;
    deletemessage(channel: string, messageId: string): Promise<[string, string]>;
  }

  export default Client;
}
