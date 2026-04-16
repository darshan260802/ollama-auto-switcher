export interface Device {
  id: string;
  name: string;
  key: string;
  nickname?: string;
  createdAt: Date;
}

export interface DeviceFormData {
  nickname: string;
  url: string;
}
