import { useQuery } from "@tanstack/react-query";
import type { RadioStation } from "../types/radio";
import { REGIONS } from "../data/regions";

const API_SERVERS = [
  "https://de1.api.radio-browser.info/json",
  "https://at1.api.radio-browser.info/json",
  "https://nl1.api.radio-browser.info/json",
];

const CORS_PROXY = "https://api.allorigins.win/raw?url=";

const CODEC_PREFERENCE: Record<string, number> = {
  MP3: 4,
  AAC: 3,
  OGG: 2,
  VORBIS: 2,
  OPUS: 1,
  FLAC: 0,
  WMA: 0,
};

const BROKEN_URL_PATTERNS = [/\.m3u8/i, /\.flv/i, /\.f4m/i, /\.smil/i];

function safeString(val: unknown): string {
  if (typeof val === "string" && val !== "null" && val !== "") return val;
  return "";
}

function getCodecScore(codec: string): number {
  const key = codec.toUpperCase().trim();
  return CODEC_PREFERENCE[key] ?? key === "MP3" ? 3 : 1;
}

function hasBrokenUrl(url: string): boolean {
  return BROKEN_URL_PATTERNS.some(p => p.test(url));
}

function transformStation(s: Record<string, unknown>): RadioStation {
  const codec = safeString(s.codec);
  const favicon = safeString(s.favicon);
  const url = safeString(s.url_resolved) || safeString(s.url);
  return {
    id: safeString(s.stationuuid) || safeString(s.id) || crypto.randomUUID(),
    stationuuid: safeString(s.stationuuid),
    name: safeString(s.name) || "Unknown",
    url,
    url_resolved: url,
    favicon: favicon.startsWith("http") ? favicon : "",
    tags: safeString(s.tags),
    country: safeString(s.country),
    countrycode: safeString(s.countrycode),
    language: safeString(s.language),
    codec,
    bitrate: (s.bitrate as number) || 0,
    votes: (s.votes as number) || 0,
    geo_lat: (s.geo_lat as number) ?? null,
    geo_long: (s.geo_long as number) ?? null,
  };
}

function processStations(data: Record<string, unknown>[]): RadioStation[] {
  return data
    .map(transformStation)
    .filter(s => s.url && !hasBrokenUrl(s.url))
    .sort((a, b) => {
      const codecDiff = getCodecScore(b.codec) - getCodecScore(a.codec);
      if (codecDiff !== 0) return codecDiff;
      const bitrateDiff = (b.bitrate || 0) - (a.bitrate || 0);
      if (bitrateDiff !== 0) return bitrateDiff;
      return (b.votes || 0) - (a.votes || 0);
    });
}

async function apiFetch(path: string, retries = 2): Promise<Record<string, unknown>[]> {
  // Try each API server in order
  for (let attempt = 0; attempt <= retries; attempt++) {
    const serverIdx = attempt < API_SERVERS.length ? attempt : API_SERVERS.length - 1;
    const base = API_SERVERS[serverIdx] ?? API_SERVERS[0];
    try {
      const url = `${base}${path}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) return await res.json();
    } catch {
      // Server failed, try next
    }
  }

  // Last resort: try via CORS proxy
  try {
    const proxyUrl = CORS_PROXY + encodeURIComponent(`${API_SERVERS[0]}${path}`);
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
    if (res.ok) return await res.json();
  } catch {}

  throw new Error("Failed to fetch stations");
}

async function fetchStationsByCountry(countryCode: string): Promise<RadioStation[]> {
  const data = await apiFetch(
    `/stations/bycountrycodeexact/${countryCode}?limit=50&order=votes&reverse=true&hidebroken=true`
  );
  return processStations(data);
}

async function searchStationsByName(name: string): Promise<RadioStation[]> {
  const data = await apiFetch(
    `/stations/byname/${encodeURIComponent(name)}?limit=20&order=votes&reverse=true&hidebroken=true`
  );
  return processStations(data);
}

async function fetchStationsByCountryName(name: string, countryCode: string): Promise<RadioStation[]> {
  try {
    const data = await apiFetch(
      `/stations/byname/${encodeURIComponent(name)}?limit=5&order=votes&reverse=true&hidebroken=true`
    );
    return processStations(data).filter(s => s.countrycode === countryCode);
  } catch {
    return [];
  }
}

export function useRegionStations(regionCode: string) {
  return useQuery({
    queryKey: ["stations", "region", regionCode],
    queryFn: async () => {
      const region = REGIONS.find(r => r.code === regionCode);
      if (!region) return [];

      // Fetch curated and country stations in parallel
      const curatedPromises = region.curated.map(name =>
        fetchStationsByCountryName(name, region.countryCode)
      );
      const [curatedResults, countryStations] = await Promise.all([
        Promise.all(curatedPromises),
        fetchStationsByCountry(region.countryCode).catch(() => [] as RadioStation[]),
      ]);
      const curated = curatedResults.flat();

      const seen = new Set<string>();
      const combined: RadioStation[] = [];

      for (const s of [...curated, ...countryStations]) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        combined.push(s);
      }

      return combined.slice(0, 20);
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 2000,
  });
}

export function useSearchStations(query: string) {
  return useQuery({
    queryKey: ["stations", "search", query],
    queryFn: () => searchStationsByName(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularStations() {
  return useQuery({
    queryKey: ["stations", "popular"],
    queryFn: async () => {
      const data = await apiFetch("/stations/topvote/50?hidebroken=true");
      return processStations(data).slice(0, 12);
    },
    staleTime: 10 * 60 * 1000,
  });
}
