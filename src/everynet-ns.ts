import axios, {AxiosRequestConfig, AxiosPromise, AxiosResponse } from "axios";
import { WebSocket, WebSocketClient } from "./websocket"
import { config } from "./config";
import { EveryNetMessage } from './everynet-message';
import { EveryNetDevice } from './everynet-device';


class EverynetNetworkServer {

  /** WebSocket client used to connect to EveryNet's network-server */
  private wsClient: WebSocketClient;

  /**
   * Flag indicating that this agent is ready to use - all devices and tenants
   * were successfully retrieved.
   */
  private isReady: boolean;

  private wsCallback: (message: EveryNetMessage) => void;

  constructor(wscbk: (message: EveryNetMessage) => void) {
    this.wsClient = new WebSocketClient("ws://" + config.LORA_SERVER, config.RECONN_INTERVAL);
    this.isReady = false;
    this.wsCallback = wscbk;
  }

  /**
   * Process a received message from WebSocket.
   *
   * Its content is supposed to be whatever message the LoRa network-server sent
   * to this IoT agent. This message is supposed to have a EveryNetMessage
   * structure.
   * @param data The data received from WebSocket.
   */
  processWebSocketMessage(data: WebSocket.Data): void {
    let messageObj: EveryNetMessage = JSON.parse(data.toString());
    this.wsCallback(messageObj);
  }

  /**
   * Creates a new device in network server
   * @param everynetDevice The device to be created
   */
  createDevice(everynetDevice: EveryNetDevice) : Promise<void>{
    return new Promise((resolve, reject) => {
      console.log("Sending device creation request to network server...");
      let axiosConfig: AxiosRequestConfig = {
        url: "http://" + config.LORA_SERVER + "/devices?access_token=" + config.LORA_ACCESS_TOKEN,
        method: "POST",
        data: JSON.stringify(everynetDevice),
        headers: {
          "Content-Type": "application/json"
        }
      }
      axios(axiosConfig).then((response: AxiosResponse) => {
        console.log("Response: " + response.status);
        if (response.status == 200) {
          resolve();
        } else {
          reject();
        }
      });
      console.log("... request sent.");
    })
  }

  /**
   * Removes a device from network server
   * @param loraDeviceId The device ID to be removed
   */
  removeDevice(loraDeviceId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log("Sending device removal request to network server...");
      let axiosConfig: AxiosRequestConfig = {
        url: "http://" + config.LORA_SERVER + "/devices/" + loraDeviceId + "?access_token=" + config.LORA_ACCESS_TOKEN,
        method: "DELETE"
      }
      axios(axiosConfig).then((response: AxiosResponse) => {
        console.log("Response: " + response.status);
        if (response.status == 200) {
          resolve();
        } else {
          reject();
        }
      });
      console.log("... request sent.");
    });
  }

  /**
   * Initializes this network server interface.
   */
  init() {
    this.wsClient.onMessage((data: WebSocket.Data): void => {
      this.processWebSocketMessage(data);
    });

    this.wsClient.start();
  }
}

export { EverynetNetworkServer };