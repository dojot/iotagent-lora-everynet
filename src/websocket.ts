import WebSocket = require("ws");

/**
 * Class for communications using WebSockets
 */
class WebSocketClient {

  /** Interval between reconnections */
  autoReconnectInterval: number;

  /** Server address (in the form of ``localhost:9000``) */
  server: string;

  /** WebSocket handler */
  websocket?: WebSocket;

  /** Callback invoked when a message is received */
  onMessageCb?: Function;

  /**
   * Constructor
   * @param server The server that this websocket client will connect to
   * @param autoReconnectInterval Interval between reconnections
   */
  constructor(server: string, autoReconnectInterval: number) {
    this.server = server;
    this.autoReconnectInterval = autoReconnectInterval;
    this.websocket = undefined;
    this.onMessageCb = undefined;
  }

  /**
   * Set the callback for received messages
   * @param onMessage The callback to be invoked when a message is received
   */
  onMessage(onMessage: (data: WebSocket.Data) => void) {
    this.onMessageCb = onMessage;
  }

  /**
   * Start the websocket handling
   */
  start() {
    console.log(`Creating connection to server: ${this.server}`);
    this.websocket = new WebSocket(this.server);
    console.log(`WebSocket was created.`);

    this.websocket.on("open", () => {
      console.log("open ws connection");
    });

    this.websocket.on("message", (data: WebSocket.Data) => {
      if (this.onMessageCb) {
        this.onMessageCb(data);
      } else {
        console.log("No message callback was set.");
      }
    });

    this.websocket.on("close", (code: number) => {
      switch (code) {
        case 1000: // CLOSE_NORMAL
          console.log("WebSocket: closed");
          break;
        default:
          // Abnormal closure
          this.reconnect();
          break;
      }
    });

    this.websocket.on("error", (event: any) => {
      switch (event.code) {
        case "ECONNREFUSED":
          this.reconnect();
          break;
        default:
          console.log("Error ws connection: " + event);
          break;
      }
    });
  }

  /**
   * Reconnect the websocket, if any error occured previously.
   */
  reconnect() {
    console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`);
    if (this.websocket) {
      this.websocket.removeAllListeners();
      var that = this;
      setTimeout(() => {
        console.log("WebSocketClient: reconnecting...");
        this.start();
      }, this.autoReconnectInterval);
    }
  }
}

export { WebSocketClient };
export { WebSocket };
