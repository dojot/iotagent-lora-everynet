import { IoTAgent }  from "dojot-iotagent";
import { WebSocketClient } from "./websocket"
import { config } from "./config";
import { Agent } from "./agent";


if (config.LORA_ACCESS_TOKEN == "" || config.LORA_ACCESS_TOKEN == null) {
  console.error("LoRa access token was not defined. Can't go on without it.")
  process.exit(-1);
}

console.log("Starting agent");
let agent = new Agent();
agent.warmup();
agent.init();