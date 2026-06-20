import { useQuery } from "@tanstack/react-query";
import type { RadioStation } from "../types/radio";
import { REGIONS } from "../data/regions";

const API_BASE = "https://de1.api.radio-browser.info/json";

// Codecs with broadest browser support should come first
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

function getCodecScore(codec: string): number {
  const key = codec.toUpperCase().trim();
  return CODEC_PREFERENCE[key] ?? key === "MP3" ? 3 : 1;
}

function hasBrokenUrl(url: string): boolean {
  return BROKEN_URL_PATTERNS.some(p => p.test(url));
}

function transformStation(s: Record<string, unknown>): RadioStation {
  const codec = (s.codec as string) || "";
  return {
    id: (s.stationuuid as string) || (s.id as string) || crypto.randomUUID(),
    stationuuid: s.stationuuid as string || "",
    name: (s.name as string) || "Unknown",
    url: (s.url_resolved as string) || (s.url as string) || "",
    url_resolved: (s.url_resolved as string) || (s.url as string) || "",
    favicon: (s.favicon as string) || "",
    tags: (s.tags as string) || "",
    country: (s.country as string) || "",
    countrycode: (s.countrycode as string) || "",
    language: (s.language as string) || "",
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
      // Prefer MP3/AAC, then higher bitrate, then more votes
      const codecDiff = getCodecScore(b.codec) - getCodecScore(a.codec);
      if (codecDiff !== 0) return codecDiff;
      const bitrateDiff = (b.bitrate || 0) - (a.bitrate || 0);
      if (bitrateDiff !== 0) return bitrateDiff;
      return (b.votes || 0) - (a.votes || 0);
    });
}

async function fetchStationsByCountry(countryCode: string): Promise<RadioStation[]> {
  const res = await fetch(
    `${API_BASE}/stations/bycountrycodeexact/${countryCode}?limit=50&order=votes&reverse=true&hidebroken=true`
  );
  if (!res.ok) throw new Error("Failed to fetch stations");
  const data: Record<string, unknown>[] = await res.json();
  return processStations(data);
}

async function searchStationsByName(name: string): Promise<RadioStation[]> {
  const res = await fetch(
    `${API_BASE}/stations/byname/${encodeURIComponent(name)}?limit=20&order=votes&reverse=true&hidebroken=true`
  );
  if (!res.ok) throw new Error("Failed to search stations");
  const data: Record<string, unknown>[] = await res.json();
  return processStations(data);
}

async function fetchStationsByCountryName(name: string, countryCode: string): Promise<RadioStation[]> {
  const res = await fetch(
    `${API_BASE}/stations/byname/${encodeURIComponent(name)}?limit=3&order=votes&reverse=true&hidebroken=true`
  );
  if (!res.ok) return [];
  const data: Record<string, unknown>[] = await res.json();
  return processStations(data).filter(s => s.countrycode === countryCode);
}

export function useRegionStations(regionCode: string) {
  return useQuery({
    queryKey: ["stations", "region", regionCode],
    queryFn: async () => {
      const region = REGIONS.find(r => r.code === regionCode);
      if (!region) return [];

      // First try to fetch curated stations by name (matching Hertz approach)
      const curatedPromises = region.curated.map(name =>
        fetchStationsByCountryName(name, region.countryCode)
      );
      const curatedResults = await Promise.all(curatedPromises);
      const curated = curatedResults.flat();

      // Then fetch by country for fill-in
      const countryStations = await fetchStationsByCountry(region.countryCode);

      // Merge: curated first, then country (deduped)
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
      const res = await fetch(`${API_BASE}/stations/topvote/50?hidebroken=true`);
      if (!res.ok) throw new Error("Failed to fetch popular stations");
      const data: Record<string, unknown>[] = await res.json();
      return processStations(data).slice(0, 12);
    },
    staleTime: 10 * 60 * 1000,
  });
}
