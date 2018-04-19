const config = {
  LORA_SERVER: process.env.LORA_SERVER || '127.0.0.1:10000',
  LORA_ACCESS_TOKEN: process.env.LORA_ACCESS_TOKEN,
  RECONN_INTERVAL: Number(process.env.LORA_RECONN_INTERVAL) || 1000
}

export { config };
