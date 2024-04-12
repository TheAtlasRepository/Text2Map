import { MapMarker } from "../types/MapMarker";

// Changes the toggle state on a given marker by id
const toggleMarker = (
  id: number,
  markers: MapMarker[]
) => {
  // Find the index of the marker
  const todoMarkerIndex = markers.findIndex((marker) => marker.numId === id);

  // Create a new marker identical to old one, but with changed state
  const updatedMarker = { ...markers[todoMarkerIndex], toggled: !markers[todoMarkerIndex].toggled };

  // Create a copy of the entire list, and insert the updated marker at the same position, then update the state.
  // Object.values() is called to convert resulting object back to a usable array. 
  return (Object.values({ ...markers, [todoMarkerIndex]: updatedMarker }) as MapMarker[]);
}

export default toggleMarker;