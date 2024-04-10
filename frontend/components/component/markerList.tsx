import React from 'react';
import { MapMarker } from '../types/MapMarker';

interface MarkerListProps {
  markers: MapMarker[],
  onFlytoClick: (coordinates: [number, number]) => void,
  onToggleClick: (id: number, state: boolean) => void
}

const MarkerList: React.FC<MarkerListProps> = (
  props: MarkerListProps
) => {
  // Building the list as an element 
  const list = props.markers.map(marker =>
    <div
      className="border-b marker_column dark:border-b-gray-600 last:border-b-0"
      key={marker.numId}
    >
      <button
        className="p-2 text-start overflow-hidden text-nowrap hover:bg-gray-700 "
        onClick={() => props.onFlytoClick([marker.latitude, marker.longitude])}>
        <span className="pr-auto">
          {marker.type}</span>
      </button>
      <button
        className={marker.toggled
          ? "bg-green-600 p-2"
          : "bg-red-600 p-2"
        }
        onClick={() => props.onToggleClick(marker.numId, marker.toggled)}>
        <span>Toggle</span>
      </button>
    </div>
  )

  // Returned structure
  return (
    <div className="w-full">
      {list}
    </div>
  );
}

export default MarkerList;
