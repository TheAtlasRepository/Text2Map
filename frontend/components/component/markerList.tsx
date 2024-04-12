import React from 'react';
import { MapMarker } from '../types/MapMarker';
import { Input } from '../ui/input';

interface MarkerListProps {
  markers: MapMarker[],
  onSelectClick: (marker: MapMarker) => void,
  onToggleClick: (id: number) => void
}

const MarkerList: React.FC<MarkerListProps> = (
  props: MarkerListProps
) => {
  // Building the list as an element 
  const list = props.markers.map(marker =>
    <div
      className="border-b marker_column pr-2 dark:border-b-gray-600"
      key={marker.numId}
    >
      <button
        className="p-2 pl-4 text-start overflow-hidden text-nowrap hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={() => props.onSelectClick(marker)}>
        <div className="marker_column">
          {marker.type}
        </div>
      </button>

      <label className="toggle_switch" title={`Toggle marker for ${marker.type}`} aria-label={`Toggle marker for ${marker.type}`} >
        <Input
          type="checkbox"
          name={marker.type}
          checked={marker.toggled}
          onChange={() => props.onToggleClick(marker.numId)} />
        <span className="toggle_switch_slider"></span>
      </label>
    </div>
  )

  // Returned structure
  return (
    <div className="absolute w-full pb-20">
      <div className="bg-white dark:bg-gray-800 pt-2 pb-5 shadow-md dark:shadow-slate-900">
        {list}
      </div>
    </div>
  );
}

export default MarkerList;
