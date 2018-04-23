import util = require("util");
import axios, {AxiosRequestConfig, AxiosPromise, AxiosResponse } from "axios";
import { IoTAgent }  from "dojot-iotagent";
import { WebSocket, WebSocketClient } from "./websocket"
import { config } from "./config";
import { EveryNetMessage } from './everynet-message';
import { CacheHandler, CacheEntry } from "./cache";
import { DojotDevice, DeviceEvent, Attr } from './dojot-device';
import { EveryNetDevice, convertDeviceEventToEveryNet } from './everynet-device';


class Agent {

  /** dojot IoT agent helper */
  private iotagent: IoTAgent;

  /** WebSocket client used to connect to EveryNet's network-server */
  private wsClient: WebSocketClient;

  /** Device cache - translates LoRa device ID to dojot device ID */
  private cacheHandler: CacheHandler;

  /**
   * Flag indicating that this agent is ready to use - all devices and tenants
   * were successfully retrieved.
   */
  private isReady: boolean;

  constructor() {
    this.iotagent = new IoTAgent();
    this.cacheHandler = new CacheHandler();
    this.wsClient = new WebSocketClient("ws://" + config.LORA_SERVER, config.RECONN_INTERVAL);
    this.isReady = false;
  }

  /**
   * Look for LoRa device_eui attribute among all other attributes in a device.
   *
   * If a attribute called "device_eui" (device identifier for LoRa) is found,
   * then it is returned alongside its template ID (as there is no way so far
   * to identify the template related to LoRa devices).
   *
   * @param device The device to be verified.
   * @param tenant Tenant associated to the device.
   * @returns The identifier attribute (as is retrieved from the device) and
   * which template is associated to it.
   */
  findLoRaId(device: DojotDevice, tenant: string) : [Attr | null, string | null] {
    // Look for an attribute called device_eui.
    for (let templateid in device.attrs) {
      if (device.attrs.hasOwnProperty(templateid)) {
        for (let attr of device.attrs[templateid]) {
          if (attr.label == "dev_eui") {
            // Got it.
            return [attr, templateid];
          }
        }
      }
    }
    return [null, null];
  }


  /**
   * Perform pre-initialization tasks, such as fill the cache before starting
   * receiving device updates.
   */
  warmup() {
    this.iotagent.init();
    // Retrieve all devices
    this.iotagent.listTenants().then((tenants: string[]) => {
      for (let tenant of tenants) {
        this.iotagent.listDevices(tenant).then((devices: string[]) => {
          for (let device of devices) {
            this.iotagent.getDevice(device, tenant).then((deviceinfo: DojotDevice) => {
              let [attr, templateid] = this.findLoRaId(deviceinfo, tenant);
              if (attr != null) {
                this.cacheHandler.cache[attr.static_value] = new CacheEntry(deviceinfo.id, tenant);
              }
            });
          }
        })
      }
    });
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
    if (messageObj.meta === undefined || messageObj.meta.device === undefined) {
      console.log('Cannot get meta attr or meta.device attr from JSON. Discarding message');
      return;
    }

    let cacheEntry = this.cacheHandler.lookup(messageObj.meta.device);

    if (cacheEntry === null) {
      console.log('Cannot get device data from device ID: ' + messageObj.meta.device);
      return;
    }
    if (cacheEntry.id === "") {
      console.log("No device ID was detected. Discarding message");
      // TODO emit iotagent warning
      return;
    }
    console.log("Detected Dojot device ID: " + cacheEntry.id + " <-> LoRa device eui: " + messageObj.meta.device);

    // TODO It might be a good idea to format the message sent through Kafka
    // as a simple key-value JSON, so a flow to translate this message is not
    // needed.

    let updateData = {
      "encrypted_payload": messageObj.params.encrypted_payload
    }
    this.iotagent.updateAttrs(cacheEntry.id, cacheEntry.tenant, updateData, {});
  }

  processDeviceCreation(device: DeviceEvent) {

    console.log("Creating device: ");
    console.log(util.inspect(device, {depth: null}));

    console.log("Trying to find LoRa template...");

    let dojotDevice: DojotDevice = device.data;
    let tenant = device.meta["service"];
    let [attr, templateid] = this.findLoRaId(dojotDevice, tenant);
    console.log("Result is: " + util.inspect(attr, {depth: null}));

    if (templateid && attr) {
      let everynetDevice = convertDeviceEventToEveryNet(device, templateid);
      if (everynetDevice == null) {
        console.error("A mandatory parameter is missing. Check your device template.");
        return;
      }
      let loraId = everynetDevice.dev_eui;
      console.log("Sending device creation request to network server...");
      let axiosConfig: AxiosRequestConfig = {
        url: "http://" + config.LORA_SERVER + "/devices",
        method: "POST",
        data: JSON.stringify(everynetDevice),
        headers: {
          "Content-Type": "application/json"
        }
      }
      axios(axiosConfig).then((response: AxiosResponse) => {
        console.log("Response: " + response.status);
        if (response.status == 200) {
          this.cacheHandler.cache[loraId] = new CacheEntry(dojotDevice.id, tenant);
        }
      });
      console.log("... request sent.");

    }
  }

  processDeviceRemoval(device: DeviceEvent) {
    console.log("Removing device: ");
    console.log(util.inspect(device, {depth: null}));

    console.log("Trying to find LoRa template...");
    let [attr, templateid] = this.findLoRaId(device.data, device.meta["service"])
    console.log("Result is: " + attr)

    if (templateid && attr) {
      console.log("Sending device creation request to network server...");
      let loraId = attr.static_value;
      let axiosConfig: AxiosRequestConfig = {
        url: "http://" + config.LORA_SERVER + "/devices/" + attr.static_value,
        method: "DELETE"
      }
      axios(axiosConfig).then((response: AxiosResponse) => {
        console.log("Response: " + response.status);
        if (response.status == 200) {
          delete this.cacheHandler.cache[loraId];
        }
      });
      console.log("... request sent.");
    }
  }

  init() {
    this.wsClient.onMessage((data: WebSocket.Data): void => {
      this.processWebSocketMessage(data);
    });

    this.iotagent.on("device.create", (data: any) => {
      console.log("Processing device creation")
      this.processDeviceCreation(data);
    })

    this.iotagent.on("device.remove", (data: any) => {
      console.log("Processing device creation")
      this.processDeviceRemoval(data);
    })

    this.wsClient.start();
  }
}



export { Agent };