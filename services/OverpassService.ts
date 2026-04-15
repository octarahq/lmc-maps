export type NeerAmenityResponse = {
  id: number;
  type: string;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}[];

export default class OverpassService {
  static async fetchNeerAmenity(
    lat: number,
    lon: number,
    radius = 100,
    amenityType: string,
  ): Promise<NeerAmenityResponse> {
    const query = `[out:json];(node["amenity"="${amenityType}"](around:${radius},${lat},${lon});way["amenity"="${amenityType}"](around:${radius},${lat},${lon});relation["amenity"="${amenityType}"](around:${radius},${lat},${lon}););out center;`;

    const response = await fetch(
      "https://lambert.openstreetmap.de/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ data: query }).toString(),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Overpass API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.elements) {
      return [];
    }

    return data.elements.map((element: any) => ({
      id: element.id,
      type: element.type,
      lat: element.lat ?? element.center?.lat,
      lon: element.lon ?? element.center?.lon,
      tags: element.tags || {},
    }));
  }
}
