const config = {
  LORA_SERVER: process.env.LORA_SERVER || 'wss://ns.atc.everynet.io/api/v1.0/data',
  LORA_ACCESS_TOKEN: process.env.LORA_ACCESS_TOKEN || '5b2278e7a99a0a000605423c',
  RECONN_INTERVAL: Number(process.env.LORA_RECONN_INTERVAL) || 1000
}

export { config };
