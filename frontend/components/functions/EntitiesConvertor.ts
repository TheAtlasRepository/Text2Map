import { CoordinateEntity } from "../types/CoordinateEntity";
import { MapMarker } from "../types/MapMarker";

/**
 * Converts list of CoordinateEntity to list of MapMarkers with extra values, 
 * and their own number id,
 * 
 * @param entities Array of CoordinateEntities
 * @returns Array of MapMarkers
 */
export const entitiesConvertor = (entities: CoordinateEntity[]): MapMarker[] => {
  let markers: MapMarker[] = [];
  let x = 0;

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