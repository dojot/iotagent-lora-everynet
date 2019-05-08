import util = require("util");
import { IoTAgent }  from "@dojot/iotagent-nodejs";
import { EveryNetMessage } from './everynet-message';
import { CacheHandler, CacheEntry } from "./cache";
import { DojotDevice, DeviceEvent, Attr } from './dojot-device';
import { convertDeviceEventToEveryNet } from './everynet-device';
import { EverynetNetworkServer } from './everynet-ns';
import * as decode from './everynet-payload';

class Agent {

  /** dojot IoT agent helper */
  private iotagent: IoTAgent;

  /** Network server interface */
  private everynetNs: EverynetNetworkServer;

  /** Device cache - translates LoRa device ID to dojot device ID */
  private cacheHandler: CacheHandler;


  constructor() {
    this.iotagent = new IoTAgent();
    this.cacheHandler = new CacheHandler();
    this.everynetNs = new EverynetNetworkServer((msg: EveryNetMessage): void => {
      this.processWebSocketMessage(msg);
    });
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
  findLoRaId(device: DojotDevice) : [Attr | null, string | null] {
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
   * Process a received message from network server.
   *
   * Its content is supposed to be whatever message the LoRa network-server sent
   * to this IoT agent. This message is supposed to have a EveryNetMessage
   * structure.
   * @param data The data received from WebSocket.
   */
  processWebSocketMessage(messageObj: EveryNetMessage): void {
    let cacheEntry = this.cacheHandler.lookup(messageObj.meta.device_addr);

    if (cacheEntry === null) {
      console.log('Cannot get device data from device ID: ' + messageObj.meta.device_addr);
      return;
    }
    if (cacheEntry.id === "") {
      console.log("No device ID was detected. Discarding message");
      // TODO emit iotagent warning
      return;
    }
    console.log("Detected Dojot device ID: " + cacheEntry.id + " <-> LoRa device eui: " + messageObj.meta.device_addr);

    // TODO It might be a good idea to format the message sent through Kafka
    // as a simple key-value JSON, so a flow to translate this message is not
    // needed.
    

    if (messageObj.type === "uplink") {
        let decryptedPayload: any = decode(messageObj.params.payload);

        let updateData = {
         "encrypted_payload": messageObj.params.payload,
         "battery_voltage": decryptedPayload["Battery voltage"]["value"],
         "distance": decryptedPayload["Distance"]["value"]
        }

        console.log("Update data: " + updateData);

        this.iotagent.updateAttrs(cacheEntry.id, cacheEntry.tenant, updateData, {});
    }
  }

  processDeviceCreation(tenant: string, device: DeviceEvent) {

    console.log("Creating device: ");
    console.log(util.inspect(device, {depth: null}));

    console.log("Trying to find LoRa template...");
    let dojotDevice: DojotDevice = device.data;
    let [attr, templateid] = this.findLoRaId(dojotDevice);
    console.log("Result is: " + util.inspect(attr, {depth: null}));

    if (templateid && attr) {
      let everynetDevice = convertDeviceEventToEveryNet(device, templateid);
      if (everynetDevice == null) {
        console.error("A mandatory parameter is missing. Check your device template.");
        return;
      }
      let loraId = everynetDevice.dev_eui;
      this.cacheHandler.cache[loraId] = new CacheEntry(dojotDevice.id, tenant);
    
    }
  }

  processDeviceRemoval(device: DeviceEvent) {
    console.log("Removing device: ");
    console.log(util.inspect(device, {depth: null}));

    console.log("Trying to find LoRa template...");
    let [attr, templateid] = this.findLoRaId(device.data)
    console.log("Result is: " + attr)

    if (templateid && attr) {
      let loraId = attr.static_value;
      this.everynetNs.removeDevice(loraId).then(() => {
        delete this.cacheHandler.cache[loraId];
      })
    }
  }

  init() {
    this.everynetNs.init();

    try {
      this.iotagent.init().then(() => {
        this.iotagent.generateDeviceCreateEventForActiveDevices();
      }).catch((err: any) => {
        console.log(err);
      });
    } catch (error) {
      console.log(error);
    }

    this.iotagent.on('iotagent.device', 'device.create', (tenant: string, event: any) => {
      console.log("Processing device creation")
      this.processDeviceCreation(tenant, event);
    })

    this.iotagent.on('iotagent.device', 'device.remove', (tenant: string, event: any) => {
      console.log("Processing device creation")
      this.processDeviceRemoval(event);
    })
  }
}



export { Agent };
