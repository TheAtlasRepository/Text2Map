import { CoordinateEntity } from "../types/BackendResponse";
import { MapMarker } from "../types/MapMarker";

/**
 * Converts list of CoordinateEntity to list of MapMarkers with extra values, 
 * and their own number id,
 * 
 * @param entities Array of CoordinateEntities
 * @param existingNumberOfMarkers Number of existing markers, to tell where next id starts from
 * @returns Array of MapMarkers
 */
export const entitiesConvertor = (entities: CoordinateEntity[], existingNumberOfMarkers: number = 0): MapMarker[] => {
  let markers: MapMarker[] = [];
  let x = existingNumberOfMarkers;

  entities.forEach(marker => {
    markers.push({
      display_name: marker.display_name, 
      latitude: marker.lat, 
      longitude: marker.lon, 
      numId: x, 
      toggled: true
    })
    x++;
  })

  return markers
}