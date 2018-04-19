export interface EveryNetMessage {
  params: Params;
  meta: Meta;
  type: string;
}
export interface Params {
  payload: string;
  port: number;
  duplicate: boolean;
  radio: Radio;
  counter_up: number;
  rx_time: number;
  encrypted_payload: string;
}
export interface Radio {
  delay: number;
  datarate: number;
  modulation: Modulation;
  hardware: Hardware;
  time: number;
  freq: number;
}
export interface Modulation {
  bandwidth: number;
  type: number;
  spreading: number;
  coderate: string;
}
export interface Hardware {
  status: number;
  chain: number;
  tmst: number;
  snr: number;
  rssi: number;
  channel: number;
  gps: Gps;
}
export interface Gps {
  lat: number;
  lng: number;
  alt: number;
}
export interface Meta {
  network: string;
  packet_hash: string;
  application: string;
  device_addr: string;
  time: number;
  device: string;
  packet_id: string;
  gateway: string;
}
