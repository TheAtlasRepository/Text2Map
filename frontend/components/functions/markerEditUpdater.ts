import { MapMarker } from "../types/MapMarker";

/**
 * Updates the values of a marker in a given list of markers 
 * @param newMarker New marker with new values
 * @param markerList List of markers to update using the new marker
 * @returns Updated list of markers
 */
const updateMarker = (
  newMarker: MapMarker,
  markerList: MapMarker[]
) => {
  // Find the index of the marker
  const todoMarkerIndex = markerList.findIndex(marker => marker.numId === newMarker.numId);

  // Create a copy of the entire list, and insert the updated marker at the same position, then update the state.
  // Object.values() is called to convert resulting object back to a usable array. 
  return (Object.values({ ...markerList, [todoMarkerIndex]: newMarker }) as MapMarker[]);
}

export default updateMarker;