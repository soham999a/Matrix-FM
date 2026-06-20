export interface RadioStation {
  id: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  language: string;
  codec: string;
  bitrate: number;
  votes: number;
  geo_lat: number | null;
  geo_long: number | null;
}

export interface Region {
  code: string;
  name: string;
  countryCode: string;
  curated: string[];
}

export interface FavoriteStation {
  id: string;
  name: string;
  url: string;
  favicon: string;
  country: string;
  tags: string;
  addedAt: number;
}
