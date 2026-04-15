import {
    OverpassClient,
    OverpassResponse,
} from "@andreasnicolaou/overpass-client";
import { Observable } from "rxjs";

export default class OverpassService {
  static async fetchNeerAmenity(
    lat: number,
    lon: number,
    radius = 100,
    amenityType: string,
  ): Promise<Observable<OverpassResponse>> {
    const client = new OverpassClient();

    const tags = { amenity: [amenityType] };
    return client.getElementsByRadius(tags, lat, lon, radius);
  }
}
