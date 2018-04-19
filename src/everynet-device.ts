export interface EveryNetDevice {
  dev_eui: string; /** DevEUI as described in LoRaWAN specification */
  app_eui: string; /** AppEUI as described in LoRaWAN specification */
  app_key: string; /** AppEUI as described in LoRaWAN specification */
  tags?: (null)[] | null;
  activation: "OTAA" | "ABP";  /** Type of activation */
  encryption: "NS" | "APP"; /** Type of encryption */
  dev_addr: string; /** DevAddr as described in LoRaWAN specification */
  nwkskey: string; /** Network Session Key as described in LoRaWAN specification */
  appskey: string; /** Application Session Key as described in LoRaWAN specification */
  /**
   * Device class as described in LoRaWAN specification. 
   * Possible values are: A, C.
   * Class B selected automatically. 
   */
  dev_class: "A" | "B" | "C"; 
  adr: Adr; /** Adaptive data rate object */
  band: string; /** Device band name */

  block_downlink?: boolean; /** If set to ‘true’ Network Server will ignore device’s downlink messages */
  block_uplink?: boolean; /** If set to ‘true’ Network Server will ignore device’s uplink messages */
  counter_down?: number; /** Downlink counter value */
  counter_up?: number; /** Uplink counter value */
  counters_size: 2 | 4; /** Counter size in bytes. Could be 2 or 4. */
  geolocation?: Geolocation; /** Geolocation object */
  last_activity?: number; /** UNIX timestamp of last device activity (last message received) */
  last_join?: number; /** UNIX timestamp of last device join */

  rx1?: RX1; /** 	Params of first RX window */

  /**
   * Enable strict security mode. 
   * Device must have strictly increasing counter.
   */
  strict_counter: boolean; 
  rx2?: RX2; /** Params of second RX window */
}

export interface Geolocation {
  lat: number; /** Latitude */
  lng: number; /** Longitude */
  precision: number;
}

export interface RX1 {
  delay: number; /** RX1 delay */
  status: "processing" | "pending" | "set"; /** Current status */
  current_delay: number; /** Current RX1 delay */
}

export interface RX2 {
  /**
   * if set to ‘true’ Network Server will send downlink messages in second RX window
   */
  force: boolean;
}

export interface Adr {
  datarate: null | number; /** Currently datarate */
  enabled: boolean; /** Device ADR status */
  mode: "on" | "off" | "static"; /** ADR mode */
  tx_power: number | null; /** TX power */
}
