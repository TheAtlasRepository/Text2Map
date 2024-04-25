import { CoordinateEntity } from "../types/BackendResponse";
import { MapMarker } from "../types/MapMarker";

/**
 * Converts list of CoordinateEntity to list of MapMarkers with extra values, 
 * and their own number id,
 * 
 * @param entities Array of CoordinateEntities
 * @param existingMarkers List of existing markers
 * @returns Array of MapMarkers
 */
export const entitiesConvertor = (entities: CoordinateEntity[], existingMarkers?: MapMarker[]): MapMarker[] => {
  let markers: MapMarker[] = [];
  let x = 0;

  if (existingMarkers != undefined && existingMarkers.length > 0) {
    x = existingMarkers.length;
    markers = existingMarkers;
  }

  entities.forEach(marker => {
    // TODO: If marker displayname exists, skip

    markers.push({
      display_name: marker.display_name,
      latitude: marker.lat,
      longitude: marker.lon,
      numId: x,
      img_url: marker.img_url,
      toggled: true
    })
    x++;
  })

  return markers
}