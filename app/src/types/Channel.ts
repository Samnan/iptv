export interface Channel {
  id: string;
  name: string;
  url: string;
  isFavorite: boolean;
  group?: string;
  logo?: string;
}

export interface ParsedM3U {
  channels: Channel[];
  totalChannels: number;
}