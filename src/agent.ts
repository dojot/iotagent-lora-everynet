import util = require("util");
// import { A} from "axios";
import { IoTAgent }  from "dojot-iotagent";
import { WebSocket, WebSocketClient } from "./websocket"
import { config } from "./config";
import { EveryNetMessage } from './everynet-message';
import { CacheHandler, CacheEntry } from "./cache";
import { DojotDevice, DeviceEvent, Attr } from './dojot-device';


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

  findLoRaId(device: DojotDevice, tenant: string) : [Attr | null, string | null] {
    // Look for an attribute called device_eui.
    for (let templatemap of device.attrs) {
      for (let templateid in templatemap) {
        for (let attr of templatemap[templateid]) {
          if (attr.label == "device_eui") {
            // Got it.
            return [attr, templateid];
          }
        }
      }
    }
    return [null, null];
  }

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

    this.iotagent.updateAttrs(cacheEntry.id, cacheEntry.tenant, messageObj);
  }

  processDeviceCreation(device: DeviceEvent) {
    // axios.default({
    //   "url": config.LORA_SERVER + "/devices"

    // })
    // return new Promise((resolve, reject) => {
    //   axios({
    //     'url': this.auth.manager + '/admin/tenants'
    //   }).then((response) => {
    //     resolve(response.data.tenants);
    //   }).catch((error) => {
    //     reject(error);
    //   })
    // })


  }

  init() {
    this.wsClient.onMessage((data: WebSocket.Data): void => {
      this.processWebSocketMessage(data);
    });

    this.iotagent.on("device.create", (data: any) => {
      this.processDeviceCreation(data);
    })


    this.wsClient.start();
  }
}



export { Agent };