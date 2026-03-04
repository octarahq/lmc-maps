import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "recent_trips_v1";
export type RecentTrip = {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  ts: number;
};

async function read(): Promise<RecentTrip[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentTrip[];
  } catch {
    return [];
  }
}

async function write(list: RecentTrip[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export async function getRecentTrips(): Promise<RecentTrip[]> {
  const list = await read();
  return list.sort((a, b) => b.ts - a.ts);
}

export async function addRecentTrip(trip: Omit<RecentTrip, "ts">) {
  try {
    const list = await read();

    const round = (n: number) => Math.round(n * 1e6) / 1e6;
    const keyLat = round(trip.lat);
    const keyLng = round(trip.lng);

    const filtered = list.filter(
      (t) => !(round(t.lat) === keyLat && round(t.lng) === keyLng),
    );

    const newItem: RecentTrip = { ...(trip as any), ts: Date.now() };
    const newList = [newItem, ...filtered].slice(0, 10);
    await write(newList);
  } catch {}
}

export async function clearRecentTrips() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export default { getRecentTrips, addRecentTrip, clearRecentTrips };
