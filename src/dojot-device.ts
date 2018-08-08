export interface DojotDevice {
  attrs: Attrs;
  created: string;
  id: string;
  label: string;
  templates?: string[] | null;
}

export interface Attrs {
  [templateid: string]: Attr[]
}

export interface Attr {
  created: string;
  id: number;
  label: string;
  template_id: string;
  type: string;
  value_type: string;
  static_value: string;
}

export interface DeviceEvent {
  event: "create" | "remove" | "update" | "actuate";
  data: DojotDevice;
  meta: any;
}