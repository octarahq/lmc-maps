import { NominatimSearchResult, NominatimService } from "./NominatimService";
import { PhotonFeature, SearchEngineService } from "./SearchEngineService";
import {
    telemetryError,
    telemetryFeatureUsed,
    telemetryNavigationStart,
    telemetryNavigationStop,
} from "./TelemetryService";

export const TelemetrySearchService = {
  async photonSearch(query: string, options?: any): Promise<PhotonFeature[]> {
    const startTime = performance.now();

    telemetryNavigationStart("photon_search", {
      query_length: query.length,
      limit: options?.limit || 5,
      has_location: !!(options?.lat && options?.lon),
    });

    try {
      const results = await SearchEngineService.photonSearch(query, options);
      const duration = performance.now() - startTime;

      telemetryNavigationStop({
        success: true,
        duration_ms: Math.round(duration),
        results_count: results.length,
        query_type: TelemetrySearchService._getQueryType(query),
      });

      telemetryFeatureUsed("search_completed", {
        results: results.length,
        query_length: query.length,
        provider: "photon",
      });

      return results;
    } catch (error) {
      const duration = performance.now() - startTime;

      telemetryError(
        "PhotonSearchError",
        error instanceof Error ? error.message : "Unknown error",
        error instanceof Error ? error.stack : "",
        {
          duration_ms: Math.round(duration),
          query_length: query.length,
        },
      );

      throw error;
    }
  },

  _getQueryType(query: string): string {
    if (!query) return "empty";
    if (/^\d{5}$/.test(query)) return "postal_code";
    if (/^\d/.test(query)) return "starts_with_number";
    if (/@/.test(query)) return "email";
    return "address";
  },
};

export const TelemetryNominatimService = {
  async search(query: string, options?: any): Promise<NominatimSearchResult[]> {
    const startTime = performance.now();

    telemetryNavigationStart("nominatim_search", {
      query_length: query.length,
      country: options?.countryCode,
      limit: options?.limit || 5,
    });

    try {
      const results = await NominatimService.search(query, options);
      const duration = performance.now() - startTime;

      telemetryNavigationStop({
        success: true,
        duration_ms: Math.round(duration),
        results_count: results.length,
      });

      return results;
    } catch (error) {
      const duration = performance.now() - startTime;

      telemetryError(
        "NominatimSearchError",
        error instanceof Error ? error.message : "Unknown error",
        error instanceof Error ? error.stack : "",
        {
          duration_ms: Math.round(duration),
        },
      );

      throw error;
    }
  },
};

export const TelemetryServices = {
  Search: TelemetrySearchService,
  Nominatim: TelemetryNominatimService,
};

export default TelemetryServices;
